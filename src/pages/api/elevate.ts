import type { APIRoute } from 'astro';
import { getDb } from 'emdash/runtime';
import { getMigrationStatus } from 'emdash/db';
import { applySeed } from 'emdash/seed';
import seedData from '../../../seed/seed.json';
import { sql } from 'kysely';

export const GET: APIRoute = async () => {
    const steps: Record<string, any> = {};

    try {
        const db = await getDb();
        steps.dbConnected = true;

        // Step 1: Check migration status (don't run, just inspect)
        try {
            const status = await getMigrationStatus(db);
            steps.migrationStatus = status;
        } catch (e: any) {
            steps.migrationStatus = 'Could not read: ' + e.message;
        }

        // Step 2: List existing tables
        const tables = await sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`.execute(db);
        steps.existingTables = (tables.rows as any[]).map((r: any) => r.name);

        // Step 3: Apply seed (collections, fields, etc.) with conflict handling
        try {
            const seedResult = await applySeed(db, seedData as any, { onConflict: 'skip' });
            steps.seed = seedResult;
        } catch (e: any) {
            steps.seedError = e.message;
        }

        // Step 4: Check users
        try {
            const users = await sql`SELECT id, email, name, role FROM emdash_users`.execute(db);
            steps.existingUsers = users.rows;

            if ((users.rows as any[]).length > 0) {
                await sql`UPDATE emdash_users SET role = 'owner'`.execute(db);
                steps.elevated = true;
            } else {
                steps.elevated = false;
                steps.note = "No users found. Visit /_emdash/admin to register, then hit this endpoint again.";
            }

            const finalUsers = await sql`SELECT id, email, name, role FROM emdash_users`.execute(db);
            steps.finalUsers = finalUsers.rows;
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
