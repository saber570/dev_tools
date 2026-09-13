export function startRegexTask(request, {
  createWorker = url => new Worker(url),
  baseUrl = document.baseURI,
  timeoutMs = 1500,
} = {}) {
  let worker, timer, settled = false, rejectTask;
  const finish = (callback, value) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    worker?.terminate();
    callback(value);
  };
  const promise = new Promise((resolve, reject) => {
    rejectTask = reject;
    try {
      worker = createWorker(new URL('js/regex-worker.js', baseUrl));
      worker.onmessage = ({ data }) => {
        if (data.ok) finish(resolve, data.result);
        else finish(reject, Object.assign(new Error(data.error.message), { code: data.error.code }));
      };
      worker.onerror = () => finish(reject, Object.assign(new Error('Worker failed to load'), { code: 'WORKER' }));
      timer = setTimeout(() => finish(reject, Object.assign(new Error('Regex timed out'), { code: 'TIMEOUT' })), timeoutMs);
      worker.postMessage(request);
    } catch (error) {
      finish(reject, Object.assign(error, { code: 'WORKER' }));
    }
  });
  return {
    promise,
    cancel: () => finish(rejectTask, Object.assign(new Error('Cancelled'), { name: 'AbortError' })),
  };
}
