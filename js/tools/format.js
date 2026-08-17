/* DevKit tools: format */

(() => {

/* ---------- JSON ---------- */
function renderJson(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'json')) + `
    <div class="card">
      ${textareaWrap('输入 JSON', 'jsonInput', '在此粘贴 JSON 文本，支持任意层级嵌套',
        '{\n  "name": "DevKit",\n  "version": "1.0",\n  "tools": ["json", "base64", "md5"]\n}')}
      <div class="btn-group">
        <button class="btn primary" id="jsonFormat">格式化</button>
        <button class="btn" id="jsonMinify">压缩</button>
        <button class="btn" id="jsonValidate">校验</button>
        <button class="btn" id="jsonEscape">转义</button>
        <button class="btn" id="jsonUnescape">反转义</button>
        <button class="btn ghost" id="jsonClear">清空</button>
      </div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="jsonOutput">复制</button>
        <textarea class="textarea lg" id="jsonOutput" placeholder="结果将显示在这里"></textarea>
      </div>
    </div>
  `;
  const input = $('#jsonInput', main), output = $('#jsonOutput', main);
  const setOut = (v, err) => { output.value = v; if (err) toast(err, 'error'); };

  $('#jsonFormat', main).onclick = () => {
    try { setOut(JSON.stringify(JSON.parse(input.value), null, 2)); toast('格式化成功', 'success'); }
    catch (e) { setOut('', true); toast('JSON 解析失败：' + e.message, 'error'); }
  };
  $('#jsonMinify', main).onclick = () => {
    try { setOut(JSON.stringify(JSON.parse(input.value))); toast('压缩成功', 'success'); }
    catch (e) { setOut('', true); toast('JSON 解析失败：' + e.message, 'error'); }
  };
  $('#jsonValidate', main).onclick = () => {
    try { JSON.parse(input.value); toast('✅ JSON 格式正确', 'success'); output.value = '✅ 有效的 JSON'; }
    catch (e) { toast('❌ JSON 格式错误', 'error'); output.value = '❌ ' + e.message; }
  };
  $('#jsonEscape', main).onclick = () => {
    output.value = input.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    toast('已转义', 'success');
  };
  $('#jsonUnescape', main).onclick = () => {
    output.value = input.value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    toast('已反转义', 'success');
  };
  $('#jsonClear', main).onclick = () => { input.value = ''; output.value = ''; };
}

