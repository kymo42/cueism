import type { APIRoute } from 'astro';
import { getDb } from 'emdash/runtime';
import { runMigrations } from 'emdash/db';
import { applySeed } from 'emdash/seed';
import seedData from '../../../seed/seed.json';
import { sql } from 'kysely';

export const GET: APIRoute = async () => {
    const steps: Record<string, any> = {};

    try {
        const db = await getDb();
        steps.dbConnected = true;

        // Step 1: Drop the pre-created table that blocks migration 027
        try {
            await sql`DROP TABLE IF EXISTS _emdash_comments`.execute(db);
            steps.droppedComments = true;
        } catch (e: any) {
            steps.dropError = e.message;
        }

        // Step 2: Now run migrations properly — they'll recreate _emdash_comments and apply 028-033
        try {
            const migrationResult = await runMigrations(db);
            steps.migrations = migrationResult;
        } catch (e: any) {
            steps.migrationError = e.message;
        }

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
                steps.note = "No users yet. After migrations are fixed, visit /_emdash/admin to register, then hit this endpoint again to elevate.";
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
