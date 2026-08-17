/* DevKit tools: misc */

(() => {

/* ---------- 正则测试 ---------- */
function renderRegex(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'regex')) + `
    <div class="card">
      <div class="row">
        <div class="field">
          <label class="field-label">正则表达式</label>
          <input class="input" id="rePattern" type="text" value="\\d+" placeholder="如 \\d+ 匹配数字" />
        </div>
        <div class="field" style="max-width:200px;">
          <label class="field-label">标志</label>
          <input class="input" id="reFlags" type="text" value="g" placeholder="g i m" />
        </div>
      </div>
      ${textareaWrap('测试文本', 'reText', '输入要匹配的文本', '我有 3 个苹果和 15 个橘子，共 18 个水果。')}
      <div class="btn-group">
        <button class="btn primary" id="reTest">测试匹配</button>
        <button class="btn" id="reReplace">替换匹配</button>
        <button class="btn ghost" id="reClear">清空</button>
      </div>
      <div class="field" style="margin-top:12px;">
        <input class="input" id="reReplaceTo" type="text" placeholder="替换为（用于替换模式，$1 $2 可引用分组）" />
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div id="reResult"></div>
    </div>
  `;
  const buildRe = () => {
    const p = $('#rePattern', main).value;
    const f = $('#reFlags', main).value;
    return new RegExp(p, f);
  };
  $('#reTest', main).onclick = () => {
    try {
      const re = buildRe();
      const text = $('#reText', main).value;
      // matchAll 要求全局正则；展示匹配列表时用副本补上 g，
      // 不改变用户为替换操作填写的原始 flags。
      const matchRe = re.global ? re : new RegExp(re.source, re.flags + 'g');
      const matches = [...text.matchAll(matchRe)];
      if (!matches.length) {
        $('#reResult', main).innerHTML = `<div class="output-box empty">${t('未匹配到任何内容')}</div>`;
        return;
      }
      let html = `<div class="hint success">共匹配 ${matches.length} 处</div>`;
      html += `<table class="table"><tr><th>#</th><th>${t('匹配内容')}</th><th>${t('位置')}</th><th>${t('分组')}</th></tr>`;
      matches.forEach((m, i) => {
        html += `<tr>
          <td>${i + 1}</td>
          <td class="mono">${escapeHtml(m[0])}</td>
          <td class="mono">${m.index}-${m.index + m[0].length}</td>
          <td class="mono">${m.slice(1).map(x => x == null ? '-' : escapeHtml(x)).join(', ')}</td>
        </tr>`;
      });
      html += `</table>`;
      $('#reResult', main).innerHTML = html;
      toast(`匹配到 ${matches.length} 处`, 'success');
    } catch (e) { toast('正则错误：' + e.message, 'error'); }
  };
  $('#reReplace', main).onclick = () => {
    try {
      const re = buildRe();
      const text = $('#reText', main).value;
      const to = $('#reReplaceTo', main).value;
      const r = text.replace(re, to);
      $('#reResult', main).innerHTML = `<label class="field-label">替换结果</label>
        <div class="textarea-wrap">
          <button class="copy-btn" data-copy-target="reReplaceOut">复制</button>
          <textarea class="textarea" id="reReplaceOut">${escapeHtml(r)}</textarea>
        </div>`;
      toast('替换完成', 'success');
    } catch (e) { toast('正则错误：' + e.message, 'error'); }
  };
  $('#reClear', main).onclick = () => { $('#reText', main).value = ''; $('#reResult', main).innerHTML = ''; };
}

/* ---------- 二维码 ---------- */
function renderQrcode(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'qrcode')) + `
    <div class="card">
      ${textareaWrap('输入文本/URL', 'qrInput', '输入要生成二维码的内容', 'https://github.com')}
      <div class="row">
        <div class="field">
          <label class="field-label">尺寸（像素）</label>
          <input class="input" id="qrSize" type="number" value="240" min="64" max="600" />
        </div>
        <div class="field">
          <label class="field-label">纠错等级</label>
          <select class="select" id="qrLevel">
            <option value="L">L (7%)</option>
            <option value="M" selected>M (15%)</option>
            <option value="Q">Q (25%)</option>
            <option value="H">H (30%)</option>
          </select>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="qrGen">生成二维码</button>
        <button class="btn" id="qrDownload">下载图片</button>
        <button class="btn ghost" id="qrClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">二维码预览</label>
      <div class="qrcode-box" id="qrBox">
        <div style="color:var(--text-mute);font-style:italic;">${t('输入内容后点击「生成二维码」')}</div>
      </div>
    </div>
  `;
  let qrInstance = null;
  $('#qrGen', main).onclick = () => {
    const text = $('#qrInput', main).value.trim();
    if (!text) { toast('请输入内容', 'error'); return; }
    const size = parseInt($('#qrSize', main).value) || 240;
    const level = $('#qrLevel', main).value;
    const box = $('#qrBox', main);
    box.innerHTML = '';
    try {
      qrInstance = new QRCode(box, {
        text, width: size, height: size,
        correctLevel: QRCode.CorrectLevel[level]
      });
      toast('已生成', 'success');
    } catch (e) { toast('生成失败：' + e.message, 'error'); }
  };
  $('#qrDownload', main).onclick = () => {
    const img = $('#qrBox canvas', main) || $('#qrBox img', main);
    const canvas = $('#qrBox canvas', main);
    if (canvas) {
      const a = document.createElement('a');
      a.download = 'qrcode.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast('已下载', 'success');
    } else {
      toast('请先生成二维码', 'error');
    }
  };
  $('#qrClear', main).onclick = () => {
    $('#qrInput', main).value = '';
    $('#qrBox', main).innerHTML = `<div style="color:var(--text-mute);font-style:italic;">${t('输入内容后点击「生成二维码」')}</div>`;
  };
}

