export function matchesQuery(row, query, selectors) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return selectors.some((selector) => {
    const value = typeof selector === 'function' ? selector(row) : row[selector];
    return String(value ?? '').toLowerCase().includes(normalizedQuery);
  });
}

export function sortRows(rows, selector, direction = 'asc') {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = typeof selector === 'function' ? selector(left) : left[selector];
    const rightValue = typeof selector === 'function' ? selector(right) : right[selector];

    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, { numeric: true }) * multiplier;
  });
}

export function getPage(rows, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, rows.length);

  return {
    currentPage,
    end: endIndex,
    pageCount,
    rows: rows.slice(startIndex, endIndex),
    start: rows.length === 0 ? 0 : startIndex + 1,
  };
}
