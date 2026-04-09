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

        // Step 1: Create all missing tables from migrations 027-033
        const createStatements = [
            // 027_comments
            `CREATE TABLE IF NOT EXISTS "_emdash_comments" ("id" text primary key, "collection" text not null, "content_id" text not null, "parent_id" text references "_emdash_comments" ("id") on delete cascade, "author_name" text not null, "author_email" text not null, "author_user_id" text references "users" ("id") on delete set null, "body" text not null, "status" text default 'pending' not null, "ip_hash" text, "user_agent" text, "moderation_metadata" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')))`,
            // 029_redirects
            `CREATE TABLE IF NOT EXISTS "_emdash_redirects" ("id" text primary key, "source" text not null, "destination" text not null, "type" integer default 301 not null, "is_pattern" integer default 0 not null, "enabled" integer default 1 not null, "hits" integer default 0 not null, "last_hit_at" text, "group_name" text, "auto" integer default 0 not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')))`,
            // 031_bylines
            `CREATE TABLE IF NOT EXISTS "_emdash_bylines" ("id" text primary key, "slug" text not null unique, "display_name" text not null, "bio" text, "avatar_media_id" text references "media" ("id") on delete set null, "website_url" text, "user_id" text references "users" ("id") on delete set null, "is_guest" integer default 0 not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')))`,
            `CREATE TABLE IF NOT EXISTS "_emdash_content_bylines" ("id" text primary key, "collection_slug" text not null, "content_id" text not null, "byline_id" text not null references "_emdash_bylines" ("id") on delete cascade, "sort_order" integer default 0 not null, "role_label" text, "created_at" text default (datetime('now')), constraint "content_bylines_unique" unique ("collection_slug", "content_id", "byline_id"))`,
            // 032_rate_limits
            `CREATE TABLE IF NOT EXISTS "_emdash_rate_limits" ("key" text not null, "window" text not null, "count" integer default 1 not null, constraint "pk_rate_limits" primary key ("key", "window"))`,
        ];

        const created: string[] = [];
        for (const stmt of createStatements) {
            try {
                await sql.raw(stmt).execute(db);
                created.push(stmt.substring(0, 60) + '...');
            } catch (e: any) {
                created.push('SKIP: ' + e.message.substring(0, 80));
            }
        }
        steps.tablesCreated = created;

        // Step 2: Create indexes from migration 033 (optimize_content_indexes)
        const indexes = [
            `CREATE UNIQUE INDEX IF NOT EXISTS "redirects_source_idx" ON "_emdash_redirects" ("source")`,
            `CREATE INDEX IF NOT EXISTS "comments_content_idx" ON "_emdash_comments" ("collection", "content_id")`,
            `CREATE INDEX IF NOT EXISTS "comments_status_idx" ON "_emdash_comments" ("status")`,
        ];
        for (const idx of indexes) {
            try { await sql.raw(idx).execute(db); } catch (_) {}
        }
        steps.indexesCreated = true;

        // Step 3: Force-mark all pending migrations as applied
        const stuckMigrations = [
            '027_comments', '028_drop_author_url', '029_redirects',
            '030_widen_scheduled_index', '031_bylines', '032_rate_limits',
            '033_optimize_content_indexes'
        ];
        
        const marked: string[] = [];
        for (const name of stuckMigrations) {
            try {
                // Match local schema: columns are "name" and "timestamp"
                await sql`INSERT INTO _emdash_migrations (name, timestamp) VALUES (${name}, ${new Date().toISOString()})`.execute(db);
                marked.push(name);
            } catch (_) {
                // Already marked
            }
        }
        steps.migrationsMarked = marked;

        // Step 4: Verify all migrations now tracked
        const allMigrations = await sql`SELECT name FROM _emdash_migrations ORDER BY name`.execute(db);
        steps.totalMigrations = (allMigrations.rows as any[]).length;

        // Step 5: Apply seed
        try {
            const seedResult = await applySeed(db, seedData as any, { onConflict: 'skip' });
            steps.seed = seedResult;
        } catch (e: any) {
            steps.seedError = e.message;
        }

        // Step 6: Check and elevate users
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
                steps.note = "No users yet. Sign in at /_emdash/admin (try GitHub), then visit /api/elevate again.";
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
