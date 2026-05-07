CREATE TABLE dokumen_rekomendasi_penelitian (
  id_dokumen INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  jenis_dokumen ENUM(
    'ktp_mahasiswa',
    'ktm_mahasiswa',
    'surat_rekomendasi_riset_univ_kesbangpol'
  ) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pengajuan_jenis (id_pengajuan, jenis_dokumen),
  INDEX idx_pengajuan (id_pengajuan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opsional foreign key (aktifkan jika tabel rekomendasi_penelitian punya PK id_pengajuan)
-- ALTER TABLE dokumen_rekomendasi_penelitian
-- ADD CONSTRAINT fk_dokumen_penelitian_pengajuan
-- FOREIGN KEY (id_pengajuan) REFERENCES rekomendasi_penelitian(id_pengajuan)
-- ON DELETE CASCADE;
