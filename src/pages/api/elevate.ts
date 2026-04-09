import type { APIRoute } from 'astro';
import { getDb } from 'emdash/runtime';
import { sql } from 'kysely';

export const GET: APIRoute = async () => {
    const steps: Record<string, any> = {};

    try {
        const db = await getDb();
        steps.dbConnected = true;

        // Step 1: Fix stuck migrations — mark 027-033 as applied since their tables already exist
        const stuckMigrations = [
            '027_comments', '028_drop_author_url', '029_redirects',
            '030_widen_scheduled_index', '031_bylines', '032_rate_limits',
            '033_optimize_content_indexes'
        ];
        
        for (const name of stuckMigrations) {
            try {
                await sql`INSERT INTO _emdash_migrations (name, applied_at) VALUES (${name}, datetime('now'))`.execute(db);
            } catch (_) {
                // Already exists, skip
            }
        }
        steps.migrationsFixed = stuckMigrations;

        // Step 2: Check users in the actual "users" table
        const users = await sql`SELECT id, email, name, role FROM users`.execute(db);
        steps.existingUsers = users.rows;

        // Step 3: Elevate all users to owner
        if ((users.rows as any[]).length > 0) {
            await sql`UPDATE users SET role = 'owner'`.execute(db);
            steps.elevated = true;
        } else {
            steps.elevated = false;
            steps.note = "No users found. Visit /_emdash/admin to register, then hit this endpoint again.";
        }

        // Step 4: Verify final state
        const finalUsers = await sql`SELECT id, email, name, role FROM users`.execute(db);
        steps.finalUsers = finalUsers.rows;

        return new Response(JSON.stringify({ success: true, steps }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ 
            error: err.message, 
            stepsCompleted: steps 
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
