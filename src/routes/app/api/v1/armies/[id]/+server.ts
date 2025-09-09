/**
 * 军队详情接口
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { endpoint } from '$server/utils';

export const GET: RequestHandler = endpoint(async (req) => {
	const server = req.locals.server;
	const armyId = parseInt(req.params.id!);
	
	if (isNaN(armyId)) {
		throw new Error('Invalid army ID');
	}
	
	const army = await server.army.getArmy(req, armyId);
	
	if (!army) {
		throw new Error('Army not found');
	}
	
	return json(army, { status: 200 });
});

export const PUT: RequestHandler = endpoint(async (req) => {
	const server = req.locals.server;
	
	// 验证用户身份
	const user = req.locals.requireAuth();
	
	const armyId = parseInt(req.params.id!);
	
	if (isNaN(armyId)) {
		throw new Error('Invalid army ID');
	}
	
	const body = await req.request.json();
	
	// 准备军队数据（包含ID用于更新）
	const armyData = {
		id: armyId,
		name: body.name,
		townHall: body.townHall,
		banner: body.banner,
		units: body.units || [],
		equipment: body.equipment || [],
		pets: body.pets || [],
		tags: body.tags || [],
		guide: body.guide
	};
	
	// 使用现有的军队系统更新军队
	await server.army.saveArmy(req, armyData);
	
	return json(armyId, { status: 200 });
});

export const DELETE: RequestHandler = endpoint(async (req) => {
	const server = req.locals.server;
	
	// 验证用户身份
	const user = req.locals.requireAuth();
	
	const armyId = parseInt(req.params.id!);
	
	if (isNaN(armyId)) {
		throw new Error('Invalid army ID');
	}
	
	// 使用现有的军队系统删除军队
	await server.army.deleteArmy(req, armyId);
	
	return json({}, { status: 200 });
});
