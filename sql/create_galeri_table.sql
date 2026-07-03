CREATE TABLE galeri (
  id_galeri INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(150) NOT NULL,
  deskripsi_singkat VARCHAR(255) NOT NULL,
  deskripsi_detail TEXT NOT NULL,
  tanggal_kegiatan DATE NULL,
  lokasi VARCHAR(150) NULL,
  foto_url VARCHAR(500) NOT NULL,
  tipe_tampilan ENUM('hero','card') DEFAULT 'card',
  urutan_tampil INT DEFAULT 0,
  status_aktif TINYINT(1) DEFAULT 1,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
