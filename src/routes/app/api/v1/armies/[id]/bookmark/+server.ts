/**
 * 军队收藏接口
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { endpoint } from '$server/utils';
import z from 'zod';

export const POST: RequestHandler = endpoint(async (req) => {
	const server = req.locals.server;
	
	// 验证用户身份
	const user = req.locals.requireAuth();
	
	const armyId = parseInt(req.params.id!);
	
	if (isNaN(armyId)) {
		throw new Error('Invalid army ID');
	}
	
	await server.army.bookmark(req, armyId);
	
	return json({}, { status: 200 });
});

export const DELETE: RequestHandler = endpoint(async (req) => {
	const server = req.locals.server;
	
	// 验证用户身份
	const user = req.locals.requireAuth();
	
	const armyId = parseInt(req.params.id!);
	
	if (isNaN(armyId)) {
		throw new Error('Invalid army ID');
	}
	
	await server.army.removeBookmark(req, armyId);
	
	return json({}, { status: 200 });
});
