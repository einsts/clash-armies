# Clash Armies APP接口设计文档

## 📋 项目概述

本文档描述了为Clash Armies项目开发移动端APP接口的设计方案。APP接口将基于现有的Web功能，通过最大化代码复用来实现军队展示、创建、评论、点赞、用户认证等核心功能。

## 🏗️ 架构设计原则

### 1. 核心设计原则
- **继承现有架构**: 复用现有的数据模型、业务逻辑、数据库操作
- **接口层分离**: 只在API接口层做APP适配，底层逻辑完全复用
- **最小化重复**: 避免重复实现相同的业务逻辑
- **统一数据源**: APP和Web使用相同的数据模型和验证逻辑

### 2. 代码复用策略

#### 2.1 完全复用的模块
```
✅ 数据模型类 (ArmyModel, UnitModel, PetModel等)
✅ 业务逻辑 (ArmyAPI, UserAPI, NotificationAPI等)
✅ 数据验证 (Zod schemas, validation functions)
✅ 数据库操作 (所有CRUD操作)
✅ 游戏数据 (units, equipment, pets, townhalls)
✅ 权限控制 (角色检查, 资源所有权验证)
```

#### 2.2 需要适配的模块
```
🔄 认证系统: 从Session改为JWT Token
🔄 响应格式: 从HTML/JSON改为统一API格式
🔄 错误处理: 从Web错误页面改为API错误响应
🔄 数据格式: 从Web视图模型改为API数据模型
```

## 📁 项目目录结构

### 1. 整体目录结构
```
src/
├── lib/
│   ├── client/              # 现有Web客户端代码
│   ├── models/              # 现有数据模型（复用）
│   ├── server/              # 现有服务端代码（复用）
│   │   ├── api/             # 现有Web API
│   │   ├── auth/            # 现有认证系统
│   │   └── migration/       # 现有数据库迁移
│   ├── shared/              # 现有共享代码（复用）
│   └── app/                 # 🆕 APP接口适配层（新增）
│       ├── api/             # APP API路由
│       ├── middleware/      # APP专用中间件
│       ├── transformers/    # 数据转换器
│       └── types/           # APP专用类型定义
├── routes/                  # 现有Web路由
├── app-routes/              # 🆕 APP专用路由（新增）
└── components/              # 现有Web组件
```

### 2. APP专用目录详细结构
```
src/lib/app/
├── api/                     # APP API接口层
│   ├── ArmyAppAPI.ts       # 军队管理API适配
│   ├── UserAppAPI.ts       # 用户管理API适配
│   ├── CommentAppAPI.ts    # 评论系统API适配
│   ├── GameAppAPI.ts       # 游戏数据API适配
│   └── index.ts            # API统一导出
├── middleware/              # APP专用中间件
│   ├── auth.ts             # JWT认证中间件
│   ├── rateLimit.ts        # 限流中间件
│   ├── cors.ts             # 跨域处理中间件
│   └── errorHandler.ts     # 错误处理中间件
├── transformers/            # 数据转换器
│   ├── ArmyTransformer.ts  # 军队数据转换
│   ├── UserTransformer.ts  # 用户数据转换
│   ├── CommentTransformer.ts # 评论数据转换
│   └── GameDataTransformer.ts # 游戏数据转换
├── types/                   # APP专用类型定义
│   ├── requests.ts          # 请求类型定义
│   ├── responses.ts         # 响应类型定义
│   ├── auth.ts              # 认证相关类型
│   ├── army.ts              # 军队相关类型
│   └── common.ts            # 通用类型
└── utils/                   # APP工具函数
    ├── response.ts          # 响应格式化工具
    ├── validation.ts        # 数据验证工具
    └── constants.ts         # APP常量定义
```

### 3. APP路由目录结构
```
src/app-routes/
├── api/
│   └── v1/                 # API v1版本路由
│       ├── armies/
│       │   ├── +server.ts  # 军队列表/创建
│       │   └── [id]/
│       │       ├── +server.ts      # 军队详情/更新/删除
│       │       ├── comments/
│       │       │   └── +server.ts  # 军队评论
│       │       ├── like/
│       │       │   └── +server.ts  # 点赞功能
│       │       └── bookmark/
│       │           └── +server.ts  # 收藏功能
│       ├── auth/
│       │   ├── register/
│       │   │   └── +server.ts      # 用户注册
│       │   ├── login/
│       │   │   └── +server.ts      # 用户登录
│       │   ├── refresh/
│       │   │   └── +server.ts      # Token刷新
│       │   ├── logout/
│       │   │   └── +server.ts      # 用户登出
│       │   └── profile/
│       │       └── +server.ts      # 用户信息
│       ├── users/
│       │   └── [username]/
│       │       └── +server.ts      # 用户信息
│       ├── game/
│       │   ├── units/
│       │   │   └── +server.ts      # 单位数据
│       │   ├── equipment/
│       │   │   └── +server.ts      # 装备数据
│       │   ├── pets/
│       │   │   └── +server.ts      # 宠物数据
│       │   └── townhalls/
│       │       └── +server.ts      # 大本营数据
│       └── comments/
│           └── [id]/
│               └── +server.ts      # 评论管理
└── health/
    └── +server.ts          # 健康检查接口
```

