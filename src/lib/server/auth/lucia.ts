import { Lucia } from 'lucia';
import { Google, Apple } from 'arctic';
import { db } from '$server/db';
import { sqlAdapter } from './adapter';
import { dev, building } from '$app/environment';
import { env } from '$env/dynamic/private';
// Buffer no longer needed; APPLE_PRIVATE_KEY is provided as plain text (PEM or single-line body)

const { GOOGLE_AUTH_CLIENT_ID, GOOGLE_AUTH_SECRET, BASE_APP_URL, APPLE_SERVICE_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } = env;

if (typeof GOOGLE_AUTH_CLIENT_ID !== 'string') {
	throw new Error('Expected google auth client id to be defined');
}   
if (typeof GOOGLE_AUTH_SECRET !== 'string') {
	throw new Error('Expected google auth secret to be defined');
}
if (!building && !dev && typeof BASE_APP_URL !== 'string') {
	throw new Error('Expected base app url to be defined in production');
}
if (typeof APPLE_SERVICE_ID !== 'string') {
    throw new Error('Expected apple service id to be defined');
}
if (typeof APPLE_TEAM_ID !== 'string') {
    throw new Error('Expected apple team id to be defined');
}
if (typeof APPLE_KEY_ID !== 'string') {
    throw new Error('Expected apple key id to be defined');
}
if (typeof APPLE_PRIVATE_KEY !== 'string') {
    throw new Error('Expected apple private key to be defined');
}

const adapter = new sqlAdapter(db);

function normalizePkcs8Body(singleLineBody: string): string {
    const begin = '-----BEGIN PRIVATE KEY-----';
    const end = '-----END PRIVATE KEY-----';
    const cleaned = singleLineBody.replace(/\r|\n|\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    const base64 = cleaned + '='.repeat((4 - (cleaned.length % 4)) % 4);
    return `${begin}\n${base64}\n${end}\n`;
}

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev,
		},
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			playerTag: attributes.playerTag,
			roles: attributes.roles,
		};
	},
});

export const google = new Google(GOOGLE_AUTH_CLIENT_ID, GOOGLE_AUTH_SECRET, `${BASE_APP_URL}/api/login/google/callback`);
export const apple = new Apple(
    {
        clientId: APPLE_SERVICE_ID,
        teamId: APPLE_TEAM_ID,
        keyId: APPLE_KEY_ID,
        certificate: normalizePkcs8Body(APPLE_PRIVATE_KEY)
    },
    `${BASE_APP_URL}/api/login/apple/callback`
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		UserId: number;
		DatabaseUserAttributes: {
			username: string;
			googleId: string;
			playerTag: string | null;
			roles: string[];
		};
	}
}
