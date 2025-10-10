import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { apple } from '$server/auth/lucia';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export async function GET(req: RequestEvent): Promise<Response> {
    const redirectTo = req.locals.server.getSafeRedirect(req, {
        considerRedirectParam: true,
        considerRefererHeader: true,
    });

    if (req.locals.user) {
        redirect(302, redirectTo);
    }

    const state = JSON.stringify({ r: redirectTo });
	const url = await apple.createAuthorizationURL(state);

    const baseUrl = env.BASE_APP_URL || '';
    let cookieDomain: string | undefined = undefined;
    try {
        const url = new URL(baseUrl);
        cookieDomain = url.hostname || undefined;
    } catch {}

    req.cookies.set('apple_oauth_state', state, {
        path: '/',
        secure: true,
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'none',
        domain: cookieDomain,
    });

    return redirect(302, url.toString());
}


