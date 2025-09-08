# 📱 APP-API接口规范

> 本文档为APP开发人员提供完整的API接口参考，包含所有接口的详细说明、请求参数、响应格式和示例。

## 📋 目录

- [基础信息](#基础信息)
- [认证说明](#认证说明)
- [通用响应格式](#通用响应格式)
- [错误码说明](#错误码说明)
- [接口列表](#接口列表)
  - [认证相关](#认证相关)
  - [军队管理](#军队管理)
  - [互动功能](#互动功能)
  - [评论系统](#评论系统)
  - [用户偏好设置](#用户偏好设置)
  - [游戏数据](#游戏数据)
- [测试指南](#测试指南)
- [常见问题](#常见问题)

---

## 🔧 基础信息

### 服务器信息
- **开发环境**: `http://localhost:5173`
- **生产环境**: `https://your-domain.com`
- **API版本**: `v1`
- **基础路径**: `/app/api/v1`

### 请求格式
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`
- **时间格式**: `ISO 8601` (如: `2024-08-29T10:00:00.000Z`)

### 响应格式
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`
- **时间格式**: `ISO 8601`

---

## 🔐 认证说明

### JWT Token结构
```typescript
interface AccessToken {
  userId: number;      // 用户ID
  username: string;    // 用户名
  roles: string[];     // 用户角色
  iat: number;         // 签发时间
  exp: number;         // 过期时间
}
```

### 认证流程
1. **登录获取Token**: 调用登录接口获取Access Token和Refresh Token
2. **请求携带Token**: 在请求Header中添加 `Authorization: Bearer <token>`
3. **Token过期处理**: 使用Refresh Token获取新的Token对
4. **设备管理**: 支持多设备登录和Token版本控制
5. **完全独立**: APP认证系统与Web端完全分离，不会重定向到OAuth流程

### 请求头示例
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📊 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据内容
  },
  "message": "操作成功"
}
```

### 分页响应
```json
{
  "success": true,
  "data": [
    // 数据列表
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
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

### 验证错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": [
      {
        "field": "username",
        "field": "username",
        "message": "用户名至少3个字符"
      }
    ]
  }
}
```

---

## ❌ 错误码说明

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|------------|------|----------|
| `AUTHENTICATION_REQUIRED` | 401 | 需要认证 | 检查Token是否有效，重新登录 |
| `INVALID_TOKEN` | 401 | Token无效 | 检查Token格式，重新登录 |
| `TOKEN_EXPIRED` | 401 | Token过期 | 使用Refresh Token获取新Token |
| `INSUFFICIENT_PERMISSIONS` | 403 | 权限不足 | 检查用户角色权限 |
| `VALIDATION_ERROR` | 400 | 数据验证失败 | 检查请求参数格式 |
| `RESOURCE_NOT_FOUND` | 404 | 资源不存在 | 检查资源ID是否正确 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 | 降低请求频率，等待限流窗口重置 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 | 联系技术支持 |

---

## 📱 接口列表

### 🔐 认证相关

#### 1. 用户登录
```http
POST /app/api/v1/auth/login
```

**请求参数**
```json
{
  "googleIdToken": "google_id_token_string"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "roles": ["user"]
    }
  },
  "message": "登录成功"
}
```

**错误响应**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_GOOGLE_TOKEN",
    "message": "Google ID Token无效",
    "details": "Token验证失败"
  }
}
```

#### 2. 用户登出
```http
POST /app/api/v1/auth/logout
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "登出成功"
  }
}
```

#### 3. Token刷新
```http
POST /app/api/v1/auth/refresh
```

**请求参数**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  },
  "message": "Token刷新成功"
}
```

#### 4. 获取用户信息
```http
GET /app/api/v1/users/profile
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "获取用户资料成功",
    "user": {
      "id": 1,
      "username": "testuser",
      "roles": ["user"],
      "playerTag": "#ABC123"
    }
  }
}
```

---

### 🏗️ 军队管理

#### 1. 获取军队列表
```http
GET /app/api/v1/armies?townHall=15&sort=new&creator=testuser
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `townHall` | number | 否 | 大本营等级过滤 | `15` |
| `sort` | string | 否 | 排序方式：`new`(最新)、`score`(评分)，默认`new` | `new` |
| `creator` | string | 否 | 创建者用户名过滤 | `testuser` |

**响应示例**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "测试军队",
        "townHall": 15,
        "banner": "test-banner",
        "score": 95.5,
        "likes": 10,
        "comments": 5,
        "userBookmarked": false,
        "createdBy": "testuser",
        "createdTime": "2024-08-29T10:00:00.000Z"
      }
    ],
    "total": 100
  }
}
```

**说明**
- 接口返回所有匹配条件的军队数据，不进行服务端分页
- 前端可根据需要自行实现分页逻辑
- 响应中的`total`字段表示匹配条件的军队总数

#### 2. 创建军队
```http
POST /app/api/v1/armies
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**请求参数**
```json
{
  "name": "新军队",
  "townHall": 15,
  "banner": "test-banner",
  "units": [
    {
      "unitId": 1,
      "home": "home",
      "amount": 10
    }
  ],
  "equipment": [
    {
      "equipmentId": 1
    }
  ],
  "pets": [
    {
      "petId": 1,
      "hero": "Archer Queen"
    }
  ],
  "tags": ["attack", "defense"],
  "guide": {
    "textContent": "军队使用说明",
    "youtubeUrl": "https://youtube.com/watch?v=..."
  }
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "军队创建成功",
    "armyId": 123,
    "userId": 1,
    "army": {
      "id": 123,
      "name": "新军队",
      "townHall": 15,
      "banner": "test-banner"
    }
  }
}
```