/* ---------- 文本对比 ---------- */
function renderDiff(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'diff')) + `
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <label class="field-label">原始文本</label>
          <textarea class="textarea" id="dfLeft" rows="10" placeholder="粘贴原始文本"></textarea>
        </div>
        <div>
          <label class="field-label">修改后文本</label>
          <textarea class="textarea" id="dfRight" rows="10" placeholder="粘贴修改后文本"></textarea>
        </div>
      </div>
      <div class="btn-group" style="margin-top:12px;">
        <button class="btn primary" id="dfCompare">⚖️ 对比差异</button>
        <button class="btn" id="dfSwap">⇄ 交换</button>
        <button class="btn ghost" id="dfClear">清空</button>
      </div>
    </div>
    <div class="card" id="dfResultCard" style="display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <label class="field-label">对比结果</label>
        <div id="dfStats" style="font-size:13px;color:var(--text-mute);"></div>
      </div>
      <div id="dfResult" style="font-family:'SF Mono','Consolas','Courier New',monospace;font-size:13px;line-height:1.7;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;"></div>
    </div>
  `;
  // LCS diff
  function diffLines(a, b) {
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const ops = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ t: 'eq', v: a[i] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ t: 'del', v: a[i] }); i++; }
      else { ops.push({ t: 'add', v: b[j] }); j++; }
    }
    while (i < n) { ops.push({ t: 'del', v: a[i++] }); }
    while (j < m) { ops.push({ t: 'add', v: b[j++] }); }
    return ops;
  }
  $('#dfCompare', main).onclick = () => {
    const left = $('#dfLeft', main).value.split('\n');
    const right = $('#dfRight', main).value.split('\n');
    // LCS 需要 O(n*m) 内存；限制矩阵规模，避免大文本锁死页面。
    if (left.length * right.length > 2000000) {
      toast(lang === 'en' ? 'Text is too large (comparison limit exceeded)' : '文本过大，已超过安全对比上限', 'error');
      return;
    }
    const ops = diffLines(left, right);
    let add = 0, del = 0;
    const html = ops.map(o => {
      const esc = escapeHtml(o.v) || '&nbsp;';
      if (o.t === 'add') { add++; return `<div style="background:rgba(34,139,34,.12);color:#228b22;padding:1px 12px;border-left:3px solid #228b22;">+ ${esc}</div>`; }
      if (o.t === 'del') { del++; return `<div style="background:rgba(200,0,0,.12);color:#c00;padding:1px 12px;border-left:3px solid #c00;">- ${esc}</div>`; }
      return `<div style="color:var(--text-mute);padding:1px 12px;border-left:3px solid transparent;">&nbsp;&nbsp;${esc}</div>`;
    }).join('');
    $('#dfResult', main).innerHTML = html;
    $('#dfStats', main).textContent = lang === 'en' ? `Total ${ops.length} lines - +${add} - -${del}` : `共 ${ops.length} 行 · 新增 ${add} · 删除 ${del}`;
    $('#dfResultCard', main).style.display = 'block';
    toast('对比完成', 'success');
  };
  $('#dfSwap', main).onclick = () => {
    const l = $('#dfLeft', main).value;
    $('#dfLeft', main).value = $('#dfRight', main).value;
    $('#dfRight', main).value = l;
  };
  $('#dfClear', main).onclick = () => {
    $('#dfLeft', main).value = ''; $('#dfRight', main).value = '';
    $('#dfResultCard', main).style.display = 'none';
  };
}

