/* DevKit tools: identity */

(() => {

/* ---------- 邮政编码 ---------- */
function renderPostCode(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'postcode')) + `
    <div class="card">
      <h3 style="margin-bottom:12px;">🔍 邮编反查（根据邮编查省市区）</h3>
      <div class="field">
        <label class="field-label">输入邮政编码</label>
        <div class="row">
          <input class="input" id="pcReverseInput" type="text" inputmode="numeric" maxlength="6" placeholder="3 或 6 位邮政编码，如 100、100089" value="100089" />
          <button class="btn primary" id="pcReverseBtn">查询</button>
          <button class="btn ghost" id="pcReverseClear">清空</button>
        </div>
      </div>
      <div class="hint">说明：输入完整的 3 或 6 位邮政编码，查询对应的省/市/区。数据本地内置，不会上传。</div>
    </div>
    <div class="card" id="pcReverseCard" style="display:none;">
      <label class="field-label">查询结果</label>
      <div id="pcReverseResultList" style="display:flex;flex-direction:column;gap:10px;"></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:12px;">📮 省市区查邮编</h3>
      <div class="row">
        <div class="field">
          <label class="field-label">省份</label>
          <select class="select" id="pcProvince"><option value="">${t('请选择省份')}</option></select>
        </div>
        <div class="field">
          <label class="field-label">城市</label>
          <select class="select" id="pcCity"><option value="">${t('请先选择省份')}</option></select>
        </div>
        <div class="field">
          <label class="field-label">区/县</label>
          <select class="select" id="pcDistrict"><option value="">${t('请先选择城市')}</option></select>
        </div>
      </div>
      <button class="btn primary" id="pcForwardBtn">查询邮编</button>
    </div>
    <div class="card" id="pcForwardCard" style="display:none;">
      <label class="field-label">查询结果</label>
      <div id="pcForwardResultList" style="display:flex;flex-direction:column;gap:10px;"></div>
    </div>
  `;

  const DATA = window.POSTCODE_DATA || [];

  /* ===== 邮编反查 ===== */
  $('#pcReverseBtn', main).onclick = () => {
    const code = $('#pcReverseInput', main).value.trim();
    const card = $('#pcReverseCard', main);
    const listEl = $('#pcReverseResultList', main);
    card.style.display = 'block';

    if (!/^(?:\d{3}|\d{6})$/.test(code)) {
      listEl.innerHTML = '<div class="tag danger" style="padding:12px 16px;border-radius:8px;display:block;">' + t('格式错误：邮政编码应为 3 或 6 位数字') + '</div>';
      toast('格式错误', 'error');
      return;
    }
    const matches = DATA.filter(d => d.code === code);
    if (!matches.length) {
      listEl.innerHTML = `<div class="tag danger" style="padding:12px 16px;border-radius:8px;display:block;">未查询到邮编 <strong>${code}</strong> 对应的地区</div>`;
      toast('未找到对应地区', 'error');
      return;
    }

    listEl.innerHTML = matches.map(m => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-soft);border-radius:var(--radius);border:1px solid var(--border);gap:12px;">
        <div style="min-width:0;flex:1;">
          <div style="font-size:15px;font-weight:600;color:var(--text);line-height:1.5;">${m.province} ${m.city} ${m.district}</div>
          <div style="font-size:12px;color:var(--text-mute);margin-top:4px;">${m.province} / ${m.city} / ${m.district}</div>
        </div>
        <div style="flex-shrink:0;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--primary);letter-spacing:2px;font-family:'SF Mono',monospace;">${m.code}</div>
          <button class="btn sm ghost" data-copy-text="${m.code}" style="margin-top:4px;">${t('复制邮编')}</button>
        </div>
      </div>`).join('');
    toast(lang === 'en' ? `Found ${matches.length} records` : `找到 ${matches.length} 条记录`, 'success');
  };
  $('#pcReverseClear', main).onclick = () => {
    $('#pcReverseInput', main).value = '';
    $('#pcReverseCard', main).style.display = 'none';
  };

  /* ===== 省市区查邮编 ===== */
  const provSel = $('#pcProvince', main);
  const citySel = $('#pcCity', main);
  const distSel = $('#pcDistrict', main);

  const provinces = [...new Set(DATA.map(d => d.province))];
  provinces.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    provSel.appendChild(opt);
  });

  function fillCities() {
    citySel.innerHTML = `<option value="">${t('请选择城市')}</option>`;
    distSel.innerHTML = `<option value="">${t('请先选择城市')}</option>`;
    const prov = provSel.value;
    if (!prov) return;
    const cities = [...new Set(DATA.filter(d => d.province === prov).map(d => d.city))];
    cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      citySel.appendChild(opt);
    });
  }
  function fillDistricts() {
    distSel.innerHTML = `<option value="">${t('请选择区/县')}</option>`;
    const prov = provSel.value;
    const city = citySel.value;
    if (!city) return;
    const dists = [...new Set(DATA.filter(d => d.province === prov && d.city === city).map(d => d.district))];
    dists.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      distSel.appendChild(opt);
    });
  }
  provSel.addEventListener('change', fillCities);
  citySel.addEventListener('change', fillDistricts);

  $('#pcForwardBtn', main).onclick = () => {
    const prov = provSel.value;
    const city = citySel.value;
    const dist = distSel.value;
    const card = $('#pcForwardCard', main);
    const listEl = $('#pcForwardResultList', main);
    card.style.display = 'block';

    if (!prov) { toast(t('请选择省份'), 'error'); return; }
    let matches = DATA.filter(d => d.province === prov);
    if (city) matches = matches.filter(d => d.city === city);
    if (dist) matches = matches.filter(d => d.district === dist);

    if (!matches.length) {
      listEl.innerHTML = '<div class="tag danger" style="padding:12px 16px;border-radius:8px;display:block;">未找到匹配记录</div>';
      toast('未找到匹配记录', 'error');
      return;
    }

    listEl.innerHTML = matches.map(m => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg-soft);border-radius:var(--radius);border:1px solid var(--border);gap:12px;">
        <div style="min-width:0;flex:1;">
          <div style="font-size:15px;font-weight:600;color:var(--text);line-height:1.5;">${m.district}</div>
          <div style="font-size:12px;color:var(--text-mute);margin-top:4px;">${m.province} / ${m.city} / ${m.district}</div>
        </div>
        <div style="flex-shrink:0;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--primary);letter-spacing:2px;font-family:'SF Mono',monospace;">${m.code}</div>
          <button class="btn sm ghost" data-copy-text="${m.code}" style="margin-top:4px;">${t('复制邮编')}</button>
        </div>
      </div>`).join('');
    toast(lang === 'en' ? `Found ${matches.length} records` : `找到 ${matches.length} 条记录`, 'success');
  };
}

