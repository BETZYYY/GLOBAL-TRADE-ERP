/**
 * seed.js
 * Jalankan: node database/seed.js
 *
 * Mengisi database dengan data awal:
 *   - 3 pengguna (finance_manager, treasury_officer, risk_analyst)
 *   - 5 kurs mata uang (USD/IDR, EUR/IDR, JPY/IDR, GBP/IDR, SGD/IDR)
 *   - 10 transaksi pembayaran dengan level risiko bervariasi
 *   - 3 posisi hedging
 *   - Analisis risiko & peringatan terkait
 *
 * Password semua pengguna: "Password123!"
 */

require('dotenv').config();

const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');

const uuid = () => crypto.randomUUID();
const now  = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// ─── Koneksi ────────────────────────────────────────────────────────────────
async function getConn() {
  return mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'globaltrade_erp',
    multipleStatements: false,
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function seed() {
  const conn = await getConn();
  console.log('✅  Terhubung ke MySQL');

  // Hash password sekali
  const passwordHash = await bcrypt.hash('Password123!', 12);
  console.log('🔐  Password di-hash');

  // ── 1. PENGGUNA ────────────────────────────────────────────────────────────
  const idFinanceManager    = uuid();
  const idTreasuryOfficer   = uuid();
  const idRiskAnalyst       = uuid();

  const pengguna = [
    {
      id_pengguna:   idFinanceManager,
      nama_lengkap:  'Budi Santoso',
      email:         'budi.santoso@globaltrade.co.id',
      password_hash: passwordHash,
      peran:         'finance_manager',
      hak_akses:     JSON.stringify({
        transaksi: ['baca','buat','ubah'],
        risiko:    ['baca','ubah'],
        laporan:   ['baca','ekspor'],
        pengguna:  ['baca'],
      }),
      status_akun:   'aktif',
    },
    {
      id_pengguna:   idTreasuryOfficer,
      nama_lengkap:  'Sari Dewi Rahayu',
      email:         'sari.dewi@globaltrade.co.id',
      password_hash: passwordHash,
      peran:         'treasury_officer',
      hak_akses:     JSON.stringify({
        transaksi: ['baca','buat','ubah'],
        hedging:   ['baca','buat','ubah'],
        kurs:      ['baca'],
      }),
      status_akun:   'aktif',
    },
    {
      id_pengguna:   idRiskAnalyst,
      nama_lengkap:  'Ahmad Rizal Fauzi',
      email:         'ahmad.rizal@globaltrade.co.id',
      password_hash: passwordHash,
      peran:         'risk_analyst',
      hak_akses:     JSON.stringify({
        transaksi:  ['baca'],
        risiko:     ['baca','buat','ubah'],
        peringatan: ['baca','kelola'],
        laporan:    ['baca'],
      }),
      status_akun:   'aktif',
    },
  ];

  console.log('\n📝  Menyisipkan pengguna...');
  for (const p of pengguna) {
    await conn.execute(
      `INSERT IGNORE INTO tb_pengguna
         (id_pengguna, nama_lengkap, email, password_hash, peran, hak_akses, status_akun)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.id_pengguna, p.nama_lengkap, p.email, p.password_hash,
       p.peran, p.hak_akses, p.status_akun]
    );
    console.log(`   ✔ ${p.nama_lengkap} (${p.peran})`);
  }

  // ── 2. NILAI TUKAR ─────────────────────────────────────────────────────────
  const idKursUSD = uuid();
  const idKursEUR = uuid();
  const idKursJPY = uuid();
  const idKursGBP = uuid();
  const idKursSGD = uuid();

  const nilaiTukar = [
    { id: idKursUSD, dari: 'USD', ke: 'IDR', nilai: 16287.500000, beli: 16250.000000, jual: 16325.000000 },
    { id: idKursEUR, dari: 'EUR', ke: 'IDR', nilai: 17614.320000, beli: 17550.000000, jual: 17678.640000 },
    { id: idKursJPY, dari: 'JPY', ke: 'IDR', nilai: 107.823000,  beli: 107.500000,  jual: 108.146000  },
    { id: idKursGBP, dari: 'GBP', ke: 'IDR', nilai: 20634.780000, beli: 20550.000000, jual: 20719.560000 },
    { id: idKursSGD, dari: 'SGD', ke: 'IDR', nilai: 12156.450000, beli: 12100.000000, jual: 12212.900000 },
  ];

  console.log('\n💱  Menyisipkan kurs nilai tukar...');
  for (const k of nilaiTukar) {
    await conn.execute(
      `INSERT IGNORE INTO tb_nilai_tukar
         (id_kurs, kode_mata_uang_dari, kode_mata_uang_ke, nilai_kurs,
          kurs_beli, kurs_jual, sumber_api, timestamp_fetch, is_realtime)
       VALUES (?, ?, ?, ?, ?, ?, 'OpenExchangeRates', ?, TRUE)`,
      [k.id, k.dari, k.ke, k.nilai, k.beli, k.jual, now()]
    );
    console.log(`   ✔ ${k.dari}/${k.ke} = ${k.nilai}`);
  }

  // ── 3. TRANSAKSI PEMBAYARAN ────────────────────────────────────────────────
  const transaksiData = [
    // [referensi, id_pengguna, id_kurs, m_asal, m_tujuan, jml_asal, metode, status, tgl, catatan]
    ['TRX-2024-0001', idTreasuryOfficer, idKursUSD, 'USD', 'IDR', 50000.00,   'swift', 'completed',  '2024-06-01 09:00:00', 'Pembayaran ekspor Q1'],
    ['TRX-2024-0002', idTreasuryOfficer, idKursEUR, 'EUR', 'IDR', 75000.00,   'sepa',  'completed',  '2024-06-03 10:30:00', 'Impor bahan baku EU'],
    ['TRX-2024-0003', idFinanceManager,  idKursUSD, 'USD', 'IDR', 250000.00,  'wire',  'processing', '2024-06-05 11:00:00', 'Pembayaran kontrak besar'],
    ['TRX-2024-0004', idTreasuryOfficer, idKursJPY, 'JPY', 'IDR', 8000000.00, 'swift', 'completed',  '2024-06-07 13:45:00', 'Pembelian mesin Jepang'],
    ['TRX-2024-0005', idFinanceManager,  idKursGBP, 'GBP', 'IDR', 30000.00,   'wire',  'pending',    '2024-06-10 08:15:00', 'Konsultasi London'],
    ['TRX-2024-0006', idTreasuryOfficer, idKursUSD, 'USD', 'IDR', 500000.00,  'rtgs',  'completed',  '2024-06-12 09:30:00', 'Transfer antar bank RTGS'],
    ['TRX-2024-0007', idTreasuryOfficer, idKursSGD, 'SGD', 'IDR', 120000.00,  'swift', 'completed',  '2024-06-14 14:00:00', 'Pembayaran vendor SG'],
    ['TRX-2024-0008', idFinanceManager,  idKursEUR, 'EUR', 'IDR', 180000.00,  'sepa',  'failed',     '2024-06-16 10:00:00', 'Gagal – rekening tujuan tidak valid'],
    ['TRX-2024-0009', idTreasuryOfficer, idKursUSD, 'USD', 'IDR', 95000.00,   'ach',   'processing', '2024-06-17 11:30:00', 'Pembayaran dividen'],
    ['TRX-2024-0010', idFinanceManager,  idKursGBP, 'GBP', 'IDR', 60000.00,   'wire',  'pending',    '2024-06-18 09:00:00', 'Lisensi software UK'],
  ];

  // Kurs map untuk menghitung jumlah_tujuan
  const kursMap = {
    [idKursUSD]: 16287.500000,
    [idKursEUR]: 17614.320000,
    [idKursJPY]: 107.823000,
    [idKursGBP]: 20634.780000,
    [idKursSGD]: 12156.450000,
  };

  const idTranList = [];
  console.log('\n💳  Menyisipkan transaksi pembayaran...');
  for (const t of transaksiData) {
    const [ref, idPengguna, idKurs, mAsal, mTujuan, jmlAsal, metode, status, tgl, catatan] = t;
    const idTransaksi = uuid();
    idTranList.push(idTransaksi);
    const kurs        = kursMap[idKurs];
    const jmlTujuan   = parseFloat((jmlAsal * kurs).toFixed(2));

    await conn.execute(
      `INSERT IGNORE INTO tb_transaksi_pembayaran
         (id_transaksi, nomor_referensi, id_pengguna, id_kurs,
          mata_uang_asal, mata_uang_tujuan, jumlah_asal, jumlah_tujuan,
          nilai_tukar_pakai, metode_pembayaran, status_pembayaran,
          tanggal_transaksi, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idTransaksi, ref, idPengguna, idKurs,
       mAsal, mTujuan, jmlAsal, jmlTujuan,
       kurs, metode, status, tgl, catatan]
    );
    console.log(`   ✔ ${ref} – ${mAsal} ${jmlAsal.toLocaleString()} → IDR ${jmlTujuan.toLocaleString()} [${status}]`);
  }

  // ── 4. HEDGING ─────────────────────────────────────────────────────────────
  const hedgingData = [
    {
      id_transaksi:        idTranList[2],   // TRX-0003 – USD besar
      tipe:                'forward',
      nilai_kontrak:       250000.00,
      mata_uang:           'USD',
      kurs_terkunci:       16150.000000,
      tgl_mulai:           '2024-06-05',
      tgl_jatuh_tempo:     '2024-09-05',
      biaya_premium:       1250.00,
      status:              'aktif',
      lembaga:             'Bank Mandiri – Treasury Division',
    },
    {
      id_transaksi:        idTranList[5],   // TRX-0006 – USD RTGS
      tipe:                'option',
      nilai_kontrak:       500000.00,
      mata_uang:           'USD',
      kurs_terkunci:       16200.000000,
      tgl_mulai:           '2024-06-12',
      tgl_jatuh_tempo:     '2024-12-12',
      biaya_premium:       4500.00,
      status:              'aktif',
      lembaga:             'BCA – Global Treasury',
    },
    {
      id_transaksi:        idTranList[3],   // TRX-0004 – JPY
      tipe:                'swap',
      nilai_kontrak:       8000000.00,
      mata_uang:           'JPY',
      kurs_terkunci:       106.500000,
      tgl_mulai:           '2024-06-07',
      tgl_jatuh_tempo:     '2024-07-07',
      biaya_premium:       320.00,
      status:              'tereksekusi',
      lembaga:             'MUFG Bank Jakarta',
    },
  ];

  console.log('\n🛡️   Menyisipkan posisi hedging...');
  for (const h of hedgingData) {
    const idHedging = uuid();
    await conn.execute(
      `INSERT IGNORE INTO tb_hedging
         (id_hedging, id_transaksi, tipe_hedging, nilai_kontrak,
          mata_uang_lindung, nilai_tukar_terkunci,
          tanggal_mulai, tanggal_jatuh_tempo,
          biaya_premium, status_hedging, lembaga_keuangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idHedging, h.id_transaksi, h.tipe, h.nilai_kontrak,
       h.mata_uang, h.kurs_terkunci,
       h.tgl_mulai, h.tgl_jatuh_tempo,
       h.biaya_premium, h.status, h.lembaga]
    );
    console.log(`   ✔ ${h.tipe.toUpperCase()} ${h.mata_uang} ${h.nilai_kontrak.toLocaleString()} [${h.status}]`);
  }

  // ── 5. ANALISIS RISIKO ─────────────────────────────────────────────────────
  const analisisData = [
    {
      id_transaksi:         idTranList[2],   // USD 250k – HIGH
      skor:                 72,
      level:                'tinggi',
      rugi_usd:             8500.00,
      rekomendasi:          'Lakukan hedging forward minimum 80% dari nilai transaksi.',
    },
    {
      id_transaksi:         idTranList[5],   // USD 500k – CRITICAL
      skor:                 88,
      level:                'kritis',
      rugi_usd:             43500.00,
      rekomendasi:          'Wajib hedging penuh. Eskalasi ke Finance Manager untuk persetujuan.',
    },
    {
      id_transaksi:         idTranList[0],   // USD 50k – LOW
      skor:                 18,
      level:                'rendah',
      rugi_usd:             null,
      rekomendasi:          'Tidak diperlukan tindakan khusus.',
    },
    {
      id_transaksi:         idTranList[1],   // EUR 75k – MEDIUM
      skor:                 41,
      level:                'sedang',
      rugi_usd:             1200.00,
      rekomendasi:          'Monitor pergerakan kurs EUR/IDR. Pertimbangkan partial hedging.',
    },
    {
      id_transaksi:         idTranList[8],   // USD 95k – MEDIUM
      skor:                 45,
      level:                'sedang',
      rugi_usd:             2300.00,
      rekomendasi:          'Pasang alert otomatis jika kurs melewati 16.500.',
    },
  ];

  const idAnalisList = [];
  console.log('\n📊  Menyisipkan analisis risiko...');
  for (const a of analisisData) {
    const idAnalisis = uuid();
    idAnalisList.push({ id: idAnalisis, level: a.level });

    await conn.execute(
      `INSERT IGNORE INTO tb_analisis_risiko
         (id_analisis, id_transaksi, id_analyst, tipe_risiko,
          skor_volatilitas, level_risiko, selisih_potensi_rugi_usd,
          parameter_simulasi, rekomendasi)
       VALUES (?, ?, ?, 'volatilitas', ?, ?, ?, ?, ?)`,
      [
        idAnalisis, a.id_transaksi, idRiskAnalyst,
        a.skor, a.level, a.rugi_usd,
        JSON.stringify({ confidence: 0.95, simulasi_skenario: 1000, metode: 'Monte Carlo' }),
        a.rekomendasi,
      ]
    );
    console.log(`   ✔ Analisis transaksi [${a.level}] skor=${a.skor}`);
  }

  // ── 6. PERINGATAN RISIKO ───────────────────────────────────────────────────
  const peringatanData = [
    {
      analisisIdx: 0,   // tinggi
      id_pengguna: idFinanceManager,
      jenis:       'batas_kerugian',
      level:       'warning',
      pesan:       'Transaksi TRX-2024-0003 mendekati batas kerugian yang ditetapkan. Segera lakukan review hedging.',
      threshold:   8500.00,
    },
    {
      analisisIdx: 1,   // kritis
      id_pengguna: idFinanceManager,
      jenis:       'batas_kerugian',
      level:       'critical',
      pesan:       'PERHATIAN KRITIS: Transaksi TRX-2024-0006 melampaui batas risiko maksimum. Eskalasi segera diperlukan!',
      threshold:   43500.00,
    },
    {
      analisisIdx: 1,   // kritis – juga notif ke risk analyst
      id_pengguna: idRiskAnalyst,
      jenis:       'volatilitas_tinggi',
      level:       'emergency',
      pesan:       'Volatilitas USD/IDR melebihi 3 standar deviasi. Semua transaksi USD di atas $100k memerlukan persetujuan manual.',
      threshold:   500000.00,
    },
  ];

  console.log('\n⚠️   Menyisipkan peringatan risiko...');
  for (const p of peringatanData) {
    const idPeringatan  = uuid();
    const idAnalisis    = idAnalisList[p.analisisIdx].id;

    await conn.execute(
      `INSERT IGNORE INTO tb_peringatan_risiko
         (id_peringatan, id_analisis, id_pengguna, jenis_peringatan,
          level_keparahan, pesan_peringatan, threshold_terlampaui, is_dibaca)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [idPeringatan, idAnalisis, p.id_pengguna,
       p.jenis, p.level, p.pesan, p.threshold]
    );
    console.log(`   ✔ [${p.level.toUpperCase()}] ${p.jenis}`);
  }

  // ── 7. AUDIT TRAIL – contoh login ─────────────────────────────────────────
  console.log('\n📋  Menyisipkan contoh audit trail...');
  const auditEntries = [
    { id_pengguna: idFinanceManager,   aksi: 'LOGIN',  tabel: 'tb_pengguna', status: 'sukses', ip: '192.168.1.101' },
    { id_pengguna: idTreasuryOfficer,  aksi: 'LOGIN',  tabel: 'tb_pengguna', status: 'sukses', ip: '192.168.1.102' },
    { id_pengguna: idRiskAnalyst,      aksi: 'LOGIN',  tabel: 'tb_pengguna', status: 'sukses', ip: '192.168.1.103' },
    { id_pengguna: idTreasuryOfficer,  aksi: 'CREATE', tabel: 'tb_transaksi_pembayaran', status: 'sukses', ip: '192.168.1.102' },
    { id_pengguna: idRiskAnalyst,      aksi: 'CREATE', tabel: 'tb_analisis_risiko',       status: 'sukses', ip: '192.168.1.103' },
  ];

  for (const a of auditEntries) {
    await conn.execute(
      `INSERT INTO tb_audit_trail
         (id_pengguna, jenis_aksi, tabel_terdampak, ip_address, status_aksi)
       VALUES (?, ?, ?, ?, ?)`,
      [a.id_pengguna, a.aksi, a.tabel, a.ip, a.status]
    );
  }
  console.log(`   ✔ ${auditEntries.length} entri audit trail`);

  // ── Selesai ────────────────────────────────────────────────────────────────
  await conn.end();

  console.log(`
╔══════════════════════════════════════════════════╗
║         🌱  SEED BERHASIL DIJALANKAN!            ║
╠══════════════════════════════════════════════════╣
║  Pengguna      : 3 akun                          ║
║  Kurs          : 5 pasang mata uang              ║
║  Transaksi     : 10 transaksi                    ║
║  Hedging       : 3 posisi                        ║
║  Analisis      : 5 analisis risiko               ║
║  Peringatan    : 3 peringatan                    ║
║  Audit Trail   : 5 entri                         ║
╠══════════════════════════════════════════════════╣
║  Login creds:                                    ║
║  📧 budi.santoso@globaltrade.co.id               ║
║  📧 sari.dewi@globaltrade.co.id                  ║
║  📧 ahmad.rizal@globaltrade.co.id                ║
║  🔑 Password: Password123!                       ║
╚══════════════════════════════════════════════════╝
`);
}

seed().catch(err => {
  console.error('❌  Seed gagal:', err.message);
  console.error(err);
  process.exit(1);
});