/* ---------- 颜色转换 ---------- */
function renderColor(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'color')) + `
    <div class="card">
      <div class="row" style="align-items:flex-end;">
        <div class="field">
          <label class="field-label">HEX</label>
          <input class="input" id="cHex" type="text" value="#165dff" />
        </div>
        <div class="field">
          <label class="field-label">RGB</label>
          <input class="input" id="cRgb" type="text" value="rgb(22, 93, 255)" />
        </div>
        <div class="field">
          <label class="field-label">HSL</label>
          <input class="input" id="cHsl" type="text" value="hsl(219, 100%, 54%)" />
        </div>
        <div class="color-preview" id="cPreview" style="background:#165dff;"></div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="cFromHex">从 HEX 转换</button>
        <button class="btn primary" id="cFromRgb">从 RGB 转换</button>
        <button class="btn primary" id="cFromHsl">从 HSL 转换</button>
        <input type="color" id="cPicker" value="#165dff" style="width:42px;height:34px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:var(--bg-soft);" />
      </div>
    </div>
    <div class="card">
      <label class="field-label">预览</label>
      <div id="cPreviewBig" style="height:80px;border-radius:8px;background:#165dff;border:1px solid var(--border);"></div>
    </div>
  `;
  function hexToRgb(hex) {
    hex = hex.trim();
    if (!/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new Error('Invalid HEX');
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
  function updateAll(rgb) {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    $('#cHex', main).value = hex;
    $('#cRgb', main).value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    $('#cHsl', main).value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    $('#cPreview', main).style.background = hex;
    $('#cPreviewBig', main).style.background = hex;
    $('#cPicker', main).value = hex;
  }
  $('#cFromHex', main).onclick = () => {
    try { updateAll(hexToRgb($('#cHex', main).value)); toast('已转换', 'success'); }
    catch (e) { toast('HEX 格式错误', 'error'); }
  };
  $('#cFromRgb', main).onclick = () => {
    const m = $('#cRgb', main).value.match(/^\s*(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?\s*$/i);
    const rgb = m && { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
    if (!rgb || Object.values(rgb).some(v => v < 0 || v > 255)) {
      toast('RGB 格式错误', 'error'); return;
    }
    updateAll(rgb);
    toast('已转换', 'success');
  };
  $('#cFromHsl', main).onclick = () => {
    const m = $('#cHsl', main).value.match(/^\s*(?:hsl\s*\(\s*)?(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)?\s*$/i);
    const hsl = m && { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
    if (!hsl || hsl.h < 0 || hsl.h > 360 || hsl.s < 0 || hsl.s > 100 || hsl.l < 0 || hsl.l > 100) {
      toast('HSL 格式错误', 'error'); return;
    }
    updateAll(hslToRgb(hsl.h, hsl.s, hsl.l));
    toast('已转换', 'success');
  };
  $('#cPicker', main).oninput = (e) => updateAll(hexToRgb(e.target.value));
}

/* ---------- 进制转换 ---------- */
function renderRadix(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'radix')) + `
    <div class="card">
      <div class="field">
        <label class="field-label">输入数值</label>
        <input class="input" id="rInput" type="text" value="255" placeholder="输入数字" />
      </div>
      <div class="row">
        <div class="field">
          <label class="field-label">输入进制</label>
          <select class="select" id="rFrom">
            <option value="2">二进制 (2)</option>
            <option value="8">八进制 (8)</option>
            <option value="10" selected>十进制 (10)</option>
            <option value="16">十六进制 (16)</option>
          </select>
        </div>
      </div>
      <button class="btn primary" id="rConvert">转换 →</button>
    </div>
    <div class="card">
      <label class="field-label">转换结果</label>
      <table class="table">
        <tr><th>${t('进制')}</th><th>${t('值')}</th><th></th></tr>
        <tr><td>二进制 (2)</td><td class="mono" id="r2">-</td><td><button class="btn sm ghost" data-copy="r2">复制</button></td></tr>
        <tr><td>八进制 (8)</td><td class="mono" id="r8">-</td><td><button class="btn sm ghost" data-copy="r8">复制</button></td></tr>
        <tr><td>十进制 (10)</td><td class="mono" id="r10">-</td><td><button class="btn sm ghost" data-copy="r10">复制</button></td></tr>
        <tr><td>十六进制 (16)</td><td class="mono" id="r16">-</td><td><button class="btn sm ghost" data-copy="r16">复制</button></td></tr>
      </table>
    </div>
  `;
  $('#rConvert', main).onclick = () => {
    const v = $('#rInput', main).value.trim();
    const from = Number($('#rFrom', main).value);
    const patterns = {
      2: /^[+-]?[01]+$/,
      8: /^[+-]?[0-7]+$/,
      10: /^[+-]?\d+$/,
      16: /^[+-]?[0-9a-f]+$/i,
    };
    if (!patterns[from] || !patterns[from].test(v)) {
      toast('输入数值无效', 'error');
      return;
    }
    const negative = v.startsWith('-');
    const digits = v.replace(/^[+-]/, '');
    const prefix = { 2: '0b', 8: '0o', 10: '', 16: '0x' }[from];
    let n;
    try {
      n = BigInt(prefix + digits) * (negative ? -1n : 1n);
    } catch (e) {
      toast('输入数值无效', 'error');
      return;
    }
    $('#r2', main).textContent = n.toString(2);
    $('#r8', main).textContent = n.toString(8);
    $('#r10', main).textContent = n.toString(10);
    $('#r16', main).textContent = n.toString(16).toUpperCase();
    toast('转换成功', 'success');
  };
}

/* ---------- IP / 子网计算器 ---------- */
function renderIpCalc(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'ipcalc')) + `
    <div class="card">
      <h3 style="margin-bottom:12px;">🌐 CIDR / 子网计算</h3>
      <div class="row">
        <div class="field" style="flex:2;">
          <label class="field-label">IP 地址 / CIDR</label>
          <input class="input mono" id="ipInput" type="text" value="192.168.1.100/24" placeholder="如 192.168.1.100/24" />
        </div>
      </div>
      <button class="btn primary" id="ipCalc">计算</button>
    </div>
    <div class="card" id="ipResultCard" style="display:none;">
      <table class="table" id="ipTable"></table>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">🔗 同网段判断</h3>
      <div class="row">
        <div class="field"><label class="field-label">IP 1 / CIDR</label><input class="input mono" id="ipA" type="text" value="192.168.1.10/24" /></div>
        <div class="field"><label class="field-label">IP 2</label><input class="input mono" id="ipB" type="text" value="192.168.1.200" /></div>
      </div>
      <button class="btn primary" id="ipSameCheck">判断</button>
      <div id="ipSameResult" style="margin-top:12px;"></div>
    </div>
  `;
  function parseIp(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p))) return null;
    const octets = parts.map(Number);
    if (octets.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null;
    return { text: octets.join('.'), octets };
  }
  function parseCidr(raw) {
    const m = raw.match(/^(.+)\/(\d+)$/);
    if (!m) return null;
    const parsedIp = parseIp(m[1]);
    const prefix = Number(m[2]);
    if (!parsedIp || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
    return { ip: parsedIp.text, octets: parsedIp.octets, prefix };
  }
  function ipToInt(octets) { return octets.reduce((a, p) => ((a << 8) + p) >>> 0, 0); }
  function intToIp(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); }
  function maskFromPrefix(p) { return p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0; }
  function maskToStr(m) { return intToIp(m); }
  $('#ipCalc', main).onclick = () => {
    const raw = $('#ipInput', main).value.trim();
    const parsed = parseCidr(raw);
    if (!parsed) { toast('格式应为有效的 IP/前缀，如 192.168.1.100/24', 'error'); return; }
    const { ip, octets, prefix } = parsed;
    const ipInt = ipToInt(octets), mask = maskFromPrefix(prefix);
    const net = (ipInt & mask) >>> 0, broadcast = (net | (~mask >>> 0)) >>> 0;
    const wildcard = (~mask >>> 0);
    const hostCount = prefix >= 31 ? Math.pow(2, 32 - prefix) : Math.max(0, Math.pow(2, 32 - prefix) - 2);
    const row = (k, v) => `<tr><th style="width:160px;">${k}</th><td class="mono">${v}</td><td><button class="btn sm ghost" data-copy-text="${v}">复制</button></td></tr>`;
    $('#ipTable', main).innerHTML = `<tr><th>${t('项目')}</th><th>${t('值')}</th><th></th></tr>
      ${row(t('IP 地址'), ip)}
      ${row(t('CIDR 前缀'), '/' + prefix)}
      ${row(t('子网掩码'), maskToStr(mask))}
      ${row(t('通配符掩码'), maskToStr(wildcard))}
      ${row(t('网络地址'), intToIp(net))}
      ${row(t('广播地址'), intToIp(broadcast))}
      ${row(t('可用主机范围'), prefix >= 31 ? intToIp(net) + ' ~ ' + intToIp(broadcast) : (net + 1 <= broadcast - 1 ? intToIp(net + 1) + ' ~ ' + intToIp(broadcast - 1) : '无'))}
      ${row(t('可用主机数'), String(hostCount))}
      ${row(t('IP 类型'), (ipInt >>> 24) === 10 ? t('A 类私有') : ((ipInt >>> 24) === 172 && ((ipInt >>> 16) & 255) >= 16 && ((ipInt >>> 16) & 255) <= 31 ? t('B 类私有') : ((ipInt >>> 24) === 192 && ((ipInt >>> 16) & 255) === 168 ? t('C 类私有') : t('公网'))))}`;
    $('#ipResultCard', main).style.display = 'block';
    toast('计算完成', 'success');
  };
  $('#ipSameCheck', main).onclick = () => {
    const a = parseCidr($('#ipA', main).value.trim());
    const b = parseIp($('#ipB', main).value.trim());
    if (!a) { toast('IP1 需含 CIDR 前缀，如 192.168.1.10/24', 'error'); return; }
    if (!b) { toast('IP2 格式错误', 'error'); return; }
    const mask = maskFromPrefix(a.prefix);
    const same = (ipToInt(a.octets) & mask) === (ipToInt(b.octets) & mask);
    $('#ipSameResult', main).innerHTML = same
      ? '<span class="tag success" style="padding:8px 16px;border-radius:8px;">✅ 同网段</span>'
      : '<span class="tag danger" style="padding:8px 16px;border-radius:8px;">❌ 不同网段</span>';
  };
}

