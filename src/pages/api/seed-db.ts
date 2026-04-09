import type { APIRoute } from 'astro';
import { applySeed } from 'emdash/seed';
import { getDb } from 'emdash/runtime';
import seedData from '../../../seed/seed.json';

export const GET: APIRoute = async () => {
    try {
        if (!seedData) {
            return new Response('Seed file not found.', { status: 404 });
        }
        
        // Apply it directly to the active EmDash database via the emdash/seed API
        const db = await getDb();
        const result = await applySeed(db, seedData as any);

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error("Seed error", err);
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
