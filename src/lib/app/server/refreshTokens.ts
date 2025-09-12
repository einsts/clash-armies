import { db } from '$server/db';

interface RefreshState {
  userId: number;
  tokenVersion: number;
  lastJti: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getRefreshState(userId: number): Promise<RefreshState | null> {
  const row = await db.getRow<RefreshState>('user_refresh_tokens', { userId });
  return row ?? null;
}

export async function initRefreshState(userId: number, options?: { initialVersion?: number; jti?: string | null }): Promise<void> {
  const initialVersion = options?.initialVersion ?? 1;
  const jti = options?.jti ?? null;
  await db.transaction(async (tx) => {
    const existing = await tx.getRow<RefreshState>('user_refresh_tokens', { userId });
    if (existing) {
      await tx.query(
        'UPDATE user_refresh_tokens SET tokenVersion = ?, lastJti = ? WHERE userId = ?',
        [initialVersion, jti, userId]
      );
    } else {
      await tx.insertOne('user_refresh_tokens', {
        userId,
        tokenVersion: initialVersion,
        lastJti: jti,
      });
    }
  });
}

export async function bumpVersionIfMatch(userId: number, currentVersion: number, options?: { newJti?: string | null }): Promise<boolean> {
  const newJti = options?.newJti ?? null;
  const result = await db.query<{ affectedRows: number }>(
    'UPDATE user_refresh_tokens SET tokenVersion = tokenVersion + 1, lastJti = ? WHERE userId = ? AND tokenVersion = ?',
    [newJti, userId, currentVersion]
  );

  // @ninjalib/sql 的返回值语义：若不直接提供 affectedRows，可再读一遍验证
  // 这里做一次乐观判断，若无法获取 affectedRows，则兜底复读
  if (Array.isArray(result) && typeof (result as any).affectedRows !== 'number') {
    const row = await getRefreshState(userId);
    return !!row && row.tokenVersion === currentVersion + 1 && row.lastJti === newJti;
  }

  const affected = (result as any).affectedRows ?? 0;
  return affected === 1;
}


