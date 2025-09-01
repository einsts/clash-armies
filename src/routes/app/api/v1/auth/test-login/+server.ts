/**
 * 测试登录接口 - 仅用于开发测试
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (req: RequestEvent) => {
  try {
    // 仅用于开发测试，生成测试用户token
    const testUser = {
      userId: 1,
      username: 'testuser',
      roles: ['user']
    };
    
    const accessToken = generateAccessToken(testUser);
    const refreshToken = generateRefreshToken(testUser.userId, 1);
    
    const response = createSuccessResponse({
      message: '测试登录成功',
      accessToken,
      refreshToken,
      user: testUser
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    console.error('测试登录错误:', error);
    throw error;
  }
};
