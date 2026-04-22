# 宝可梦图鉴 - Pokemon-Searching

一个使用微信小程序构建的宝可梦图鉴应用，数据来源于 [PokéAPI](https://pokeapi.co/)。

## 功能特点

- 📋 **宝可梦列表**：分页展示所有宝可梦，支持下拉刷新和滑动加载更多
- 🔍 **搜索功能**：支持按宝可梦名称（英文）或编号搜索
- 📖 **宝可梦详情**：展示宝可梦的图片、属性、特性、基础属性（带进度条）和图鉴描述
- 🌏 **中文支持**：属性名称、特性名称使用中文显示；如 PokéAPI 有中文名称和描述则优先展示
- 🎨 **精美 UI**：根据宝可梦主属性动态生成卡片背景色，支持深色/浅色风格

## 项目结构

```
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── project.config.json     # 项目配置
├── sitemap.json
├── pages/
│   ├── index/              # 首页（宝可梦列表 + 搜索）
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── detail/             # 详情页
│       ├── detail.js
│       ├── detail.json
│       ├── detail.wxml
│       └── detail.wxss
└── utils/
    ├── api.js              # wx.request 封装
    └── pokemon.js          # 类型颜色、名称等工具函数
```

## 开发环境

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择「导入项目」
3. 选择本项目根目录，AppID 填写自己的或使用测试号
4. 在「详情 → 本地设置」中勾选「不校验合法域名...」，以允许访问 PokéAPI
5. 点击编译即可预览

## 数据来源

- API：[PokéAPI](https://pokeapi.co/) — 免费、开放的宝可梦数据 RESTful API
- 图片：[PokeAPI/sprites](https://github.com/PokeAPI/sprites) — 官方插画高清图片
