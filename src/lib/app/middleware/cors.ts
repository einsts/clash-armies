/**
 * APP CORS中间件
 */

import type { RequestEvent } from '@sveltejs/kit';

interface CorsConfig {
  origin: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  origin: true, // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24小时
};

/**
 * CORS中间件
 */
export function corsMiddleware(config: Partial<CorsConfig> = {}) {
  const finalConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  
  return function(req: RequestEvent): void {
    const response = new Response();
    
      // 处理预检请求
  if (req.request.method === 'OPTIONS') {
    // 注意：这里不能直接设置status，因为Response对象是只读的
    // 在实际使用中，我们需要在创建Response时设置正确的状态码
  }
    
    // 设置CORS头
    const origin = req.request.headers.get('Origin');
    if (origin && shouldAllowOrigin(origin, finalConfig.origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    if (finalConfig.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    if (finalConfig.methods) {
      response.headers.set('Access-Control-Allow-Methods', finalConfig.methods.join(', '));
    }
    
    if (finalConfig.allowedHeaders) {
      response.headers.set('Access-Control-Allow-Headers', finalConfig.allowedHeaders.join(', '));
    }
    
    if (finalConfig.maxAge) {
      response.headers.set('Access-Control-Max-Age', finalConfig.maxAge.toString());
    }
  };
}

/**
 * 检查是否允许来源
 */
function shouldAllowOrigin(origin: string, allowedOrigins: string | string[] | boolean): boolean {
  if (allowedOrigins === true) {
    return true;
  }
  
  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }
  
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin);
  }
  
  return false;
}

/**
 * 设置CORS头到响应
 */
export function setCorsHeaders(response: Response, config: Partial<CorsConfig> = {}): void {
  const finalConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  
  const origin = response.headers.get('Origin');
  if (origin && shouldAllowOrigin(origin, finalConfig.origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  if (finalConfig.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (finalConfig.methods) {
    response.headers.set('Access-Control-Allow-Methods', finalConfig.methods.join(', '));
  }
  
  if (finalConfig.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', finalConfig.allowedHeaders.join(', '));
  }
  
  if (finalConfig.maxAge) {
    response.headers.set('Access-Control-Max-Age', finalConfig.maxAge.toString());
  }
}
