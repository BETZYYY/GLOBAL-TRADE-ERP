/**
 * migrate.js
 * Jalankan: node database/migrate.js
 *
 * Membaca file SQL migrations secara berurutan dan mengeksekusinya
 * ke database yang dikonfigurasi di .env
 */

require('dotenv').config();

const fs      = require('fs');
const path    = require('path');
const mysql   = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'globaltrade_erp',
    multipleStatements: true,   // diperlukan untuk menjalankan SQL multi-statement
  });

  console.log('✅  Terhubung ke MySQL');

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql      = fs.readFileSync(filePath, 'utf8');

    console.log(`▶   Menjalankan migrasi: ${file}`);
    await conn.query(sql);
    console.log(`✔   Selesai: ${file}`);
  }

  await conn.end();
  console.log('\n🎉  Semua migrasi berhasil dijalankan!');
}

run().catch(err => {
  console.error('❌  Migrasi gagal:', err.message);
  process.exit(1);
});
