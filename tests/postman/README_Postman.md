# Postman 测试配置使用说明

## 文件说明

- `postman_collection.json` - 主要测试集合文件
- `postman_environment.json` - 开发环境配置
- `postman_production_env.json` - 生产环境配置

## 导入步骤

1. 打开 Postman > Import > 选择 `postman_collection.json`
2. Import 环境：`postman_environment.json` 或 `postman_production_env.json`
3. 右上角选择对应环境后，开始按集合顺序运行

## 环境变量

- `baseUrl`: 开发 `http://localhost:5173`，生产 `https://your-domain.com`
- `apiVersion`: `v1`
- `accessToken`/`refreshToken`: 登录后自动保存
- `armyId`/`commentId`: 测试用接口调用后自动保存

## 建议测试顺序

1. 认证相关：登录 → 刷新 → 登出
2. 军队管理：创建 → 列表 → 详情 → 更新 → 删除
3. 互动功能：点赞/取消点赞/反向点赞/收藏/收藏列表
4. 评论系统：发表评论 → 获取评论列表 → 删除评论
5. 用户偏好设置：获取用户资料 → 更新用户资料
6. 游戏数据：单位、装备、宠物、大本营

## 注意

- 先运行“登录”，否则需要鉴权的请求会失败
- 如需手动设置 Token，可在环境中编辑 `accessToken` 与 `refreshToken`
- 若接口路径或返回结构调整，请同步更新集合
