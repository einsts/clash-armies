import { db } from '$server/db';

export async function getUserRoles(userId: number): Promise<string[]> {
  const userRoles = await db.getRows<{ role: string }>('user_roles', { userId });
  return userRoles.map((r) => r.role);
}


