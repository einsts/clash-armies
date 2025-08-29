# APP模块说明

## 概述

APP模块提供了与Web端完全一致的Google OAuth认证和用户管理功能，确保数据一致性和业务逻辑统一。

## 核心特性

### 🔐 **与Web端完全一致的认证**
- **Google OAuth流程**: 与Web端使用完全相同的OAuth流程
- **用户管理逻辑**: 与Web端使用完全相同的数据库操作和业务逻辑
- **数据一致性**: 确保APP端和Web端用户数据完全同步

### 🚀 **简化的APP接口**
- **JWT Token认证**: APP端使用JWT Token，Web端使用Cookie+Lucia会话
- **统一的业务逻辑**: 底层Google OAuth和用户管理完全一致
- **智能状态检测**: 避免重复的WebView重定向

## 认证流程

### Google OAuth登录流程

#### 1. **登录引导**: `POST /app/api/v1/auth/login`
- 检查用户是否已登录（通过JWT Token）
- 如果已登录，返回用户信息
- 如果未登录，引导使用Google OAuth

#### 2. **初始化OAuth**: `POST /app/api/v1/auth/google`
- 与Web端完全一致的OAuth状态管理
- 使用相同的Cookie名和配置
- 返回Google授权URL

#### 3. **用户授权**: APP端重定向到Google授权页面
- 用户完成Google登录
- Google重定向回APP回调URL

#### 4. **处理回调**: `POST /app/api/v1/auth/google/callback`
- 与Web端完全一致的授权码验证
- 与Web端完全一致的用户查找/创建逻辑
- 与Web端完全一致的数据库操作
- 返回JWT Token对（APP端特有）

### 登录状态检查

#### **快速状态检查**: `GET /app/api/v1/auth/status`
- 检查JWT Token有效性
- 返回用户登录状态和基本信息

#### **状态刷新**: `POST /app/api/v1/auth/status`
- 支持 `action: 'refresh_status'` 参数
- 重新验证Token并更新状态

## 与Web端的一致性

### ✅ **完全一致的部分**
- Google OAuth核心流程
- 用户查找和创建逻辑
- 数据库操作和事务
- 错误处理和验证
- Cookie管理和状态存储

### 🔄 **差异化的部分**
- **认证机制**: Web端使用Cookie+Lucia会话，APP端使用JWT Token
- **响应格式**: APP端返回JSON格式，Web端重定向到页面
- **状态管理**: APP端简化了状态管理，移除了设备相关逻辑

### 🗄️ **数据库一致性**
- 使用完全相同的数据库表结构
- 使用完全相同的SQL查询
- 使用完全相同的业务逻辑
- 确保用户数据完全同步

## API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/app/api/v1/auth/login` | POST | 登录引导和状态检查 |
| `/app/api/v1/auth/google` | POST | Google OAuth初始化 |
| `/app/api/v1/auth/google/callback` | POST | Google OAuth回调处理 |
| `/app/api/v1/auth/status` | GET/POST | 登录状态检查 |
| `/app/api/v1/auth/register` | POST | 注册引导（已移除） |

## 技术实现

### 中间件
- **错误处理**: 统一的错误响应格式
- **限流**: 防止API滥用
- **CORS**: 支持跨域请求
- **JWT认证**: APP端特有的Token验证

### 数据转换
- **响应格式化**: 统一的成功/错误响应格式
- **类型安全**: 完整的TypeScript类型定义

## 优势

### 🎯 **业务一致性**
- 与Web端完全相同的用户管理逻辑
- 确保数据一致性和完整性
- 统一的业务规则和验证

### 🚀 **开发效率**
- 复用Web端的核心逻辑
- 减少重复代码和维护成本
- 统一的测试和部署流程

### 🔒 **安全性**
- 与Web端相同的安全验证
- 统一的权限控制
- 一致的错误处理

## 注意事项

1. **不要修改Web端代码**: 所有更改都在APP端进行
2. **保持数据库一致性**: 确保APP端和Web端使用相同的数据库操作
3. **测试覆盖**: 确保APP端功能与Web端行为一致
4. **错误处理**: 保持与Web端相同的错误处理逻辑

## 未来改进

- [ ] 从数据库获取用户实际角色信息
- [ ] 从数据库获取用户最后登录时间
- [ ] 完善用户信息的数据库查询
- [ ] 添加更多的状态检查功能
