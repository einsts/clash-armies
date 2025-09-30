/**
 * 军队统计接口
 * 用于处理军队相关的统计指标，如浏览次数、点击次数等
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { PAGE_VIEW_METRIC, COPY_LINK_CLICK_METRIC, OPEN_LINK_CLICK_METRIC } from '$shared/utils';

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 200 // 统计接口限制适中
  })(req);

  const data = await req.request.json();
  const dataSchema = z.object({ metric: z.string(), armyId: z.number() });
  const { metric, armyId } = dataSchema.parse(data);
  const invalidMetricErr = new Error('Invalid metric');

  if (metric === PAGE_VIEW_METRIC) {
    await req.locals.server.army.metrics.reportPageView(req, armyId);
  } else if (metric === COPY_LINK_CLICK_METRIC) {
    await req.locals.server.army.metrics.reportCopyLinkClick(req, armyId);
  } else if (metric === OPEN_LINK_CLICK_METRIC) {
    await req.locals.server.army.metrics.reportOpenLinkClick(req, armyId);
  } else {
    throw invalidMetricErr;
  }

  const response = createSuccessResponse({}, '统计指标记录成功');
  setCorsHeaders(response);
  return response;
});
