/* =========================================================
   DevKit · 开发者工具箱  纯静态实现
   ========================================================= */

/* ---------- 工具函数 ---------- */
const $ = (sel, p = document) => p.querySelector(sel);
const $$ = (sel, p = document) => Array.from(p.querySelectorAll(sel));

function toast(msg, type = '') {
  if (lang === 'en' && I18N[msg]) msg = I18N[msg];
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = 'toast', 1800);
}
function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => toast('已复制', 'success'),
    () => toast('复制失败', 'error')
  );
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- i18n 国际化 ---------- */
let lang = localStorage.getItem('devkit-lang') || 'zh';
const I18N = {
  /* Groups */
  '首页': 'Home', '编码解码': 'Encoding', '证件工具': 'ID & License',
  '加密哈希': 'Crypto', '文本工具': 'Text Tools', '其他工具': 'Others',
  '常用': 'Common',
  /* Tool names */
  'JSON 格式化': 'JSON Formatter', 'JSON ↔ YAML': 'JSON ↔ YAML',
  'Base64': 'Base64', 'URL 编码': 'URL Encode', 'HTML 转义': 'HTML Escape',
  'Unicode 转换': 'Unicode Convert', '图片 ↔ Base64': 'Image ↔ Base64',
  '身份证号': 'ID Card Number', '营业执照号': 'Business License',
  '邮政编码': 'Postal Code', 'MD5/SHA 哈希': 'MD5/SHA Hash',
  'AES 加解密': 'AES Encrypt/Decrypt', 'UUID 生成': 'UUID Generator',
  '时间戳': 'Timestamp', '世界时间': 'World Clock',
  '正则测试': 'Regex Tester', '密码生成器': 'Password Generator',
  '文本对比': 'Text Diff', '文本去重排序': 'Text Dedupe & Sort',
  'Cron 解析': 'Cron Parser', '二维码生成': 'QR Code Generator',
  '颜色转换': 'Color Converter', 'JWT 解析': 'JWT Decoder',
  '进制转换': 'Radix Converter', 'IP 子网计算': 'IP Subnet Calc',
  'SQL 格式化': 'SQL Formatter', '二维码识别': 'QR Code Reader',
  /* Tool descriptions */
  '格式化、压缩、校验 JSON 数据': 'Format, minify, validate JSON',
  'JSON 与 YAML 双向转换': 'Convert between JSON and YAML',
  'Base64 编码与解码': 'Base64 encode and decode',
  'URL 编码与解码': 'URL encode and decode',
  'HTML 实体转义与反转义': 'HTML entity escape and unescape',
  '中文与 Unicode 互转': 'Convert between Chinese and Unicode',
  '图片转 Base64 / Base64 预览图片': 'Image to Base64 / Base64 to image',
  '身份证号校验、解析（性别/生日/地区）': 'ID card number validation and parsing',
  '统一社会信用代码 / 营业执照注册号校验解析': 'USCC / Business License validation',
  '省市区 ↔ 邮编 互查': 'Province/city/district <-> postal code',
  'MD5、SHA1、SHA256、SHA512 哈希计算': 'MD5, SHA1, SHA256, SHA512 hash',
  'AES 对称加密与解密': 'AES symmetric encryption and decryption',
  '批量生成 UUID/GUID': 'Batch generate UUID/GUID',
  '时间戳与日期互转': 'Convert between timestamp and date',
  '全球实时时间、时区查询': 'World time and timezone query',
  '正则表达式匹配测试': 'Regex match testing',
  '自定义规则批量生成随机密码': 'Generate random passwords with custom rules',
  '逐行对比两段文本差异': 'Line-by-line text diff comparison',
  '按行去重、排序、统计': 'Dedupe, sort, count by line',
  'Cron 表达式翻译 + 下次执行时间': 'Cron expression parser with next runs',
  '生成二维码图片': 'Generate QR code image',
  'RGB / HEX / HSL 互转': 'RGB / HEX / HSL conversion',
  '解析 JWT Token 三段内容': 'Parse JWT token (header/payload/signature)',
  '二进制/八进制/十进制/十六进制互转': 'Binary/Octal/Decimal/Hex conversion',
  'CIDR/掩码互转、网络/广播地址、同网段判断': 'CIDR/subnet mask, network/broadcast, same-subnet check',
  'SQL 关键字大写、换行缩进': 'SQL keyword casing and formatting',
  '上传图片识别二维码内容': 'Upload image to decode QR code',
  /* Home page */
  '🧰 开发者工具箱': '🧰 Developer Toolkit',
  '日常开发常用工具集合 · 纯前端运行 · 数据不出本地': 'Common dev tools - Pure frontend - Data stays local',
  'DevKit · 纯静态实现': 'DevKit - Static Implementation',
  '所有计算均在浏览器本地完成，数据不会上传': 'All calculations run locally in your browser. No data is uploaded.',
  /* Common buttons */
  '格式化': 'Format', '压缩': 'Minify', '校验': 'Validate',
  '转义': 'Escape', '反转义': 'Unescape',
  '编码': 'Encode', '解码': 'Decode',
  '加密': 'Encrypt', '解密': 'Decrypt',
  '转换': 'Convert', '生成': 'Generate',
  '查询': 'Search', '解析': 'Parse',
  '计算': 'Calculate', '处理': 'Process',
  '预览': 'Preview', '下载图片': 'Download',
  '判断': 'Check', '测试匹配': 'Test Match',
  '替换匹配': 'Replace', '对比差异': 'Compare',
  '交换': 'Swap', '刷新': 'Refresh',
  '复制': 'Copy', '复制全部': 'Copy All',
  '清空': 'Clear', '清空结果': 'Clear Results',
  '生成 UUID': 'Generate UUID', '生成密码': 'Generate Password',
  '生成二维码': 'Generate QR Code', '预览图片': 'Preview Image',
  '转换 →': 'Convert →', '编码 →': 'Encode →', '← 解码': '← Decode',
  '加密 →': 'Encrypt →', '← 解密': '← Decrypt',
  '转义 →': 'Escape →', '← 反转义': '← Unescape',
  '🎲 生成': '🎲 Generate', '🎲 生成密码': '🎲 Generate Password',
  '⚖️ 对比差异': '⚖️ Compare', '⇄ 交换': '⇄ Swap',
  '🔄 刷新': '🔄 Refresh',
  /* Common labels */
  '输出结果': 'Output', '格式化结果': 'Formatted Result',
  '输入文本': 'Input Text', '输入 JSON': 'Input JSON',
  '输入 SQL': 'Input SQL', '输入': 'Input',
  '输入文本（每行一条）': 'Input Text (one per line)',
  '测试文本': 'Test Text', '原始文本': 'Original Text',
  '修改后文本': 'Modified Text', '对比结果': 'Diff Results',
  '替换结果': 'Replace Result', '识别结果': 'Decode Result',
  '生成结果': 'Generated Results', '查询结果': 'Search Results',
  '转换结果': 'Conversion Results', '解析结果': 'Parse Results',
  '二维码预览': 'QR Code Preview',
  '结果将显示在这里': 'Results will appear here',
  '处理结果将显示在这里': 'Processed results will appear here',
  '转换结果将显示在这里': 'Converted results will appear here',
  '生成的 UUID 列表将显示在这里': 'Generated UUIDs will appear here',
  '生成的密码将显示在这里': 'Generated passwords will appear here',
  '生成的身份证号码将显示在这里': 'Generated ID numbers will appear here',
  '生成的号码将显示在这里': 'Generated numbers will appear here',
  '哈希值将显示在这里': 'Hash value will appear here',
  '格式化后的 SQL 将显示在这里': 'Formatted SQL will appear here',
  '识别内容将显示在这里': 'Decoded content will appear here',
  '（输出结果将显示在这里）': '(Results will appear here)',
  /* Common toast messages */
  '已复制': 'Copied', '复制失败': 'Copy failed',
  '格式化成功': 'Formatted successfully',
  '压缩成功': 'Minified successfully',
  '已转义': 'Escaped', '已反转义': 'Unescaped',
  '编码成功': 'Encoded successfully',
  '解码成功': 'Decoded successfully',
  '加密成功': 'Encrypted successfully',
  '解密成功': 'Decrypted successfully',
  '已转换': 'Converted', '转换成功': 'Converted successfully',
  '已生成': 'Generated', '生成失败': 'Generation failed',
  '解析成功': 'Parsed successfully', '解析失败': 'Parse failed',
  '计算完成': 'Calculation complete', '计算失败': 'Calculation failed',
  '处理完成': 'Processing complete', '处理失败': 'Processing failed',
  '对比完成': 'Comparison complete', '替换完成': 'Replace complete',
  '预览成功': 'Preview successful', '转换完成': 'Conversion complete',
  '已下载': 'Downloaded', '识别成功': 'Decoded successfully',
  '完成': 'Done', '操作失败': 'Operation failed',
  '格式化完成': 'Formatting complete',
  'JSON → YAML 转换成功': 'JSON to YAML converted',
  'YAML → JSON 转换成功': 'YAML to JSON converted',
  '转换失败': 'Conversion failed',
  /* Search & header */
  '搜索工具（如 JSON、Base64、MD5）...': 'Search tools (e.g. JSON, Base64, MD5)...',
  '切换主题': 'Toggle Theme', '菜单': 'Menu',
  /* Timestamp */
  '当前时间': 'Current Time',
  '时间戳（秒）': 'Timestamp (sec)', '时间戳（毫秒）': 'Timestamp (ms)',
  '本地时间': 'Local Time', 'UTC 时间': 'UTC Time',
  '时间戳 → 日期': 'Timestamp to Date', '日期 → 时间戳': 'Date to Timestamp',
  '单位': 'Unit', '秒': 'Seconds', '毫秒': 'Milliseconds',
  '秒级时间戳': 'Timestamp (seconds)', '毫秒级时间戳': 'Timestamp (ms)',
  '日期时间': 'Date Time',
  '请输入有效数字': 'Please enter a valid number',
  '日期格式错误': 'Invalid date format',
  /* World time */
  '北京': 'Beijing', '东京': 'Tokyo', '悉尼': 'Sydney',
  '迪拜': 'Dubai', '莫斯科': 'Moscow', '巴黎': 'Paris',
  '伦敦': 'London', '纽约': 'New York',
  '温哥华': 'Vancouver', '洛杉矶': 'Los Angeles',
  '北京时间（UTC+8）': 'Beijing Time (UTC+8)',
  '🌏 全球主要城市': '🌏 Major World Cities',
  '周日': 'Sun', '周一': 'Mon', '周二': 'Tue',
  '周三': 'Wed', '周四': 'Thu', '周五': 'Fri', '周六': 'Sat',
  'Unix 时间戳': 'Unix Timestamp',
  'Unix 时间戳 · 点击复制': 'Unix Timestamp - Click to copy',
  '点击复制': 'Click to copy',
  /* Regex */
  '正则表达式': 'Regex Pattern', '标志': 'Flags',
  '未匹配到任何内容': 'No matches found',
  '正则错误': 'Regex error',
  '替换为（用于替换模式，$1 $2 可引用分组）': 'Replace with ($1 $2 for groups)',
  /* QR Code */
  '输入文本/URL': 'Input Text/URL',
  '输入要生成二维码的内容': 'Enter content for QR code',
  '尺寸（像素）': 'Size (px)', '纠错等级': 'Error Correction',
  '输入内容后点击「生成二维码」': 'Enter content and click Generate',
  '请输入内容': 'Please enter content',
  '请先生成二维码': 'Please generate QR code first',
  /* Color */
  '从 HEX 转换': 'From HEX', '从 RGB 转换': 'From RGB',
  '从 HSL 转换': 'From HSL',
  'HEX 格式错误': 'Invalid HEX', 'RGB 格式错误': 'Invalid RGB',
  'HSL 格式错误': 'Invalid HSL',
  /* JWT */
  '输入 JWT Token': 'Input JWT Token',
  '段': 'Part', '内容': 'Content',
  '时间字段解析': 'Time Field Analysis',
  '字段': 'Field',
  /* Radix */
  '输入数值': 'Input Value', '输入进制': 'From Base',
  '进制': 'Base', '值': 'Value',
  '二进制 (2)': 'Binary (2)', '八进制 (8)': 'Octal (8)',
  '十进制 (10)': 'Decimal (10)', '十六进制 (16)': 'Hex (16)',
  '输入数值无效': 'Invalid number',
  '转换成功': 'Converted successfully',
  /* Postcode */
  '🔍 邮编反查（根据邮编查省市区）': '🔍 Reverse Lookup (Code to Region)',
  '输入邮政编码': 'Enter Postal Code',
  '3 或 6 位邮政编码，如 100、100089': '3 or 6-digit postal code, e.g. 100 or 100089',
  '📮 省市区查邮编': '📮 Forward Lookup (Region to Code)',
  '省份': 'Province', '城市': 'City', '区/县': 'District',
  '请选择省份': 'Select province',
  '请先选择省份': 'Select province first',
  '请选择城市': 'Select city',
  '请先选择城市': 'Select city first',
  '请选择区/县': 'Select district',
  '查询邮编': 'Lookup Code', '复制邮编': 'Copy Code',
  '格式错误：邮政编码应为 3 或 6 位数字': 'Invalid: postal code must be 3 or 6 digits',
  '未找到对应地区': 'No matching region found',
  '未找到匹配记录': 'No matching records found',
  /* ID Card */
  '🎲 测试号码生成': '🎲 Test Number Generator',
  '性别': 'Gender', '男': 'Male', '女': 'Female', '随机': 'Random',
  '出生年份范围': 'Birth Year Range',
  '校验并解析': 'Validate & Parse',
  '校验失败': 'Validation Failed', '校验通过': 'Validation Passed',
  '身份证号码有效': 'ID number is valid',
  '项目': 'Field', '身份证号码': 'ID Number',
  '出生日期': 'Date of Birth', '年龄': 'Age',
  '顺序码': 'Sequence Code', '校验码': 'Check Digit',
  '校验码错误': 'Check digit error', '格式错误': 'Format error',
  '出生日期无效': 'Invalid birth date',
  '📋 号码校验与解析': '📋 Validate & Parse',
  '输入身份证号码': 'Enter ID Number',
  '18 位身份证号码': '18-digit ID number',
  /* License */
  '代码类型': 'Code Type',
  '统一社会信用代码（18 位）': 'USCC (18 digits)',
  '营业执照注册号（15 位）': 'Business License No. (15 digits)',
  '登记管理部门（仅 18 位）': 'Registration Dept (18-digit only)',
  '9 · 工商': '9 - Industry & Commerce',
  '1 · 机构编制': '1 - Institution',
  '5 · 民政': '5 - Civil Affairs',
  'Y · 其他': 'Y - Other',
  '输入统一社会信用代码 / 营业执照注册号': 'Enter USCC or Business License No.',
  '18 位统一社会信用代码 或 15 位注册号': '18-digit USCC or 15-digit License No.',
  '统一社会信用代码有效（18 位）': 'USCC is valid (18 digits)',
  '营业执照注册号有效（15 位）': 'Business License No. is valid (15 digits)',
  '类型': 'Type', '登记管理部门': 'Registration Dept',
  '机构类别': 'Organization Type',
  '登记管理机关': 'Registration Authority',
  '主体标识码': 'Subject Code',
  '统一社会信用代码': 'USCC',
  '营业执照注册号': 'Business License No.',
  '长度错误': 'Length error', '字符非法': 'Illegal character',
  '企业': 'Enterprise', '个体工商户': 'Individual Business',
  '农民专业合作社': 'Farmer Cooperative',
  '机构编制': 'Institution', '民政': 'Civil Affairs',
  '工商': 'Industry & Commerce', '其他': 'Other',
  /* AES */
  '密钥（Key）': 'Key', '模式': 'Mode',
  '解密失败：请检查密钥和密文': 'Decryption failed: check key and ciphertext',
  '解密结果为空': 'Decryption result is empty',
  /* Hash */
  '哈希算法': 'Hash Algorithm',
  'MD5（128 位）': 'MD5 (128-bit)',
  'SHA1（160 位）': 'SHA1 (160-bit)',
  'SHA256（256 位）': 'SHA256 (256-bit)',
  'SHA512（512 位）': 'SHA512 (512-bit)',
  '输出大写': 'Uppercase output', '计算哈希': 'Calculate Hash',
  /* UUID */
  '生成数量': 'Count', '格式': 'Format',
  '小写（默认）': 'Lowercase (default)', '大写': 'Uppercase',
  '是否带连字符': 'Hyphens', '带连字符': 'With hyphens',
  '无连字符': 'Without hyphens',
  /* Base64 */
  'URL Safe（用 -_ 替换 +/，去掉 =）': 'URL Safe (replace +/ with -_, strip =)',
  /* Password */
  '密码长度': 'Password Length',
  '小写字母 a-z': 'Lowercase a-z', '大写字母 A-Z': 'Uppercase A-Z',
  '数字 0-9': 'Digits 0-9', '特殊符号 !@#$%^&*': 'Symbols !@#$%^&*',
  '排除易混字符 (0O1lI|)': 'Exclude ambiguous (0O1lI|)',
  '请至少选择一种字符类型': 'Select at least one character type',
  /* Image Base64 */
  '🖼️ 图片转 Base64': '🖼️ Image to Base64',
  '点击选择或拖拽图片到此处': 'Click to select or drag image here',
  '支持 PNG / JPEG / GIF / WebP / SVG': 'Supports PNG / JPEG / GIF / WebP / SVG',
  '复制 data URI': 'Copy Data URI', '复制纯 Base64': 'Copy Raw Base64',
  '🔁 Base64 转图片': '🔁 Base64 to Image',
  '粘贴 Base64 或 data URI': 'Paste Base64 or data URI',
  '请选择图片文件': 'Please select an image file',
  '请粘贴 Base64 内容': 'Please paste Base64 content',
  '无法解析为图片，请检查 Base64 内容': 'Cannot parse as image, check Base64',
  '点击选择或拖拽二维码图片到此处': 'Click to select or drag QR image here',
  '支持 PNG / JPEG / GIF / BMP': 'Supports PNG / JPEG / GIF / BMP',
  '❌ 未识别到二维码': '❌ No QR code found',
  '未识别到二维码，请确认图片清晰': 'No QR code found, ensure image is clear',
  /* Diff */
  '共': 'Total', '行': 'lines', '新增': 'added', '删除': 'deleted',
  /* YAML */
  '转换方向': 'Direction',
  '粘贴 JSON 或 YAML 文本': 'Paste JSON or YAML text',
  /* Text tool */
  '一行一条，按行处理': 'One per line, processed by line',
  '去重': 'Dedupe', '不去重': 'No dedupe',
  '去重（保留首次）': 'Dedupe (keep first)',
  '去重（保留末次）': 'Dedupe (keep last)',
  '排序': 'Sort', '不排序': 'No sort',
  '升序 (A-Z)': 'Ascending (A-Z)', '降序 (Z-A)': 'Descending (Z-A)',
  '按长度': 'By length', '反转顺序': 'Reverse', '随机打乱': 'Shuffle',
  '其他': 'Other', '无': 'None',
  '去首尾空格': 'Trim whitespace', '去空行': 'Remove blank lines',
  '去空格+去空行': 'Trim + remove blanks',
  '复制结果': 'Copy Result',
  '行数': 'Lines', '字符数': 'Chars',
  '字节数(UTF-8)': 'Bytes (UTF-8)', '非空行': 'Non-blank lines',
  /* Cron */
  'Cron 表达式（5 段：分 时 日 月 周）': 'Cron expression (5 fields: min hour day month weekday)',
  '如 0 9 * * 1-5（工作日9点）': 'e.g. 0 9 * * 1-5 (weekdays 9am)',
  '中文说明': 'Description',
  '未来 5 次执行时间': 'Next 5 Execution Times',
  '分钟': 'Minute', '小时': 'Hour',
  '日': 'Day', '月': 'Month', '星期': 'Weekday',
  '需要 5 段：分 时 日 月 周': 'Need 5 fields: min hour day month weekday',
  '表达式解析失败': 'Expression parse failed',
  '表达式无效': 'Invalid expression',
  '一年内无匹配时间': 'No matching time within a year',
  /* IP calc */
  '🌐 CIDR / 子网计算': '🌐 CIDR / Subnet Calculator',
  'IP 地址 / CIDR': 'IP Address / CIDR',
  '如 192.168.1.100/24': 'e.g. 192.168.1.100/24',
  '🔗 同网段判断': '🔗 Same Subnet Check',
  'IP 1 / CIDR': 'IP 1 / CIDR', 'IP 2': 'IP 2',
  '格式应为有效的 IP/前缀，如 192.168.1.100/24': 'Enter a valid IP/prefix, e.g. 192.168.1.100/24',
  'IP 地址': 'IP Address', 'CIDR 前缀': 'CIDR Prefix',
  '子网掩码': 'Subnet Mask', '通配符掩码': 'Wildcard Mask',
  '网络地址': 'Network Address', '广播地址': 'Broadcast Address',
  '可用主机范围': 'Usable Host Range',
  '可用主机数': 'Usable Hosts', 'IP 类型': 'IP Type',
  'A 类私有': 'Class A Private', 'B 类私有': 'Class B Private',
  'C 类私有': 'Class C Private', '公网': 'Public',
  '✅ 同网段': '✅ Same Subnet', '❌ 不同网段': '❌ Different Subnet',
  'IP1 需含 CIDR 前缀，如 192.168.1.10/24': 'IP1 needs CIDR prefix, e.g. 192.168.1.10/24',
  'IP2 格式错误': 'Invalid IP2 format',
  /* SQL */
  '粘贴需要格式化的 SQL 语句': 'Paste SQL to format',
  '关键字': 'Keywords', '保持原样': 'Preserve', '缩进': 'Indent',
  '2 空格': '2 Spaces', '4 空格': '4 Spaces',
  '请输入 SQL': 'Please enter SQL',
  /* QR decode */
  '识别': 'Decode',
  /* Hint texts */
  '说明：输入完整的 3 或 6 位邮政编码，查询对应的省/市/区。数据本地内置，不会上传。':
    'Enter a 3 or 6-digit postal code to look up province/city/district. Data is local.',
  '说明：本工具仅在浏览器本地按 GB11643-1999 标准做格式校验与字段解析，不会上传任何数据。地区码仅解析到省级行政区。':
    'Local validation per GB11643-1999. No data uploaded. Province-level only.',
  '说明：本工具仅在浏览器本地按 GB 32100-2015（统一社会信用代码）与 GB 11714-1997（营业执照注册号）标准做格式校验与字段解析，不会上传任何数据。':
    'Local validation per GB 32100-2015 & GB 11714-1997. No data uploaded.',
  '⚠️ 生成的号码仅能通过校验位算法，不对应任何真实个人。仅限开发测试、表单填充等合法用途，请勿用于非法场景。':
    '⚠️ Generated numbers pass checksum only, not real. For dev/testing only.',
  '⚠️ 生成的号码仅能通过校验位算法，不对应任何真实企业。仅限开发测试、表单填充等合法用途，请勿用于非法场景。':
    '⚠️ Generated numbers pass checksum only, not real. For dev/testing only.',
  '提示：AES 加密结果为 Base64 字符串；解密时输入 Base64 密文。所有运算在本地完成。':
    'Tip: AES output is Base64; enter Base64 ciphertext for decryption. All local.',
  '使用 crypto.getRandomValues 生成密码学安全随机数，全部本地运算。':
    'Uses crypto.getRandomValues for CSPRNG. All local.',
  '依赖 js-yaml 库（CDN 加载），本地浏览器运算。':
    'Uses js-yaml (CDN). All local.',
  '基础格式化：关键字大写、主要子句换行缩进。非完整 SQL parser，复杂嵌套可能不完美。':
    'Basic formatting: keyword casing, clause indentation. Not a full SQL parser.',
  '支持 * / - , 和数字。示例：*/5 * * * *（每5分钟）、0 0 1 * *（每月1号）、0 9 * * 1-5（工作日9点）':
    'Supports * / - , and numbers. e.g. */5 * * * * (every 5min), 0 0 1 * * (1st of month), 0 9 * * 1-5 (weekdays 9am)',
};
function t(zh) { return lang === 'zh' ? zh : (I18N[zh] || zh); }

