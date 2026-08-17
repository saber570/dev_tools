import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const projectRoot = new URL('../', import.meta.url);

function createRegistryContext() {
  const context = vm.createContext({});
  context.window = context;
  const registrySource = readFileSync(new URL('js/registry.js', projectRoot), 'utf8');
  vm.runInContext(registrySource, context, { filename: 'js/registry.js' });
  return context;
}

test('all tool metadata has exactly one registered renderer', async () => {
  const context = createRegistryContext();
  const toolsDirectory = new URL('js/tools/', projectRoot);
  const toolFiles = (await readdir(toolsDirectory)).filter(file => file.endsWith('.js')).sort();

  for (const file of toolFiles) {
    const source = readFileSync(new URL(file, toolsDirectory), 'utf8');
    vm.runInContext(source, context, { filename: `js/tools/${file}` });
  }

  const appSource = readFileSync(new URL('js/app.js', projectRoot), 'utf8');
  const rendererMappings = [...appSource.matchAll(
    /\{\s*id:\s*'([^']+)'[^{}]*render:\s*resolveRenderer\('([^']+)'\)\s*\}/g,
  )].map(match => ({ metadataId: match[1], rendererId: match[2] }));
  const metadataIds = rendererMappings.map(mapping => mapping.metadataId).sort();
  const registeredIds = [...context.DevKitRegistry.getRegisteredToolIds()].sort();

  assert.equal(metadataIds.length, 27);
  assert.deepEqual(
    rendererMappings.filter(mapping => mapping.metadataId !== mapping.rendererId),
    [],
    'tool metadata IDs must match their renderer IDs',
  );
  assert.deepEqual(registeredIds, metadataIds);
  assert.equal(context.DevKitRegistry.getGroups().size, toolFiles.length);
});

test('failed registration is atomic', () => {
  const context = createRegistryContext();
  const registry = context.DevKitRegistry;
  const originalRenderer = () => {};

  registry.registerTools('original', { existing: originalRenderer });

  assert.throws(
    () => registry.registerTools('conflict', { fresh: () => {}, existing: () => {} }),
    /Duplicate tool renderer: existing/,
  );
  assert.equal(registry.getRenderer('fresh'), null);
  assert.equal(registry.getRenderer('existing'), originalRenderer);
  assert.equal(registry.getGroups().has('conflict'), false);
});

test('duplicate groups are rejected', () => {
  const registry = createRegistryContext().DevKitRegistry;
  registry.registerTools('group', { first: () => {} });

  assert.throws(
    () => registry.registerTools('group', { second: () => {} }),
    /Duplicate tool group: group/,
  );
  assert.equal(registry.getRenderer('second'), null);
});