/* ---------- 二维码识别 ---------- */
function renderQrDecode(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'qrdecode')) + `
    <div class="card">
      <div id="qdDrop" style="border:2px dashed var(--border);border-radius:var(--radius);padding:32px;text-align:center;cursor:pointer;transition:border-color .2s;">
        <div style="font-size:32px;">📷</div>
        <div style="margin-top:8px;color:var(--text-mute);">点击选择或拖拽二维码图片到此处</div>
        <div style="font-size:12px;color:var(--text-mute);margin-top:4px;">支持 PNG / JPEG / GIF / BMP</div>
      </div>
      <input type="file" id="qdFile" accept="image/*" style="display:none;" />
      <div id="qdPreview" style="margin-top:16px;display:none;">
        <img id="qdImg" style="max-width:300px;max-height:240px;border:1px solid var(--border);border-radius:8px;" />
      </div>
    </div>
    <div class="card" id="qdResultCard" style="display:none;">
      <label class="field-label">识别结果</label>
      <div id="qdStatus" style="margin-bottom:8px;"></div>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="qdResult">复制</button>
        <textarea class="textarea lg" id="qdResult" placeholder="识别内容将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  const drop = $('#qdDrop', main);
  const fileInput = $('#qdFile', main);
  drop.onclick = () => fileInput.click();
  drop.ondragover = e => { e.preventDefault(); drop.style.borderColor = 'var(--primary)'; };
  drop.ondragleave = () => { drop.style.borderColor = 'var(--border)'; };
  drop.ondrop = e => { e.preventDefault(); drop.style.borderColor = 'var(--border)'; if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
  fileInput.onchange = () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); };
  function handleFile(file) {
    if (!file.type.startsWith('image/')) { toast('请选择图片文件', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        $('#qdPreview', main).style.display = 'block';
        $('#qdImg', main).src = reader.result;
        $('#qdResultCard', main).style.display = 'block';
        // 用 canvas 取像素数据
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          $('#qdStatus', main).innerHTML = '<span class="tag success" style="padding:6px 12px;border-radius:6px;">✅ 识别成功</span>';
          $('#qdResult', main).value = code.data;
          toast('识别成功', 'success');
        } else {
          $('#qdStatus', main).innerHTML = '<span class="tag danger" style="padding:6px 12px;border-radius:6px;">❌ 未识别到二维码</span>';
          $('#qdResult', main).value = '';
          toast('未识别到二维码，请确认图片清晰', 'error');
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

DevKitRegistry.registerTools('misc', {
  regex: renderRegex,
  qrcode: renderQrcode,
  color: renderColor,
  radix: renderRadix,
  ipcalc: renderIpCalc,
  qrdecode: renderQrDecode,
});
})();