function translateDOM(root) {
  if (!root || lang === 'zh') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, null);
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    const trimmed = node.nodeValue.trim();
    if (trimmed && I18N[trimmed]) textNodes.push({ node, orig: node.nodeValue, trimmed });
  }
  textNodes.forEach(({ node, orig, trimmed }) => {
    node.nodeValue = orig.replace(trimmed, I18N[trimmed]);
  });
  root.querySelectorAll('*').forEach(el => {
    ['placeholder', 'title'].forEach(attr => {
      const v = el.getAttribute(attr);
      if (v && I18N[v]) el.setAttribute(attr, I18N[v]);
    });
  });
}


/* ---------- 省、自治区、直辖市、特别行政区（前2位） ---------- */
const PROVINCES = {
  '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省', '15': '内蒙古自治区',
  '21': '辽宁省', '22': '吉林省', '23': '黑龙江省', '31': '上海市', '32': '江苏省',
  '33': '浙江省', '34': '安徽省', '35': '福建省', '36': '江西省', '37': '山东省',
  '41': '河南省', '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区',
  '46': '海南省', '50': '重庆市', '51': '四川省', '52': '贵州省', '53': '云南省',
  '54': '西藏自治区', '61': '陕西省', '62': '甘肃省', '63': '青海省', '64': '宁夏回族自治区',
  '65': '新疆维吾尔自治区', '71': '中国台湾', '81': '中国香港特别行政区', '82': '中国澳门特别行政区'
};

