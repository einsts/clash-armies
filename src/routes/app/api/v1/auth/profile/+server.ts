/**
 * 用户信息接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { UserTransformer } from '$lib/app/transformers';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    // TODO: 从数据库获取完整的用户信息
    const userData = {
      id: user.userId,
      username: user.username,
      roles: user.roles,
      playerTag: null, // 从数据库获取
      level: null // 从数据库获取
    };
    
    // 转换用户数据
    const transformer = new UserTransformer();
    const appUser = transformer.toAppFormat(userData as any);
    
    const response = createSuccessResponse(appUser);
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});

export const PUT = createApiEndpoint(async (req: RequestEvent) => {
  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    const body = await req.request.json();
    
    // TODO: 验证和更新用户信息
    // 这里应该调用现有的UserAPI来更新用户信息
    
    const response = createSuccessResponse({
      message: '用户信息更新成功'
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
