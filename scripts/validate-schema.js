const fs = require('node:fs');
const path = require('node:path');

const schemaPath = path.join(process.cwd(), 'lib', 'supabase', 'schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error(`Schema file not found: ${schemaPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf8');

if (!sql.trim()) {
  console.error('Schema file is empty.');
  process.exit(1);
}

if (!/CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"uuid-ossp";/i.test(sql)) {
  console.error('Missing uuid-ossp extension setup.');
  process.exit(1);
}

const tableRegex = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.([a-z_][a-z0-9_]*)\s*\(/gi;
const tables = [];
let match;
while ((match = tableRegex.exec(sql)) !== null) {
  tables.push(match[1]);
}

if (tables.length < 8) {
  console.error(`Expected at least 8 tables, found ${tables.length}.`);
  process.exit(1);
}

const missingRls = tables.filter((table) => {
  const escaped = table.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rlsRegex = new RegExp(
    `ALTER\\s+TABLE\\s+public\\.${escaped}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY\\s*;`,
    'i'
  );
  return !rlsRegex.test(sql);
});

if (missingRls.length > 0) {
  console.error(`Missing RLS ENABLE statement for table(s): ${missingRls.join(', ')}`);
  process.exit(1);
}

console.log(`Schema validation passed. Tables found: ${tables.length}.`);
