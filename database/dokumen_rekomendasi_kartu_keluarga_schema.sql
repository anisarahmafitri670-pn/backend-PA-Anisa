CREATE TABLE dokumen_rekomendasi_kartu_keluarga (
  id_dokumen INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  jenis_dokumen ENUM(
    'surat_keterangan_rt',
    'pengantar_lurah_penghulu',
    'surat_nikah',
    'kartu_keluarga',
    'akta_kelahiran_dan_suket_wni_tionghoa'
  ) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pengajuan_jenis (id_pengajuan, jenis_dokumen),
  INDEX idx_pengajuan (id_pengajuan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opsional foreign key (aktifkan jika tabel rekomendasi_kartu_keluarga punya PK id_pengajuan)
-- ALTER TABLE dokumen_rekomendasi_kartu_keluarga
-- ADD CONSTRAINT fk_dokumen_kk_pengajuan
-- FOREIGN KEY (id_pengajuan) REFERENCES rekomendasi_kartu_keluarga(id_pengajuan)
-- ON DELETE CASCADE;