#### 3. 获取军队详情
```http
GET /app/api/v1/armies/{id}
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "测试军队",
    "townHall": 15,
    "banner": "test-banner",
    "score": 95.5,
    "likes": 10,
    "comments": 5,
    "userBookmarked": false,
    "createdBy": "testuser",
    "createdTime": "2024-08-29T10:00:00.000Z",
    "units": [
      {
        "id": 1,
        "unitId": 1,
        "name": "Barbarian",
        "home": "home",
        "amount": 10,
        "level": 8
      }
    ],
    "equipment": [
      {
        "id": 1,
        "equipmentId": 1,
        "name": "Rage Vial",
        "level": 5
      }
    ],
    "pets": [
      {
        "id": 1,
        "petId": 1,
        "name": "Spirit Fox",
        "hero": "Archer Queen",
        "level": 5
      }
    ],
    "tags": ["attack", "defense"],
    "guide": {
      "id": 1,
      "textContent": "军队使用说明",
      "youtubeUrl": "https://youtube.com/watch?v=..."
    }
  }
}
```

#### 4. 更新军队
```http
PUT /app/api/v1/armies/{id}
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**请求参数**
```json
{
  "name": "更新后的军队名称",
  "townHall": 16,
  "banner": "new-banner",
  "units": [
    {
      "unitId": 1,
      "home": "home",
      "amount": 15
    }
  ],
  "equipment": [],
  "pets": [],
  "tags": ["attack"],
  "guide": null
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "军队更新成功",
    "armyId": 1,
    "userId": 1,
    "army": {
      "id": 1,
      "name": "更新后的军队名称",
      "townHall": 16,
      "banner": "new-banner"
    }
  }
}
```

#### 5. 删除军队
```http
DELETE /app/api/v1/armies/{id}
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "军队删除成功",
    "armyId": 1,
    "userId": 1
  }
}
```

---

### ❤️ 互动功能

#### Vote系统说明
APP的点赞系统支持三种状态：
- **点赞 (vote: 1)**: 用户对军队表示喜欢
- **取消点赞 (vote: 0)**: 用户取消所有点赞状态
- **反向点赞 (vote: -1)**: 用户对军队表示不喜欢

**注意**: 同一用户对同一军队只能有一种vote状态，新的vote会覆盖之前的vote。

#### 1. 点赞军队
```http
POST /app/api/v1/armies/{id}/like
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "点赞成功",
    "armyId": 1,
    "userId": 1,
    "action": "like"
  }
}
```

#### 2. 取消点赞
```http
DELETE /app/api/v1/armies/{id}/like
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "取消点赞成功",
    "armyId": 1,
    "userId": 1,
    "action": "unlike"
  }
}
```

#### 3. 反向点赞
```http
POST /app/api/v1/armies/{id}/dislike
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "反向点赞成功",
    "armyId": 1,
    "userId": 1,
    "action": "dislike"
  }
}
```

#### 4. 取消反向点赞
```http
DELETE /app/api/v1/armies/{id}/dislike
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "取消反向点赞成功",
    "armyId": 1,
    "userId": 1,
    "action": "undislike"
  }
}
```

#### 5. 收藏军队
```http
POST /app/api/v1/armies/{id}/bookmark
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "收藏成功",
    "armyId": 1,
    "userId": 1,
    "action": "bookmark"
  }
}
```

#### 6. 取消收藏
```http
DELETE /app/api/v1/armies/{id}/bookmark
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "取消收藏成功",
    "armyId": 1,
    "userId": 1,
    "action": "unbookmark"
  }
}
```

#### 7. 获取收藏军队列表
```http
GET /app/api/v1/armies/bookmarked?page=1&limit=20&sort=new
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `page` | number | 否 | 页码，默认1 | `1` |
| `limit` | number | 否 | 每页数量，默认20，最大100 | `20` |
| `sort` | string | 否 | 排序方式：`new`(最新)、`score`(评分) | `new` |

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "收藏的军队",
      "townHall": 15,
      "banner": "test-banner",
      "score": 95.5,
      "likes": 10,
      "comments": 5,
      "userBookmarked": true,
      "createdBy": "testuser",
      "createdTime": "2024-08-29T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 💬 评论系统

