/**
 * Script de migração — Realizzare Mail
 * Executa o schema completo (migration) e seed no Supabase/PostgreSQL.
 * 
 * Uso: node supabase/run_migration.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração usando a string de conexão com pooler (IPv4) 
// O @ na senha foi substituído por %40 para URL encoding.
const connectionString = 'postgres://postgres.wgjxhktboboqekzwwcmq:33130169Leo%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('🔌 Conectando ao banco de dados Supabase via Pooler (IPv4)...');
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // ---- PASSO 1: Reset (dropar tabelas e tipos antigos) ----
    console.log('🗑️  Passo 1/3: Limpando schema existente...');
    await client.query(`
      -- Dropar todas as tabelas existentes (cascade para FKs)
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;

      -- Dropar todos os tipos enum existentes
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;

      -- Dropar materialized views se existirem
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT matviewname FROM pg_matviews WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.' || quote_ident(r.matviewname) || ' CASCADE';
        END LOOP;
      END $$;

      -- Dropar funções antigas se existirem
      DROP FUNCTION IF EXISTS refresh_contact_summary() CASCADE;
      DROP FUNCTION IF EXISTS refresh_dashboard_metrics(DATE) CASCADE;
    `);
    console.log('✅ Schema limpo com sucesso!\n');

    // ---- PASSO 2: Executar migration ----
    console.log('📦 Passo 2/3: Executando migration (schema completo)...');
    const migrationPath = path.join(__dirname, 'migrations', '20260727000000_phase1_complete_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSQL);
    console.log('✅ Migration executada com sucesso! (~35 tabelas, ~50 índices, RLS ativado)\n');

    // ---- PASSO 3: Executar seed ----
    console.log('🌱 Passo 3/3: Executando seed (dados mockados)...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSQL);
    console.log('✅ Seed executado com sucesso! (12 contatos, 4 cursos, 7 campanhas, etc.)\n');

    // ---- Verificação ----
    console.log('🔍 Verificando tabelas criadas...');
    const result = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log(`✅ ${result.rows.length} tabelas encontradas no schema public:`);
    result.rows.forEach((row, i) => {
      console.log(`   ${String(i + 1).padStart(2)}. ${row.tablename}`);
    });

    // Verificar contagem de registros nas tabelas principais
    console.log('\n📊 Contagem de registros nas tabelas principais:');
    const tables = ['organizations', 'contacts', 'tags', 'courses', 'enrollments', 'campaigns', 'flows', 'lists', 'purchases', 'suppression_list', 'api_keys'];
    for (const tbl of tables) {
      try {
        const cnt = await client.query(`SELECT COUNT(*) as count FROM ${tbl}`);
        console.log(`   ${tbl.padEnd(25)} → ${cnt.rows[0].count} registros`);
      } catch { /* tabela pode não existir */ }
    }

    console.log('\n🎉 Migração completa com sucesso! O backend está pronto para uso.');

  } catch (error) {
    console.error('\n❌ ERRO durante a migração:', error.message);
    if (error.detail) console.error('   Detalhe:', error.detail);
    if (error.hint) console.error('   Dica:', error.hint);
    if (error.position) console.error('   Posição SQL:', error.position);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
