import { readFileSync } from 'node:fs';
import { Worker } from 'node:worker_threads';

const source = readFileSync(new URL('../../js/regex-worker.js', import.meta.url), 'utf8');

export class BrowserWorker {
  constructor(url) {
    this.url = url;
    this.terminated = false;
    this.thread = new Worker(`
      const { parentPort, workerData } = require('node:worker_threads');
      const vm = require('node:vm');
      const scope = { postMessage: message => parentPort.postMessage(message) };
      scope.self = scope;
      vm.createContext(scope);
      vm.runInContext(workerData, scope, { filename: 'regex-worker.js' });
      parentPort.on('message', data => scope.onmessage({ data }));
    `, { eval: true, workerData: source });
    this.thread.on('message', data => this.onmessage?.({ data }));
    this.thread.on('error', error => this.onerror?.(error));
  }
  postMessage(data) { this.thread.postMessage(data); }
  terminate() { this.terminated = true; return this.thread.terminate(); }
}
