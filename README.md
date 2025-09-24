# ChatGPT 对话聊天页面

一个简洁的 Web 应用，基于 GPT API 实现类似 ChatGPT 的对话功能。

## 功能特性

- 🤖 **文字聊天**: 基于 GPT API 的智能对话
- 📁 **文件上传**: 支持上传文件并将内容作为上下文传递给 GPT
- 🖼️ **图片支持**: 支持粘贴图片，在输入框中显示缩略图预览
- ⚙️ **灵活配置**: 用户可自定义 API Key、请求 URL、代理地址
- 🎛️ **自定义模型**: 支持手动输入任何兼容的模型名称
- 📏 **可调界面**: 设置面板支持拖拽调整宽度
- 💾 **本地存储**: 配置和对话历史保存在本地
- 🎨 **现代界面**: 参考 ChatGPT 官网设计，左侧边栏 + 主聊天区域布局

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: React Hooks + Context
- **HTTP 客户端**: Axios
- **图标**: Lucide React

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

## 使用说明

### 初始配置

首次使用时，需要在设置页面配置以下信息：

1. **API Key**: 你的 GPT API 密钥
2. **API URL**: GPT API 请求地址（默认: https://api.openai.com/v1/chat/completions）
3. **代理地址**: 可选，如果需要通过代理访问 API

### 功能使用

#### 文字聊天
- 在输入框中输入消息，按 Enter 或点击发送按钮
- 支持多轮对话，上下文会自动保持

#### 文件上传
- 点击输入框旁的文件上传按钮
- 支持的文件类型：.txt, .md, .json, .csv, .pdf 等
- 文件内容会作为上下文发送给 GPT

#### 图片粘贴
- 直接在输入框中粘贴图片（Ctrl+V）
- 图片会显示缩略图预览
- 支持 GPT-4V 的图片理解功能

## 项目结构

```
chatAi/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── Chat/          # 聊天相关组件
│   │   ├── Settings/      # 设置相关组件
│   │   └── UI/            # 通用 UI 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 配置说明

### API 配置

应用支持多种 GPT API 提供商：

- **OpenAI**: 官方 API
- **Azure OpenAI**: 企业版 API
- **其他兼容提供商**: 任何兼容 OpenAI API 格式的服务

### 代理配置

如果你在中国大陆使用，可能需要配置代理：

1. 在设置中填入代理地址
2. 格式：`http://proxy-server:port`
3. 支持 HTTP/HTTPS 代理

## 开发指南

### 添加新功能

1. 在 `src/components/` 下创建新组件
2. 在 `src/hooks/` 下添加相关 Hook
3. 在 `src/services/` 下添加 API 服务
4. 更新类型定义在 `src/types/`

### 样式开发

项目使用 Tailwind CSS，遵循以下原则：

- 使用语义化的类名组合
- 保持响应式设计
- 遵循设计系统的颜色和间距规范

## 部署

### 静态部署

```bash
npm run build
```

构建产物在 `dist/` 目录，可以部署到任何静态托管服务。

### Docker 部署

```bash
docker build -t chatgpt-web .
docker run -p 3000:3000 chatgpt-web
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 常见问题

### Q: 如何获取 API Key？
A: 访问 OpenAI 官网注册账号并创建 API Key。

### Q: 支持哪些文件格式？
A: 目前支持文本文件（.txt, .md, .json, .csv）和 PDF 文件。

### Q: 图片上传有大小限制吗？
A: 建议图片大小不超过 20MB，会自动压缩处理。

### Q: 对话历史保存在哪里？
A: 所有数据都保存在浏览器本地存储中，不会上传到服务器。
