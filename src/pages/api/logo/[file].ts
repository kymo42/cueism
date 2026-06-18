import type { APIRoute } from 'astro';
import type { R2Bucket } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ params }) => {
	const bucket = (env as { MEDIA?: R2Bucket }).MEDIA;
	const file = params.file;
	if (!bucket || !file) {
		return new Response('Not found', { status: 404 });
	}

	// Only serve from the logos/ prefix; reject any path traversal.
	if (file.includes('/') || file.includes('..')) {
		return new Response('Not found', { status: 404 });
	}

	const object = await bucket.get(`logos/${file}`);
	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(object.body as unknown as BodyInit, {
		headers: {
			'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
