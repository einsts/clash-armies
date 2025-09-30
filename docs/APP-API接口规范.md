# Clash Armies APP API 接口规范

## 概述

本文档描述了 Clash Armies 移动应用的 REST API 接口规范。所有接口都基于 HTTPS 协议，使用 JSON 格式进行数据交换。

**基础URL**: `https://your-domain.com/app/api/v1`

## 认证方式

APP 端使用 JWT (JSON Web Token) 进行身份认证：

- **Access Token**: 用于API请求认证，有效期30分钟
- **Refresh Token**: 用于刷新Access Token，有效期30天
- **请求头**: `Authorization: Bearer <access_token>`

### 刷新与旋转规则

- 刷新成功后会“旋转”Refresh Token：服务器返回新的 `refreshToken`，客户端必须用新值覆盖旧值。
- 旧的 Refresh Token 在旋转后立即失效；再次使用旧 token 将返回 `401 TOKEN_INVALID`。
- 并发刷新导致版本冲突时将返回 `401 TOKEN_INVALID`，客户端可重试一次。

### CORS 与预检

- 所有接口支持 `OPTIONS` 预检请求，返回 204 并带 CORS 头。
- `Access-Control-Allow-Origin` 按请求 `Origin` 回显；允许方法：`GET, POST, PUT, DELETE, OPTIONS`；允许头：`Content-Type, Authorization`。
- APP 侧不依赖 Web Cookie。

### JWT 密钥要求（服务端）

- 需要配置环境变量：`APP_JWT_SECRET` 与 `APP_REFRESH_SECRET`；缺失会导致服务启动失败。

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": <响应数据>,
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

### 统一命名与响应约定

- 顶层字段恒定：`success`、`data`、`message`、`timestamp`、`requestId`。
- `message` 一律位于顶层，`data` 内不再放置 `message`。
- 资源命名：
  - 列表返回使用复数名：如 `armies`、`comments`，并配套 `total`。
  - 详情或创建/更新返回资源对象使用单数名：如 `army`、`user`。
- 创建与更新：`data` 内仅返回完整资源对象（如 `army`、`user`）。如需 ID，请从资源对象字段获取，不再重复返回 `armyId`、`userId` 等顶层同义字段。
- 删除：`data` 内返回被删除资源的主键 ID（如 `armyId` 或 `commentId`）。
- 计数/状态类：按需返回语义化字段（如 `vote`）。

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

## 接口列表

### 1. 认证相关接口

#### 1.1 用户登录
**POST** `/auth/login`

通过 Google ID Token 进行登录认证。

**请求体**:
```json
{
  "idToken": "google_id_token_string"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": 123,
      "username": "Warrior-123",
      "roles": ["user"],
      "playerTag": null,
      "level": null,
      "googleId": "google_user_id",
      "googleEmail": "user@gmail.com",
      "name": "User Name",
      "picture": "https://profile_picture_url"
    },
    "expiresIn": {
      "accessToken": 1800,
      "refreshToken": 2592000
    }
  },
  "message": "登录成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 1.2 刷新Token
**POST** `/auth/refresh`

使用 Refresh Token 获取新的 Access Token。

**请求体**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token",
    "expiresIn": {
      "accessToken": 1800,
      "refreshToken": 2592000
    }
  },
  "message": "刷新成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```
**说明**:
- 刷新成功会返回一对新的 AT/RT，客户端必须替换本地保存的 `refreshToken`。
- 若使用旧 `refreshToken` 再次调用，将返回 `401 TOKEN_INVALID`。

#### 1.3 用户登出
**POST** `/auth/logout`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "deviceId": "optional_device_id"
}
```

**响应**:
```json
{
  "success": true,
  "data": {},
  "message": "登出成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

### 2. 用户相关接口

#### 2.1 获取用户资料
**GET** `/users/profile`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "Warrior-123",
      "playerTag": null,
      "roles": ["user"]
    }
  },
  "message": "获取用户资料成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 2.2 更新用户资料
**PUT** `/users/profile`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "username": "new_username"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "new_username"
    }
  },
  "message": "用户资料更新成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

### 3. 军队相关接口

#### 3.1 获取军队列表
**GET** `/armies`

**查询参数**:
- `townHall` (可选): 大本营等级 (1-17)
- `sort` (可选): 排序方式 (`new` | `score`)，默认 `new`
- `creator` (可选): 创建者用户名