/** 用 PROVINCES 填充 <select> 选项（保留首项占位） */
function populateProvinceSelect(sel) {
  const first = sel.options[0];
  sel.innerHTML = '';
  if (first) sel.appendChild(first.cloneNode(true));
  Object.entries(PROVINCES).forEach(([code, name]) => {
    const opt = document.createElement('option');
    opt.value = code; opt.textContent = name;
    sel.appendChild(opt);
  });
}

/** 生成表格行的 HTML（用于校验结果展示） */
function tableRow(k, v, copyable = false, labelW = 140) {
  const ve = escapeHtml(String(v));
  return `<tr><td style="width:${labelW}px;">${k}</td><td class="mono">${ve}</td>
    <td style="width:60px;">${copyable ? `<button class="btn sm ghost" data-copy-text="${ve}">复制</button>` : ''}</td></tr>`;
}

/* ---------- 工具定义 ---------- */
function resolveRenderer(id) {
  const renderer = window.DevKitRegistry?.getRenderer(id);
  if (renderer) return renderer;
  return main => {
    const tool = TOOLS.find(item => item.id === id);
    main.innerHTML = toolHeader(tool) + `
      <div class="card">
        <div class="hint danger" style="margin:0;">
          ${lang === 'en' ? 'This tool failed to load. Check the deployed script files.' : '此工具加载失败，请检查部署的脚本文件。'}
        </div>
      </div>`;
  };
}

