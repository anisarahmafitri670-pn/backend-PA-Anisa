-- Migration aman untuk kolom surat hasil semua layanan.
-- Jalankan di phpMyAdmin pada database aplikasi.
-- Jika phpMyAdmin/MySQL menolak "IF NOT EXISTS", cek kolom dengan:
-- SHOW COLUMNS FROM nama_tabel LIKE 'nama_kolom';
-- lalu jalankan hanya ADD COLUMN yang belum ada.

ALTER TABLE rekomendasi_penelitian
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_surat_pindah
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_akta_kelahiran
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_kartu_keluarga
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_surat_kerja
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_surat_tanah
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_surat_ahli_waris
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;

ALTER TABLE rekomendasi_surat_yayasan
  ADD COLUMN IF NOT EXISTS file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nama_file_surat_hasil VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_surat_hasil_at DATETIME NULL;
