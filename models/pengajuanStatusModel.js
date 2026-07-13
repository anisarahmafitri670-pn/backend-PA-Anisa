const db = require('../config/db');
const { getAllLayanan, getLayananConfig, normalizeStatus } = require('../utils/pengajuanLayanan');

const columnCache = new Map();

async function tableHasColumn(tableName, columnName) {
  const cacheKey = `${tableName}.${columnName}`;
  if (columnCache.has(cacheKey)) {
    return columnCache.get(cacheKey);
  }

  const [rows] = await db.execute(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  const exists = rows.length > 0;
  columnCache.set(cacheKey, exists);
  return exists;
}

async function findInTable(layanan, idPengajuan) {
  const config = getLayananConfig(layanan);
  if (!config) {
    return null;
  }

  const [rows] = await db.execute(
    `SELECT * FROM ${config.table} WHERE id_pengajuan = ? LIMIT 1`,
    [idPengajuan]
  );

  return rows[0] ? { layanan, config, row: rows[0] } : null;
}

async function resolvePengajuan(idPengajuan, layanan = null) {
  if (layanan) {
    return findInTable(layanan, idPengajuan);
  }

  const matches = [];
  for (const item of getAllLayanan()) {
    const found = await findInTable(item, idPengajuan);
    if (found) {
      matches.push(found);
    }
  }

  if (matches.length === 1) {
    return matches[0];
  }

  if (matches.length > 1) {
    return { ambiguous: true, matches };
  }

  return null;
}

class PengajuanStatusModel {
  static async findById(idPengajuan, layanan = null) {
    return resolvePengajuan(idPengajuan, layanan);
  }

  static async updateStatus(idPengajuan, layanan, status, catatanPetugas = null) {
    const normalizedStatus = normalizeStatus(status);
    if (!normalizedStatus) {
      return { success: false, code: 'INVALID_STATUS' };
    }

    const target = await resolvePengajuan(idPengajuan, layanan);
    if (!target) {
      return { success: false, code: 'NOT_FOUND' };
    }
    if (target.ambiguous) {
      return { success: false, code: 'AMBIGUOUS' };
    }

    const setParts = ['status = ?'];
    const values = [normalizedStatus];

    if (catatanPetugas !== undefined) {
      setParts.push('catatan_petugas = ?');
      values.push(catatanPetugas || null);
    }

    values.push(idPengajuan);
    const [result] = await db.execute(
      `UPDATE ${target.config.table} SET ${setParts.join(', ')} WHERE id_pengajuan = ?`,
      values
    );

    const updated = await findInTable(target.layanan, idPengajuan);
    return {
      success: true,
      affectedRows: result.affectedRows,
      layanan: target.layanan,
      data: updated?.row || null
    };
  }

  static async uploadSuratHasil(idPengajuan, layanan, filePath, originalName) {
    const target = await resolvePengajuan(idPengajuan, layanan);
    if (!target) {
      return { success: false, code: 'NOT_FOUND' };
    }
    if (target.ambiguous) {
      return { success: false, code: 'AMBIGUOUS' };
    }

    const setParts = [
      'status = ?',
      'file_surat_hasil = ?',
      'nama_file_surat_hasil = ?'
    ];
    const values = ['Selesai', filePath, originalName];

    if (await tableHasColumn(target.config.table, 'uploaded_surat_hasil_at')) {
      setParts.push('uploaded_surat_hasil_at = NOW()');
    }

    values.push(idPengajuan);
    const [result] = await db.execute(
      `UPDATE ${target.config.table} SET ${setParts.join(', ')} WHERE id_pengajuan = ?`,
      values
    );

    const updated = await findInTable(target.layanan, idPengajuan);
    return {
      success: true,
      affectedRows: result.affectedRows,
      layanan: target.layanan,
      oldFilePath: target.row.file_surat_hasil || null,
      data: updated?.row || null
    };
  }

  static async deleteSuratHasil(idPengajuan, layanan) {
    const target = await resolvePengajuan(idPengajuan, layanan);
    if (!target) {
      return { success: false, code: 'NOT_FOUND' };
    }
    if (target.ambiguous) {
      return { success: false, code: 'AMBIGUOUS' };
    }

    const nextStatus = normalizeStatus(target.row.status) === 'Selesai' ? 'Diproses' : target.row.status;
    const setParts = [
      'status = ?',
      'file_surat_hasil = NULL',
      'nama_file_surat_hasil = NULL'
    ];
    const values = [nextStatus || 'Diproses'];

    if (await tableHasColumn(target.config.table, 'uploaded_surat_hasil_at')) {
      setParts.push('uploaded_surat_hasil_at = NULL');
    }

    values.push(idPengajuan);
    const [result] = await db.execute(
      `UPDATE ${target.config.table} SET ${setParts.join(', ')} WHERE id_pengajuan = ?`,
      values
    );

    const updated = await findInTable(target.layanan, idPengajuan);
    return {
      success: true,
      affectedRows: result.affectedRows,
      layanan: target.layanan,
      oldFilePath: target.row.file_surat_hasil || null,
      data: updated?.row || null
    };
  }
}

module.exports = PengajuanStatusModel;