const TOOLS = [
  // ===== 首页 =====
  { id: 'home', group: '', name: '首页', icon: '🏠', render: renderHome },

  // ===== JSON =====
  { id: 'json', group: 'JSON', name: 'JSON 格式化', icon: '📊', desc: '格式化、压缩、校验 JSON 数据',
    render: resolveRenderer('json') },
  { id: 'yaml', group: 'JSON', name: 'JSON ↔ YAML', icon: '📋', desc: 'JSON 与 YAML 双向转换',
    render: resolveRenderer('yaml') },

  // ===== 编码解码 =====
  { id: 'base64', group: '编码解码', name: 'Base64', icon: '🔤', desc: 'Base64 编码与解码',
    render: resolveRenderer('base64') },
  { id: 'url', group: '编码解码', name: 'URL 编码', icon: '🔗', desc: 'URL 编码与解码',
    render: resolveRenderer('url') },
  { id: 'html-escape', group: '编码解码', name: 'HTML 转义', icon: '🛡️', desc: 'HTML 实体转义与反转义',
    render: resolveRenderer('html-escape') },
  { id: 'unicode', group: '编码解码', name: 'Unicode 转换', icon: '🌐', desc: '中文与 Unicode 互转',
    render: resolveRenderer('unicode') },
  { id: 'imgbase64', group: '编码解码', name: '图片 ↔ Base64', icon: '🖼️', desc: '图片转 Base64 / Base64 预览图片',
    render: resolveRenderer('imgbase64') },

  // ===== 证件工具 =====
  { id: 'idcard', group: '证件工具', name: '身份证号', icon: '🪪', desc: '身份证号校验、解析（性别/生日/地区）',
    render: resolveRenderer('idcard') },
  { id: 'license', group: '证件工具', name: '营业执照号', icon: '🏢', desc: '统一社会信用代码 / 营业执照注册号校验解析',
    render: resolveRenderer('license') },
  { id: 'postcode', group: '证件工具', name: '邮政编码', icon: '📮', desc: '省市区 ↔ 邮编 互查',
    render: resolveRenderer('postcode') },

  // ===== 加密哈希 =====
  { id: 'hash', group: '加密哈希', name: 'MD5/SHA 哈希', icon: '🔐', desc: 'MD5、SHA1、SHA256、SHA512 哈希计算',
    render: resolveRenderer('hash') },
  { id: 'aes', group: '加密哈希', name: 'AES 加解密', icon: '🔑', desc: 'AES 对称加密与解密',
    render: resolveRenderer('aes') },

  // ===== 文本工具 =====
  { id: 'uuid', group: '文本工具', name: 'UUID 生成', icon: '🆔', desc: '批量生成 UUID/GUID',
    render: resolveRenderer('uuid') },
  { id: 'timestamp', group: '文本工具', name: '时间戳', icon: '⏰', desc: '时间戳与日期互转',
    render: resolveRenderer('timestamp') },
  { id: 'worldtime', group: '文本工具', name: '世界时间', icon: '🌍', desc: '全球实时时间、时区查询',
    render: resolveRenderer('worldtime') },
  { id: 'regex', group: '文本工具', name: '正则测试', icon: '🔍', desc: '正则表达式匹配测试',
    render: resolveRenderer('regex') },
  { id: 'password', group: '文本工具', name: '密码生成器', icon: '🔐', desc: '自定义规则批量生成随机密码',
    render: resolveRenderer('password') },
  { id: 'diff', group: '文本工具', name: '文本对比', icon: '⚖️', desc: '逐行对比两段文本差异',
    render: resolveRenderer('diff') },
  { id: 'texttool', group: '文本工具', name: '文本去重排序', icon: '📝', desc: '按行去重、排序、统计',
    render: resolveRenderer('texttool') },
  { id: 'cron', group: '文本工具', name: 'Cron 解析', icon: '⏱️', desc: 'Cron 表达式翻译 + 下次执行时间',
    render: resolveRenderer('cron') },

  // ===== 其他 =====
  { id: 'qrcode', group: '其他工具', name: '二维码生成', icon: '📱', desc: '生成二维码图片',
    render: resolveRenderer('qrcode') },
  { id: 'color', group: '其他工具', name: '颜色转换', icon: '🎨', desc: 'RGB / HEX / HSL 互转',
    render: resolveRenderer('color') },
  { id: 'jwt', group: '其他工具', name: 'JWT 解析', icon: '🪙', desc: '解析 JWT Token 三段内容',
    render: resolveRenderer('jwt') },
  { id: 'radix', group: '其他工具', name: '进制转换', icon: '🔢', desc: '二进制/八进制/十进制/十六进制互转',
    render: resolveRenderer('radix') },
  { id: 'ipcalc', group: '其他工具', name: 'IP 子网计算', icon: '🌐', desc: 'CIDR/掩码互转、网络/广播地址、同网段判断',
    render: resolveRenderer('ipcalc') },
  { id: 'sql', group: '其他工具', name: 'SQL 格式化', icon: '🗃️', desc: 'SQL 关键字大写、换行缩进',
    render: resolveRenderer('sql') },
  { id: 'qrdecode', group: '其他工具', name: '二维码识别', icon: '📷', desc: '上传图片识别二维码内容',
    render: resolveRenderer('qrdecode') },
];

