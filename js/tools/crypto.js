/* DevKit tools: crypto */

(() => {

/* ---------- 哈希 ---------- */
function renderHash(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'hash')) + `
    <div class="card">
      ${textareaWrap('输入文本', 'hashInput', '输入要计算哈希的文本', 'Hello DevKit')}
      <div class="field">
        <label class="field-label">哈希算法</label>
        <select class="select" id="hashAlgo">
          <option value="MD5">MD5（128 位）</option>
          <option value="SHA1">SHA1（160 位）</option>
          <option value="SHA256" selected>SHA256（256 位）</option>
          <option value="SHA224">SHA224</option>
          <option value="SHA384">SHA384</option>
          <option value="SHA512">SHA512（512 位）</option>
          <option value="SHA3">Keccak-512 (CryptoJS)</option>
          <option value="RIPEMD160">RIPEMD160</option>
        </select>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="hashUpper" checked><label for="hashUpper">输出大写</label>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="hashCalc">计算哈希</button>
        <button class="btn ghost" id="hashClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="hashOutput">复制</button>
        <textarea class="textarea" id="hashOutput" placeholder="哈希值将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  const input = $('#hashInput', main), output = $('#hashOutput', main);
  $('#hashCalc', main).onclick = () => {
    const algo = $('#hashAlgo', main).value;
    const upper = $('#hashUpper', main).checked;
    try {
      let r = CryptoJS[algo](input.value).toString();
      output.value = upper ? r.toUpperCase() : r;
      toast(lang === 'en' ? `${algo} done` : `${algo} 计算完成`, 'success');
    } catch (e) { toast('计算失败：' + e.message, 'error'); }
  };
  $('#hashClear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- AES ---------- */
function renderAes(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'aes')) + `
    <div class="card">
      ${textareaWrap('输入文本', 'aesInput', '输入要加密/解密的内容', 'Hello DevKit')}
      <div class="row">
        <div class="field">
          <label class="field-label">密钥（Key）</label>
          <input class="input" id="aesKey" type="text" value="my-secret-key-123" />
        </div>
        <div class="field">
          <label class="field-label">模式</label>
          <select class="select" id="aesMode">
            <option value="CBC" selected>CBC</option>
            <option value="ECB">ECB</option>
          </select>
        </div>
      </div>
      <div class="hint">提示：AES 加密结果为 Base64 字符串；解密时输入 Base64 密文。所有运算在本地完成。</div>
      <div class="btn-group">
        <button class="btn primary" id="aesEncrypt">加密 →</button>
        <button class="btn primary" id="aesDecrypt">← 解密</button>
        <button class="btn ghost" id="aesClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="aesOutput">复制</button>
        <textarea class="textarea lg" id="aesOutput" placeholder="结果将显示在这里"></textarea>
      </div>
    </div>
  `;
  const input = $('#aesInput', main), output = $('#aesOutput', main);
  $('#aesEncrypt', main).onclick = () => {
    try {
      const pass = $('#aesKey', main).value;
      const mode = $('#aesMode', main).value;
      const opt = { mode: CryptoJS.mode[mode] };
      const r = CryptoJS.AES.encrypt(input.value, pass, opt);
      output.value = r.toString();
      toast('加密成功', 'success');
    } catch (e) { toast('加密失败：' + e.message, 'error'); }
  };
  $('#aesDecrypt', main).onclick = () => {
    try {
      const pass = $('#aesKey', main).value;
      const mode = $('#aesMode', main).value;
      const opt = { mode: CryptoJS.mode[mode] };
      const r = CryptoJS.AES.decrypt(input.value, pass, opt);
      output.value = r.toString(CryptoJS.enc.Utf8);
      if (!output.value) throw new Error('解密结果为空');
      toast('解密成功', 'success');
    } catch (e) { toast('解密失败：请检查密钥和密文', 'error'); }
  };
  $('#aesClear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- UUID ---------- */
function renderUuid(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'uuid')) + `
    <div class="card">
      <div class="row">
        <div class="field">
          <label class="field-label">生成数量</label>
          <input class="input" id="uuidCount" type="number" value="5" min="1" max="100" />
        </div>
        <div class="field">
          <label class="field-label">格式</label>
          <select class="select" id="uuidUpper">
            <option value="0">小写（默认）</option>
            <option value="1">大写</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">是否带连字符</label>
          <select class="select" id="uuidDash">
            <option value="1">带连字符</option>
            <option value="0">无连字符</option>
          </select>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="uuidGen">生成 UUID</button>
        <button class="btn" id="uuidCopyAll">复制全部</button>
        <button class="btn ghost" id="uuidClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="uuidOutput">复制</button>
        <textarea class="textarea lg" id="uuidOutput" placeholder="生成的 UUID 列表将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  function uuidv4() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  $('#uuidGen', main).onclick = () => {
    const n = Math.min(100, Math.max(1, parseInt($('#uuidCount', main).value) || 1));
    const upper = $('#uuidUpper', main).value === '1';
    const dash = $('#uuidDash', main).value === '1';
    const list = [];
    for (let i = 0; i < n; i++) {
      let u = uuidv4();
      if (!dash) u = u.replace(/-/g, '');
      if (upper) u = u.toUpperCase();
      list.push(u);
    }
    $('#uuidOutput', main).value = list.join('\n');
    toast(lang === 'en' ? `Generated ${n} UUIDs` : `已生成 ${n} 个 UUID`, 'success');
  };
  $('#uuidCopyAll', main).onclick = () => copyText($('#uuidOutput', main).value);
  $('#uuidClear', main).onclick = () => { $('#uuidOutput', main).value = ''; };
}

