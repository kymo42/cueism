// Dump CREATE TABLE statements from local data.db
const Database = require('better-sqlite3');
const db = new Database('./data.db', { readonly: true });

const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE '_emdash%' ORDER BY name").all();

for (const t of tables) {
    console.log(`\n-- ${t.name}`);
    console.log(t.sql + ';');
}

// Also check for other tables from migrations 027-033
const others = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND (name LIKE '%comment%' OR name LIKE '%redirect%' OR name LIKE '%byline%' OR name LIKE '%rate_limit%') ORDER BY name").all();

console.log('\n\n-- OTHER TABLES FROM LATE MIGRATIONS:');
for (const t of others) {
    console.log(`\n-- ${t.name}`);
    console.log(t.sql + ';');
}

// Check columns on _emdash_collections
const cols = db.prepare("PRAGMA table_info(_emdash_collections)").all();
console.log('\n\n-- _emdash_collections columns:');
cols.forEach(c => console.log(`  ${c.name} ${c.type} ${c.notnull ? 'NOT NULL' : ''} ${c.dflt_value ? 'DEFAULT ' + c.dflt_value : ''}`));

db.close();