/* ---------- 分组主题色系（首页卡片图标） ---------- */
const GROUP_THEME = {
  'JSON': 'g-json',
  '编码解码': 'g-encode',
  '证件工具': 'g-id',
  '加密哈希': 'g-crypto',
  '文本工具': 'g-text',
  '其他工具': 'g-misc',
};

/* ---------- 路由 ---------- */
function getHash() { return location.hash.slice(1) || 'home'; }
function navigate(id) { location.hash = id; }

function route() {
  const id = getHash();
  const tool = TOOLS.find(t => t.id === id) || TOOLS[0];

  // 高亮导航
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.id === tool.id));

  // 渲染主区（挂分组色系 class，供页面内组件继承 --group-accent）
  const main = $('#main');
  if (main._cleanup) {
    main._cleanup();
    main._cleanup = null;
  }
  main.className = 'main ' + (GROUP_THEME[tool.group] || '');
  main.innerHTML = '';
  tool.render(main);

  // 滚动到顶
  main.scrollTop = 0;
  translateDOM(main);
}

/* ---------- 渲染侧边栏 ---------- */
function renderSidebar() {
  const sb = $('#sidebar');
  const groups = {};
  TOOLS.forEach(t => {
    const g = t.group || '首页';
    (groups[g] = groups[g] || []).push(t);
  });
  let html = '';
  Object.entries(groups).forEach(([g, list]) => {
    html += `<div class="nav-group ${GROUP_THEME[g] || ''}">
      <div class="nav-group-title">${g || '常用'}</div>`;
    list.forEach(t => {
      html += `<div class="nav-item" data-id="${t.id}" data-href="#${t.id}">
        <span class="icon">${t.icon}</span>
        <span>${t.name}</span>
      </div>`;
    });
    html += `</div>`;
  });
  sb.innerHTML = html;
  translateDOM(sb);
  $$('.nav-item', sb).forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.id));
  });
}

