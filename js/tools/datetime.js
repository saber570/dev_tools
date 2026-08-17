/* DevKit tools: datetime */

(() => {

/* ---------- 时间戳 ---------- */
function renderTimestamp(main) {
  const now = Math.floor(Date.now() / 1000);
  const nowMs = Date.now();
  const nowDate = new Date();
  const fmt = (d) => {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'timestamp')) + `
    <div class="card">
      <div class="field">
        <label class="field-label">当前时间</label>
        <table class="table">
          <tr><th>${t('时间戳（秒）')}</th><th>${t('时间戳（毫秒）')}</th><th>${t('本地时间')}</th><th>${t('UTC 时间')}</th></tr>
          <tr>
            <td class="mono" id="tsNow">${now}</td>
            <td class="mono" id="tsNowMs">${nowMs}</td>
            <td class="mono" id="tsNowLocal">${fmt(nowDate)}</td>
            <td class="mono" id="tsNowUtc">${nowDate.toISOString()}</td>
          </tr>
        </table>
        <button class="btn sm" id="tsRefresh" style="margin-top:8px;">🔄 刷新</button>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">时间戳 → 日期</h3>
      <div class="row">
        <div class="field">
          <label class="field-label">时间戳</label>
          <input class="input" id="ts2dInput" type="text" value="${now}" placeholder="秒或毫秒" />
        </div>
        <div class="field">
          <label class="field-label">单位</label>
          <select class="select" id="ts2dUnit">
            <option value="s">秒</option>
            <option value="ms">毫秒</option>
          </select>
        </div>
      </div>
      <button class="btn primary" id="ts2dBtn">转换 →</button>
      <div id="ts2dResult" style="margin-top:12px;"></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">日期 → 时间戳</h3>
      <div class="row">
        <div class="field">
          <label class="field-label">日期时间</label>
          <input class="input" id="d2tsInput" type="text" value="${fmt(nowDate)}" placeholder="YYYY-MM-DD HH:mm:ss" />
        </div>
      </div>
      <button class="btn primary" id="d2tsBtn">转换 →</button>
      <div id="d2tsResult" style="margin-top:12px;"></div>
    </div>
  `;
  const refresh = () => {
    const n = Math.floor(Date.now() / 1000);
    $('#tsNow', main).textContent = n;
    $('#tsNowMs', main).textContent = Date.now();
    $('#tsNowLocal', main).textContent = fmt(new Date());
    $('#tsNowUtc', main).textContent = new Date().toISOString();
  };
  $('#tsRefresh', main).onclick = refresh;
  const timer = setInterval(refresh, 1000);

  $('#ts2dBtn', main).onclick = () => {
    let v = parseInt($('#ts2dInput', main).value.trim());
    if (isNaN(v)) { toast('请输入有效数字', 'error'); return; }
    if ($('#ts2dUnit', main).value === 's') v *= 1000;
    const d = new Date(v);
    $('#ts2dResult', main).innerHTML = `
      <table class="table">
        <tr><th>${t('本地时间')}</th><th>${t('UTC 时间')}</th><th>ISO 8601</th></tr>
        <tr>
          <td class="mono">${fmt(d)}</td>
          <td class="mono">${d.toUTCString()}</td>
          <td class="mono">${d.toISOString()}</td>
        </tr>
      </table>`;
  };
  $('#d2tsBtn', main).onclick = () => {
    const s = $('#d2tsInput', main).value.trim();
    const d = new Date(s.replace(/-/g, '/'));
    if (isNaN(d.getTime())) { toast('日期格式错误', 'error'); return; }
    $('#d2tsResult', main).innerHTML = `
      <table class="table">
        <tr><th>${t('秒级时间戳')}</th><th>${t('毫秒级时间戳')}</th></tr>
        <tr>
          <td class="mono">${Math.floor(d.getTime() / 1000)}</td>
          <td class="mono">${d.getTime()}</td>
        </tr>
      </table>`;
  };
  // 切换工具时清理定时器
  main._cleanup = () => clearInterval(timer);
}

/* ---------- 世界时间 ---------- */
function renderWorldTime(main) {
  const fmtTime = (d) => {
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  const fmtDate = (d) => {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  };
  const fmtWeekday = (d) => [t('周日'),t('周一'),t('周二'),t('周三'),t('周四'),t('周五'),t('周六')][d.getDay()];

  const cities = [
    { name: t('北京'), tz: 'Asia/Shanghai', emoji: '🇨🇳', offset: '+8' },
    { name: t('东京'), tz: 'Asia/Tokyo', emoji: '🇯🇵', offset: '+9' },
    { name: t('悉尼'), tz: 'Australia/Sydney', emoji: '🇦🇺', offset: '+10' },
    { name: t('迪拜'), tz: 'Asia/Dubai', emoji: '🇦🇪', offset: '+4' },
    { name: t('莫斯科'), tz: 'Europe/Moscow', emoji: '🇷🇺', offset: '+3' },
    { name: t('巴黎'), tz: 'Europe/Paris', emoji: '🇫🇷', offset: '+2' },
    { name: t('伦敦'), tz: 'Europe/London', emoji: '🇬🇧', offset: '+1' },
    { name: t('纽约'), tz: 'America/New_York', emoji: '🇺🇸', offset: '-4' },
    { name: t('温哥华'), tz: 'America/Vancouver', emoji: '🇨🇦', offset: '-7' },
    { name: t('洛杉矶'), tz: 'America/Los_Angeles', emoji: '🇺🇸', offset: '-7' },
  ];

  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'worldtime')) + `
    <div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span style="font-size:32px;">🇨🇳</span>
        <div>
          <div style="font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:2px;" id="wtBeijing">--:--:--</div>
          <div style="font-size:13px;color:var(--text-mute);" id="wtBeijingFull"></div>
        </div>
      </div>
    </div>
    <div class="card" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
      <div>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:2px;">${t('Unix 时间戳')}</div>
        <div style="font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;cursor:pointer;color:var(--primary);" id="wtTs" title="点击复制"></div>
      </div>
      <div style="width:1px;height:32px;background:var(--border);"></div>
      <div>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:2px;">UTC</div>
        <div class="mono" id="wtUtc" style="font-size:13px;"></div>
      </div>
      <div style="width:1px;height:32px;background:var(--border);"></div>
      <div>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:2px;">ISO 8601</div>
        <div class="mono" id="wtIso" style="font-size:13px;"></div>
      </div>
      <div style="width:1px;height:32px;background:var(--border);"></div>
      <div>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:2px;">${t('本地时间')}</div>
        <div class="mono" id="wtLocal" style="font-size:13px;"></div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">🌏 全球主要城市</h3>
      <div class="wt-city-grid">${cities.map(c => `
        <div class="wt-city">
          <div class="wt-city-head">
            <span>${c.emoji}</span>
            <span style="font-weight:600;">${c.name}</span>
            <span style="font-size:11px;color:var(--text-mute);">UTC${c.offset}</span>
          </div>
          <div class="wt-city-time" data-tz="${c.tz}">--:--:--</div>
          <div class="wt-city-date" data-tz="${c.tz}"></div>
        </div>
      `).join('')}</div>
    </div>
  `;

  const update = () => {
    const now = new Date();

    // 北京时间
    const bj = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    $('#wtBeijing', main).textContent = fmtTime(bj);
    $('#wtBeijingFull', main).textContent = `${fmtDate(bj)} ${fmtWeekday(bj)}  ·  ${t('北京时间（UTC+8）')}`;

    // 时间戳
    $('#wtTs', main).textContent = Math.floor(now.getTime() / 1000);
    $('#wtUtc', main).textContent = now.toUTCString();
    $('#wtIso', main).textContent = now.toISOString();
    $('#wtLocal', main).textContent = `${fmtDate(now)} ${fmtTime(now)} ${fmtWeekday(now)}`;

    // 各城市时间
    $$('.wt-city-time', main).forEach(el => {
      const tz = el.dataset.tz;
      const d = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      el.textContent = fmtTime(d);
    });
    $$('.wt-city-date', main).forEach(el => {
      const tz = el.dataset.tz;
      const d = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      el.textContent = `${fmtDate(d)} ${fmtWeekday(d)}`;
    });
  };

  update();
  const timer = setInterval(update, 500);
  $('#wtTs', main).addEventListener('click', () => copyText($('#wtTs', main).textContent));
  main._cleanup = () => clearInterval(timer);
}

