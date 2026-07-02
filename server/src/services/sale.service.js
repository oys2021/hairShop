import { sequelize, models } from '../database/sequelize.js';
import { findSaleById, listSales } from '../repositories/sale.repository.js';
import { createId, createSequentialId } from '../utils/ids.js';
import { buildPaginationMeta, readPagination } from '../utils/pagination.js';
import { HttpError } from '../utils/http-error.js';

function serializeSale(sale) {
  return sale.toJSON();
}

function readAmount(value, field) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, `${field} must be a valid positive number`);
  }

  return amount;
}

function readItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'At least one sale item is required');
  }

  return items.map((item) => {
    const qty = Number(item.qty);

    if (!item.productId || !Number.isInteger(qty) || qty <= 0) {
      throw new HttpError(400, 'Each sale item needs a product and valid quantity');
    }

    return {
      productId: item.productId,
      qty,
    };
  });
}

function summarizeSaleItems(items) {
  return items.reduce((total, item) => total + Number(item.lineTotal), 0);
}

async function applyStockDelta({ productId, delta, reason, saleId, createdBy, transaction }) {
  const product = await models.Product.findByPk(productId, { transaction });

  if (!product) {
    throw new HttpError(400, `Product ${productId} does not exist`);
  }

  const nextQty = Number(product.qtyInStock) + delta;

  if (nextQty < 0) {
    throw new HttpError(400, `${product.name} does not have enough stock`);
  }

  await product.update({ qtyInStock: nextQty }, { transaction });

  if (delta !== 0) {
    await models.StockMovement.create(
      {
        id: createId('stk'),
        productId,
        type: 'sale_adjustment',
        quantityChange: delta,
        reason,
        referenceType: 'sale',
        referenceId: saleId,
        createdBy,
      },
      { transaction },
    );
  }

  return product;
}

export async function readSales(query) {
  const pagination = readPagination(query);
  const result = await listSales({ ...pagination, search: query.search });

  return {
    data: result.rows.map(serializeSale),
    meta: buildPaginationMeta({ count: result.count, ...pagination }),
  };
}

export async function readSale(id) {
  const sale = await findSaleById(id);

  if (!sale) {
    throw new HttpError(404, 'Sale not found');
  }

  return serializeSale(sale);
}

export async function addSale(payload, authUser) {
  const items = readItems(payload.items);
  const amountPaid = readAmount(payload.amountPaid, 'Amount paid');
  const saleId = payload.id ?? await createSequentialId(models.Sale, 'AD');
  const createdBy = authUser?.username ?? 'administrator';

  return sequelize.transaction(async (transaction) => {
    const lineItems = [];

    for (const item of items) {
      const product = await applyStockDelta({
        productId: item.productId,
        delta: -item.qty,
        reason: 'Product sold',
        saleId,
        createdBy,
        transaction,
      });

      const unitPrice = Number(product.price);
      lineItems.push({
        id: createId('sli'),
        saleId,
        productId: product.id,
        qty: item.qty,
        unitPrice,
        lineTotal: unitPrice * item.qty,
      });
    }

    const totalAmount = summarizeSaleItems(lineItems);
    const sale = await models.Sale.create(
      {
        id: saleId,
        saleDate: payload.saleDate ?? new Date().toISOString().slice(0, 10),
        customerId: payload.customerId || null,
        createdBy,
        totalAmount,
        amountPaid,
        balance: amountPaid - totalAmount,
      },
      { transaction },
    );

    await models.SaleItem.bulkCreate(lineItems, { transaction });

    return serializeSale(await findSaleById(sale.id, transaction));
  });
}

export async function editSale(id, payload, authUser) {
  const nextItems = readItems(payload.items);
  const amountPaid = readAmount(payload.amountPaid, 'Amount paid');
  const createdBy = authUser?.username ?? 'administrator';

  return sequelize.transaction(async (transaction) => {
    const sale = await findSaleById(id, transaction);

    if (!sale) {
      throw new HttpError(404, 'Sale not found');
    }

    const oldQuantities = new Map();
    sale.items.forEach((item) => {
      oldQuantities.set(item.productId, Number(item.qty));
    });

    const nextQuantities = new Map();
    nextItems.forEach((item) => {
      nextQuantities.set(item.productId, (nextQuantities.get(item.productId) ?? 0) + item.qty);
    });

    const allProductIds = new Set([...oldQuantities.keys(), ...nextQuantities.keys()]);
    for (const productId of allProductIds) {
      const oldQty = oldQuantities.get(productId) ?? 0;
      const nextQty = nextQuantities.get(productId) ?? 0;
      const delta = oldQty - nextQty;
      await applyStockDelta({
        productId,
        delta,
        reason: 'Sale edited',
        saleId: id,
        createdBy,
        transaction,
      });
    }

    await models.SaleItem.destroy({ where: { saleId: id }, transaction });

    const lineItems = [];
    for (const item of nextItems) {
      const product = await models.Product.findByPk(item.productId, { transaction });
      const unitPrice = Number(product.price);
      lineItems.push({
        id: createId('sli'),
        saleId: id,
        productId: product.id,
        qty: item.qty,
        unitPrice,
        lineTotal: unitPrice * item.qty,
      });
    }

    const totalAmount = summarizeSaleItems(lineItems);
    await models.SaleItem.bulkCreate(lineItems, { transaction });
    await sale.update(
      {
        saleDate: payload.saleDate ?? sale.saleDate,
        customerId: payload.customerId || null,
        totalAmount,
        amountPaid,
        balance: amountPaid - totalAmount,
      },
      { transaction },
    );

    return serializeSale(await findSaleById(id, transaction));
  });
}
