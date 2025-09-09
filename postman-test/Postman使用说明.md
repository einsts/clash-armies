# Postman API 测试使用说明

## 文件说明

- `postman_collection.json` - Postman 集合文件，包含所有 API 接口
- `postman_environment.json` - Postman 环境配置文件，包含变量设置

## 导入步骤

### 1. 导入集合
1. 打开 Postman
2. 点击 "Import" 按钮
3. 选择 `postman_collection.json` 文件
4. 点击 "Import" 完成导入

### 2. 导入环境
1. 在 Postman 中点击右上角的齿轮图标
2. 选择 "Import"
3. 选择 `postman_environment.json` 文件
4. 点击 "Import" 完成导入
5. 在环境下拉菜单中选择 "Clash Armies APP Environment"

## 配置说明

### 环境变量
- `baseUrl`: API 基础 URL，默认为 `https://your-domain.com/app/api/v1`
- `accessToken`: 访问令牌，登录后自动设置
- `refreshToken`: 刷新令牌，登录后自动设置
- `armyId`: 军队 ID，创建军队后自动设置
- `commentId`: 评论 ID，发表评论后自动设置
- `userId`: 用户 ID，登录后自动设置
- `googleIdToken`: Google ID Token，需要手动设置

### 自动功能
集合配置了以下自动功能：

1. **自动设置认证头**: 所有需要认证的请求会自动添加 `Authorization: Bearer <accessToken>` 头
2. **自动保存 Token**: 登录成功后自动保存 `accessToken` 和 `refreshToken`
3. **自动保存 ID**: 创建军队或评论后自动保存相应的 ID

## 测试流程

### 1. 基础配置
1. 修改 `baseUrl` 变量为你的实际 API 地址
2. 获取 Google ID Token 并设置到 `googleIdToken` 变量

### 2. 认证测试
1. 执行 "认证相关 > 用户登录" 请求
2. 检查响应中的 `accessToken` 和 `refreshToken`
3. 这些值会自动保存到环境变量中

### 3. 军队功能测试
1. 执行 "军队相关 > 创建军队" 请求
2. 执行 "军队相关 > 获取军队列表" 请求
3. 执行 "军队相关 > 获取军队详情" 请求
4. 执行 "军队相关 > 收藏军队" 请求
5. 执行 "军队相关 > 军队投票" 请求
6. 执行 "军队相关 > 发表评论" 请求

### 4. 身份验证测试
1. 执行 "军队相关 > 军队投票（无Token测试）" 请求
2. 应该返回 401 未授权错误
3. 如果返回 200 成功，说明身份验证有问题

**重要**：
- 集合级别的认证设置已移除，避免影响无Token测试
- 预请求脚本已修改，会跳过名称包含"无Token测试"的请求
- 无Token测试请求设置为 `noauth` 类型，确保不发送Authorization头
- 可以在Postman Console中查看认证头的添加/跳过日志

### 5. 用户功能测试
1. 执行 "用户相关 > 获取用户资料" 请求
2. 执行 "用户相关 > 更新用户资料" 请求

### 6. 游戏数据测试
1. 执行 "游戏数据 > 获取单位数据" 请求
2. 执行 "游戏数据 > 获取装备数据" 请求
3. 执行 "游戏数据 > 获取宠物数据" 请求
4. 执行 "游戏数据 > 获取大本营数据" 请求

## 注意事项

1. **Google ID Token**: 需要从 Google OAuth 流程中获取有效的 ID Token
2. **Token 过期**: Access Token 有效期为 15 分钟，过期后需要使用 Refresh Token 刷新
3. **限流**: 某些接口有请求频率限制，请参考 API 文档中的限流规则
4. **错误处理**: 所有接口都返回统一的错误格式，请检查响应中的错误信息

## 常见问题

### Q: 如何获取 Google ID Token？
A: 需要通过 Google OAuth 2.0 流程获取，具体步骤请参考 Google 开发者文档。

### Q: Token 过期了怎么办？
A: 执行 "认证相关 > 刷新Token" 请求，使用 Refresh Token 获取新的 Access Token。

### Q: 如何测试需要认证的接口？
A: 先执行登录接口，系统会自动保存 Token 并添加到后续请求的认证头中。

### Q: 如何修改请求参数？
A: 在 Postman 中打开对应的请求，修改 Body 或 Query Parameters 中的值。

### Q: Token 没有自动保存怎么办？
A: 请按以下步骤排查：
1. 确保选择了正确的环境（右上角环境选择器）
2. 打开 Postman Console（View > Show Postman Console）
3. 执行登录请求，查看控制台是否有 "Token saved" 日志
4. 检查登录响应格式是否包含 `data.accessToken` 字段
5. 如果仍然不工作，可以手动在环境变量中设置 `accessToken`

### Q: 如何手动设置环境变量？
A: 
1. 点击右上角的齿轮图标
2. 选择 "Manage Environments"
3. 选择 "Clash Armies APP Environment"
4. 在变量列表中找到 `accessToken`
5. 在 "Current Value" 列中输入你的 Token 值
6. 点击 "Save" 保存

### Q: 登出后Token没有清除怎么办？
A: 登出接口现在会自动清除环境变量中的Token。如果自动清除失败，可以手动清空环境变量中的 `accessToken`、`refreshToken` 和 `userId` 字段。

### Q: 无Token测试仍然返回200怎么办？
A: 请检查：
1. 确保使用的是更新后的Postman集合
2. 无Token测试请求已设置为 `noauth` 类型
3. 服务器端的身份验证逻辑是否正常工作
4. 查看Postman Console中的错误日志

## 更新日志

- v1.0.0: 初始版本，包含所有基础 API 接口
