(function initDevKitRegistry(global) {
  const renderers = new Map();
  const groups = new Map();

  function registerTools(group, definitions) {
    if (typeof group !== 'string' || !group.trim() || !definitions || typeof definitions !== 'object') {
      throw new TypeError('registerTools requires a group name and renderer map');
    }
    if (groups.has(group)) throw new Error(`Duplicate tool group: ${group}`);

    const entries = Object.entries(definitions);
    entries.forEach(([id, render]) => {
      if (!/^[a-z0-9-]+$/.test(id)) throw new TypeError(`Invalid tool id: ${id}`);
      if (typeof render !== 'function') throw new TypeError(`Renderer must be a function: ${id}`);
      if (renderers.has(id)) throw new Error(`Duplicate tool renderer: ${id}`);
    });

    const ids = [];
    entries.forEach(([id, render]) => {
      renderers.set(id, render);
      ids.push(id);
    });
    groups.set(group, Object.freeze(ids));
  }

  global.DevKitRegistry = Object.freeze({
    registerTools,
    getRenderer: id => renderers.get(id) || null,
    getRegisteredToolIds: () => Object.freeze([...renderers.keys()]),
    getGroups: () => new Map(groups),
  });
})(window);
