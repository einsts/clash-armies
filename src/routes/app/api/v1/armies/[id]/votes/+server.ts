/**
 * 军队投票接口
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { endpoint } from '$server/utils';
import z from 'zod';

export const POST: RequestHandler = endpoint(async (req) => {
	const server = req.locals.server;
	
	// 验证用户身份
	const user = req.locals.requireAuth();
	
	const data = await req.request.json();
	const dataSchema = z.object({ armyId: z.number(), vote: z.number() });

	const voteOptions = dataSchema.parse(data);
	await server.army.saveVote(req, voteOptions);

	return json({}, { status: 200 });
});
