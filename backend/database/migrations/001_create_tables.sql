-- ============================================================
--  GlobalTrade ERP – Migration 001 – Create Tables
--  Urutan: respek foreign key dependencies
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- 1. tb_pengguna
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_pengguna (
    id_pengguna     CHAR(36)      NOT NULL,
    nama_lengkap    VARCHAR(200)  NOT NULL,
    email           VARCHAR(254)  NOT NULL,
    password_hash   VARCHAR(256)  NOT NULL,
    peran           ENUM(
                      'admin',
                      'treasury_officer',
                      'risk_analyst',
                      'finance_manager',
                      'auditor'
                    )             NOT NULL,
    hak_akses       JSON          NOT NULL,
    status_akun     ENUM('aktif','nonaktif','ditangguhkan')
                                  NOT NULL DEFAULT 'aktif',
    gagal_login     TINYINT       NOT NULL DEFAULT 0,
    tanggal_dibuat  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME      NULL,

    PRIMARY KEY (id_pengguna),
    UNIQUE  KEY uq_pengguna_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Pengguna sistem GlobalTrade ERP';


-- ─────────────────────────────────────────────────────────────
-- 2. tb_nilai_tukar
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_nilai_tukar (
    id_kurs               CHAR(36)      NOT NULL,
    kode_mata_uang_dari   VARCHAR(3)    NOT NULL,
    kode_mata_uang_ke     VARCHAR(3)    NOT NULL,
    nilai_kurs            DECIMAL(18,6) NOT NULL,
    kurs_beli             DECIMAL(18,6) NOT NULL,
    kurs_jual             DECIMAL(18,6) NOT NULL,
    sumber_api            VARCHAR(100)  NOT NULL,
    timestamp_fetch       DATETIME      NOT NULL,
    is_realtime           BOOLEAN       NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id_kurs),
    INDEX idx_kurs_pair (kode_mata_uang_dari, kode_mata_uang_ke),
    INDEX idx_kurs_timestamp (timestamp_fetch)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Data nilai tukar historis & real-time';


-- ─────────────────────────────────────────────────────────────
-- 3. tb_transaksi_pembayaran
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_transaksi_pembayaran (
    id_transaksi        CHAR(36)      NOT NULL,
    nomor_referensi     VARCHAR(50)   NOT NULL,
    id_pengguna         CHAR(36)      NOT NULL,
    id_kurs             CHAR(36)      NOT NULL,
    mata_uang_asal      VARCHAR(3)    NOT NULL,
    mata_uang_tujuan    VARCHAR(3)    NOT NULL,
    jumlah_asal         DECIMAL(18,2) NOT NULL,
    jumlah_tujuan       DECIMAL(18,2) NOT NULL,
    nilai_tukar_pakai   DECIMAL(18,6) NOT NULL,
    metode_pembayaran   ENUM('swift','sepa','rtgs','ach','wire')
                                      NULL,
    status_pembayaran   ENUM('pending','processing','completed',
                             'failed','cancelled')
                                      NULL,
    tanggal_transaksi   DATETIME      NOT NULL,
    catatan             TEXT          NULL,

    PRIMARY KEY (id_transaksi),
    UNIQUE  KEY uq_transaksi_referensi (nomor_referensi),
    INDEX   idx_transaksi_pengguna    (id_pengguna),
    INDEX   idx_transaksi_status      (status_pembayaran),
    INDEX   idx_transaksi_tanggal     (tanggal_transaksi),

    CONSTRAINT fk_transaksi_pengguna
        FOREIGN KEY (id_pengguna)
        REFERENCES tb_pengguna (id_pengguna)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_transaksi_kurs
        FOREIGN KEY (id_kurs)
        REFERENCES tb_nilai_tukar (id_kurs)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Transaksi pembayaran lintas mata uang';


-- ─────────────────────────────────────────────────────────────
-- 4. tb_analisis_risiko
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_analisis_risiko (
    id_analisis             CHAR(36)      NOT NULL,
    id_transaksi            CHAR(36)      NULL,
    id_analyst              CHAR(36)      NOT NULL,
    tipe_risiko             ENUM('volatilitas','likuiditas',
                                 'counterparty','settlement')
                                          NULL,
    skor_volatilitas        TINYINT       NOT NULL,
    level_risiko            ENUM('rendah','sedang','tinggi','kritis')
                                          NULL,
    selisih_potensi_rugi_usd DECIMAL(18,2) NULL,
    parameter_simulasi      JSON          NOT NULL,
    rekomendasi             TEXT          NULL,
    timestamp_analisis      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_analisis),
    INDEX idx_analisis_transaksi (id_transaksi),
    INDEX idx_analisis_level     (level_risiko),
    INDEX idx_analisis_timestamp (timestamp_analisis),

    CONSTRAINT fk_analisis_transaksi
        FOREIGN KEY (id_transaksi)
        REFERENCES tb_transaksi_pembayaran (id_transaksi)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_analisis_analyst
        FOREIGN KEY (id_analyst)
        REFERENCES tb_pengguna (id_pengguna)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Hasil analisis risiko per transaksi';


-- ─────────────────────────────────────────────────────────────
-- 5. tb_hedging
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_hedging (
    id_hedging            CHAR(36)      NOT NULL,
    id_transaksi          CHAR(36)      NOT NULL,
    tipe_hedging          ENUM('forward','option','swap','futures')
                                        NULL,
    nilai_kontrak         DECIMAL(18,2) NOT NULL,
    mata_uang_lindung     VARCHAR(3)    NOT NULL,
    nilai_tukar_terkunci  DECIMAL(18,6) NOT NULL,
    tanggal_mulai         DATE          NOT NULL,
    tanggal_jatuh_tempo   DATE          NOT NULL,
    biaya_premium         DECIMAL(18,2) NOT NULL DEFAULT 0,
    status_hedging        ENUM('aktif','jatuh_tempo',
                               'dibatalkan','tereksekusi')
                                        NULL,
    lembaga_keuangan      VARCHAR(200)  NULL,

    PRIMARY KEY (id_hedging),
    INDEX idx_hedging_transaksi (id_transaksi),
    INDEX idx_hedging_status    (status_hedging),
    INDEX idx_hedging_jatuh_tempo (tanggal_jatuh_tempo),

    CONSTRAINT fk_hedging_transaksi
        FOREIGN KEY (id_transaksi)
        REFERENCES tb_transaksi_pembayaran (id_transaksi)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Posisi lindung nilai (hedging)';


-- ─────────────────────────────────────────────────────────────
-- 6. tb_peringatan_risiko
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_peringatan_risiko (
    id_peringatan       CHAR(36)       NOT NULL,
    id_analisis         CHAR(36)       NOT NULL,
    id_pengguna         CHAR(36)       NOT NULL,
    jenis_peringatan    ENUM('volatilitas_tinggi','batas_kerugian',
                             'kurs_ekstrem','counterparty')
                                       NULL,
    level_keparahan     ENUM('info','warning','critical','emergency')
                                       NULL,
    pesan_peringatan    TEXT           NOT NULL,
    threshold_terlampaui DECIMAL(18,2) NULL,
    is_dibaca           BOOLEAN        NOT NULL DEFAULT FALSE,
    timestamp_peringatan DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_peringatan),
    INDEX idx_peringatan_pengguna  (id_pengguna),
    INDEX idx_peringatan_is_dibaca (is_dibaca),
    INDEX idx_peringatan_level     (level_keparahan),

    CONSTRAINT fk_peringatan_analisis
        FOREIGN KEY (id_analisis)
        REFERENCES tb_analisis_risiko (id_analisis)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_peringatan_pengguna
        FOREIGN KEY (id_pengguna)
        REFERENCES tb_pengguna (id_pengguna)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Peringatan otomatis sistem manajemen risiko';


-- ─────────────────────────────────────────────────────────────
-- 7. tb_audit_trail
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_audit_trail (
    id_log              BIGINT        NOT NULL AUTO_INCREMENT,
    id_pengguna         CHAR(36)      NOT NULL,
    jenis_aksi          ENUM('CREATE','READ','UPDATE','DELETE',
                             'LOGIN','LOGOUT','EXPORT')
                                      NOT NULL,
    tabel_terdampak     VARCHAR(100)  NOT NULL,
    id_record_terdampak VARCHAR(36)   NULL,
    data_sebelum        JSON          NULL,
    data_sesudah        JSON          NULL,
    ip_address          VARCHAR(45)   NULL,
    status_aksi         ENUM('sukses','gagal','ditolak')
                                      NOT NULL,
    timestamp_aksi      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_log),
    INDEX idx_audit_pengguna   (id_pengguna),
    INDEX idx_audit_aksi       (jenis_aksi),
    INDEX idx_audit_tabel      (tabel_terdampak),
    INDEX idx_audit_timestamp  (timestamp_aksi),

    CONSTRAINT fk_audit_pengguna
        FOREIGN KEY (id_pengguna)
        REFERENCES tb_pengguna (id_pengguna)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Audit trail seluruh aktivitas sistem';


SET FOREIGN_KEY_CHECKS = 1;
