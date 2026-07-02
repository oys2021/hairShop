import { sequelize, models } from '../database/sequelize.js';
import {
  createProduct,
  createStockMovement,
  findProductById,
  listProducts,
  updateProduct,
} from '../repositories/product.repository.js';
import { createId, createSequentialId } from '../utils/ids.js';
import { buildPaginationMeta, readPagination } from '../utils/pagination.js';
import { HttpError } from '../utils/http-error.js';

function serializeProduct(product) {
  return product.toJSON();
}

function readMoney(value, field) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, `${field} must be a valid positive number`);
  }

  return amount.toFixed(2);
}

function readQuantity(value, field = 'Quantity') {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new HttpError(400, `${field} must be a valid whole number`);
  }

  return quantity;
}

export async function readProducts(query) {
  const pagination = readPagination(query);
  const result = await listProducts({
    ...pagination,
    search: query.search,
    categoryId: query.categoryId,
    sort: query.sort,
  });

  return {
    data: result.rows.map(serializeProduct),
    meta: buildPaginationMeta({ count: result.count, ...pagination }),
  };
}

export async function readProduct(id) {
  const product = await findProductById(id);

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  return serializeProduct(product);
}

export async function addProduct(payload, authUser) {
  if (!payload.name || !payload.categoryId) {
    throw new HttpError(400, 'Product name and category are required');
  }

  const category = await models.Category.findByPk(payload.categoryId);
  if (!category) {
    throw new HttpError(400, 'Category does not exist');
  }

  return sequelize.transaction(async (transaction) => {
    const quantity = readQuantity(payload.qtyInStock ?? payload.qty ?? 0);
    const product = await createProduct(
      {
        id: payload.id ?? await createSequentialId(models.Product, 'PT'),
        name: payload.name.trim(),
        categoryId: payload.categoryId,
        price: readMoney(payload.price ?? 0, 'Price'),
        qtyInStock: quantity,
        reorderLevel: readQuantity(payload.reorderLevel ?? 5, 'Reorder level'),
        imageUrl: payload.imageUrl ?? null,
        createdBy: authUser?.username ?? 'administrator',
      },
      transaction,
    );

    if (quantity > 0) {
      await createStockMovement(
        {
          id: createId('stk'),
          productId: product.id,
          type: 'initial_stock',
          quantityChange: quantity,
          reason: 'Initial product quantity',
          referenceType: 'product',
          referenceId: product.id,
          createdBy: authUser?.username ?? 'administrator',
        },
        transaction,
      );
    }

    return serializeProduct(await findProductById(product.id, transaction));
  });
}

export async function editProduct(id, payload, authUser) {
  return sequelize.transaction(async (transaction) => {
    const product = await findProductById(id, transaction);

    if (!product) {
      throw new HttpError(404, 'Product not found');
    }

    let nextQty;
    if (payload.qtyInStock !== undefined || payload.qty !== undefined) {
      nextQty = readQuantity(payload.qtyInStock ?? payload.qty);
    }

    const previousQty = Number(product.qtyInStock);
    const updated = await updateProduct(
      id,
      {
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(payload.categoryId ? { categoryId: payload.categoryId } : {}),
        ...(payload.price !== undefined ? { price: readMoney(payload.price, 'Price') } : {}),
        ...(nextQty !== undefined ? { qtyInStock: nextQty } : {}),
        ...(payload.reorderLevel !== undefined ? { reorderLevel: readQuantity(payload.reorderLevel, 'Reorder level') } : {}),
        ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl || null } : {}),
      },
      transaction,
    );

    if (nextQty !== undefined && nextQty !== previousQty) {
      await createStockMovement(
        {
          id: createId('stk'),
          productId: id,
          type: 'manual_adjustment',
          quantityChange: nextQty - previousQty,
          reason: 'Product quantity edited',
          referenceType: 'product',
          referenceId: id,
          createdBy: authUser?.username ?? 'administrator',
        },
        transaction,
      );
    }

    return serializeProduct(updated);
  });
}
