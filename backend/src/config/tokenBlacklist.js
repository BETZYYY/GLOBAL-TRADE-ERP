/**
 * Token Blacklist – in-memory Set.
 *
 * Digunakan oleh auth middleware untuk memblokir token yang sudah
 * di-logout sebelum masa berlakunya habis (exp).
 *
 * Catatan:
 *  - Restar server → blacklist terhapus (cukup untuk production
 *    scale kecil; upgrade ke Redis kalau butuh multi-instance).
 *  - TTL cleanup berjalan setiap 30 menit supaya memory tidak membengkak.
 */

const blacklist = new Set();   // Set<{ jti: string, exp: number }>

/** Tambahkan token ke blacklist */
function addToBlacklist(jti, exp) {
  blacklist.add(JSON.stringify({ jti, exp }));
}

/** Cek apakah token sudah di-blacklist */
function isBlacklisted(jti) {
  for (const entry of blacklist) {
    const parsed = JSON.parse(entry);
    if (parsed.jti === jti) return true;
  }
  return false;
}

/** Hapus entri yang sudah kadaluarsa (tiap 30 menit) */
function cleanup() {
  const nowSec = Math.floor(Date.now() / 1000);
  for (const entry of blacklist) {
    const parsed = JSON.parse(entry);
    if (parsed.exp < nowSec) blacklist.delete(entry);
  }
}

setInterval(cleanup, 30 * 60 * 1000);

module.exports = { addToBlacklist, isBlacklisted };
