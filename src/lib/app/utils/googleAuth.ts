/**
 * Google ID Token验证工具
 * 用于验证APP端传来的Google ID Token
 */

import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private';
import type { GoogleIdTokenPayload } from '../types/auth';

const GOOGLE_CLIENT_ID = env.GOOGLE_AUTH_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_AUTH_CLIENT_ID environment variable is required');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * 验证Google ID Token
 * @param idToken Google ID Token
 * @returns 验证后的用户信息
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    // 验证必要字段
    if (!payload.sub || !payload.email) {
      throw new Error('Missing required fields in token payload');
    }

    // 验证邮箱是否已验证
    if (payload.email_verified !== true && payload.email_verified !== 'true') {
      throw new Error('Email not verified');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name || '',
      picture: payload.picture || '',
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      locale: payload.locale || '',
      iat: payload.iat || 0,
      exp: payload.exp || 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Google ID Token verification failed: ${error.message}`);
    }
    throw new Error('Google ID Token verification failed');
  }
}

/**
 * 从Google ID Token中提取用户信息
 * @param payload Google ID Token payload
 * @returns 标准化的用户信息
 */
export function extractUserInfoFromToken(payload: GoogleIdTokenPayload) {
  return {
    googleId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
    givenName: payload.given_name,
    familyName: payload.family_name,
    locale: payload.locale,
  };
}