/* ---------- 通用：工具页头 ---------- */
function toolHeader(tool) {
  return `<div class="tool-header">
    <div>
      <div class="tool-title"><span class="tool-badge ${GROUP_THEME[tool.group] || ''}">${tool.icon}</span>${t(tool.name)}</div>
      <div class="tool-desc">${t(tool.desc || '')}</div>
    </div>
  </div>`;
}

/* ---------- 通用：可复制输出框 ---------- */
function outputBox(text, { error = false } = {}) {
  const cls = error ? 'output-box error' : 'output-box';
  const empty = !text ? ' empty' : '';
  return `<div class="${cls}${empty}">${escapeHtml(text || '（输出结果将显示在这里）')}</div>`;
}

/* ---------- 通用：带复制按钮的 textarea 容器 ---------- */
function textareaWrap(label, id, placeholder = '', value = '') {
  return `<div class="field">
    <label class="field-label">${t(label)}</label>
    <div class="textarea-wrap">
      <button class="copy-btn" data-copy-target="${id}">${t('复制')}</button>
      <textarea class="textarea" id="${id}" placeholder="${t(placeholder)}">${escapeHtml(value)}</textarea>
    </div>
  </div>`;
}

/* =========================================================
   工具实现
   ========================================================= */

/* ---------- 首页 ---------- */
function renderHome(main) {
  const tools = TOOLS.filter(t => t.id !== 'home');
  const html = `
    <div style="display:flex;flex-direction:column;min-height:100%;">
    <div class="tool-header">
      <div>
        <div class="tool-title">${t('🧰 开发者工具箱')}</div>
        <div class="tool-desc">${t('日常开发常用工具集合 · 纯前端运行 · 数据不出本地')}</div>
      </div>
      <div class="home-clock" id="homeClock">
        <div class="hc-row">
          <span id="clockDisplay"></span>
          <span class="date" id="dateDisplay"></span>
        </div>
        <span class="ts" id="timestampDisplay" title="${t('Unix 时间戳 · 点击复制')}"></span>
      </div>
    </div>
    <div class="home-grid">
      ${tools.map(tool => `
        <div class="home-card ${GROUP_THEME[tool.group] || ''}" data-go="${tool.id}">
          <div class="icon">${tool.icon}</div>
          <div class="title">${t(tool.name)}</div>
          <div class="desc">${t(tool.desc || '')}</div>
        </div>
      `).join('')}
    </div>
    <div class="footer">
      ${t('DevKit · 纯静态实现')}<br/>
      ${t('所有计算均在浏览器本地完成，数据不会上传')}<br/>
      <span style="margin-top:8px;display:inline-block;">Power by <strong>DH</strong> & <strong>ZPW</strong></span>
    </div>
    </div>
  `;
  main.innerHTML = html;
  $$('.home-card', main).forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
  // 时间戳点击复制
  const $ts = document.getElementById('timestampDisplay');
  if ($ts) $ts.addEventListener('click', () => copyText($ts.textContent));
}

