# Clash Armies APP API 接口规范

## 概述

本文档描述了 Clash Armies 移动应用的 REST API 接口规范。所有接口都基于 HTTPS 协议，使用 JSON 格式进行数据交换。

**基础URL**: `https://your-domain.com/app/api/v1`

## 认证方式

APP 端使用 JWT (JSON Web Token) 进行身份认证：

- **Access Token**: 用于API请求认证，有效期15分钟
- **Refresh Token**: 用于刷新Access Token，有效期7天
- **请求头**: `Authorization: Bearer <access_token>`

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": <响应数据>,
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  }
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
    "message": "登录成功",
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
    "sessionId": "lucia_session_id",
    "expiresIn": {
      "accessToken": 900,
      "refreshToken": 604800
    }
  }
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
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

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
  "data": {
    "message": "登出成功"
  }
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
    "message": "获取用户资料成功",
    "user": {
      "id": 123,
      "username": "Warrior-123",
      "playerTag": null,
      "roles": ["user"]
    }
  }
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
    "message": "用户资料更新成功",
    "user": {
      "id": 123,
      "username": "new_username"
    }
  }
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
    "data": [
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
  }
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
    "message": "军队创建成功",
    "armyId": 123,
    "userId": 456,
    "army": {
      "id": 123,
      "name": "军队名称",
      "townHall": 15,
      "banner": "banner_image_url"
    }
  }
}
```

#### 3.3 获取军队详情
**GET** `/armies/{id}`

**响应**:
```json
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
```

#### 3.4 更新军队
**PUT** `/armies/{id}`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**: 同创建军队的请求体

**响应**:
```json
{
  "armyId": 123
}
```

#### 3.5 删除军队
**DELETE** `/armies/{id}`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{}
```

#### 3.6 收藏军队
**POST** `/armies/{id}/bookmark`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{}
```

#### 3.7 取消收藏军队
**DELETE** `/armies/{id}/bookmark`

**请求头**: `Authorization: Bearer <access_token>`

**响应**:
```json
{}
```

#### 3.8 获取收藏军队列表
**GET** `/armies/bookmarked`

**请求头**: `Authorization: Bearer <access_token>`

**查询参数**:
- `sort` (可选): 排序方式 (`new` | `score`)，默认 `new`

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "获取收藏军队成功",
    "data": {
      "armies": [...],
      "total": 10
    }
  }
}
```

#### 3.9 军队投票
**POST** `/armies/{id}/votes`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "armyId": 123,
  "vote": 1
}
```

**投票值说明**:
- `1`: 点赞
- `0`: 取消投票
- `-1`: 反向点赞

**响应**:
```json
{}
```

#### 3.10 发表评论
**POST** `/armies/{id}/comments`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "armyId": 123,
  "comment": "评论内容",
  "replyTo": null
}
```

**响应**:
```json
{
  "id": 456
}
```

#### 3.11 删除评论
**DELETE** `/armies/{id}/comments`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
123
```

**响应**:
```json
{}
```

### 4. 游戏数据接口

#### 4.1 获取单位数据
**GET** `/game/units`

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
  ]
}
```

#### 4.2 获取装备数据
**GET** `/game/equipment`

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
  ]
}
```

#### 4.3 获取宠物数据
**GET** `/game/pets`

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
  ]
}
```

#### 4.4 获取大本营数据
**GET** `/game/townhalls`

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
  ]
}
```

## 错误码说明

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| `VALIDATION_ERROR` | 请求参数验证失败 | 400 |
| `AUTHENTICATION_REQUIRED` | 需要身份认证 | 401 |
| `TOKEN_INVALID` | Token无效或已过期 | 401 |
| `TOKEN_EXPIRED` | Token已过期 | 401 |
| `GOOGLE_AUTH_FAILED` | Google认证失败 | 401 |
| `USER_NOT_FOUND` | 用户不存在 | 404 |
| `ARMY_NOT_FOUND` | 军队不存在 | 404 |
| `ARMY_CREATION_ERROR` | 军队创建失败 | 400 |
| `ARMY_UPDATE_ERROR` | 军队更新失败 | 400 |
| `ARMY_DELETE_ERROR` | 军队删除失败 | 400 |
| `PROFILE_UPDATE_ERROR` | 用户资料更新失败 | 400 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 429 |
| `INTERNAL_SERVER_ERROR` | 服务器内部错误 | 500 |

## 限流规则

| 接口类型 | 时间窗口 | 最大请求数 |
|----------|----------|------------|
| 登录相关 | 15分钟 | 10次 |
| 军队列表 | 15分钟 | 100次 |
| 军队详情 | 15分钟 | 200次 |
| 军队操作 | 15分钟 | 10次 |
| 用户资料 | 15分钟 | 50次 |
| 游戏数据 | 15分钟 | 50次 |

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

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持Google OAuth登录
- 完整的军队CRUD操作
- 支持评论和投票功能
- 提供游戏数据接口