/* ---------- 身份证号 ---------- */
function renderIdCard(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'idcard')) + `
    <div class="card">
      <h3 style="margin-bottom:12px;">🎲 测试号码生成</h3>
      <div class="hint warning">⚠️ 生成的号码仅能通过校验位算法，不对应任何真实个人。仅限开发测试、表单填充等合法用途，请勿用于非法场景。</div>
      <div class="row">
        <div class="field">
          <label class="field-label">性别</label>
          <select class="select" id="genIdGender">
            <option value="random">随机</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">出生年份范围</label>
          <div class="row" style="gap:6px;">
            <input class="input" id="genIdYearFrom" type="number" value="1960" min="1900" max="2020" />
            <span style="align-self:center;color:var(--text-mute);">~</span>
            <input class="input" id="genIdYearTo" type="number" value="2005" min="1900" max="2020" />
          </div>
        </div>
        <div class="field">
          <label class="field-label">省份</label>
          <select class="select" id="genIdProvince">
            <option value="random">随机</option>
          </select>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="idGenBtn">🎲 生成</button>
        <button class="btn" id="idGenCopyAll">复制全部</button>
        <button class="btn ghost" id="idGenClear">清空结果</button>
      </div>
    </div>
    <div class="card" id="idGenCard" style="display:none;">
      <label class="field-label">生成结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="idGenOutput">复制</button>
        <textarea class="textarea gen" id="idGenOutput" placeholder="生成的身份证号码将显示在这里" readonly></textarea>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:12px;">📋 号码校验与解析</h3>
      <div class="field">
        <label class="field-label">输入身份证号码</label>
        <div class="row">
          <input class="input" id="idInput" type="text" maxlength="18" placeholder="18 位身份证号码" value="11010519491231002X" />
          <button class="btn primary" id="idCheck">校验并解析</button>
          <button class="btn ghost" id="idClear">清空</button>
        </div>
      </div>
      <div class="hint">说明：本工具仅在浏览器本地按 GB11643-1999 标准做格式校验与字段解析，不会上传任何数据。地区码仅解析到省级行政区。</div>
    </div>
    <div class="card" id="idResultCard" style="display:none;">
      <div class="field" style="display:flex;align-items:center;gap:12px;">
        <span id="idStatusTag"></span>
        <span id="idStatusText" style="font-weight:600;"></span>
      </div>
      <table class="table" id="idTable"></table>
    </div>
  `;

  // 权重与校验码映射（GB11643-1999）
  const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const ID_CHECK = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  // 填充省份下拉
  populateProvinceSelect($('#genIdProvince', main));

  function calcCheckCode(id17) {
    let sum = 0;
    for (let i = 0; i < 17; i++) sum += parseInt(id17[i], 10) * ID_WEIGHTS[i];
    return ID_CHECK[sum % 11];
  }

  /* ===== 生成逻辑 ===== */
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pad(n, len) { return String(n).padStart(len, '0'); }

  function genOneId() {
    // 省份码
    let provCode;
    const provVal = $('#genIdProvince', main).value;
    if (provVal === 'random') {
      const codes = Object.keys(PROVINCES);
      provCode = codes[randInt(0, codes.length - 1)];
    } else {
      provCode = provVal;
    }
    // 地区码后4位（市/县）随机
    const distCode = provCode + pad(randInt(0, 99), 2) + pad(randInt(0, 99), 2);

    // 出生日期
    const yFrom = parseInt($('#genIdYearFrom', main).value) || 1960;
    const yTo = parseInt($('#genIdYearTo', main).value) || 2005;
    const yMin = Math.min(yFrom, yTo), yMax = Math.max(yFrom, yTo);
    const year = randInt(yMin, yMax);
    const month = randInt(1, 12);
    // 当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = randInt(1, daysInMonth);
    const birth = pad(year, 4) + pad(month, 2) + pad(day, 2);

    // 顺序码
    const genderVal = $('#genIdGender', main).value;
    let seq;
    if (genderVal === 'male') seq = randInt(0, 499) * 2 + 1;       // 奇数 001-999
    else if (genderVal === 'female') seq = randInt(0, 499) * 2;    // 偶数 000-998
    else seq = randInt(0, 999);
    const seqStr = pad(seq, 3);

    const body = distCode + birth + seqStr;
    return body + calcCheckCode(body);
  }

  function doGen() {
    const n = 5; // 默认生成 5 个
    const list = [];
    for (let i = 0; i < n; i++) list.push(genOneId());
    $('#idGenCard', main).style.display = 'block';
    $('#idGenOutput', main).value = list.join('\n');
    toast(lang === 'en' ? `Generated ${n} test numbers` : `已生成 ${n} 个测试号码`, 'success');
  }

  $('#idGenBtn', main).onclick = doGen;
  $('#idGenCopyAll', main).onclick = () => copyText($('#idGenOutput', main).value);
  $('#idGenClear', main).onclick = () => {
    $('#idGenOutput', main).value = '';
    $('#idGenCard', main).style.display = 'none';
  };


  /* ===== 校验逻辑 ===== */
  $('#idCheck', main).onclick = () => {
    const id = $('#idInput', main).value.trim().toUpperCase();
    const card = $('#idResultCard', main);
    const tag = $('#idStatusTag', main);
    const txt = $('#idStatusText', main);
    const tbl = $('#idTable', main);
    card.style.display = 'block';

    const fail = (msg) => {
      tag.innerHTML = lang === 'en' ? '<span class="tag danger">Validation Failed</span>' : '<span class="tag danger">校验失败</span>';
      txt.style.color = 'var(--danger)';
      txt.textContent = msg;
      tbl.innerHTML = '';
    };

    if (!/^\d{17}[\dX]$/.test(id)) {
      fail('格式错误：应为 17 位数字 + 1 位数字或 X');
      toast('格式错误', 'error');
      return;
    }
    const expected = calcCheckCode(id.slice(0, 17));
    if (id[17] !== expected) {
      fail(`校验码错误：第 18 位应为「${expected}」，实际为「${id[17]}」`);
      toast('校验码错误', 'error');
      return;
    }

    // 解析字段
    const provinceCode = id.slice(0, 2);
    const province = PROVINCES[provinceCode] || (lang === 'en' ? 'Unknown' : '未知地区');
    const birthStr = id.slice(6, 14);
    const year = birthStr.slice(0, 4), month = birthStr.slice(4, 6), day = birthStr.slice(6, 8);
    const isDateValid = DevKitCore.isValidCalendarDate(Number(year), Number(month), Number(day));
    if (!isDateValid) {
      fail('出生日期无效');
      toast('出生日期无效', 'error');
      return;
    }

    const seq = parseInt(id.slice(14, 17), 10);
    const gender = seq % 2 === 1 ? t('男') : t('女');

    // 年龄计算
    const now = new Date();
    let age = now.getFullYear() - parseInt(year);
    const mDiff = now.getMonth() + 1 - parseInt(month);
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < parseInt(day))) age--;

    tag.innerHTML = lang === 'en' ? '<span class="tag success">Validation Passed</span>' : '<span class="tag success">校验通过</span>';
    txt.style.color = 'var(--success)';
    txt.textContent = t('身份证号码有效');
    tbl.innerHTML = `
      <tr><th style="width:140px;">${t('项目')}</th><th>${t('内容')}</th><th style="width:60px;"></th></tr>
      ${tableRow(t('身份证号码'), id, true)}
      ${tableRow(t('省份'), province)}
      ${tableRow(t('出生日期'), `${year}-${month}-${day}`)}
      ${tableRow(t('年龄'), age + (lang === 'en' ? ' yrs' : ' 岁'))}
      ${tableRow(t('性别'), gender)}
      ${tableRow(t('顺序码'), seq)}
      ${tableRow(t('校验码'), id[17])}
    `;
    toast('校验通过', 'success');
  };

  $('#idClear', main).onclick = () => {
    $('#idInput', main).value = '';
    $('#idResultCard', main).style.display = 'none';
  };
}

