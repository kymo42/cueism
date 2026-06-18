import type { APIRoute } from 'astro';
import type { R2Bucket } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];

export const POST: APIRoute = async ({ request }) => {
	const bucket = (env as { MEDIA?: R2Bucket }).MEDIA;
	if (!bucket) {
		return new Response(JSON.stringify({ error: 'Storage not available' }), { status: 500 });
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid upload' }), { status: 400 });
	}

	const file = form.get('file');
	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
	}
	if (!ALLOWED.includes(file.type)) {
		return new Response(JSON.stringify({ error: 'Please upload an image (PNG, JPG, WEBP, SVG, or GIF).' }), { status: 400 });
	}
	if (file.size > MAX_BYTES) {
		return new Response(JSON.stringify({ error: 'Logo must be 5 MB or smaller.' }), { status: 400 });
	}

	const ext = (file.name.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '').slice(0, 5).toLowerCase() || 'png';
	const name = `${crypto.randomUUID()}.${ext}`;
	const key = `logos/${name}`;

	await bucket.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type },
	});

	return new Response(JSON.stringify({ url: `/api/logo/${name}`, filename: file.name }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
