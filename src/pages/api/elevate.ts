import type { APIRoute } from 'astro';
import { getDb } from 'emdash/runtime';
import { applySeed } from 'emdash/seed';
import seedData from '../../../seed/seed.json';
import { sql } from 'kysely';

export const GET: APIRoute = async () => {
    const steps: Record<string, any> = {};

    try {
        const db = await getDb();
        steps.dbConnected = true;

        // Step 1: Force-mark all pending migrations as applied
        // Their schema changes already exist in the DB, just the tracker is out of sync
        const stuckMigrations = [
            '027_comments', '028_drop_author_url', '029_redirects',
            '030_widen_scheduled_index', '031_bylines', '032_rate_limits',
            '033_optimize_content_indexes'
        ];
        
        const marked: string[] = [];
        for (const name of stuckMigrations) {
            try {
                await sql`INSERT INTO _emdash_migrations (name, applied_at) VALUES (${name}, datetime('now'))`.execute(db);
                marked.push(name);
            } catch (_) {
                // Already marked, skip
            }
        }
        steps.migrationsMarkedAsApplied = marked;

        // Step 2: Verify migration status
        const allMigrations = await sql`SELECT name FROM _emdash_migrations ORDER BY name`.execute(db);
        steps.allTrackedMigrations = (allMigrations.rows as any[]).map((r: any) => r.name);

        // Step 3: Apply seed data
        try {
            const seedResult = await applySeed(db, seedData as any, { onConflict: 'skip' });
            steps.seed = seedResult;
        } catch (e: any) {
            steps.seedError = e.message;
        }

        // Step 4: Check users and elevate
        try {
            const users = await sql`SELECT id, email, name, role FROM users`.execute(db);
            steps.existingUsers = users.rows;

            if ((users.rows as any[]).length > 0) {
                await sql`UPDATE users SET role = 'owner'`.execute(db);
                steps.elevated = true;
                const finalUsers = await sql`SELECT id, email, name, role FROM users`.execute(db);
                steps.finalUsers = finalUsers.rows;
            } else {
                steps.elevated = false;
                steps.note = "No users yet. Sign in via GitHub/Google/email at /_emdash/admin, then visit this endpoint again to get owner access.";
            }
        } catch (e: any) {
            steps.userError = e.message;
        }

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