/* ---------- JSON ↔ YAML ---------- */
function renderYaml(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'yaml')) + `
    <div class="card">
      <div class="row">
        <div class="field">
          <label class="field-label">转换方向</label>
          <select class="select" id="ymDir">
            <option value="j2y">JSON → YAML</option>
            <option value="y2j">YAML → JSON</option>
          </select>
        </div>
      </div>
      ${textareaWrap('输入', 'ymInput', '粘贴 JSON 或 YAML 文本', '{\n  "name": "DevKit",\n  "tools": ["json", "yaml"],\n  "version": 1.0\n}')}
      <div class="btn-group">
        <button class="btn primary" id="ymConvert">转换 →</button>
        <button class="btn ghost" id="ymClear">清空</button>
      </div>
      <div class="hint" id="ymHint">依赖 js-yaml 库（CDN 加载），本地浏览器运算。</div>
    </div>
    <div class="card">
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="ymOutput">复制</button>
        <textarea class="textarea lg" id="ymOutput" placeholder="转换结果将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  $('#ymConvert', main).onclick = () => {
    const dir = $('#ymDir', main).value;
    const input = $('#ymInput', main).value;
    const out = $('#ymOutput', main);
    try {
      if (dir === 'j2y') {
        const obj = JSON.parse(input);
        out.value = jsyaml.dump(obj, { indent: 2, lineWidth: 120 });
        toast('JSON → YAML 转换成功', 'success');
      } else {
        const obj = jsyaml.load(input);
        out.value = JSON.stringify(obj, null, 2);
        toast('YAML → JSON 转换成功', 'success');
      }
    } catch (e) {
      out.value = '';
      toast('转换失败：' + e.message, 'error');
    }
  };
  $('#ymClear', main).onclick = () => { $('#ymInput', main).value = ''; $('#ymOutput', main).value = ''; };
}

/* ---------- 文本去重/排序/统计 ---------- */
function renderTextTool(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'texttool')) + `
    <div class="card">
      ${textareaWrap('输入文本（每行一条）', 'ttInput', '一行一条，按行处理', '')}
      <div class="row" style="margin-top:12px;">
        <div class="field">
          <label class="field-label">去重</label>
          <select class="select" id="ttDedup">
            <option value="0">不去重</option>
            <option value="1" selected>去重（保留首次）</option>
            <option value="2">去重（保留末次）</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">排序</label>
          <select class="select" id="ttSort">
            <option value="0">不排序</option>
            <option value="asc">升序 (A-Z)</option>
            <option value="desc">降序 (Z-A)</option>
            <option value="len">按长度</option>
            <option value="rev">反转顺序</option>
            <option value="rand">随机打乱</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">其他</label>
          <select class="select" id="ttOpt">
            <option value="0">无</option>
            <option value="trim">去首尾空格</option>
            <option value="noblank">去空行</option>
            <option value="trim noblank">去空格+去空行</option>
          </select>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="ttRun">处理</button>
        <button class="btn" id="ttCopy">复制结果</button>
        <button class="btn ghost" id="ttClear">清空</button>
      </div>
    </div>
    <div class="card">
      <div class="row" style="margin-bottom:12px;">
        <div class="field"><label class="field-label">行数</label><div class="output-box" id="ttStatLines">-</div></div>
        <div class="field"><label class="field-label">字符数</label><div class="output-box" id="ttStatChars">-</div></div>
        <div class="field"><label class="field-label">字节数(UTF-8)</label><div class="output-box" id="ttStatBytes">-</div></div>
        <div class="field"><label class="field-label">非空行</label><div class="output-box" id="ttStatNonBlank">-</div></div>
      </div>
      <label class="field-label">输出结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="ttOutput">复制</button>
        <textarea class="textarea lg" id="ttOutput" placeholder="处理结果将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  $('#ttRun', main).onclick = () => {
    let lines = $('#ttInput', main).value.split('\n');
    const opt = $('#ttOpt', main).value;
    if (opt.includes('trim')) lines = lines.map(l => l.trim());
    if (opt.includes('noblank')) lines = lines.filter(l => l.trim() !== '');
    const dedup = $('#ttDedup', main).value;
    if (dedup === '1') { const seen = new Set(), out = []; for (const l of lines) if (!seen.has(l)) { seen.add(l); out.push(l); } lines = out; }
    else if (dedup === '2') { const seen = new Set(), out = []; for (let i = lines.length - 1; i >= 0; i--) if (!seen.has(lines[i])) { seen.add(lines[i]); out.unshift(lines[i]); } lines = out; }
    const sort = $('#ttSort', main).value;
    if (sort === 'asc') lines.sort((a, b) => a.localeCompare(b, 'zh'));
    else if (sort === 'desc') lines.sort((a, b) => b.localeCompare(a, 'zh'));
    else if (sort === 'len') lines.sort((a, b) => a.length - b.length);
    else if (sort === 'rev') lines.reverse();
    else if (sort === 'rand') { for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; } }
    const out = lines.join('\n');
    $('#ttOutput', main).value = out;
    $('#ttStatLines', main).textContent = lines.length;
    $('#ttStatChars', main).textContent = out.length;
    $('#ttStatBytes', main).textContent = new Blob([out]).size;
    $('#ttStatNonBlank', main).textContent = lines.filter(l => l.trim() !== '').length;
    toast('处理完成', 'success');
  };
  $('#ttCopy', main).onclick = () => copyText($('#ttOutput', main).value);
  $('#ttClear', main).onclick = () => { $('#ttInput', main).value = ''; $('#ttOutput', main).value = ''; ['Lines','Chars','Bytes','NonBlank'].forEach(k => $('#ttStat' + k, main).textContent = '-'); };
}

