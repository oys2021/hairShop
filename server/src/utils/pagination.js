export function readPagination(query = {}) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 25, 1), 100);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPaginationMeta({ count, page, limit }) {
  return {
    page,
    limit,
    total: count,
    totalPages: Math.max(Math.ceil(count / limit), 1),
  };
}
