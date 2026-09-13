import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const root = new URL('../../', import.meta.url);

export function createApp(language = 'zh') {
  const dom = new JSDOM(readFileSync(new URL('index.html', root), 'utf8'), {
    url: 'http://localhost/devkit/', runScripts: 'outside-only',
  });
  dom.window.localStorage.setItem('devkit-lang', language);
  for (const script of dom.window.document.querySelectorAll('script[src]')) {
    const source = script.getAttribute('src');
    if (source.startsWith('https://')) continue;
    vm.runInContext(readFileSync(new URL(source, root), 'utf8'), dom.getInternalVMContext(), { filename: source });
  }
  const close = dom.window.close.bind(dom.window);
  dom.window.close = () => {
    vm.runInContext("translationObserver.disconnect(); document.getElementById('main')._cleanup?.();", dom.getInternalVMContext());
    close();
  };
  return dom;
}

export async function openTool(window, id) {
  if (window.location.hash === '#' + id) return;
  const changed = new Promise(resolve => window.addEventListener('hashchange', resolve, { once: true }));
  window.location.hash = id;
  await changed;
}

export function setLanguage(window, language) {
  const select = window.document.getElementById('langBtn');
  select.value = language;
  select.dispatchEvent(new window.Event('change'));
}
