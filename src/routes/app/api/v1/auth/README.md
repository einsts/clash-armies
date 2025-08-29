# 🔐 APP认证接口说明

## 📋 接口概述

APP端认证系统已重构为Google ID Token直接验证，移除了所有旧的OAuth流程和无关功能。

## 🚀 登录流程

```
APP客户端 → Google SDK登录 → 获取ID Token → 调用登录接口 → 验证Token → 返回JWT
```

## 🔌 接口列表

### 1. 用户登录
```
POST /app/api/v1/auth/login
```

**功能**: 使用Google ID Token进行用户登录或注册

**请求参数**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "message": "登录成功",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "username": "Warrior-123",
      "roles": ["user"],
      "googleId": "123456789",
      "googleEmail": "user@gmail.com",
      "name": "User Name",
      "picture": "https://..."
    },
    "sessionId": "session_123",
    "expiresIn": {
      "accessToken": 900,
      "refreshToken": 604800
    }
  }
}
```

### 2. Token刷新
```
POST /app/api/v1/auth/refresh
```

**功能**: 使用Refresh Token获取新的Access Token

**请求参数**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 用户登出
```
POST /app/api/v1/auth/logout
```

**功能**: 用户登出，撤销Token

**请求参数**:
```json
{
  "deviceId": "device_123"  // 可选，撤销特定设备
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "message": "登出成功"
  }
}
```

## 📱 客户端集成

### Flutter示例
```dart
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

  Future<AuthResult> signInWithGoogle() async {
    try {
      // 1. 获取Google账户
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) throw Exception('用户取消登录');
      
      // 2. 获取ID Token
      final GoogleSignInAuthentication auth = await account.authentication;
      final String? idToken = auth.idToken;
      if (idToken == null) throw Exception('无法获取ID Token');
      
      // 3. 调用登录接口
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/app/api/v1/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      );
      
      // 4. 处理响应
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return AuthResult.success(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
          user: User.fromJson(data['user']),
        );
      } else {
        throw Exception('登录失败: ${response.body}');
      }
    } catch (e) {
      return AuthResult.failure(e.toString());
    }
  }
}
```

## 🔒 安全特性

### 1. **ID Token验证**
- 使用Google官方库验证Token签名
- 验证Token过期时间和受众
- 确保邮箱已验证

### 2. **限流保护**
- 登录接口：15分钟内最多10次请求
- 刷新接口：15分钟内最多10次请求
- 登出接口：无限制

### 3. **JWT Token管理**
- Access Token：15分钟有效期
- Refresh Token：7天有效期
- 支持Token刷新和撤销

## 📊 已移除的功能

以下功能已被移除，不再支持：

- ❌ Google OAuth重定向流程
- ❌ 用户注册接口（Google OAuth自动创建）
- ❌ 登录状态检查接口
- ❌ 用户信息管理接口

## 🚀 优势

1. **更快的登录速度**: 从3-4次网络请求减少到1次
2. **更好的用户体验**: 原生登录体验，无需重定向
3. **更简单的实现**: 客户端集成更简单
4. **更高的安全性**: 使用Google官方验证库

## 🆘 技术支持

如遇到问题，请：
1. 检查环境变量配置 (`GOOGLE_AUTH_CLIENT_ID`)
2. 验证Google Cloud Console设置
3. 查看服务器日志
4. 提交GitHub Issue

---

*最后更新: 2024-08-29*
*版本: v2.0 (重构版本)*
*状态: ✅ 核心功能完成，已清理旧代码*