## 🔐 认证系统设计

### 1. JWT Token结构
```typescript
// Access Token (短期，15分钟)
interface AccessToken {
  userId: number;
  username: string;
  roles: string[];
  exp: number;
  iat: number;
}

// Refresh Token (长期，7天)
interface RefreshToken {
  userId: number;
  tokenVersion: number;
  exp: number;
  iat: number;
}
```

### 2. 认证流程
```
1. 用户登录 → 验证凭据 → 生成Access Token + Refresh Token
2. APP请求 → 携带Access Token → 验证Token有效性
3. Token过期 → 使用Refresh Token → 生成新的Access Token
4. 用户登出 → 撤销Refresh Token → 清除设备会话
```

### 3. 设备管理
```typescript
interface AppDevice {
  id: string;
  userId: number;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceToken?: string;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
}
```

## 📡 API接口设计

### 1. 统一响应格式

#### 1.1 成功响应
```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
}
```

#### 1.2 错误响应
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}
```

### 2. 核心接口定义

#### 2.1 用户认证接口
```
POST   /api/v1/auth/register     # 用户注册
POST   /api/v1/auth/login        # 用户登录
POST   /api/v1/auth/refresh      # Token刷新
POST   /api/v1/auth/logout       # 用户登出
GET    /api/v1/auth/profile      # 获取用户信息
PUT    /api/v1/auth/profile      # 更新用户信息
```

#### 2.2 军队管理接口
```
GET    /api/v1/armies            # 获取军队列表
GET    /api/v1/armies/:id        # 获取军队详情
POST   /api/v1/armies            # 创建新军队
PUT    /api/v1/armies/:id        # 更新军队
DELETE /api/v1/armies/:id        # 删除军队
GET    /api/v1/armies/my         # 获取我的军队
```

#### 2.3 军队交互接口
```
POST   /api/v1/armies/:id/like     # 点赞军队
DELETE /api/v1/armies/:id/like     # 取消点赞
POST   /api/v1/armies/:id/bookmark # 收藏军队
DELETE /api/v1/armies/:id/bookmark # 取消收藏
GET    /api/v1/armies/bookmarked   # 获取收藏的军队
```

#### 2.4 评论系统接口
```
GET    /api/v1/armies/:id/comments     # 获取军队评论
POST   /api/v1/armies/:id/comments     # 发表评论
PUT    /api/v1/comments/:id            # 更新评论
DELETE /api/v1/comments/:id            # 删除评论
POST   /api/v1/comments/:id/reply      # 回复评论
```

#### 2.5 游戏数据接口
```
GET /api/v1/game/units        # 获取所有单位数据
GET /api/v1/game/equipment    # 获取装备数据
GET /api/v1/game/pets         # 获取宠物数据
GET /api/v1/game/townhalls    # 获取大本营数据
GET /api/v1/game/banners      # 获取横幅数据
```

### 3. 查询参数规范

#### 3.1 分页参数
```typescript
interface PaginationParams {
  page?: number;      // 页码，默认1
  limit?: number;     // 每页数量，默认20，最大100
}
```

#### 3.2 军队筛选参数
```typescript
interface ArmyFilterParams extends PaginationParams {
  townHall?: number;           // 大本营等级筛选
  sort?: 'new' | 'score' | 'popular'; // 排序方式
  tags?: string[];             // 标签筛选
  search?: string;             // 搜索关键词
  creator?: string;            // 创建者筛选
}
```

#### 3.3 排序选项
```typescript
type ArmySortOption = 
  | 'new'        // 最新创建
  | 'score'      // 评分最高
  | 'popular'    // 最受欢迎
  | 'views'      // 浏览量最高
  | 'likes'      // 点赞数最高
  | 'comments';  // 评论数最多
```

## 🔄 数据转换设计

### 1. 转换器基类
```typescript
abstract class BaseTransformer<T, R> {
  abstract toAppFormat(data: T): R;
  abstract toAppFormatList(dataList: T[]): R[];
  
  protected formatDate(date: Date): string {
    return date.toISOString();
  }
  
