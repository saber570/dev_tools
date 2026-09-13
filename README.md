# DevKit · 开发者工具箱

日常开发常用工具集合，纯静态实现，可直接部署到 Cloudflare Pages / Vercel / GitHub Pages 等。

## 包含工具

| 分组 | 工具 |
|------|------|
| JSON | JSON 格式化 / 压缩 / 校验 / 转义 |
| 编码解码 | Base64、URL 编码、HTML 转义、Unicode 转换 |
| 加密哈希 | MD5 / SHA1 / SHA256 / SHA512 / Keccak-512 / RIPEMD160、AES 加解密 |
| 文本工具 | UUID 生成、时间戳转换、正则表达式测试 |
| 其他工具 | 二维码生成、颜色转换（HEX/RGB/HSL）、JWT 解析、进制转换 |

## 特点

- **纯静态**：无需构建，静态文件可直接部署
- **本地运算**：所有计算在浏览器本地完成，数据不上传
- **响应式**：支持桌面和移动端
- **暗色模式**：支持浅色/暗色主题切换
- **快速搜索**：顶部搜索框过滤工具列表

## 本地预览

```bash
# 任选一种
python3 -m http.server 8000
# 或
npx serve .
```

浏览器打开 `http://localhost:8000`。

使用 Node.js 20.19+ 或 22.12+，安装开发依赖并运行回归测试：

```bash
npm ci
npm test
```

`js/core.js` 是已提交的本地计算库，包含 SQL 格式化、无损 JSON、Cron 和日期校验逻辑，部署时无需安装依赖或构建。修改 `src/` 或升级依赖后运行 `npm run build:core`，并一起提交生成文件。测试会检查生成文件是否与源码一致。

正则工具通过独立 Worker 执行，需通过上面的 HTTP 本地预览或静态网站访问。匹配和替换均有超时保护，匹配列表最多显示 1000 项。

## 部署到 Cloudflare Pages

### 方式一：拖拽上传（最快）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create
2. 选择 **Pages** → **Upload assets**
3. 项目名称填 `devkit`（任意）
4. 把项目目录中的 `index.html`、`styles.css`、`postcode-data.js` 和 `js/` 一起上传
5. 点击 **Deploy**，几秒后即可访问 `https://devkit-xxx.pages.dev`

### 方式二：Git 仓库自动部署（推荐长期维护）

1. 把本目录推到 GitHub / GitLab 仓库
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Connect to Git**
3. 选择仓库后配置：
   - **Framework preset**: `None`
   - **Build command**: 留空
   - **Build output directory**: `/`（根目录）
4. **Save and Deploy**，之后每次 push 自动更新

### 方式三：Wrangler CLI 部署

```bash
# 安装 wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署（首次会自动创建项目）
wrangler pages deploy . --project-name=devkit
```

输出示例：
```
✨ Successfully deployed!
🌐 https://devkit-xxx.pages.dev
```

后续更新只需重复执行 `wrangler pages deploy .` 命令。

## 部署到其他平台

- **Vercel**: `vercel deploy` 或导入 Git 仓库
- **GitHub Pages**: 推到 `gh-pages` 分支或用 Actions
- **Netlify**: 拖拽上传或连接 Git
- **腾讯云 EdgeOne Pages**: 类似 Cloudflare Pages
- **任意静态服务器**: Nginx、Apache 直接托管

## 自定义域名

部署后到 Cloudflare Pages 项目设置 → Custom domains → 添加自己的域名，按提示配置 CNAME 即可。

## 技术栈

- 原生 HTML / CSS / JavaScript（无框架）
- [crypto-js](https://github.com/brix/crypto-js) - 加密哈希
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) - 二维码生成
- sql-formatter、lossless-json、cron-parser - 本地打包的计算依赖，版本由 `package-lock.json` 固定
- Node.js 测试、jsdom 和 Worker 回归测试；第三方许可证见 `js/vendor-licenses.txt`

## 项目结构

```text
.
├── index.html              # 页面骨架、依赖和脚本加载顺序
├── styles.css              # 全局样式与响应式布局
├── postcode-data.js        # 邮政编码数据
├── js
│   ├── registry.js         # 工具渲染器注册表与故障隔离
│   ├── core.js             # 已生成的本地计算库
│   ├── regex-worker.js     # 隔离执行正则匹配和替换
│   ├── app.js              # 工具元数据、路由、国际化和全局事件
│   └── tools
│       ├── format.js       # JSON、YAML、Diff、文本、SQL
│       ├── encoding.js     # Base64、URL、HTML、Unicode、图片
│       ├── crypto.js       # 哈希、AES、UUID、JWT、密码
│       ├── datetime.js     # 时间戳、世界时间、Cron
│       ├── identity.js     # 邮编、身份证、营业执照
│       └── misc.js         # 正则、二维码、颜色、进制、IP
├── tests
│   ├── registry.test.mjs   # 工具元数据与注册项完整性测试
│   ├── core.test.mjs       # 计算结果、边界输入与跨时区验证
│   ├── app.test.mjs        # 工具界面与语言切换回归测试
│   └── regex.test.mjs      # 正则语义、超时、取消与数量限制
├── src                    # 本地计算库的可维护源码
├── scripts                # 可复现的计算库生成脚本
└── package.json            # 测试命令
```

## 扩展新工具

在 `js/app.js` 的 `TOOLS` 数组中新增工具元数据，并在对应的 `js/tools/*.js` 中实现渲染函数，再把它追加到该文件已有的 `registerTools` 对象中。函数接收主容器元素，渲染完整 UI 并绑定事件。

```js
{ id: 'my-tool', group: '其他工具', name: '我的工具', icon: '🔧',
  desc: '工具说明', render: resolveRenderer('my-tool') },

DevKitRegistry.registerTools('misc', {
  regex: renderRegex,
  // ...该分组已有的其他工具
  'my-tool': renderMyTool,
});
```

## License

MIT
