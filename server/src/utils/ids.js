import { randomUUID } from 'node:crypto';

export function createId(prefix = 'id') {
  return `${prefix}_${randomUUID().slice(0, 12)}`;
}

export async function createSequentialId(model, prefix, width = 3) {
  const rows = await model.findAll({
    attributes: ['id'],
    raw: true,
  });
  const max = rows.reduce((currentMax, row) => {
    const id = String(row.id ?? '');

    if (!id.startsWith(prefix)) {
      return currentMax;
    }

    const parsed = Number(id.slice(prefix.length));
    return Number.isFinite(parsed) ? Math.max(currentMax, parsed) : currentMax;
  }, 0);

  return `${prefix}${String(max + 1).padStart(width, '0')}`;
}
