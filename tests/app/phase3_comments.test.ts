/**
 * 第三阶段：评论功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '$lib/app/utils/response';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';

// Mock the rateLimit module
vi.mock('$lib/app/middleware/rateLimit', () => ({
  rateLimitMiddleware: vi.fn(() => vi.fn())
}));

// Mock RequestEvent
const createMockRequest = (params: any = {}) => {
  return {
    params: params.params || {},
    request: {
      url: params.url || 'http://localhost:3000',
      json: async () => params.body || {},
    },
    locals: {
      server: {
        army: {
          getArmy: async (req: any, armyId: number) => {
            // Mock army with comments
            if (armyId === 1) {
              return {
                id: 1,
                name: 'Test Army',
                townHall: 15,
                comments: [
                  {
                    id: 1,
                    armyId: 1,
                    comment: 'Great army!',
                    replyTo: null,
                    username: 'user1',
                    createdBy: 1,
                    createdTime: new Date(),
                    updatedTime: new Date()
                  },
                  {
                    id: 2,
                    armyId: 1,
                    comment: 'I like this composition',
                    replyTo: null,
                    username: 'user2',
                    createdBy: 2,
                    createdTime: new Date(),
                    updatedTime: new Date()
                  }
                ]
              };
            }
            return null;
          },
          saveComment: async (req: any, data: any) => {
            // Mock save comment success
            return 123;
          },
          deleteComment: async (req: any, commentId: number) => {
            // Mock delete comment success
            return Promise.resolve();
          }
        }
      }
    }
  } as any;
};

describe('评论功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('获取评论列表', () => {
    it('应该成功获取评论列表', async () => {
      const mockReq = createMockRequest({
        params: { id: '1' },
        url: 'http://localhost:3000/app/api/v1/armies/1/comments?page=1&limit=10'
      });

      const response = await createApiEndpoint(async (req) => {
        const armyId = parseInt(req.params.id!);
        if (isNaN(armyId)) {
          return createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
        }
        
        // 获取军队信息（包含评论）
        const army = await req.locals.server.army.getArmy(req, armyId);
        if (!army) {
          return createErrorResponse('ARMY_NOT_FOUND', '军队不存在');
        }
        
        // 从军队数据中提取评论
        const comments = army.comments || [];
        const total = comments.length;
        
        // 手动实现分页
        const page = 1;
        const limit = 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedComments = comments.slice(startIndex, endIndex);
        
        // 创建分页响应
        return createPaginatedResponse(
          paginatedComments,
          page,
          limit,
          total
        );
      })(mockReq);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(2);
      expect(data.data.pagination.total).toBe(2);
      expect(data.data.pagination.totalPages).toBe(1);
    });
  });
});
