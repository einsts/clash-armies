/**
 * APP常量定义
 */

// API版本
export const API_VERSION = 'v1';

// 分页默认值
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// 缓存配置
export const CACHE_CONFIG = {
  GAME_DATA: { ttl: 24 * 60 * 60 },      // 游戏数据24小时
  POPULAR_ARMIES: { ttl: 60 * 60 },      // 热门军队1小时
  USER_SESSIONS: { ttl: 7 * 24 * 60 * 60 }, // 用户会话7天
  ARMY_DETAILS: { ttl: 30 * 60 }         // 军队详情30分钟
};

// 限流配置
export const RATE_LIMIT_CONFIG = {
  GLOBAL: { windowMs: 15 * 60 * 1000, maxRequests: 1000 },    // 全局限流
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 10 },        // 认证接口限流
  USER: { windowMs: 15 * 60 * 1000, maxRequests: 100 },       // 用户接口限流
  ARMY: { windowMs: 15 * 60 * 1000, maxRequests: 200 }        // 军队接口限流
};

// 错误代码
export const ERROR_CODES = {
  // 通用错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // 业务错误
  ARMY_NOT_FOUND: 'ARMY_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  ALREADY_LIKED: 'ALREADY_LIKED',
  ALREADY_BOOKMARKED: 'ALREADY_BOOKMARKED'
};

// 排序选项
export const SORT_OPTIONS = {
  NEW: 'new',
  SCORE: 'score',
  POPULAR: 'popular',
  VIEWS: 'views',
  LIKES: 'likes',
  COMMENTS: 'comments'
} as const;

// 军队标签
export const ARMY_TAGS = [
  'CWL/War',
  'Legends League', 
  'Farming',
  'Beginner Friendly',
  'Spam'
] as const;
