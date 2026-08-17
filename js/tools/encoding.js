/* DevKit tools: encoding */

(() => {

/* ---------- Base64 ---------- */
function renderBase64(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'base64')) + `
    <div class="card">
      ${textareaWrap('输入文本', 'b64Input', '输入要编码/解码的内容', 'Hello DevKit')}
      <div class="checkbox-row">
        <input type="checkbox" id="b64UrlSafe"><label for="b64UrlSafe">URL Safe（用 -_ 替换 +/，去掉 =）</label>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="b64Encode">编码 →</button>
        <button class="btn primary" id="b64Decode">← 解码</button>
        <button class="btn ghost" id="b64Clear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="b64Output">复制</button>
        <textarea class="textarea lg" id="b64Output" placeholder="结果将显示在这里"></textarea>
      </div>
    </div>
  `;
  const input = $('#b64Input', main), output = $('#b64Output', main);
  const isUrlSafe = () => $('#b64UrlSafe', main).checked;

  $('#b64Encode', main).onclick = () => {
    try {
      const utf8 = unescape(encodeURIComponent(input.value));
      let r = btoa(utf8);
      if (isUrlSafe()) r = r.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      output.value = r; toast('编码成功', 'success');
    } catch (e) { toast('编码失败：' + e.message, 'error'); }
  };
  $('#b64Decode', main).onclick = () => {
    try {
      let s = input.value.trim();
      if (isUrlSafe()) s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      output.value = decodeURIComponent(escape(atob(s)));
      toast('解码成功', 'success');
    } catch (e) { toast('解码失败：请检查输入是否为有效 Base64', 'error'); }
  };
  $('#b64Clear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- URL 编码 ---------- */
function renderUrl(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'url')) + `
    <div class="card">
      ${textareaWrap('输入文本', 'urlInput', '输入要编码/解码的 URL 或文本', 'https://example.com/搜索?q=开发者工具')}
      <div class="btn-group">
        <button class="btn primary" id="urlEncodeAll">全编码 encodeURI</button>
        <button class="btn primary" id="urlEncodeComp">组件编码 encodeURIComponent</button>
        <button class="btn" id="urlDecodeAll">全解码 decodeURI</button>
        <button class="btn" id="urlDecodeComp">组件解码 decodeURIComponent</button>
        <button class="btn ghost" id="urlClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="urlOutput">复制</button>
        <textarea class="textarea lg" id="urlOutput" placeholder="结果将显示在这里"></textarea>
      </div>
    </div>
  `;
  const input = $('#urlInput', main), output = $('#urlOutput', main);
  const safe = fn => () => {
    try { output.value = fn(input.value); toast('完成', 'success'); }
    catch (e) { toast('操作失败：' + e.message, 'error'); }
  };
  $('#urlEncodeAll', main).onclick = safe(encodeURI);
  $('#urlEncodeComp', main).onclick = safe(encodeURIComponent);
  $('#urlDecodeAll', main).onclick = safe(decodeURI);
  $('#urlDecodeComp', main).onclick = safe(decodeURIComponent);
  $('#urlClear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- HTML 转义 ---------- */
function renderHtmlEscape(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'html-escape')) + `
    <div class="card">
      ${textareaWrap('输入文本', 'htmlInput', '输入要转义/反转义的 HTML 文本',
        '<div class="box">Hello & "World"</div>')}
      <div class="btn-group">
        <button class="btn primary" id="htmlEscape">转义 →</button>
        <button class="btn primary" id="htmlUnescape">← 反转义</button>
        <button class="btn ghost" id="htmlClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="htmlOutput">复制</button>
        <textarea class="textarea lg" id="htmlOutput" placeholder="结果将显示在这里"></textarea>
      </div>
    </div>
  `;
  const input = $('#htmlInput', main), output = $('#htmlOutput', main);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const rmap = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&apos;': "'" };
  $('#htmlEscape', main).onclick = () => {
    output.value = input.value.replace(/[&<>"']/g, c => map[c]);
    toast('已转义', 'success');
  };
  $('#htmlUnescape', main).onclick = () => {
    output.value = input.value.replace(/&(amp|lt|gt|quot|#39|#x27|apos);/g, m => rmap[m]);
    toast('已反转义', 'success');
  };
  $('#htmlClear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- Unicode ---------- */
function renderUnicode(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'unicode')) + `
    <div class="card">
      ${textareaWrap('输入文本', 'uniInput', '中文 ↔ Unicode（\\uXXXX）', '开发者工具箱 DevKit')}
      <div class="btn-group">
        <button class="btn primary" id="uniEncode">中文 → Unicode</button>
        <button class="btn primary" id="uniDecode">Unicode → 中文</button>
        <button class="btn" id="uniEncodeAll">全部 → Unicode</button>
        <button class="btn ghost" id="uniClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="uniOutput">复制</button>
        <textarea class="textarea lg" id="uniOutput" placeholder="结果将显示在这里"></textarea>
      </div>
    </div>
  `;
  const input = $('#uniInput', main), output = $('#uniOutput', main);
  $('#uniEncode', main).onclick = () => {
    output.value = input.value.replace(/[\u4e00-\u9fa5]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
    toast('已转换', 'success');
  };
  $('#uniEncodeAll', main).onclick = () => {
    output.value = input.value.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
    toast('已转换', 'success');
  };
  $('#uniDecode', main).onclick = () => {
    output.value = input.value.replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
    toast('已转换', 'success');
  };
  $('#uniClear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- 图片 ↔ Base64 ---------- */
function renderImgBase64(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'imgbase64')) + `
    <div class="card">
      <h3 style="margin-bottom:12px;">🖼️ 图片转 Base64</h3>
      <div id="ibDrop" style="border:2px dashed var(--border);border-radius:var(--radius);padding:32px;text-align:center;cursor:pointer;transition:border-color .2s;">
        <div style="font-size:32px;">📁</div>
        <div style="margin-top:8px;color:var(--text-mute);">点击选择或拖拽图片到此处</div>
        <div style="font-size:12px;color:var(--text-mute);margin-top:4px;">支持 PNG / JPEG / GIF / WebP / SVG</div>
      </div>
      <input type="file" id="ibFile" accept="image/*" style="display:none;" />
      <div id="ibPreview" style="margin-top:16px;display:none;">
        <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
          <img id="ibImg" style="max-width:240px;max-height:200px;border:1px solid var(--border);border-radius:8px;" />
          <div style="flex:1;min-width:200px;">
            <div id="ibMeta" style="color:var(--text-mute);font-size:13px;line-height:1.8;"></div>
            <div class="btn-group" style="margin-top:8px;">
              <button class="btn" id="ibCopyData">复制 data URI</button>
              <button class="btn" id="ibCopyRaw">复制纯 Base64</button>
            </div>
          </div>
        </div>
        <div class="textarea-wrap" style="margin-top:12px;">
          <button class="copy-btn" data-copy-target="ibOut">复制</button>
          <textarea class="textarea" id="ibOut" rows="4" readonly style="font-size:12px;"></textarea>
        </div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">🔁 Base64 转图片</h3>
      ${textareaWrap('粘贴 Base64 或 data URI', 'ibRev', '粘贴图片的 Base64 编码或 data:image/... URI')}
      <div class="btn-group">
        <button class="btn primary" id="ibRevBtn">预览图片</button>
        <button class="btn ghost" id="ibRevClear">清空</button>
      </div>
      <div id="ibRevPreview" style="margin-top:16px;text-align:center;display:none;">
        <img id="ibRevImg" style="max-width:100%;max-height:400px;border:1px solid var(--border);border-radius:8px;" />
      </div>
    </div>
  `;
  const drop = $('#ibDrop', main);
  const fileInput = $('#ibFile', main);
  drop.onclick = () => fileInput.click();
  drop.ondragover = e => { e.preventDefault(); drop.style.borderColor = 'var(--primary)'; };
  drop.ondragleave = () => { drop.style.borderColor = 'var(--border)'; };
  drop.ondrop = e => { e.preventDefault(); drop.style.borderColor = 'var(--border)'; if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
  fileInput.onchange = () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); };
  function handleFile(file) {
    if (!file.type.startsWith('image/')) { toast('请选择图片文件', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result;
      $('#ibPreview', main).style.display = 'block';
      $('#ibImg', main).src = dataUri;
      $('#ibOut', main).value = dataUri;
      $('#ibMeta', main).innerHTML = lang === 'en' ? `File: ${escapeHtml(file.name)}<br>Type: ${file.type}<br>Size: ${(file.size / 1024).toFixed(1)} KB<br>Base64 length: ${dataUri.length} chars` : `文件名：${escapeHtml(file.name)}<br>类型：${file.type}<br>大小：${(file.size / 1024).toFixed(1)} KB<br>Base64 长度：${dataUri.length} 字符`;
      toast('转换成功', 'success');
    };
    reader.readAsDataURL(file);
  }
  $('#ibCopyData', main).onclick = () => copyText($('#ibOut', main).value);
  $('#ibCopyRaw', main).onclick = () => {
    const v = $('#ibOut', main).value;
    const raw = v.replace(/^data:image\/[^;]+;base64,/, '');
    copyText(raw);
  };
  $('#ibRevBtn', main).onclick = () => {
    let v = $('#ibRev', main).value.trim();
    if (!v) { toast('请粘贴 Base64 内容', 'error'); return; }
    if (!v.startsWith('data:')) {
      v = 'data:image/png;base64,' + v.replace(/\s/g, '');
    }
    $('#ibRevPreview', main).style.display = 'block';
    $('#ibRevImg', main).src = v;
    $('#ibRevImg', main).onerror = () => { toast('无法解析为图片，请检查 Base64 内容', 'error'); $('#ibRevPreview', main).style.display = 'none'; };
    toast('预览成功', 'success');
  };
  $('#ibRevClear', main).onclick = () => { $('#ibRev', main).value = ''; $('#ibRevPreview', main).style.display = 'none'; };
}

DevKitRegistry.registerTools('encoding', {
  base64: renderBase64,
  url: renderUrl,
  'html-escape': renderHtmlEscape,
  unicode: renderUnicode,
  imgbase64: renderImgBase64,
});
})();