/* ---------- SQL 格式化 ---------- */
function renderSql(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'sql')) + `
    <div class="card">
      ${textareaWrap('输入 SQL', 'sqlInput', '粘贴需要格式化的 SQL 语句', 'select id, name, email from users where age > 18 and status = "active" order by name')}
      <div class="row" style="margin-top:12px;">
        <div class="field">
          <label class="field-label">关键字</label>
          <select class="select" id="sqlCase">
            <option value="upper" selected>大写</option>
            <option value="lower">小写</option>
            <option value="preserve">保持原样</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">缩进</label>
          <select class="select" id="sqlIndent">
            <option value="2" selected>2 空格</option>
            <option value="4">4 空格</option>
            <option value="tab">Tab</option>
          </select>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="sqlFormat">格式化</button>
        <button class="btn ghost" id="sqlClear">清空</button>
      </div>
      <div class="hint">基础格式化：关键字大写、主要子句换行缩进。非完整 SQL parser，复杂嵌套可能不完美。</div>
    </div>
    <div class="card">
      <label class="field-label">格式化结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="sqlOutput">复制</button>
        <textarea class="textarea lg" id="sqlOutput" placeholder="格式化后的 SQL 将显示在这里" readonly></textarea>
      </div>
    </div>
  `;
  const KEYWORDS = ['SELECT','DISTINCT','FROM','WHERE','AND','OR','NOT','IN','LIKE','BETWEEN','IS','NULL','ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','ON','UNION','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','INDEX','PRIMARY','KEY','FOREIGN','REFERENCES','DEFAULT','CONSTRAINT','CHECK','UNIQUE','CASE','WHEN','THEN','ELSE','END','AS','ASC','DESC','COUNT','SUM','AVG','MIN','MAX'];
  $('#sqlFormat', main).onclick = () => {
    let sql = $('#sqlInput', main).value.trim();
    if (!sql) { toast('请输入 SQL', 'error'); return; }
    const cas = $('#sqlCase', main).value;
    const indentStr = $('#sqlIndent', main).value === 'tab' ? '\t' : ' '.repeat(parseInt($('#sqlIndent', main).value));
    // 关键字替换
    const kwSet = new Set(KEYWORDS);
    // 先规范化空格
    sql = sql.replace(/\s+/g, ' ').trim();
    // 标记关键字（按单词边界）
    const tokens = sql.split(/(\s+|[(),;])/).filter(t => t !== '');
    const NEWLINE_BEFORE = new Set(['FROM','WHERE','AND','OR','GROUP','ORDER','HAVING','LIMIT','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','FULL JOIN','UNION','VALUES','SET','ON']);
    let out = '', indent = 0;
    tokens.forEach((tok, i) => {
      const upper = tok.toUpperCase();
      const isKw = kwSet.has(upper);
      const display = isKw ? (cas === 'upper' ? upper : cas === 'lower' ? upper.toLowerCase() : tok) : tok;
      if (isKw && NEWLINE_BEFORE.has(upper) && i > 0) {
        out += '\n' + indentStr.repeat(indent) + display + ' ';
      } else if (tok === ',') {
        out = out.trimEnd() + ',\n' + indentStr.repeat(indent);
      } else if (tok === '(') {
        out += '(';
      } else if (tok === ')') {
        out = out.trimEnd() + ')';
      } else if (tok === ';') {
        out = out.trimEnd() + ';';
      } else {
        out += display + ' ';
      }
    });
    // 子查询缩进：SELECT 后增加缩进，遇到外层 FROM 等恢复
    $('#sqlOutput', main).value = out.replace(/\s+$/g, '').replace(/\n /g, '\n');
    toast('格式化完成', 'success');
  };
  $('#sqlClear', main).onclick = () => { $('#sqlInput', main).value = ''; $('#sqlOutput', main).value = ''; };
}

DevKitRegistry.registerTools('format', {
  json: renderJson,
  diff: renderDiff,
  yaml: renderYaml,
  texttool: renderTextTool,
  sql: renderSql,
});
})();