/* =========================================================
   全局事件
   ========================================================= */
// 复制按钮（事件委托）
document.addEventListener('click', e => {
  const copyBtn = e.target.closest('[data-copy-target]');
  if (copyBtn) {
    const el = $('#' + copyBtn.dataset.copyTarget);
    if (el) copyText(el.value);
  }
  const copyIdBtn = e.target.closest('[data-copy]');
  if (copyIdBtn) {
    const el = $('#' + copyIdBtn.dataset.copy);
    if (el) copyText(el.textContent);
  }
  const copyTextBtn = e.target.closest('[data-copy-text]');
  if (copyTextBtn) {
    copyText(copyTextBtn.dataset.copyText);
  }
});

// 主题切换
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('devkit-theme', theme);
}
$('#themeBtn').onclick = () => {
  const cur = document.documentElement.dataset.theme || 'light';
  applyTheme(cur === 'light' ? 'dark' : 'light');
};
applyTheme(localStorage.getItem('devkit-theme') || 'light');

// 语言切换
function applyLang(l) {
  lang = l;
  localStorage.setItem('devkit-lang', l);
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
  $('#langBtn').value = l;
  renderSidebar();
  buildSearchIndex();
  translateDOM($('.header'));
  translateDOM($('.logo-area'));
  route();
}
$('#langBtn').onchange = () => applyLang($('#langBtn').value);
$('#langBtn').value = lang;
document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
setTimeout(() => { translateDOM($('.header')); translateDOM($('.logo-area')); }, 0);


