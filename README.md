# 张薇失联事件

一款基于网页的交互式解密游戏。玩家扮演张薇的网友，通过模拟手机桌面、社交应用和搜索引擎，逐步揭开她失联背后的真相。

## 技术栈

- **框架**：Next.js 15 + React 18
- **样式**：Tailwind CSS
- **AI 对话**：Moonshot AI（Kimi）API
- **状态管理**：localStorage + BroadcastChannel 跨标签页同步

## 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）或 npm

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:3000` 开始游戏。

### 生产构建

```bash
pnpm build
pnpm start
```

### 环境变量

在项目根目录创建 `.env` 文件：

```env
MOONSHOT_API_KEY=你的_Moonshot_API_密钥
```

可在 [Moonshot 开放平台](https://platform.moonshot.cn/) 申请 API Key。

## 项目结构

```
zhangwei/
├── pages/                  # 页面与路由
│   ├── index.js            # 开始界面
│   ├── desktop.js          # 模拟手机桌面
│   ├── wechat.js           # 微信（与张薇的聊天）
│   ├── chrome.js           # 浏览器（搜索引擎）
│   ├── qq.js               # QQ 应用
│   ├── weibo.js            # 微博
│   ├── xiaohongshu.js      # 小红书
│   ├── bilibili.js         # 哔哩哔哩
│   ├── hengnian.js         # 恒念药业官网
│   ├── hengnian-admin.js   # 管理员登录
│   ├── hengnian-panel.js   # 管理面板
│   ├── hengnian-config.js  # 隐藏配置页
│   ├── end0~end4           # 结局页面
│   └── api/
│       ├── chat.js         # Moonshot AI 代理接口
│       ├── search.js       # 搜索代理接口
│       └── qq-portrait.js  # QQ 头像接口
├── hooks/
│   ├── useGameState.js     # 游戏状态管理
│   └── useAIChat.js        # AI 对话管理
├── data/
│   ├── appList.js          # 应用列表定义
│   ├── aiPrompts.js        # AI 角色提示词
│   ├── zhangweiChat.js     # 预设聊天记录
│   ├── aiFallback.js       # AI 降级回复
│   └── searchablePages.json # 搜索索引
├── utils/
│   ├── basePath.js         # 路径前缀处理
│   ├── chatDates.js        # 时间格式化
│   └── cookies.js          # Cookie 管理
├── styles/
│   └── globals.css         # 全局样式
└── public/                 # 静态资源
```

## 游戏特色

- **模拟真实手机界面**：桌面、微信、浏览器、QQ 等多个应用的高还原度模拟
- **AI 驱动的角色对话**：基于 Moonshot AI 实现动态角色交互，每个角色拥有独立的人格提示词
- **多结局系统**：根据玩家的选择和调查深度，可达成不同结局
- **跨标签页状态同步**：通过 BroadcastChannel API 实现多标签页间的游戏状态实时同步
- **渐进式解密流程**：线索环环相扣，玩家需要在不同应用间切换、搜索、推理

## 使用的 AI 模型

| 用途 | 模型 |
|------|------|
| 角色对话 | kimi-k2-0905-preview |
| 摘要生成 | moonshot-v1-8k |

## 许可证

本项目仅供学习与交流使用。