/* ---------- JWT ---------- */
function renderJwt(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'jwt')) + `
    <div class="card">
      ${textareaWrap('输入 JWT Token', 'jwtInput', '粘贴 JWT token（三段式，以 . 分隔）',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')}
      <div class="btn-group">
        <button class="btn primary" id="jwtDecode">解析</button>
        <button class="btn ghost" id="jwtClear">清空</button>
      </div>
    </div>
    <div class="card" id="jwtResultCard" style="display:none;">
      <label class="field-label">解析结果</label>
      <div id="jwtResult"></div>
    </div>
  `;
  function b64urlDecode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }
  $('#jwtDecode', main).onclick = () => {
    const token = $('#jwtInput', main).value.trim();
    const parts = token.split('.');
    if (parts.length !== 3) { toast('JWT 格式错误：应为 3 段', 'error'); return; }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const card = $('#jwtResultCard', main);
      card.style.display = 'block';
      let html = `<table class="table">
        <tr><th style="width:100px;">${t('段')}</th><th>${t('内容')}</th></tr>
        <tr><td>Header</td><td class="mono"><pre style="margin:0;white-space:pre-wrap;">${escapeHtml(JSON.stringify(header, null, 2))}</pre></td></tr>
        <tr><td>Payload</td><td class="mono"><pre style="margin:0;white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre></td></tr>
        <tr><td>Signature</td><td class="mono">${escapeHtml(parts[2])}</td></tr>
      </table>`;
      // 时间字段解析
      const timeFields = ['iat', 'exp', 'nbf', 'auth_time'];
      const timeInfo = Object.entries(payload)
        .filter(([k]) => timeFields.includes(k))
        .map(([k, v]) => {
          const valid = typeof v === 'number' && Number.isFinite(v);
          const displayValue = escapeHtml(String(v));
          const displayDate = valid
            ? escapeHtml(new Date(v * 1000).toLocaleString())
            : (lang === 'en' ? 'Invalid timestamp' : '无效时间戳');
          return `<tr><td>${escapeHtml(k)}</td><td>${displayValue}</td><td>${displayDate}</td></tr>`;
        })
        .join('');
      if (timeInfo) {
        html += `<h3 style="margin:16px 0 8px;">时间字段解析</h3>
          <table class="table"><tr><th>${t('字段')}</th><th>${t('时间戳')}</th><th>${t('本地时间')}</th></tr>${timeInfo}</table>`;
      }
      $('#jwtResult', main).innerHTML = html;
      toast('解析成功', 'success');
    } catch (e) { toast('解析失败：' + e.message, 'error'); }
  };
  $('#jwtClear', main).onclick = () => {
    $('#jwtInput', main).value = '';
    $('#jwtResultCard', main).style.display = 'none';
  };
}

/* ---------- 密码生成器 ---------- */
function renderPassword(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'password')) + `
    <div class="card">
      <div class="row">
        <div class="field">
          <label class="field-label">密码长度</label>
          <input class="input" id="pwLen" type="number" value="16" min="1" max="128" />
        </div>
        <div class="field">
          <label class="field-label">生成数量</label>
          <input class="input" id="pwCount" type="number" value="5" min="1" max="100" />
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:14px 22px;margin:12px 0;">
        <label><input type="checkbox" id="pwLower" checked> 小写字母 a-z</label>
        <label><input type="checkbox" id="pwUpper" checked> 大写字母 A-Z</label>
        <label><input type="checkbox" id="pwDigit" checked> 数字 0-9</label>
        <label><input type="checkbox" id="pwSym" checked> 特殊符号 !@#$%^&*</label>
        <label><input type="checkbox" id="pwNoAmb"> 排除易混字符 (0O1lI|)</label>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="pwGen">🎲 生成密码</button>
        <button class="btn" id="pwCopyAll">复制全部</button>
        <button class="btn ghost" id="pwClear">清空</button>
      </div>
      <div class="hint">使用 crypto.getRandomValues 生成密码学安全随机数，全部本地运算。</div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="pwOutput">复制</button>
        <textarea class="textarea lg" id="pwOutput" placeholder="生成的密码将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  function genOne() {
    const len = Math.min(128, Math.max(1, parseInt($('#pwLen', main).value) || 16));
    const noAmb = $('#pwNoAmb', main).checked;
    let pool = '';
    if ($('#pwLower', main).checked) pool += 'abcdefghijklmnopqrstuvwxyz';
    if ($('#pwUpper', main).checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if ($('#pwDigit', main).checked) pool += '0123456789';
    if ($('#pwSym', main).checked) pool += '!@#$%^&*-_=+?';
    if (noAmb) pool = pool.replace(/[0O1lI|]/g, '');
    if (!pool) return '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let out = '';
    for (let i = 0; i < len; i++) out += pool[arr[i] % pool.length];
    return out;
  }
  $('#pwGen', main).onclick = () => {
    const n = Math.min(100, Math.max(1, parseInt($('#pwCount', main).value) || 1));
    if (!$('#pwLower', main).checked && !$('#pwUpper', main).checked && !$('#pwDigit', main).checked && !$('#pwSym', main).checked) {
      toast('请至少选择一种字符类型', 'error'); return;
    }
    const list = [];
    for (let i = 0; i < n; i++) list.push(genOne());
    $('#pwOutput', main).value = list.join('\n');
    toast(lang === 'en' ? `Generated ${n} passwords` : `已生成 ${n} 个密码`, 'success');
  };
  $('#pwCopyAll', main).onclick = () => copyText($('#pwOutput', main).value);
  $('#pwClear', main).onclick = () => { $('#pwOutput', main).value = ''; };
}

DevKitRegistry.registerTools('crypto', {
  hash: renderHash,
  aes: renderAes,
  uuid: renderUuid,
  jwt: renderJwt,
  password: renderPassword,
});
})();