#### 1. 获取评论列表
```http
GET /app/api/v1/armies/{id}/comments?page=1&limit=20
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**查询参数**
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `page` | number | 否 | 页码，默认1 | `1` |
| `limit` | number | 否 | 每页数量，默认20，最大100 | `20` |

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "comment": "这个军队配置很好！",
      "createdBy": "testuser",
      "createdTime": "2024-08-29T10:00:00.000Z",
      "replyTo": null,
      "replies": [
        {
          "id": 2,
          "comment": "同意，我也觉得不错",
          "createdBy": "user2",
          "createdTime": "2024-08-29T10:30:00.000Z",
          "replyTo": 1
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 2. 发表评论
```http
POST /app/api/v1/armies/{id}/comments
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**请求参数**
```json
{
  "comment": "这是一条评论",
  "replyTo": null
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "评论发表成功",
    "commentId": 123,
    "armyId": 1,
    "userId": 1,
    "comment": "这是一条评论",
    "replyTo": null
  }
}
```

#### 3. 删除评论
```http
DELETE /app/api/v1/armies/{id}/comments?commentId=123
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | number | 军队ID |

**查询参数**
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `commentId` | number | 是 | 评论ID | `123` |

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "评论删除成功",
    "commentId": 123,
    "userId": 1
  }
}
```

---

### 👤 用户偏好设置

#### 1. 获取用户资料
```http
GET /app/api/v1/users/profile
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "获取用户资料成功",
    "user": {
      "id": 1,
      "username": "testuser",
      "playerTag": "#ABC123",
      "roles": ["user"]
    }
  }
}
```

#### 2. 更新用户资料
```http
PUT /app/api/v1/users/profile
```

**请求头**
```http
Authorization: Bearer <access_token>
```

**请求参数**
```json
{
  "username": "newusername"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "message": "用户资料更新成功",
    "user": {
      "id": 1,
      "username": "newusername"
    }
  }
}
```

---

### 🎮 游戏数据

#### 1. 获取单位数据
```http
GET /app/api/v1/game/units
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Barbarian",
      "type": "Troop",
      "maxLevel": 8,
      "unlockLevel": 1,
      "housingSpace": 1,
      "trainingTime": 20,
      "imageUrl": "/static/units/barbarian.webp"
    }
  ]
}
```

