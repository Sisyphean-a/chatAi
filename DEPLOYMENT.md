# 部署指南

本文档介绍如何将 ChatGPT 对话聊天页面部署到各种平台。

## 构建生产版本

### 1. 安装依赖
```bash
npm install
```

### 2. 构建项目
```bash
npm run build
```

构建完成后，`dist/` 目录包含所有静态文件。

### 3. 预览构建结果
```bash
npm run preview
```

## 部署选项

### 1. Vercel 部署（推荐）

Vercel 是最简单的部署方式，特别适合 React 应用。

#### 方法一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel
```

#### 方法二：通过 Git 集成
1. 将代码推送到 GitHub/GitLab
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

### 2. Netlify 部署

#### 方法一：拖拽部署
1. 运行 `npm run build`
2. 将 `dist/` 文件夹拖拽到 [Netlify Drop](https://app.netlify.com/drop)

#### 方法二：Git 集成
1. 将代码推送到 GitHub
2. 在 [Netlify](https://netlify.com) 连接仓库
3. 设置构建命令：`npm run build`
4. 设置发布目录：`dist`

### 3. GitHub Pages 部署

#### 创建部署脚本
在 `package.json` 中添加：
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 安装 gh-pages
```bash
npm install --save-dev gh-pages
```

#### 部署
```bash
npm run deploy
```

### 4. 服务器部署

#### 使用 Nginx

1. 构建项目：
```bash
npm run build
```

2. 将 `dist/` 目录上传到服务器

3. 配置 Nginx：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 使用 Apache

创建 `.htaccess` 文件：
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### 5. Docker 部署

#### 创建 Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 创建 nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 构建和运行
```bash
# 构建镜像
docker build -t chatgpt-web .

# 运行容器
docker run -p 3000:80 chatgpt-web
```

### 6. CDN 部署

#### 使用 AWS S3 + CloudFront

1. 创建 S3 存储桶
2. 启用静态网站托管
3. 上传 `dist/` 目录内容
4. 配置 CloudFront 分发
5. 设置自定义域名（可选）

#### 使用阿里云 OSS + CDN

1. 创建 OSS 存储桶
2. 开启静态网站功能
3. 上传构建文件
4. 配置 CDN 加速
5. 绑定自定义域名

## 环境变量配置

如果需要在构建时配置环境变量，创建 `.env.production` 文件：

```env
VITE_APP_TITLE=ChatGPT 对话
VITE_DEFAULT_API_URL=https://api.openai.com/v1/chat/completions
VITE_DEFAULT_MODEL=gpt-4
```

在代码中使用：
```typescript
const apiUrl = import.meta.env.VITE_DEFAULT_API_URL;
```

## 性能优化

### 1. 代码分割
项目已配置自动代码分割，无需额外配置。

### 2. 资源压缩
构建时自动压缩 JS、CSS 和图片。

### 3. 缓存策略
```nginx
# 设置缓存头
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 4. 启用 HTTPS
推荐使用 Let's Encrypt 免费 SSL 证书：
```bash
# 使用 Certbot
sudo certbot --nginx -d your-domain.com
```

## 监控和分析

### 1. 添加 Google Analytics
在 `index.html` 中添加：
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. 错误监控
可以集成 Sentry 等错误监控服务。

## 安全考虑

### 1. HTTPS
生产环境必须使用 HTTPS。

### 2. CSP 头
设置内容安全策略：
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### 3. API Key 保护
- 用户的 API Key 只存储在本地
- 不要在代码中硬编码 API Key
- 提醒用户妥善保管 API Key

## 故障排除

### 1. 路由问题
确保服务器配置了 SPA 路由回退到 `index.html`。

### 2. 跨域问题
如果 API 存在跨域问题，可以配置代理或使用 CORS。

### 3. 构建失败
检查 Node.js 版本是否兼容（推荐 18+）。

## 自动化部署

### GitHub Actions 示例
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Deploy to Vercel
      uses: vercel/action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

选择最适合你需求的部署方式。对于个人项目，推荐使用 Vercel 或 Netlify；对于企业项目，可以考虑自建服务器或云服务。
