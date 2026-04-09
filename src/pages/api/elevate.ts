import type { APIRoute } from 'astro';
import { getDb } from 'emdash/runtime';
import { sql } from 'kysely';

export const GET: APIRoute = async () => {
    try {
        const db = await getDb();
        const users = await sql`SELECT * FROM emdash_users`.execute(db);
        
        // Elevate all to owner
        await sql`UPDATE emdash_users SET role = 'owner'`.execute(db);

        // Fetch again
        const elevated = await sql`SELECT * FROM emdash_users`.execute(db);
        
        return new Response(JSON.stringify({ 
            success: true, 
            message: "Elevated users to owner",
            users: elevated.rows
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
