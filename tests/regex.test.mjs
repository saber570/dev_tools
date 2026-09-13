import assert from 'node:assert/strict';
import test from 'node:test';
import { startRegexTask } from '../src/regex-task.mjs';
import { BrowserWorker } from './support/worker.mjs';

function start(request, options = {}) {
  return startRegexTask({ pattern: '\\d+', flags: 'g', text: 'a12 b34', operation: 'match', ...request }, {
    baseUrl: 'http://localhost/devkit/', createWorker: url => new BrowserWorker(url), ...options,
  });
}

test('Regex worker supports captures, missing g, and Unicode zero-length matches', async () => {
  const result = await start({ pattern: '(\\d+)', flags: '' }).promise;
  assert.deepEqual(result.matches, [
    { value: '12', index: 1, groups: ['12'] }, { value: '34', index: 5, groups: ['34'] },
  ]);
  assert.equal(result.truncated, false);
  const empty = await start({ pattern: '(?:)', flags: 'gu', text: '\u{1f600}' }).promise;
  assert.deepEqual(empty.matches.map(match => match.index), [0, 2]);
});

test('Regex replacement preserves native flags and substitution semantics', async () => {
  for (const flags of ['', 'g', 'y', 'gy', 'i']) {
    const pattern = '(?<word>[a-z]+)(\\d+)?';
    const text = 'ab12 cd';
    const replacement = "$$:$&:$1:$2:$12:$<word>:$`:$'";
    const result = await start({ operation: 'replace', pattern, text, flags, replacement }).promise;
    assert.equal(result.text, text.replace(new RegExp(pattern, flags), replacement));
  }
});

test('Regex worker limits results and rejects excessive replacement expansion', async () => {
  const result = await start({ pattern: 'a', text: 'a'.repeat(2000) }).promise;
  assert.equal(result.matches.length, 1000);
  assert.equal(result.truncated, true);
  await assert.rejects(start({ operation: 'replace', pattern: 'a', text: 'a'.repeat(2000), replacement: 'b'.repeat(1000) }).promise,
    error => error.code === 'OUTPUT_LIMIT');
  await assert.rejects(start({ text: 'a'.repeat(1000001) }).promise, error => error.code === 'INPUT_LIMIT');
});

test('Invalid regexes report errors and pathological patterns time out in the worker', async () => {
  await assert.rejects(start({ pattern: '[' }).promise, error => error.code === 'REGEX');
  await assert.rejects(start({ pattern: '(a+)+$', text: 'a'.repeat(30) + '!' }, { timeoutMs: 100 }).promise,
    error => error.code === 'TIMEOUT');
  assert.equal((await start({}).promise).matches.length, 2);
});

test('Cancelling a task terminates the worker and rejects with AbortError', async () => {
  let worker;
  const task = start({}, { createWorker: url => (worker = new BrowserWorker(url)) });
  task.cancel();
  await assert.rejects(task.promise, error => error.name === 'AbortError');
  assert.equal(worker.terminated, true);
  assert.equal(worker.url.href, 'http://localhost/devkit/js/regex-worker.js');
});

test('Worker startup failures are reported without leaving a pending task', async () => {
  await assert.rejects(start({}, { createWorker: () => { throw new Error('Unavailable'); } }).promise,
    error => error.code === 'WORKER');
});
