function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function buildPengajuanFilters({
  idUser = null,
  query = {},
  keywordColumns = []
} = {}) {
  const clauses = [];
  const values = [];

  if (idUser) {
    clauses.push('id_user = ?');
    values.push(idUser);
  }

  if (query.status) {
    clauses.push('LOWER(status) = LOWER(?)');
    values.push(String(query.status).trim());
  }

  if (isValidDate(query.tanggal_awal)) {
    clauses.push('DATE(created_at) >= ?');
    values.push(query.tanggal_awal);
  }

  if (isValidDate(query.tanggal_akhir)) {
    clauses.push('DATE(created_at) <= ?');
    values.push(query.tanggal_akhir);
  }

  if (query.keyword) {
    const keyword = `%${String(query.keyword).trim()}%`;
    const searchableColumns = ['CAST(id_pengajuan AS CHAR)', ...keywordColumns];
    clauses.push(`(${searchableColumns.map((column) => `${column} LIKE ?`).join(' OR ')})`);
    values.push(...searchableColumns.map(() => keyword));
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values
  };
}

module.exports = { buildPengajuanFilters };