  protected formatNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
```

### 2. 军队数据转换
```typescript
export class ArmyTransformer extends BaseTransformer<Army, AppArmy> {
  toAppFormat(army: Army): AppArmy {
    return {
      id: army.id,
      name: army.name,
      townHall: army.townHall,
      banner: army.banner,
      score: this.formatNumber(army.score),
      votes: army.votes,
      pageViews: army.pageViews,
      isLiked: army.userVote === 1,
      isBookmarked: army.userBookmarked,
      units: army.units.map(unit => ({
        id: unit.id,
        name: unit.info.name,
        amount: unit.amount,
        home: unit.home,
        type: unit.info.type,
        housingSpace: unit.info.housingSpace,
        isSuper: unit.info.isSuper
      })),
      equipment: army.equipment.map(eq => ({
        id: eq.id,
        name: eq.info.name,
        hero: eq.info.hero,
        epic: eq.info.epic
      })),
      pets: army.pets.map(pet => ({
        id: pet.id,
        name: pet.info.name,
        hero: pet.hero
      })),
      tags: army.tags,
      creator: {
        id: army.createdBy,
        username: army.username
      },
      createdAt: this.formatDate(army.createdTime),
      updatedAt: this.formatDate(army.updatedTime)
    };
  }
}
```

### 3. 用户数据转换
```typescript
export class UserTransformer extends BaseTransformer<User, AppUser> {
  toAppFormat(user: User): AppUser {
    return {
      id: user.id,
      username: user.username,
      playerTag: user.playerTag,
      level: user.level,
      roles: user.roles,
      createdAt: this.formatDate(user.createdTime)
    };
  }
}
```

## 🛡️ 安全设计

### 1. 认证安全
- **Token过期策略**: Access Token 15分钟，Refresh Token 7天
- **Token轮换**: 每次刷新生成新的Token对
- **设备管理**: 支持多设备登录，可撤销特定设备
- **Token黑名单**: 登出后的Token加入黑名单

### 2. API安全
- **Rate Limiting**: 基于IP和用户的请求频率限制
- **Input Validation**: 严格的输入验证和类型检查
- **SQL Injection**: 使用参数化查询
- **XSS Protection**: 内容过滤和转义

### 3. 数据安全
- **敏感信息过滤**: 用户密码、Token等敏感信息不返回
- **权限验证**: 严格的资源访问权限控制
- **数据脱敏**: 用户隐私信息适当脱敏

## 📊 性能优化策略

### 1. 缓存策略
```typescript
// Redis缓存配置
const CACHE_CONFIG = {
  GAME_DATA: { ttl: 24 * 60 * 60 },      // 游戏数据24小时
  POPULAR_ARMIES: { ttl: 60 * 60 },      // 热门军队1小时
  USER_SESSIONS: { ttl: 7 * 24 * 60 * 60 }, // 用户会话7天
  ARMY_DETAILS: { ttl: 30 * 60 }         // 军队详情30分钟
};
```

### 2. 数据库优化
- **查询优化**: 复用现有的复杂JOIN查询
- **索引优化**: 为APP查询添加适当索引
- **分页优化**: 使用游标分页提高性能
- **连接池**: 优化数据库连接管理

### 3. 响应优化
- **数据压缩**: 启用gzip压缩
- **字段选择**: 支持字段选择，减少数据传输
- **懒加载**: 评论等关联数据支持懒加载
- **批量操作**: 支持批量点赞、收藏等操作

## 📋 开发计划

### 第一阶段：基础架构 (1-2周)
- [ ] 创建APP目录结构
- [ ] 实现JWT认证系统
- [ ] 创建统一响应格式
- [ ] 实现基础中间件

### 第二阶段：核心功能 (2-3周)
- [ ] 实现用户认证接口
- [ ] 实现军队管理接口
- [ ] 实现点赞/收藏功能
- [ ] 实现评论系统

### 第三阶段：游戏数据 (1-2周)
- [ ] 实现游戏数据接口
- [ ] 优化数据转换
- [ ] 实现缓存策略
- [ ] 性能优化

### 第四阶段：测试优化 (1-2周)
- [ ] 单元测试和集成测试
- [ ] 性能测试和优化
- [ ] 安全测试和加固
- [ ] 文档完善

### 第五阶段：部署上线 (1周)
- [ ] 生产环境部署
- [ ] 监控和告警配置
- [ ] 用户培训和文档
- [ ] 上线后监控

## 🔗 相关文档

- [Web前端功能文档](./源码说明文档.md)
- [数据库设计文档](./schema.sql)
- [API接口规范](./API规范.md)
- [部署运维手册](./部署运维手册.md)

## 📞 联系方式

- **项目负责人**: [待填写]
- **技术负责人**: [待填写]
- **开发团队**: [待填写]
- **测试团队**: [待填写]

## 🎯 总结

这份APP接口设计文档为Clash Armies项目提供了完整的移动端接口开发指南。通过最大化代码复用的设计原则，我们可以在保持现有功能完整性的同时，快速构建功能丰富的APP接口。

### 主要优势：
1. **最大化代码复用**: 95%以上的业务逻辑完全复用
2. **最小化重复代码**: 只新增APP接口适配层
3. **保持一致性**: 业务逻辑完全一致，避免功能差异
4. **易于维护**: 核心逻辑只需要维护一份
5. **快速开发**: 基于现有功能快速构建APP接口
6. **质量保证**: 复用经过测试的现有代码

### 下一步行动：
1. 按照开发计划逐步实施
2. 优先实现基础架构和认证系统
3. 逐步完善核心功能接口
4. 持续优化性能和安全性

---

*本文档将随着开发进度持续更新，请关注最新版本。*
