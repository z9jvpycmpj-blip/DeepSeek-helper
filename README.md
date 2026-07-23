---
created: 2026-07-23
tags: [sse, 穿搭助手, 部署]
---

# 🚀 SSE 穿搭顾问 · 部署指南

> 把你的 SSE 知识体系变成一个任何人都能用的网页穿搭助手。

---

## 一、你需要准备的东西

| 项目 | 说明 | 价格 |
|:----|:-----|:----|
| **Claude API Key** | 在 [console.anthropic.com](https://console.anthropic.com) 注册获取 | 按量计费（初期约 ¥100-300/月） |
| **Vercel 账号** | 在 [vercel.com](https://vercel.com) 用 GitHub 登录 | 免费 |
| **GitHub 账号** | 在 [github.com](https://github.com) 注册 | 免费 |

> ⏱ **从零到上线时间**：约 30 分钟

---

## 二、部署步骤

### 2.1 获取 Claude API Key

1. 打开 [console.anthropic.com](https://console.anthropic.com)
2. 注册账号 → 进入 API Keys 页面
3. 点击 **Create Key** → 复制生成的 `sk-ant-...` 开头的密钥
4. **⚠️ 保存好，关闭页面后就看不到了**

### 2.2 上传代码到 GitHub

```
1. 打开 github.com → 点击右上角 "+" → New repository
2. Repository name 填：sse-fashion-advisor
3. 选 Public（免费）或 Private → Create repository
4. 进入刚创建的仓库 → 点击 "uploading an existing file"
5. 把以下 3 个文件拖进去：
   ├── index.html
   ├── api/generate.js
   └── vercel.json
6. 点击 "Commit changes"
```

### 2.3 部署到 Vercel

```
1. 打开 vercel.com → 用 GitHub 登录
2. 点击 "Add New" → "Project"
3. 选择 sse-fashion-advisor 仓库 → Import
4. 在 "Environment Variables" 部分添加：
   Name:  CLAUDE_API_KEY
   Value: 你刚才复制的 sk-ant-... 密钥
5. 点击 "Deploy" → 等 1-2 分钟
6. ✅ 部署完成！Vercel 会给你一个域名：
   https://sse-fashion-advisor.vercel.app
```

> **以后每次更新代码**：在 GitHub 仓库里修改文件，Vercel 会自动重新部署。

### 2.4 验证上线

打开 Vercel 给你的域名（如 `https://sse-fashion-advisor.vercel.app`）：

1. 填写身高 172cm，体重 65kg
2. 场景填"明天面试"
3. 点击"生成穿搭方案"
4. ✅ 看到方案输出 → 成功！

---

## 三、接入你的内容矩阵

部署完网页后，在你的每篇内容末尾加一个引导入口：

### 小红书/公众号文章末尾

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 **不知道这件衣服适不适合你？**
👉 打开「SSE 穿搭顾问」，输入你的身材数据
　　免费获取专属穿搭方案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

可以把网页链接生成**二维码**（微信里长按识别），放在文章底部图片中。

### 公众号菜单设置
```
公众号后台 → 自定义菜单 → 添加菜单项
名称：免费测穿搭
类型：跳转网页
链接：https://sse-fashion-advisor.vercel.app
```

### 微信内打开优化
Vercel 域名在微信内打开可能会提示"非官方页面"。解决方法：
- **方案 A（最简单）**：用 [百度短链接](https://dwz.cn) 或 [草料二维码](https://cli.im) 生成短链/二维码，用户扫码打开
- **方案 B（更正式）**：备案一个自己的域名，CNAME 到 Vercel（需要服务器/域名备案）

---

## 四、后续升级路径

### Phase 2：接入微信公众号（自动回复）

将后端 API 接入微信公众号的**被动回复**接口：

```
用户发消息 → 微信服务器 → 你的API → Claude API → 回复给用户
```

具体实现：
1. 在 Vercel 增加一个 `/api/wechat.js` 处理微信消息
2. 配置微信公众号的服务器地址为 `https://你的域名/api/wechat`
3. 用户发送"身高175，肩宽45，明天面试穿什么" → 自动回复穿搭方案

*（我可以帮你写这个 `/api/wechat.js`，需要时告诉我）*

### Phase 3：微信小程序

用小程序代替网页，体验更好：
- 表单输入比网页更原生
- 支持图片上传（用户可以拍衣服问"这件适合我吗"）
- 能收集用户数据（体型分布），反哺算法

### Phase 4：升级为产品 MVP

网页版验证通过后 → 增加注册/收藏/历史功能 → 就是你 SSE 平台的原型

---

## 五、成本预估

| 项目 | 月费 |
|:----|:----:|
| Vercel 托管 | 免费 |
| GitHub 托管 | 免费 |
| Claude API（初期 1000次/月） | ~¥150-300 |
| 域名（可选） | ~¥50-80/年 |
| **合计** | **约 ¥150-300/月** |

> 每次用户生成一套方案的花费：约 ¥0.15-0.3（一次 Claude API 调用）

---

## 六、项目文件说明

| 文件 | 用途 | 你需要修改吗？ |
|:----|:-----|:------------|
| `index.html` | 前端页面（表单+展示） | 可以改文案/样式 |
| `api/generate.js` | 后端 API（调用Claude） | **不需要动** |
| `vercel.json` | Vercel 配置 | **不需要动** |
| `SYSTEM_PROMPT.md` | AI 知识体系（参考文档） | 不用部署，仅参考 |
