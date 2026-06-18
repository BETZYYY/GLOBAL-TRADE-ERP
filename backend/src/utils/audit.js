/**
 * audit.js – Helper terpusat untuk penulisan tb_audit_trail
 *
 * Dipakai oleh semua controller. Menggunakan try/catch internal
 * supaya kegagalan audit tidak merusak response utama.
 */

const { pool } = require('../config/database');

/**
 * @param {object} opts
 * @param {string}  opts.id_pengguna
 * @param {string}  opts.jenis_aksi      – 'CREATE'|'READ'|'UPDATE'|'DELETE'|'LOGIN'|'LOGOUT'|'EXPORT'
 * @param {string}  opts.tabel_terdampak
 * @param {string}  [opts.id_record]
 * @param {object}  [opts.data_sebelum]
 * @param {object}  [opts.data_sesudah]
 * @param {string}  [opts.ip_address]
 * @param {string}  opts.status_aksi     – 'sukses'|'gagal'|'ditolak'
 */
async function writeAudit(opts) {
  const {
    id_pengguna, jenis_aksi, tabel_terdampak,
    id_record = null, data_sebelum = null, data_sesudah = null,
    ip_address = null, status_aksi = 'sukses',
  } = opts;

  try {
    await pool.execute(
      `INSERT INTO tb_audit_trail
         (id_pengguna, jenis_aksi, tabel_terdampak, id_record_terdampak,
          data_sebelum, data_sesudah, ip_address, status_aksi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_pengguna,
        jenis_aksi,
        tabel_terdampak,
        id_record,
        data_sebelum ? JSON.stringify(data_sebelum) : null,
        data_sesudah ? JSON.stringify(data_sesudah) : null,
        ip_address,
        status_aksi,
      ]
    );
  } catch (err) {
    console.error('[AUDIT ERROR]', err.message);
  }
}

module.exports = { writeAudit };
