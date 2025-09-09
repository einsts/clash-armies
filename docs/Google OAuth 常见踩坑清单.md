# 🛠 Google OAuth 常见踩坑清单

## 1. redirect_uri 不匹配
- 必须和 **Google Cloud Console → Credentials → OAuth Client ID → Authorized redirect URIs** 里配置的 **一模一样**。
- 注意点：
  - ✅ 协议必须相同（`https://` vs `http://`）。
  - ✅ 域名必须完全一致（`example.com` ≠ `www.example.com`）。
  - ✅ 路径必须一致（`/callback` ≠ `/callback/`）。
  - ✅ 大小写敏感。

🔴 常见错误：少了 `https://`，结尾多/少一个斜杠。

---

## 2. redirect_uri 用错地方
- **Authorized redirect URIs** 配置的是 **回调地址**（例如 `/api/login/google/callback`）。
- **Authorized JavaScript origins** 配置的是 **前端站点域名**（例如 `https://example.com`）。
- 很多人把主页地址写到 `redirect_uri`，结果报错。

---

## 3. 本地开发环境
- 本地调试时需要在 GCP 里额外配置：
http://localhost:3000

http://127.0.0.1:3000
- 如果你用的是 Postman 测试，需要加：
https://oauth.pstmn.io/v1/callback

---

## 4. 环境/代理问题
- 如果你前面有 Nginx/Cloudflare/CDN，可能会导致请求时协议/域名被改写。
- 要确保最终发给 Google 的 redirect_uri 是正确的。

---

## 5. 参数问题
构造 Google 授权链接时，常见必填参数：

https://accounts.google.com/o/oauth2/v2/auth
?
client_id=YOUR_CLIENT_ID
&redirect_uri=https://yourdomain.com/api/login/google/callback

&response_type=code
&scope=openid%20email%20profile
&access_type=offline

- `client_id` 必须和你创建的应用一致。
- `redirect_uri` 必须精确匹配。
- `scope` 至少要有 `openid email profile`，否则拿不到基本用户信息。

---

## 6. 常见错误提示
- **Error 400: invalid_request** → redirect_uri 配置问题。
- **Error 401: invalid_client** → client_id 或 client_secret 错误。
- **Error 403: disallowed_useragent** → 在不允许的 WebView 内发起登录（常见于移动端 APP 内置浏览器）。
- **Error 500: server_error** → Google 服务临时问题或请求参数格式错误。

---

✅ **建议**  
每次遇到问题时，对照 **授权链接中的 redirect_uri** 和 **GCP 配置的 URI**，一行一行比对，就能快速找到问题。
