# 🚀 Clash Armies APP接口设计文档

## 📋 项目概述

### 项目目标
为Clash Armies项目开发移动端APP接口，最大化复用现有Web前端功能，包括军队展示、创建、评论、点赞以及用户登录/注册等核心功能。

### 核心原则
- **最大化代码复用** - 95%+的业务逻辑复用现有代码
- **零重复实现** - 避免功能差异和维护困难
- **快速开发** - 基于现有功能快速构建APP接口
- **质量保证** - 复用经过测试的现有代码

## 🏗️ 架构设计

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    APP客户端     │    │   APP接口层      │    │   现有后端       │
│                 │    │                 │    │                 │
│  - 军队展示 -    │◄──►│  - 数据转换 -     │◄──►│  - ArmyAPI -    │
│  - 用户认证 -    │    │  - JWT认证 -     │    │  - UserAPI -    │
│  - 交互功能 -    │    │  - 中间件 -      │    │  - 数据库 -      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 架构特点
1. **APP接口适配层** - 在现有后端之上构建
2. **统一中间件系统** - 认证、限流、错误处理、CORS
3. **标准化响应格式** - 一致的接口规范和响应格式
4. **类型安全** - 完整的TypeScript类型系统

## 📁 项目结构

### 目录组织（仅展示为app提供接口的目录）
```
src/
├── lib/app/                    # APP接口适配层
│   ├── api/                    # APP API适配类
│   ├── middleware/             # APP专用中间件
│   ├── transformers/           # 数据转换器
│   ├── types/                  # APP专用类型定义
│   └── utils/                  # APP工具函数
├── routes/app/                 # APP专用路由
│   ├── health/                 # 健康检查
│   └── api/v1/                 # APP API v1
│       ├── auth/               # 用户认证
│       ├── armies/             # 军队管理
│       └── game/               # 游戏数据
│       └── users/              # 用户配置
└── tests/app/                  # APP专用测试
```

### 核心模块
- **中间件系统** - JWT认证、限流、错误处理、CORS
- **数据转换器** - 将现有数据格式转换为APP格式
- **类型系统** - 完整的TypeScript类型定义
- **工具函数** - 标准化的响应创建和错误处理

## 🔌 接口设计

### 1. 健康检查接口
```
GET /app/health
响应: 服务状态、版本信息、环境信息
```

### 2. 用户认证接口
```
POST /app/api/v1/auth/login/google  # 用户登录（Google ID Token）
POST /app/api/v1/auth/login/apple   # 用户登录（Apple Sign In）
POST /app/api/v1/auth/refresh       # Token刷新
POST /app/api/v1/auth/logout        # 用户登出
```

### 3. 用户偏好设置接口
```
GET /app/api/v1/users/profile    # 获取用户资料
PUT /app/api/v1/users/profile    # 更新用户资料（用户名）
```

### 4. 军队管理接口
```
GET    /app/api/v1/armies        # 军队列表
POST   /app/api/v1/armies        # 创建军队
GET    /app/api/v1/armies/[id]   # 军队详情
PUT    /app/api/v1/armies/[id]   # 更新军队
DELETE /app/api/v1/armies/[id]   # 删除军队
```

### 5. 军队交互接口
```
POST   /app/api/v1/armies/[id]/like      # 点赞军队 (vote: 1)
DELETE /app/api/v1/armies/[id]/like      # 取消点赞 (vote: 0)
POST   /app/api/v1/armies/[id]/dislike   # 反向点赞 (vote: -1)
DELETE /app/api/v1/armies/[id]/dislike   # 取消反向点赞 (vote: 0)
POST   /app/api/v1/armies/[id]/bookmark  # 收藏军队
DELETE /app/api/v1/armies/[id]/bookmark  # 取消收藏
GET    /app/api/v1/armies/bookmarked     # 获取收藏军队列表
```

### 6. 评论系统接口
```
GET  /app/api/v1/armies/[id]/comments    # 获取评论
POST /app/api/v1/armies/[id]/comments    # 发表评论
DELETE /app/api/v1/armies/[id]/comments?commentId=X  # 删除评论
```

### 7. 游戏数据接口
```
GET /app/api/v1/game/units       # 单位数据
GET /app/api/v1/game/equipment   # 装备数据
GET /app/api/v1/game/pets        # 宠物数据
GET /app/api/v1/game/townhalls   # 大本营数据
```

## 🔐 认证与安全

### 认证系统分离
APP接口和Web接口使用完全独立的认证系统：
- **APP接口**: 使用JWT Token认证，不依赖Web端OAuth流程
- **Web接口**: 使用Lucia + Google OAuth认证
- **路由隔离**: `/app/*` 路由跳过Web端认证，使用APP JWT认证

### JWT Token结构
```typescript
interface AccessTokenPayload {
  userId: number;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: number;
  version: number;
  iat: number;
  exp: number;
}
```

### APP认证流程
1. 用户通过APP登录获取Access Token和Refresh Token
2. 后续请求在Header中携带 `Authorization: Bearer <token>`
3. Token过期时使用Refresh Token获取新的Token对
4. 支持设备管理和Token版本控制
5. **完全独立**: 不会重定向到Web端OAuth流程

### 安全特性
- **限流保护** - 基于IP和用户的请求限制
- **输入验证** - Zod schema验证所有输入
- **错误处理** - 标准化的错误码和消息
- **CORS支持** - 跨域请求处理

## 📊 数据转换设计

### 转换器架构
```typescript
abstract class BaseTransformer<T, R> {
  abstract toAppFormat(data: T, gameData?: any): R;
  abstract toAppFormatList(dataList: T[], gameData?: any): R[];
  
  protected formatDate(date: Date): string;
  protected formatNumber(num: number): number;
  protected getOrDefault<V>(current: V, defaultValue: V): V;
}
```

### 主要转换器
- **ArmyTransformer** - 军队数据转换
- **UserTransformer** - 用户数据转换
- **可扩展设计** - 支持添加新的转换器

## 🧪 测试覆盖

APP接口测试现在已使用postman测试，
postman测试配置文件位于test/postman目录


## 🛠️ 开发环境

### 环境要求
- **Node.js**: 23.3.0+
- **数据库**: MariaDB(Docker)
- **认证**: Lucia + Google OAuth
- **依赖**: JWT、Zod、UUID等

### 本地开发
```bash
# 启动数据库
docker-compose up -d db

# 启动应用
npm run start

```

## 📚 相关文档

### 技术文档
- [源码说明文档.md](./源码说明文档.md) - 原Web项目整体架构和代码说明
- [SvelteKit官方文档](https://kit.svelte.dev/) - 框架使用指南
- [Lucia认证文档](https://lucia-auth.com/) - 认证系统说明

### 开发指南
- [APP-API接口规范](./APP-API接口规范.md) - 完整的API接口参考文档
