/**
 * APP限流中间件
 */

import type { RequestEvent } from '@sveltejs/kit';
import { createErrorResponse } from '../utils/response';

// 简单的内存存储（生产环境建议使用Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;    // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  keyGenerator?: (req: RequestEvent) => string; // 键生成器
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 100,          // 100次请求
  keyGenerator: (req: RequestEvent) => {
    // 默认基于IP地址
    return req.getClientAddress();
  }
};

/**
 * 限流中间件
 */
export function rateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return function(req: RequestEvent): void {
    // 获取请求路径，用于区分不同接口
    const path = req.url.pathname;
    
    // 生成唯一的键：IP + 路径
    const baseKey = finalConfig.keyGenerator!(req);
    const key = `${baseKey}:${path}`;
    
    const now = Date.now();
    
    // 获取当前记录
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      // 创建新记录
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + finalConfig.windowMs
      });
      return;
    }
    
    // 检查是否超过限制
    if (record.count >= finalConfig.maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    // 增加计数
    record.count++;
  };
}

/**
 * 用户限流中间件
 */
export function userRateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  const userConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50,            // 50次请求
    keyGenerator: (req: RequestEvent) => {
      // 基于用户ID的限流
      const authHeader = req.request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // 这里应该解析JWT获取用户ID，简化处理
        return `user:${req.getClientAddress()}`;
      }
      return req.getClientAddress();
    },
    ...config
  };
  
  return rateLimitMiddleware(userConfig);
}

/**
 * 清理过期的限流记录
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// 定期清理（每小时）
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