**响应**:
```json
{
  "success": true,
  "data": {
    "armies": [
      {
        "id": 1,
        "name": "军队名称",
        "townHall": 15,
        "banner": "banner_image_url",
        "units": [...],
        "equipment": [...],
        "pets": [...],
        "tags": [...],
        "guide": {...},
        "comments": [...],
        "score": 100,
        "votes": 10,
        "pageViews": 50,
        "openLinkClicks": 5,
        "copyLinkClicks": 3,
        "username": "creator_username",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100
  },
  "message": "获取军队列表成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.2 创建军队
**POST** `/armies`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "name": "军队名称",
  "townHall": 15,
  "banner": "banner_image_url",
  "units": [
    {
      "unitId": 1,
      "level": 10,
      "home": 1
    }
  ],
  "equipment": [
    {
      "equipmentId": 1,
      "level": 5
    }
  ],
  "pets": [
    {
      "petId": 1,
      "level": 3
    }
  ],
  "tags": ["tag1", "tag2"],
  "guide": {
    "title": "攻略标题",
    "content": "攻略内容"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "army": {
      "id": 123,
      "name": "军队名称",
      "townHall": 15,
      "banner": "banner_image_url"
    }
  },
  "message": "军队创建成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.3 获取军队详情
**GET** `/armies/{id}`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "军队名称",
    "townHall": 15,
    "banner": "banner_image_url",
    "units": [...],
    "equipment": [...],
    "pets": [...],
    "tags": [...],
    "guide": {...},
    "comments": [...],
    "score": 100,
    "votes": 10,
    "pageViews": 50,
    "openLinkClicks": 5,
    "copyLinkClicks": 3,
    "username": "creator_username",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "获取军队详情成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.4 更新军队
**PUT** `/armies/{id}`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**: 同创建军队的请求体

**响应**:
```json
{
  "success": true,
  "data": {
    "army": {
      "id": 123,
      "name": "军队名称",
      "townHall": 15,
      "banner": "banner_image_url"
    }
  },
  "message": "军队更新成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.5 删除军队
**DELETE** `/armies/{id}`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "armyId": 123
  },
  "message": "军队删除成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.6 收藏军队
**POST** `/armies/{id}/bookmark`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "armyId": 123,
    "userId": 456,
    "action": "bookmark"
  },
  "message": "收藏成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.7 取消收藏军队
**DELETE** `/armies/{id}/bookmark`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "armyId": 123,
    "userId": 456,
    "action": "unbookmark"
  },
  "message": "取消收藏成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.8 获取收藏军队列表
**GET** `/armies/bookmarked`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "armies": [...],
    "total": 10
  },
  "message": "获取收藏军队成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.9 军队投票
**POST** `/armies/{id}/votes`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "vote": 1
}
```

**投票值说明**:
- `1`: 点赞
- `0`: 取消投票
- `-1`: 反向点赞

**响应**:
```json
{
  "success": true,
  "data": {
    "armyId": 123,
    "vote": 1
  },
  "message": "投票成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.10 获取军队评论
**GET** `/armies/{id}/comments`

**响应**:
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 456,
        "armyId": 123,
        "comment": "评论内容",
        "replyTo": null,
        "userId": 789,
        "username": "commenter_username",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 5
  },
  "message": "获取评论成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.11 发表评论
**POST** `/armies/{id}/comments`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "comment": "评论内容",
  "replyTo": null
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": 456,
      "armyId": 123,
      "userId": 789,
      "comment": "评论内容",
      "replyTo": null
    }
  },
  "message": "评论发表成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.12 删除评论
**DELETE** `/armies/{id}/comments?commentId=456`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "commentId": 456
  },
  "message": "评论删除成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 3.13 军队统计接口
**POST** `/armies/metrics`

用于上报军队相关的统计指标，如浏览次数、点击次数等。

**请求体**:
```json
{
  "metric": "page-view",
  "armyId": 123
}
```

**支持的统计指标类型**:
- `page-view`: 浏览次数
- `copy-link-click`: 复制链接点击次数
- `open-link-click`: 打开链接点击次数

**响应**:
```json
{
  "success": true,
  "data": {},
  "message": "统计指标记录成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

### 4. 游戏数据接口

#### 4.1 获取所有游戏数据
**GET** `/gamedata`

**响应**:
```json
{
  "success": true,
  "data": {
    "units": [...],
    "equipment": [...],
    "pets": [...],
    "townHalls": [...]
  },
  "message": "获取游戏数据成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 4.2 获取单位数据
**GET** `/gamedata/units`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "单位名称",
      "level": 10,
      "maxLevel": 15,
      "townHall": 12,
      "image": "unit_image_url"
    }
  ],
  "message": "获取单位数据成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 4.3 获取装备数据
**GET** `/gamedata/equipment`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "装备名称",
      "level": 5,
      "maxLevel": 10,
      "townHall": 12,
      "image": "equipment_image_url"
    }
  ],
  "message": "获取装备数据成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 4.4 获取宠物数据
**GET** `/gamedata/pets`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "宠物名称",
      "level": 3,
      "maxLevel": 5,
      "townHall": 12,
      "image": "pet_image_url"
    }
  ],
  "message": "获取宠物数据成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

#### 4.5 获取大本营数据
**GET** `/gamedata/townhalls`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "level": 15,
      "maxLevel": 17,
      "image": "townhall_image_url"
    }
  ],
  "message": "获取大本营数据成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

