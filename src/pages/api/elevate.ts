import type { APIRoute } from 'astro';
import { getDb } from 'emdash/runtime';
import { runMigrations } from 'emdash/db';
import { applySeed } from 'emdash/seed';
import seedData from '../../../seed/seed.json';
import { sql } from 'kysely';

export const GET: APIRoute = async () => {
    const steps: Record<string, any> = {};

    try {
        // Step 1: Get the remote D1 database handle
        const db = await getDb();
        steps.dbConnected = true;

        // Step 2: Run all 32+ EmDash migrations to create core tables
        const migrationResult = await runMigrations(db);
        steps.migrations = migrationResult;

        // Step 3: Apply seed data (collections, fields, menus, etc.)
        const seedResult = await applySeed(db, seedData as any);
        steps.seed = seedResult;

        // Step 4: Check if any users exist
        const users = await sql`SELECT id, email, name, role FROM emdash_users`.execute(db);
        steps.existingUsers = users.rows;

        // Step 5: If users exist, elevate all to owner
        if ((users.rows as any[]).length > 0) {
            await sql`UPDATE emdash_users SET role = 'owner'`.execute(db);
            steps.elevated = true;
        } else {
            steps.elevated = false;
            steps.note = "No users found yet. Visit /_emdash/admin to register, then hit this endpoint again.";
        }

        // Step 6: Final user state
        const finalUsers = await sql`SELECT id, email, name, role FROM emdash_users`.execute(db);
        steps.finalUsers = finalUsers.rows;

        return new Response(JSON.stringify({ success: true, steps }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ 
            error: err.message, 
            stack: err.stack,
            stepsCompleted: steps 
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
