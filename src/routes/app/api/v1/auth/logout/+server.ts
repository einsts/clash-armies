/**
 * 用户登出接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 登出请求验证schema
const logoutSchema = z.object({
  deviceId: z.string().optional() // 可选的设备ID，用于撤销特定设备
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    const body = await req.request.json();
    const validatedData = logoutSchema.parse(body);
    
    if (validatedData.deviceId) {
      // 撤销特定设备
      // TODO: 从数据库中撤销指定设备的Refresh Token
      console.log(`Revoking device: ${validatedData.deviceId} for user: ${user.userId}`);
    } else {
      // 撤销所有设备（除了当前设备）
      // TODO: 从数据库中撤销用户的所有其他设备
      console.log(`Revoking all other devices for user: ${user.userId}`);
    }
    
    // TODO: 将Refresh Token加入黑名单
    
    const response = createSuccessResponse({
      message: '登出成功'
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createAuthErrorResponse(
        'VALIDATION_ERROR',
        '登出数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
