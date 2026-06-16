# Pokemon-Searching

## 项目描述
一个微信小程序，用于搜索和查看 Pokemon 信息。本项目已完整集成 **PokéAPI** 服务，实现了从外部 API 获取实时 Pokemon 数据。

## 功能特性

### 核心功能
- ✅ **PokéAPI 服务集成** - 调用 PokéAPI 获取实时 Pokemon 数据
- ✅ **智能降级方案** - 当 API 失败时自动使用本地数据
- ✅ **数据缓存机制** - 7天过期缓存，减少网络请求
- ✅ **Pokemon 搜索** - 支持按名称、ID 或中文名搜索
- ✅ **详细信息展示** - 显示属性、能力、基础数值、进化链等
- ✅ **高级过滤** - 支持按类型、代数等条件过滤

## 架构说明

### 新增文件结构

```
utils/
├── api.js           # PokéAPI 服务接口
├── cache.js         # 本地缓存管理
└── converter.js     # 数据格式转换
```

### 核心模块说明

#### 1. `utils/api.js` - API 服务模块
提供与 PokéAPI 交互的所有接口：

```javascript
// 获取完整 Pokemon 信息（包括缓存）
getPokemonFullInfo(nameOrId)

// 获取基础信息
getPokemonInfo(nameOrId)

// 获取物种信息
getPokemonSpecies(id)

// 获取进化链
getEvolutionChain(evolutionChainId)

// 获取能力详情
getAbilityInfo(abilityName)

// 获取 Pokemon 列表
getPokemonList(limit, offset)

// 搜索 Pokemon
searchPokemon(query)
```

#### 2. `utils/cache.js` - 缓存管理
管理本地存储的 API 响应数据：

```javascript
setCache(key, data)      // 保存到缓存
getCache(key)            // 读取缓存
removeCache(key)         // 删除缓存
clearAllCache()          // 清空所有缓存
```

缓存策略：
- 缓存过期时间：7 天
- 自动过期检查和清理
- 前缀管理防止冲突

#### 3. `utils/converter.js` - 数据转换
将 PokéAPI 响应转换为本地数据格式：

```javascript
convertPokemonData(apiData, speciesData)  // 转换 Pokemon 数据
parseEvolutionChain(chainData)            // 解析进化链
```

#### 4. `data/globalobject.js` - 全局数据对象（已更新）
新增异步方法支持 API 调用：

```javascript
// 异步方法（API 优先）
getPokemonFromAPI(idOrName)
getItemByIdAsync(id)
getItemsByAbilityAsync(ability)
searchAsync(key, queryString)
filterAsync(queryObject)

// 原有方法（本地数据，作为备用）
getItemById(id)
getItemsByAbility(ability)
search(key, queryString)
filter(queryObject)
```

### 页面更新说明

#### `pages/index/index.js` - 首页
- 支持从 API 加载 Pokemon 列表
- 实现分页加载（每页 50 条）
- 网络错误时自动降级到本地数据
- 支持过滤功能

#### `pages/search/index.js` - 搜索页面
- 实时搜索 API 数据
- 支持按名称、ID、中文名搜索
- 搜索失败时使用本地数据
- 搜索结果实时显示

#### `pages/sprite/index.js` - 详情页面
- 优先从 API 获取完整信息
- 显示官方图片、描述、基础数值
- 进化链信息集成
- 网络失败时使用缓存或本地数据

## API 集成方案

### 请求流程图

```
用户操作
   ↓
检查本地缓存 ← 命中 → 直接返回
   ↓ 未命中
调用 PokéAPI
   ↓
缓存结果 + 返回数据
   ↓
网络错误 → 使用本地备用数据
```

### 错误处理

1. **网络错误** - 自动使用本地数据
2. **API 超时** - 10 秒超时限制，触发备用方案
3. **缓存失效** - 自动清理过期数据

## 使用示例

### 获取 Pokemon 详情
```javascript
const app = getApp();

// 使用 API（推荐）
app.globalObject.getItemByIdAsync('001')
  .then(pokemon => {
    console.log(pokemon); // 返回完整信息
  })
  .catch(err => {
    console.log('获取失败:', err);
  });
```

### 搜索 Pokemon
```javascript
// 搜索名为 "pikachu" 的 Pokemon
app.globalObject.searchAsync('name,cname', 'pikachu')
  .then(results => {
    console.log(results); // 搜索结果
  });
```

### 按类型过滤
```javascript
// 过滤火系 Pokemon
app.globalObject.filterAsync({ type: ['fire'] })
  .then(results => {
    console.log(results); // 过滤结果
  });
```

## 配置信息

### API 基础 URL
- PokéAPI: `https://pokeapi.co/api/v2/`

### 超时设置
- 所有请求超时时间：10000 ms（10 秒）

### 缓存设置
- 缓存过期时间：7 天
- 缓存前缀：`pokemon_cache_`、`pokemon_cache_expiry_`

## 网络要求

确保小程序已配置以下域名白名单：
```
https://pokeapi.co
```

在微信小程序开发者工具中配置：设置 → 项目设置 → 合法域名

## 性能优化

1. **缓存机制** - 减少重复请求
2. **智能降级** - 网络不稳定时自动使用本地数据
3. **分页加载** - 初始加载 100 条，按需加载更多
4. **异步处理** - 非阻塞式数据加载

## 故障排查

### 无法加载 API 数据
1. 检查网络连接
2. 确认合法域名是否配置 `https://pokeapi.co`
3. 检查浏览器控制台是否有错误信息

### 缓存问题
- 清空缓存：调用 `app.globalObject.clearAllCache()` 或清空小程序缓存

### 降级到本地数据
- 当 API 不可用时，系统自动使用本地数据
- 本地数据存储在 `data/spritelist.js`

## 技术栈

- **前端框架** - 微信小程序原生框架
- **数据来源** - PokéAPI (免费开源 API)
- **存储方案** - 微信小程序本地存储（wx.storage）
- **语言** - JavaScript (ES6+)

## 开发建议

1. 首先测试网络连接和 API 可用性
2. 在调试时使用控制台查看网络请求
3. 定期清理过期缓存以节省存储空间
4. 为常用查询操作添加适当的加载提示

## 后续优化方向

- [ ] 支持离线模式（完整数据预下载）
- [ ] 添加 Pokemon 对比功能
- [ ] 支持收藏夹功能
- [ ] 性能进一步优化（图片懒加载）
- [ ] 多语言支持

## 许可证

该项目使用的数据来自 [PokéAPI](https://pokeapi.co/)，遵循其开源许可协议。

## 更新日志

### v2.0.0 (2026-06-16)
- ✅ 集成 PokéAPI 服务
- ✅ 实现智能缓存机制
- ✅ 完成所有页面的异步数据加载
- ✅ 添加完整错误处理和降级方案
