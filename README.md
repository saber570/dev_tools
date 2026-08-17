# DevKit · 开发者工具箱

日常开发常用工具集合，纯静态实现，可直接部署到 Cloudflare Pages / Vercel / GitHub Pages 等。

## 包含工具

| 分组 | 工具 |
|------|------|
| JSON | JSON 格式化 / 压缩 / 校验 / 转义 |
| 编码解码 | Base64、URL 编码、HTML 转义、Unicode 转换 |
| 加密哈希 | MD5 / SHA1 / SHA256 / SHA512 / SHA3 / RIPEMD160、AES 加解密 |
| 文本工具 | UUID 生成、时间戳转换、正则表达式测试 |
| 其他工具 | 二维码生成、颜色转换（HEX/RGB/HSL）、JWT 解析、进制转换 |

## 特点

- **纯静态**：单个 `index.html` 文件，无构建步骤
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

## 部署到 Cloudflare Pages

### 方式一：拖拽上传（最快）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create
2. 选择 **Pages** → **Upload assets**
3. 项目名称填 `devkit`（任意）
4. 把 `index.html` 拖入上传区域
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

## 扩展新工具

在 `index.html` 的 `TOOLS` 数组中新增一项，并实现对应的 `renderXxx(main)` 函数即可。函数接收主容器元素，渲染完整 UI 并绑定事件。

```js
{ id: 'my-tool', group: '其他工具', name: '我的工具', icon: '🔧',
  desc: '工具说明', render: renderMyTool },
```

## License

MIT