/* ---------- Cron 表达式解析 ---------- */
function renderCron(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'cron')) + `
    <div class="card">
      <div class="field">
        <label class="field-label">Cron 表达式（5 段：分 时 日 月 周）</label>
        <input class="input mono" id="crInput" type="text" value="0 9 * * 1-5" placeholder="如 0 9 * * 1-5（工作日9点）" />
      </div>
      <div class="btn-group">
        <button class="btn primary" id="crParse">解析</button>
        <button class="btn ghost" id="crClear">清空</button>
      </div>
      <div class="hint">支持 * / - , 和数字。示例：*/5 * * * *（每5分钟）、0 0 1 * *（每月1号）、0 9 * * 1-5（工作日9点）</div>
    </div>
    <div class="card" id="crCard" style="display:none;">
      <label class="field-label">中文说明</label>
      <div class="output-box" id="crDesc" style="margin-bottom:16px;"></div>
      <label class="field-label">未来 5 次执行时间</label>
      <div id="crNext" style="font-family:'SF Mono','Consolas',monospace;font-size:14px;line-height:2;"></div>
    </div>
  `;
  // cron 字段配置
  const FIELDS = [
    { name: t('分钟'), min: 0, max: 59 },
    { name: t('小时'), min: 0, max: 23 },
    { name: t('日'), min: 1, max: 31 },
    { name: t('月'), min: 1, max: 12 },
    { name: t('星期'), min: 0, max: 6 },
  ];
  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
  function parseField(expr, min, max) {
    const vals = new Set();
    const parseValue = value => {
      if (!/^\d+$/.test(value)) throw new Error('invalid number');
      const n = Number(value);
      if (!Number.isInteger(n) || n < min || n > max) throw new Error('out of range');
      return n;
    };
    const parseRange = value => {
      const pieces = value.split('-');
      if (pieces.length === 1) {
        const n = parseValue(pieces[0]);
        return [n, n];
      }
      if (pieces.length !== 2) throw new Error('invalid range');
      const lo = parseValue(pieces[0]);
      const hi = parseValue(pieces[1]);
      if (lo > hi) throw new Error('reversed range');
      return [lo, hi];
    };
    for (const part of expr.split(',')) {
      const p = part.trim();
      if (!p) throw new Error('empty field');
      if (p === '*') { for (let i = min; i <= max; i++) vals.add(i); }
      else if (p.includes('/')) {
        const pieces = p.split('/');
        if (pieces.length !== 2 || !/^\d+$/.test(pieces[1])) throw new Error('invalid step');
        const [base, step] = pieces;
        const s = Number(step);
        if (!Number.isInteger(s) || s <= 0 || s > max - min + 1) throw new Error('invalid step');
        let lo = min, hi = max;
        if (base !== '*') {
          if (base.includes('-')) [lo, hi] = parseRange(base);
          else lo = parseValue(base);
        }
        for (let i = lo; i <= hi; i += s) vals.add(i);
      } else if (p.includes('-')) {
        const [lo, hi] = parseRange(p);
        for (let i = lo; i <= hi; i++) vals.add(i);
      } else {
        vals.add(parseValue(p));
      }
    }
    return vals;
  }
  function describe(vals, min, max, name) {
    if (vals.size === max - min + 1) return (lang === 'en' ? 'Every ' + name : `每${name}`);
    const arr = [...vals].sort((a, b) => a - b);
    return `${name} ${arr.map(v => name === t('星期') ? (lang === 'en' ? WEEKDAYS[v] : '周' + WEEKDAYS[v]) : v).join(lang === 'en' ? ', ' : '、')}`;
  }
  function matchField(vals, v) { return vals.has(v); }
  $('#crParse', main).onclick = () => {
    const parts = $('#crInput', main).value.trim().split(/\s+/);
    if (parts.length !== 5) { toast('需要 5 段：分 时 日 月 周', 'error'); return; }
    let fieldSets;
    try {
      fieldSets = parts.map((p, i) => parseField(p, FIELDS[i].min, FIELDS[i].max));
    } catch (e) { toast('表达式解析失败', 'error'); return; }
    if (fieldSets.some(s => s.size === 0)) { toast('表达式无效', 'error'); return; }
    const desc = fieldSets.map((s, i) => describe(s, FIELDS[i].min, FIELDS[i].max, FIELDS[i].name)).join('，');
    $('#crDesc', main).textContent = desc;
    // 计算未来 5 次
    const next = [];
    let d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);
    const limit = new Date(Date.now() + 366 * 86400000);
    while (next.length < 5 && d < limit) {
      if (fieldSets[0].has(d.getMinutes()) && fieldSets[1].has(d.getHours()) &&
          fieldSets[2].has(d.getDate()) && fieldSets[3].has(d.getMonth() + 1) &&
          fieldSets[4].has(d.getDay())) {
        next.push(new Date(d));
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    const pad = n => String(n).padStart(2, '0');
    $('#crNext', main).innerHTML = next.length ? next.map((t, i) =>
      `<div>${i + 1}. ${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())} ${lang === 'en' ? WEEKDAYS[t.getDay()] : '周' + WEEKDAYS[t.getDay()]}</div>`).join('')
      : '<div style="color:var(--text-mute);">一年内无匹配时间</div>';
    $('#crCard', main).style.display = 'block';
    toast('解析成功', 'success');
  };
  $('#crClear', main).onclick = () => { $('#crInput', main).value = ''; $('#crCard', main).style.display = 'none'; };
}

DevKitRegistry.registerTools('datetime', {
  timestamp: renderTimestamp,
  worldtime: renderWorldTime,
  cron: renderCron,
});
})();