#### 2. 获取装备数据
```http
GET /app/api/v1/game/units
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rage Vial",
      "hero": "Archer Queen",
      "maxLevel": 5,
      "unlockLevel": 15,
      "imageUrl": "/static/heroes/equipment/rage-vial.webp"
    }
  ]
}
```

#### 3. 获取宠物数据
```http
GET /app/api/v1/game/pets
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Spirit Fox",
    "hero": "Archer Queen",
    "maxLevel": 5,
    "unlockLevel": 15,
    "imageUrl": "/static/heroes/pets/spirit-fox.webp"
  }
}
```

#### 4. 获取大本营数据
```http
GET /app/api/v1/game/townhalls
```

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "level": 15,
      "troopCapacity": 300,
      "spellCapacity": 11,
      "siegeCapacity": 1,
      "ccTroopCapacity": 8,
      "ccSpellCapacity": 1,
      "imageUrl": "/static/town-halls/15.webp"
    }
  ]
}
```

---

## 🧪 测试指南

### 环境准备
1. **启动开发服务器**: `npm run start`
2. **检查服务状态**: `GET /app/health`
3. **准备测试数据**: 确保数据库中有测试用户和军队数据

### 测试流程
1. **用户认证测试**
   - 测试登录接口
   - 获取Access Token
   - 测试Token有效性

2. **功能接口测试**
   - 使用有效Token测试各功能接口
   - 验证请求参数和响应格式
   - 测试错误处理

3. **权限测试**
   - 测试无Token访问
   - 测试过期Token访问
   - 测试权限不足的情况

### 测试工具
- **Postman**: API测试工具
- **curl**: 命令行测试
- **浏览器开发者工具**: 网络请求分析

### 常见测试命令
```bash
# 健康检查
curl -s "http://localhost:5173/app/health" | jq '.'

# 用户登录
curl -X POST "http://localhost:5173/app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"googleIdToken":"test_token"}' | jq '.'

# 获取军队列表
curl -s "http://localhost:5173/app/api/v1/armies?townHall=15&sort=new" | jq '.'
```

---

## ❓ 常见问题

### Q1: Token过期如何处理？
**A**: 当收到`TOKEN_EXPIRED`错误时，使用Refresh Token调用刷新接口获取新的Token对。

### Q2: 如何实现自动Token刷新？
**A**: 在请求拦截器中检查Token过期时间，提前刷新Token，或在收到过期错误时自动刷新。

### Q3: 军队列表接口如何获取数据？
**A**: 军队列表接口(`GET /app/api/v1/armies`)返回所有匹配条件的军队数据，不进行服务端分页。前端可根据需要自行实现分页逻辑。其他接口（如收藏列表、评论列表）仍支持分页参数。

### Q4: 如何处理网络错误？
**A**: 实现重试机制，对于5xx错误可以重试，对于4xx错误需要检查请求参数。

### Q5: 图片资源如何获取？
**A**: 图片URL在游戏数据接口中提供，可以直接用于显示。

### Q6: 如何实现实时更新？
**A**: 目前接口不支持WebSocket，可以通过轮询或长轮询实现数据更新。

### Q7: 用户信息接口路径说明
**A**: 用户相关信息分为两类：
- **认证相关**: `/app/api/v1/auth/*` - 登录、登出、Token刷新
- **用户数据**: `/app/api/v1/users/*` - 用户资料获取、更新

---

## 📞 技术支持

### 联系方式
- **开发团队**: 后端开发组
- **邮箱**: dev@example.com
- **文档更新**: 本文档会随API更新而更新

### 更新日志
- **v1.0.0** (2024-08-29): 初始版本，包含所有核心功能接口
- **v1.1.0** (计划): 添加WebSocket支持，实现实时更新

### 相关文档
- [APP接口设计文档](./APP接口设计文档.md) - 接口设计思路和架构说明
- [第三阶段进度报告](./APP_PHASE3_PROGRESS.md) - 功能实现进度
- [源码说明文档](./源码说明文档.md) - 项目整体架构说明

---

*最后更新: 2024-08-29*
*版本: v1.0.0*
