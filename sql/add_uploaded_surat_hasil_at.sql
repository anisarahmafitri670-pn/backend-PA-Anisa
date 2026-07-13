ALTER TABLE rekomendasi_penelitian
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_surat_pindah
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_akta_kelahiran
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_kartu_keluarga
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_surat_kerja
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_surat_tanah
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_surat_ahli_waris
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;

ALTER TABLE rekomendasi_surat_yayasan
ADD COLUMN uploaded_surat_hasil_at DATETIME NULL AFTER nama_file_surat_hasil;
