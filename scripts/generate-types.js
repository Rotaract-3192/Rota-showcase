const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

async function generate() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('Querying database schema...');

  // 1. Fetch Enums
  const enumRes = await client.query(`
    SELECT t.typname as enum_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
  `);

  const enums = {};
  enumRes.rows.forEach(row => {
    let vals = row.enum_values;
    if (typeof vals === 'string') {
      vals = vals.replace(/{|}/g, '').split(',');
    }
    enums[row.enum_name] = vals;
  });

  // 2. Fetch Columns
  const colRes = await client.query(`
    SELECT 
        c.table_name,
        c.column_name,
        c.is_nullable,
        c.data_type,
        c.column_default,
        c.udt_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position
  `);

  await client.end();

  const tables = {};
  colRes.rows.forEach(row => {
    if (!tables[row.table_name]) {
      tables[row.table_name] = [];
    }
    tables[row.table_name].push(row);
  });

  console.log(`Found ${Object.keys(tables).length} tables and ${Object.keys(enums).length} enums.`);

  // 3. Helper to map PG types to TS types
  const mapType = (col) => {
    const type = col.data_type;
    const udt = col.udt_name;

    if (enums[udt]) {
      return enums[udt].map(v => `'${v}'`).join(' | ');
    }

    switch (type) {
      case 'integer':
      case 'numeric':
      case 'double precision':
      case 'real':
      case 'smallint':
      case 'bigint':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'timestamp with time zone':
      case 'timestamp without time zone':
      case 'date':
      case 'time without time zone':
        return 'string';
      case 'jsonb':
      case 'json':
        return 'Json';
      case 'array':
      case 'text[]':
      case '_text':
        return 'string[]';
      default:
        if (type.startsWith('character') || type === 'text' || type === 'uuid') {
          return 'string';
        }
        return 'any';
    }
  };

  // 4. Construct TS code
  let code = `/**
 * Auto-generated database types via custom schema reflection.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
`;

  for (const [tableName, cols] of Object.entries(tables)) {
    code += `      ${tableName}: {\n        Row: {\n`;
    cols.forEach(col => {
      const type = mapType(col);
      const isNull = col.is_nullable === 'YES' ? ' | null' : '';
      code += `          ${col.column_name}: ${type}${isNull}\n`;
    });
    code += `        }\n        Insert: {\n`;
    cols.forEach(col => {
      const type = mapType(col);
      const isNull = col.is_nullable === 'YES' ? ' | null' : '';
      const hasDefault = col.column_default !== null || col.is_nullable === 'YES';
      code += `          ${col.column_name}${hasDefault ? '?' : ''}: ${type}${isNull}\n`;
    });
    code += `        }\n        Update: {\n`;
    cols.forEach(col => {
      const type = mapType(col);
      const isNull = col.is_nullable === 'YES' ? ' | null' : '';
      code += `          ${col.column_name}?: ${type}${isNull}\n`;
    });
    code += `        }\n        Relationships: []\n`;
    code += `      }\n`;
  }

  code += `    }\n`;

  // Views, Functions, Enums, CompositeTypes placeholders to satisfy @supabase/ssr generic constraints
  code += `    Views: Record<string, never>\n`;
  code += `    Functions: Record<string, never>\n`;
  code += `    Enums: {\n`;
  for (const [enumName, values] of Object.entries(enums)) {
    code += `      ${enumName}: ${values.map(v => `'${v}'`).join(' | ')}\n`;
  }
  code += `    }\n`;
  code += `    CompositeTypes: Record<string, never>\n`;
  code += `  }\n}\n`;

  const outputPath = path.join(__dirname, '../src/types/database.types.ts');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, code);
  console.log(`Successfully generated database.types.ts at ${outputPath}!`);
}

generate().catch(err => {
  console.error('Error generating types:', err);
  process.exit(1);
});
