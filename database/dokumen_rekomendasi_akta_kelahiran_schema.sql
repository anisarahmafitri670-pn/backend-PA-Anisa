CREATE TABLE dokumen_rekomendasi_akta_kelahiran (
  id_dokumen INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  jenis_dokumen ENUM(
    'surat_rekomendasi_lurah',
    'sk_lahir_bidan_dokter',
    'ktp_ortu',
    'kk',
    'surat_nikah',
    'akta_lahir_ortu_tionghoa'
  ) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pengajuan_jenis (id_pengajuan, jenis_dokumen),
  INDEX idx_pengajuan (id_pengajuan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opsional foreign key (aktifkan jika tabel rekomendasi_akta_kelahiran punya PK id_pengajuan)
-- ALTER TABLE dokumen_rekomendasi_akta_kelahiran
-- ADD CONSTRAINT fk_dokumen_akta_kelahiran_pengajuan
-- FOREIGN KEY (id_pengajuan) REFERENCES rekomendasi_akta_kelahiran(id_pengajuan)
-- ON DELETE CASCADE;

