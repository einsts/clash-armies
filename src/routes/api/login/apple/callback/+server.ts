import type { RequestEvent } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import type { User } from '$types';
import { apple, lucia } from '$server/auth/lucia';
import { db } from '$server/db';
import { log } from '$server/auth/utils';

export const config = {
    csrf: {
        checkOrigin: false
    }
};

type AppleUser = {
    sub: string;
    email?: string;
};

function isObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

export async function GET(req: RequestEvent): Promise<Response> {
    const code = req.url.searchParams.get('code');
    const state = req.url.searchParams.get('state');

    const storedState = req.cookies.get('apple_oauth_state') ?? null;

    if (!code || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400,
        });
    }

    let parsedState: unknown;
    let redirect: string | null = null;

    try {
        parsedState = JSON.parse(state);
    } catch (err) {
        // pass
    }

    if (isObject(parsedState) && parsedState.r && typeof parsedState.r === 'string') {
        redirect = parsedState.r;
    }

    try {
		const tokens = await apple.validateAuthorizationCode(code);
		// Apple's idToken is a JWT containing user info; Apple only returns email on first auth
		const idToken = tokens.idToken;
		const payloadPart = idToken.split('.')[1] ?? '';
		const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
		const payloadJson = Buffer.from(padded, 'base64').toString('utf-8');
		const payload = JSON.parse(payloadJson) as AppleUser;

        const appleId = payload.sub;
        const appleEmail = payload.email;

        const existingUser = await db.getRow<User>('users', { appleId });
        if (existingUser) {
            if (appleEmail) {
                await db.transaction(async (tx) => {
                    await tx.query(
                        `
                        UPDATE users
                        SET appleEmail = ?
                        WHERE id = ?
                    `,
                        [appleEmail, existingUser.id]
                    );
                });
            }
            const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			req.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes,
			});
            return new Response(null, {
                status: 302,
                headers: {
                    Location: redirect || `/users/${existingUser.username}`,
                },
            });
        } else {
            const maxId = (await db.query<{ maxId: number }>('SELECT MAX(id) AS maxId FROM users'))[0].maxId;
            const username = `Warrior-${maxId + 1}`;

            let userId: number | null = null;
            await db.transaction(async (tx) => {
                userId = await tx.insertOne('users', {
                    username,
                    googleId: null,
                    googleEmail: null,
                    appleId,
                    appleEmail: appleEmail ?? null,
                });
                await tx.insertOne('user_roles', { userId, role: 'user' });
            });
            if (!userId) {
                throw new Error('Expected user id');
            }

            const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			req.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes,
			});
            return new Response(null, {
                status: 302,
                headers: {
                    Location: redirect || `/users/${username}`,
                },
            });
        }
    } catch (err) {
        log.error('Failed authentication (apple):', {
            requestId: req.locals.uuid,
            error: err,
        });

        if (err instanceof OAuth2RequestError) {
            return new Response(null, {
                status: 400,
            });
        }
        return new Response(null, {
            status: 500,
        });
    }
}

export async function POST(req: RequestEvent): Promise<Response> {
    // Apple with response_mode=form_post posts code/state in body
    const formData = await req.request.formData();
    const code = String(formData.get('code') ?? '');
    const state = String(formData.get('state') ?? '');

    const storedState = req.cookies.get('apple_oauth_state') ?? null;

    if (!code || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400,
        });
    }

    // Reuse the same logic as GET by reconstructing URL params
    const url = new URL(req.url);
    url.searchParams.set('code', code);
    url.searchParams.set('state', state);
    const getReq = { ...req, url } as RequestEvent;
    return GET(getReq);
}


