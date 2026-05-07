CREATE TABLE dokumen_rekomendasi_surat_yayasan (
  id_dokumen INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  jenis_dokumen ENUM(
    'rekomendasi_lurah_penghulu_asli',
    'daftar_nama_guru_pengurus',
    'daftar_nama_anak_didik',
    'foto_dokumentasi_gedung_dan_musyawarah',
    'ktp_pengurus',
    'akta_notaris_pendirian'
  ) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pengajuan_jenis (id_pengajuan, jenis_dokumen),
  INDEX idx_pengajuan (id_pengajuan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opsional foreign key (aktifkan jika tabel rekomendasi_surat_yayasan punya PK id_pengajuan)
-- ALTER TABLE dokumen_rekomendasi_surat_yayasan
-- ADD CONSTRAINT fk_dokumen_surat_yayasan_pengajuan
-- FOREIGN KEY (id_pengajuan) REFERENCES rekomendasi_surat_yayasan(id_pengajuan)
-- ON DELETE CASCADE;

