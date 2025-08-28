/**
 * 用户数据转换器
 */

import { BaseTransformer } from './BaseTransformer';
import type { User } from '$types';
import type { AppUser } from '../types/user';

export class UserTransformer extends BaseTransformer<User, AppUser> {
  toAppFormat(user: User): AppUser {
    return {
      id: user.id,
      username: user.username,
      playerTag: user.playerTag || undefined,
      level: user.level || undefined,
      roles: user.roles,
      createdAt: this.formatDate(new Date()) // 使用当前时间，因为User类型中没有createdTime
    };
  }
}