### 5. 系统接口

#### 5.1 健康检查
**GET** `/health`

**响应**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "environment": "development",
    "version": "1.0.0",
    "rateLimit": {
      "message": "限流状态查询功能已启用",
      "note": "当前为开发环境，使用内存存储",
      "storage": "Node.js 进程内存",
      "cleanup": "每小时自动清理过期记录"
    }
  },
  "message": "APP服务正常运行",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid-string"
}
```

## 错误码说明

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| `VALIDATION_ERROR` | 请求参数验证失败 | 422 |
| `UNAUTHORIZED` | 需要身份认证 | 401 |
| `TOKEN_INVALID` | Token无效或已过期 | 401 |
| `TOKEN_EXPIRED` | Token已过期 | 401 |
| `GOOGLE_AUTH_FAILED` | Google认证失败 | 401 |
| `USER_NOT_FOUND` | 用户不存在 | 404 |
| `ARMY_NOT_FOUND` | 军队不存在 | 404 |
| `INVALID_ARMY_ID` | 无效的军队ID | 400 |
| `INVALID_COMMENT_ID` | 无效的评论ID | 400 |
| `ARMY_CREATION_ERROR` | 军队创建失败 | 400 |
| `ARMY_UPDATE_ERROR` | 军队更新失败 | 400 |
| `ARMY_DELETE_ERROR` | 军队删除失败 | 400 |
| `PROFILE_GET_ERROR` | 获取用户资料失败 | 400 |
| `PROFILE_UPDATE_ERROR` | 用户资料更新失败 | 400 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 429 |
| `FORBIDDEN` | 权限不足 | 403 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |
| `UNKNOWN_ERROR` | 未知错误 | 500 |

## 限流规则

| 接口类型 | 时间窗口 | 最大请求数 |
|----------|----------|------------|
| 登录相关 | 15分钟 | 10次 |
| 军队列表 | 15分钟 | 100次 |
| 军队详情 | 15分钟 | 200次 |
| 军队操作 | 15分钟 | 10次 |
| 军队投票 | 15分钟 | 50次 |
| 军队评论 | 15分钟 | 10次 |
| 军队统计 | 15分钟 | 200次 |
| 用户资料 | 15分钟 | 50次 |
| 游戏数据 | 15分钟 | 50次 |
| 统一游戏数据 | 15分钟 | 100次 |
| 健康检查 | 无限制 | - |

## 数据模型

### Army 军队模型
```typescript
interface Army {
  id: number;
  name: string;
  townHall: number;
  banner: string;
  units: ArmyUnit[];
  equipment: ArmyEquipment[];
  pets: ArmyPet[];
  tags: string[];
  guide?: ArmyGuide;
  comments: ArmyComment[];
  score: number;
  votes: number;
  pageViews: number;
  openLinkClicks: number;
  copyLinkClicks: number;
  username: string;
  createdAt: string;
}
```

### ArmyUnit 军队单位模型
```typescript
interface ArmyUnit {
  id: number;
  unitId: number;
  level: number;
  home: number;
  armyId: number;
}
```

### ArmyEquipment 军队装备模型
```typescript
interface ArmyEquipment {
  id: number;
  equipmentId: number;
  level: number;
  armyId: number;
}
```

### ArmyPet 军队宠物模型
```typescript
interface ArmyPet {
  id: number;
  petId: number;
  level: number;
  armyId: number;
}
```

### ArmyComment 军队评论模型
```typescript
interface ArmyComment {
  id: number;
  armyId: number;
  comment: string;
  replyTo: number | null;
  userId: number;
  username: string;
  createdAt: string;
}
```

### ArmyGuide 军队攻略模型
```typescript
interface ArmyGuide {
  id: number;
  title: string;
  content: string;
  armyId: number;
}
```

### User 用户模型
```typescript
interface User {
  id: number;
  username: string;
  playerTag: string | null;
  roles: string[];
  googleId: string;
  googleEmail: string;
  name: string;
  picture: string;
}
```

## 缓存策略

- **游戏数据接口**: 设置 `Cache-Control: public, max-age=86400, immutable` (1天)
- **其他接口**: 不设置缓存头，由客户端自行处理

## 更新日志

### v2.1.0 (2024-01-01)
- 新增军队统计接口 `/armies/metrics`
- 支持浏览次数、链接点击等统计指标上报
- 简化统计接口实现，参考web端设计
- 优化限流策略，为统计接口设置专门限制

### v2.0.0 (2024-01-01)
- 重构响应格式，增加 `timestamp` 和 `requestId` 字段
- 优化错误处理，统一错误响应格式
- 增加健康检查接口
- 增加统一游戏数据接口
- 优化限流策略，按接口类型设置不同限制
- 完善评论系统，支持回复功能
- 改进投票系统，支持三种投票状态

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持Google OAuth登录
- 完整的军队CRUD操作
- 支持评论和投票功能
- 提供游戏数据接口