// 移动端侧栏切换
const sidebar = $('#sidebar');
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);
function toggleSidebar() { sidebar.classList.toggle('open'); backdrop.classList.toggle('show'); }
function closeSidebar() { sidebar.classList.remove('open'); backdrop.classList.remove('show'); }
$('#menuBtn').onclick = toggleSidebar;
backdrop.addEventListener('click', closeSidebar);
// 点击导航项自动关闭
sidebar.addEventListener('click', e => { if (e.target.closest('.nav-item')) closeSidebar(); });

// 搜索
const searchInput = $('#searchInput');
let searchItems = []; // 缓存搜索项

function buildSearchIndex() {
  searchItems = [];
  $$('.nav-item').forEach(el => {
    const text = el.textContent.trim();
    const href = el.getAttribute('data-href') || '';
    if (href) searchItems.push({ text, href, el });
  });
}

searchInput.addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) {
    $$('.nav-item').forEach(el => { el.style.display = ''; el.classList.remove('search-highlight'); });
    return;
  }
  $$('.nav-item').forEach(el => {
    const text = el.textContent.toLowerCase();
    const match = text.includes(q);
    el.style.display = match ? '' : 'none';
    if (match) el.classList.add('search-highlight');
    else el.classList.remove('search-highlight');
  });
});

// 回车键跳转到第一个匹配项
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const first = $$('.nav-item').find(el => el.style.display !== 'none');
    if (first) {
      const href = first.getAttribute('data-href');
      if (href) { location.hash = href; searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); }
    }
  }
  // ESC 清空
  if (e.key === 'Escape') { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); searchInput.blur(); }
});

// 路由切换
window.addEventListener('hashchange', route);

// 时钟（每秒更新，元素由首页渲染）
function updateClock() {
  const $clock = document.getElementById('clockDisplay');
  const $date = document.getElementById('dateDisplay');
  const $ts = document.getElementById('timestampDisplay');
  if (!$clock) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  $clock.textContent = `${h}:${m}:${s}`;
  if ($date) {
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
    $date.textContent = `${y}-${mo}-${d} ${weekdays[now.getDay()]}`;
  }
  if ($ts) $ts.textContent = Math.floor(now.getTime() / 1000);
}
updateClock();
setInterval(updateClock, 1000);

// 初始化
renderSidebar();
buildSearchIndex();
route();
