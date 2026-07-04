function parsePagination(query = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const rawLimit = Number.parseInt(query.limit, 10) || 10;
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildPagination(totalData, page, limit, currentCount) {
  const total = Number(totalData) || 0;
  const totalPage = Math.ceil(total / limit);
  const from = total === 0 ? 0 : ((page - 1) * limit) + 1;
  const to = total === 0 ? 0 : from + currentCount - 1;

  return {
    current_page: page,
    per_page: limit,
    total_data: total,
    total_page: totalPage,
    from,
    to,
    has_next: page < totalPage,
    has_prev: page > 1
  };
}

function paginateArray(data, query = {}) {
  const { page, limit, offset } = parsePagination(query);
  const items = Array.isArray(data) ? data : [];
  const paginatedData = items.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: buildPagination(items.length, page, limit, paginatedData.length)
  };
}

module.exports = {
  parsePagination,
  buildPagination,
  paginateArray
};