/* ---------- 营业执照号 ---------- */
function renderLicense(main) {
  main.innerHTML = toolHeader(TOOLS.find(t => t.id === 'license')) + `
    <div class="card">
      <h3 style="margin-bottom:12px;">🎲 测试号码生成</h3>
      <div class="hint warning">⚠️ 生成的号码仅能通过校验位算法，不对应任何真实企业。仅限开发测试、表单填充等合法用途，请勿用于非法场景。</div>
      <div class="row">
        <div class="field">
          <label class="field-label">代码类型</label>
          <select class="select" id="genLcType">
            <option value="usc">统一社会信用代码（18 位）</option>
            <option value="reg">营业执照注册号（15 位）</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">登记管理部门（仅 18 位）</label>
          <select class="select" id="genLcDept">
            <option value="random">随机</option>
            <option value="9">9 · 工商</option>
            <option value="1">1 · 机构编制</option>
            <option value="5">5 · 民政</option>
            <option value="Y">Y · 其他</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">省份</label>
          <select class="select" id="genLcProvince">
            <option value="random">随机</option>
          </select>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn primary" id="lcGenBtn">🎲 生成</button>
        <button class="btn" id="lcGenCopyAll">复制全部</button>
        <button class="btn ghost" id="lcGenClear">清空结果</button>
      </div>
    </div>
    <div class="card" id="lcGenCard" style="display:none;">
      <label class="field-label">生成结果</label>
      <div class="textarea-wrap">
        <button class="copy-btn" data-copy-target="lcGenOutput">复制</button>
        <textarea class="textarea gen" id="lcGenOutput" placeholder="生成的号码将显示在这里" readonly></textarea>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:12px;">📋 号码校验与解析</h3>
      <div class="field">
        <label class="field-label">输入统一社会信用代码 / 营业执照注册号</label>
        <div class="row">
          <input class="input" id="lcInput" type="text" maxlength="18" placeholder="18 位统一社会信用代码 或 15 位注册号" value="91350100M000100Y43" />
          <button class="btn primary" id="lcCheck">校验并解析</button>
          <button class="btn ghost" id="lcClear">清空</button>
        </div>
      </div>
      <div class="hint">说明：本工具仅在浏览器本地按 GB 32100-2015（统一社会信用代码）与 GB 11714-1997（营业执照注册号）标准做格式校验与字段解析，不会上传任何数据。</div>
    </div>
    <div class="card" id="lcResultCard" style="display:none;">
      <div class="field" style="display:flex;align-items:center;gap:12px;">
        <span id="lcStatusTag"></span>
        <span id="lcStatusText" style="font-weight:600;"></span>
      </div>
      <table class="table" id="lcTable"></table>
    </div>
  `;

  /* ===== 统一社会信用代码（18位）校验 ===== */
  const USC_CHARS = '0123456789ABCDEFGHJKLMNPQRTUWXY'; // 31 位字符集
  const USC_WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];

  const DEPT_MAP = {
    '1': '机构编制', '5': '民政', '9': '工商', 'Y': '其他'
  };
  const ORG_TYPE_BY_DEPT = {
    '9': { '1': '企业', '2': '个体工商户', '3': '农民专业合作社' },
    '1': { '1': '机关', '2': '事业单位', '3': '中央编办直接管理机构编制的群众团体', '9': '其他' },
    '5': { '1': '社会团体', '2': '民办非企业单位', '3': '基金会', '4': '宗教活动场所', '9': '其他' },
    'Y': { '9': '其他' }
  };

  // 填充省份下拉
  populateProvinceSelect($('#genLcProvince', main));

  function uscCheckCode(code17) {
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const idx = USC_CHARS.indexOf(code17[i]);
      if (idx < 0) return null;
      sum += idx * USC_WEIGHTS[i];
    }
    return USC_CHARS[(31 - (sum % 31)) % 31];
  }

  /* ===== 营业执照注册号（15位）校验 ===== */
  function regNoCheckCode(code14) {
    const weights = [];
    for (let i = 14; i >= 1; i--) weights.push((Math.pow(2, i) % 11));
    let sum = 0;
    for (let i = 0; i < 14; i++) sum += parseInt(code14[i], 10) * weights[i];
    const m = sum % 11;
    return m === 10 ? 'X' : String(m);
  }

  /* ===== 生成逻辑 ===== */
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pad(n, len) { return String(n).padStart(len, '0'); }
  function randChar(charset) { return charset[randInt(0, charset.length - 1)]; }

  function genOneUsc() {
    // 登记管理部门
    let deptCode;
    const deptVal = $('#genLcDept', main).value;
    if (deptVal === 'random') {
      deptCode = randChar('159Y');
    } else {
      deptCode = deptVal;
    }
    // 机构类别（根据部门可选范围）
    const orgTypes = Object.keys(ORG_TYPE_BY_DEPT[deptCode] || { '1': '' });
    const orgTypeCode = orgTypes[randInt(0, orgTypes.length - 1)];

    // 行政区划码 6 位
    let adminDiv;
    const provVal = $('#genLcProvince', main).value;
    if (provVal === 'random') {
      const codes = Object.keys(PROVINCES);
      adminDiv = codes[randInt(0, codes.length - 1)];
    } else {
      adminDiv = provVal;
    }
    adminDiv += pad(randInt(0, 99), 2) + pad(randInt(0, 99), 2);

    // 主体标识码 9 位（从字符集随机取，避免 I O S Z V）
    let subject = '';
    for (let i = 0; i < 9; i++) subject += randChar(USC_CHARS);

    const body = deptCode + orgTypeCode + adminDiv + subject;
    return body + uscCheckCode(body);
  }

  function genOneRegNo() {
    // 行政区划码 6 位
    let adminDiv;
    const provVal = $('#genLcProvince', main).value;
    if (provVal === 'random') {
      const codes = Object.keys(PROVINCES);
      adminDiv = codes[randInt(0, codes.length - 1)];
    } else {
      adminDiv = provVal;
    }
    adminDiv += pad(randInt(0, 99), 2) + pad(randInt(0, 99), 2);

    // 顺序码 8 位
    let seq = '';
    for (let i = 0; i < 8; i++) seq += randInt(0, 9);

    const body = adminDiv + seq;
    return body + regNoCheckCode(body);
  }

  function doGen() {
    const type = $('#genLcType', main).value;
    const n = 5; // 默认生成 5 个
    const list = [];
    for (let i = 0; i < n; i++) {
      list.push(type === 'usc' ? genOneUsc() : genOneRegNo());
    }
    $('#lcGenCard', main).style.display = 'block';
    $('#lcGenOutput', main).value = list.join('\n');
    toast(lang === 'en' ? `Generated ${n} test numbers` : `已生成 ${n} 个测试号码`, 'success');
  }

  $('#lcGenBtn', main).onclick = doGen;
  $('#lcGenCopyAll', main).onclick = () => copyText($('#lcGenOutput', main).value);
  $('#lcGenClear', main).onclick = () => {
    $('#lcGenOutput', main).value = '';
    $('#lcGenCard', main).style.display = 'none';
  };


  $('#lcCheck', main).onclick = () => {
    const code = $('#lcInput', main).value.trim().toUpperCase();
    const card = $('#lcResultCard', main);
    const tag = $('#lcStatusTag', main);
    const txt = $('#lcStatusText', main);
    const tbl = $('#lcTable', main);
    card.style.display = 'block';

    const fail = (msg) => {
      tag.innerHTML = lang === 'en' ? '<span class="tag danger">Validation Failed</span>' : '<span class="tag danger">校验失败</span>';
      txt.style.color = 'var(--danger)';
      txt.textContent = msg;
      tbl.innerHTML = '';
    };

    const rowLT = (k, v, copyable = false) => tableRow(k, v, copyable, 160);

    // 统一社会信用代码（18 位）
    if (code.length === 18) {
      if (!/^[0-9A-Z]{18}$/.test(code)) {
        fail('格式错误：应仅含数字与大写字母');
        toast('格式错误', 'error');
        return;
      }
      // 字符集校验
      for (const c of code) {
        if (USC_CHARS.indexOf(c) < 0) {
          fail(`非法字符「${c}」：统一社会信用代码不含 I O S Z V`);
          toast('字符非法', 'error');
          return;
        }
      }
      const expected = uscCheckCode(code.slice(0, 17));
      if (code[17] !== expected) {
        fail(`校验码错误：第 18 位应为「${expected}」，实际为「${code[17]}」`);
        toast('校验码错误', 'error');
        return;
      }

      const deptCode = code[0];
      const orgTypeCode = code[1];
      const adminDiv = code.slice(2, 8);
      const subjectCode = code.slice(8, 17);
      const province = PROVINCES[adminDiv.slice(0, 2)] || (lang === 'en' ? 'Unknown' : '未知地区');
      const dept = t(DEPT_MAP[deptCode] || (lang === 'en' ? 'Unknown' : '未知'));
      const orgType = t((ORG_TYPE_BY_DEPT[deptCode] && ORG_TYPE_BY_DEPT[deptCode][orgTypeCode]) || (lang === 'en' ? 'Unknown' : '未知'));

      tag.innerHTML = lang === 'en' ? '<span class="tag success">Validation Passed</span>' : '<span class="tag success">校验通过</span>';
      txt.style.color = 'var(--success)';
      txt.textContent = t('统一社会信用代码有效（18 位）');
      tbl.innerHTML = `
        <tr><th style="width:160px;">${t('项目')}</th><th>${t('内容')}</th><th style="width:60px;"></th></tr>
        ${rowLT(t('统一社会信用代码'), code, true)}
        ${rowLT(t('类型'), t('统一社会信用代码（18 位）'))}
        ${rowLT(t('登记管理部门'), `${deptCode} · ${dept}`)}
        ${rowLT(t('机构类别'), `${orgTypeCode} · ${orgType}`)}
        ${rowLT(t('登记管理机关'), `${adminDiv} · ${province}`)}
        ${rowLT(t('主体标识码'), subjectCode, true)}
        ${rowLT(t('校验码'), code[17])}
      `;
      toast('校验通过', 'success');
      return;
    }

    // 营业执照注册号（15 位）
    if (code.length === 15) {
      if (!/^\d{14}[\dX]$/.test(code)) {
        fail('格式错误：15 位注册号应为 14 位数字 + 1 位校验码');
        toast('格式错误', 'error');
        return;
      }
      const expected = regNoCheckCode(code.slice(0, 14));
      if (code[14] !== expected) {
        fail(`校验码错误：第 15 位应为「${expected}」，实际为「${code[14]}」`);
        toast('校验码错误', 'error');
        return;
      }
      const adminDiv = code.slice(0, 6);
      const province = PROVINCES[adminDiv.slice(0, 2)] || (lang === 'en' ? 'Unknown' : '未知地区');
      const seq = code.slice(6, 14);

      tag.innerHTML = lang === 'en' ? '<span class="tag success">Validation Passed</span>' : '<span class="tag success">校验通过</span>';
      txt.style.color = 'var(--success)';
      txt.textContent = t('营业执照注册号有效（15 位）');
      tbl.innerHTML = `
        <tr><th style="width:160px;">${t('项目')}</th><th>${t('内容')}</th><th style="width:60px;"></th></tr>
        ${rowLT(t('营业执照注册号'), code, true)}
        ${rowLT(t('类型'), t('营业执照注册号（15 位）'))}
        ${rowLT(t('登记管理机关'), `${adminDiv} · ${province}`)}
        ${rowLT(t('顺序码'), seq, true)}
        ${rowLT(t('校验码'), code[14])}
      `;
      toast('校验通过', 'success');
      return;
    }

    fail(`长度错误：当前 ${code.length} 位，应为 18 位（统一社会信用代码）或 15 位（营业执照注册号）`);
    toast('长度错误', 'error');
  };

  $('#lcClear', main).onclick = () => {
    $('#lcInput', main).value = '';
    $('#lcResultCard', main).style.display = 'none';
  };
}

DevKitRegistry.registerTools('identity', {
  postcode: renderPostCode,
  idcard: renderIdCard,
  license: renderLicense,
});
})();
