// 简化实现，避免类型依赖解析问题
// 导出全部军队 JSON，供外部同步工具使用
export const GET = async (req: any) => {
  const server = req.locals.server;
  const armies = await server.army.getArmies(req);
  return new Response(JSON.stringify(armies), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};



