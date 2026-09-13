import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp, openTool, setLanguage } from './support/app.mjs';
import { BrowserWorker } from './support/worker.mjs';

for (const initialLanguage of ['zh', 'en']) {
  test(`Language round trip preserves controls, data, and selection (initial ${initialLanguage})`, async () => {
    const app = createApp(initialLanguage);
    const window = app.window, document = window.document;
    try {
      await openTool(window, 'json');
      const input = document.getElementById('jsonInput');
      const output = document.getElementById('jsonOutput');
      input.value = '{"id":9223372036854775807,"text":"Copy 复制"}';
      input.setSelectionRange(3, 8);
      document.getElementById('jsonFormat').click();
      const before = output.value;
      for (const language of ['en', 'zh', 'en', 'zh']) {
        setLanguage(window, language);
        assert.equal(document.getElementById('jsonInput'), input);
        assert.equal(document.getElementById('jsonOutput'), output);
        assert.equal(input.value, '{"id":9223372036854775807,"text":"Copy 复制"}');
        assert.equal(output.value, before);
        assert.deepEqual([input.selectionStart, input.selectionEnd], [3, 8]);
        assert.equal(document.getElementById('jsonFormat').textContent, language === 'zh' ? '格式化' : 'Format');
        assert.equal(document.getElementById('themeBtn').title, language === 'zh' ? '切换主题' : 'Toggle Theme');
        assert.equal(document.getElementById('menuBtn').title, language === 'zh' ? '菜单' : 'Menu');
        assert.ok(document.getElementById('searchInput').placeholder.startsWith(language === 'zh' ? '搜索工具' : 'Search tools'));
      }
    } finally { window.close(); }
  });
}

test('Every tool renders and survives a language round trip', async () => {
  const app = createApp();
  try {
    const window = app.window;
    const ids = [...window.document.querySelectorAll('.nav-item')].map(item => item.dataset.id);
    for (const id of ids) {
      await openTool(window, id);
      const main = window.document.getElementById('main');
      assert.ok(main.querySelector('.tool-title'), id);
      const firstChild = main.firstElementChild;
      setLanguage(window, 'en');
      setLanguage(window, 'zh');
      assert.equal(main.firstElementChild, firstChild, id);
    }
  } finally { app.window.close(); }
});

test('Language changes preserve computed diff content and tool options', async () => {
  const app = createApp();
  try {
    const window = app.window, document = window.document;
    await openTool(window, 'diff');
    document.getElementById('dfLeft').value = 'Copy\n复制\nHome';
    document.getElementById('dfRight').value = 'Copy\n复制\n首页';
    document.getElementById('dfCompare').click();
    const before = document.getElementById('dfResult').innerHTML;
    setLanguage(window, 'en');
    await new Promise(resolve => window.setTimeout(resolve, 0));
    assert.equal(document.getElementById('dfResult').innerHTML, before);
    await openTool(window, 'sql');
    document.getElementById('sqlCase').value = 'lower';
    document.getElementById('sqlIndent').value = '4';
    setLanguage(window, 'zh');
    assert.equal(document.getElementById('sqlCase').value, 'lower');
    assert.equal(document.getElementById('sqlIndent').value, '4');
  } finally { app.window.close(); }
});

test('Cron results change language without changing computed execution dates', async () => {
  const app = createApp();
  try {
    const window = app.window, document = window.document;
    await openTool(window, 'cron');
    document.getElementById('crInput').value = '0 9 1 * 1';
    document.getElementById('crParse').click();
    assert.match(document.getElementById('crDesc').textContent, /或/);
    const dates = document.getElementById('crNext').textContent.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/g);
    setLanguage(window, 'en');
    assert.match(document.getElementById('crDesc').textContent, /or/);
    assert.deepEqual(document.getElementById('crNext').textContent.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/g), dates);
    assert.equal(document.getElementById('crInput').value, '0 9 1 * 1');
  } finally { app.window.close(); }
});

test('Invalid timestamps clear stale results and show an error', async () => {
  const app = createApp();
  try {
    const window = app.window, document = window.document;
    await openTool(window, 'timestamp');
    document.getElementById('ts2dBtn').click();
    assert.ok(document.getElementById('ts2dResult').textContent.trim());
    for (const input of ['123abc', '999999999999999999']) {
      document.getElementById('ts2dInput').value = input;
      document.getElementById('ts2dBtn').click();
      assert.equal(document.getElementById('ts2dResult').textContent, '');
      assert.match(document.getElementById('toast').textContent, /无效/);
    }
  } finally { app.window.close(); }
});

test('Regex UI recovers after errors and cancels running work when navigating away', async () => {
  const app = createApp();
  const workers = [];
  try {
    const window = app.window, document = window.document;
    window.Worker = class extends BrowserWorker {
      constructor(url) { super(url); workers.push(this); }
    };
    await openTool(window, 'regex');
    document.getElementById('rePattern').value = '[';
    await document.getElementById('reTest').onclick();
    assert.equal(document.getElementById('reTest').disabled, false);
    assert.match(document.getElementById('toast').textContent, /正则错误/);
    document.getElementById('rePattern').value = '(a+)+$';
    document.getElementById('reText').value = 'a'.repeat(30) + '!';
    const pending = document.getElementById('reTest').onclick();
    assert.equal(document.getElementById('reTest').disabled, true);
    await openTool(window, 'json');
    await pending;
    assert.equal(workers.at(-1).terminated, true);
    assert.ok(document.getElementById('jsonInput'));
  } finally {
    workers.forEach(worker => worker.terminate());
    app.window.close();
  }
});
