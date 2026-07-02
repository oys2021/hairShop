import bcrypt from 'bcryptjs';
import { models } from '../models/index.js';

const categories = [
  { id: 'CT001', name: 'accessories', code: 'ACC', createdBy: 'administrator' },
  { id: 'CT002', name: 'hair tools', code: 'HTL', createdBy: 'administrator' },
  { id: 'CT003', name: 'BARBAR TOOLS', code: 'BBT', createdBy: 'administrator' },
  { id: 'CT004', name: 'BARBAR ACCESSORIES', code: 'BBA', createdBy: 'administrator' },
  { id: 'CT005', name: 'BARBAR PRODUCT', code: 'BBP', createdBy: 'administrator' },
  { id: 'CT006', name: 'HAIR', code: 'HAI', createdBy: 'administrator' },
];

const products = [
  ['PT003', 'Arm Rest Mat & Pillow', 'CT001', 120, 4],
  ['PT004', 'ukeby Lace Tint Mousse', 'CT002', 35, 30],
  ['PT005', 'Sonar Pixie', 'CT002', 120, 6],
  ['PT006', 'Sonar dryer SN 1236', 'CT002', 135, 6],
  ['PT007', '5 in 1Beauty care massager', 'CT001', 50, 20],
  ['PT008', 'Professional head dryer', 'CT002', 145, 6],
  ['PT009', 'Leather Arm rest', 'CT001', 300, 3],
  ['PT023', 'MELLE HAIR SHAMPOO', 'CT006', 120, 6],
  ['PT024', 'MELLE HAIR CONDITIONER', 'CT006', 120, 2],
  ['PT025', 'MELLE HAIR OIL', 'CT006', 120, 6],
  ['PT026', 'ORS OLIVE OIL COCONUT OIL 2-N1 HEAT PROTECTOR', 'CT006', 25, 6],
  ['PT027', 'CANTU SHAMPOO', 'CT006', 35, 2],
  ['PT028', 'CANTU LEAVE-IN CONDITIONING', 'CT006', 110, 6],
  ['PT046', 'AVOCADO SPRAY GEL SPRIT', 'CT006', 24, 14],
  ['PT047', 'BUCUNEER FRAGRANCE SPRAY', 'CT005', 30, 10],
  ['PT048', 'SABAON HOLDING SPRAY', 'CT005', 30, 15],
  ['PT049', 'FOITEN LACE TINT SPRAY', 'CT005', 35, 10],
  ['PT050', 'ACRYLIC LIQUID PINKEES PRO 16OZ', 'CT005', 200, 5],
];

const customers = [
  { id: 'CUS001', name: 'Ama Boateng', phone: '+233 24 111 9044', email: 'ama@example.com' },
  { id: 'CUS002', name: 'Maya Price', phone: '+233 55 812 7711', email: 'maya@example.com' },
  { id: 'CUS003', name: 'Lina Okoro', phone: '+233 20 220 1908', email: 'lina@example.com' },
  { id: 'CUS004', name: 'Walk-in', phone: null, email: null },
];

const users = [
  ['usr_manager_001', 'manager', 'manager@kalonpos.com', 'manager', 'active'],
  ['usr_cashier_001', 'cashier', 'cashier@kalonpos.com', 'cashier', 'active'],
  ['usr_stock_001', 'stock', 'stock@kalonpos.com', 'inventory', 'active'],
];

const sales = [
  {
    id: 'AD004',
    saleDate: '2025-01-02',
    customerId: null,
    amountPaid: 0,
    items: [['PT007', 1]],
  },
  {
    id: 'AD005',
    saleDate: '2025-01-02',
    customerId: null,
    amountPaid: 0,
    items: [
      ['PT009', 1],
      ['PT027', 1],
    ],
  },
  {
    id: 'AD006',
    saleDate: '2025-01-10',
    customerId: 'CUS001',
    amountPaid: 120,
    items: [['PT023', 1]],
  },
];

async function seedUsers() {
  const passwordHash = bcrypt.hashSync('password', 10);

  for (const [id, username, email, role, status] of users) {
    await models.User.findOrCreate({
      where: { id },
      defaults: {
        id,
        username,
        email,
        passwordHash,
        role,
        status,
      },
    });
  }
}

export async function seedDemoData() {
  await seedUsers();

  if (await models.Category.count()) {
    return { created: false };
  }

  await models.Category.bulkCreate(categories);
  await models.Customer.bulkCreate(customers);
  await models.Product.bulkCreate(
    products.map(([id, name, categoryId, price, qtyInStock]) => ({
      id,
      name,
      categoryId,
      price,
      qtyInStock,
      reorderLevel: 5,
      createdBy: 'administrator',
    })),
  );

  for (const product of await models.Product.findAll()) {
    await models.StockMovement.create({
      id: `stk_seed_${product.id}`,
      productId: product.id,
      type: 'initial_stock',
      quantityChange: Number(product.qtyInStock),
      reason: 'Seeded initial stock',
      referenceType: 'product',
      referenceId: product.id,
      createdBy: 'administrator',
    });
  }

  for (const saleData of sales) {
    let totalAmount = 0;

    const saleItems = [];
    for (const [productId, qty] of saleData.items) {
      const product = await models.Product.findByPk(productId);
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * qty;
      saleItems.push({
        id: `sli_seed_${saleData.id}_${productId}`,
        saleId: saleData.id,
        productId,
        qty,
        unitPrice,
        lineTotal: unitPrice * qty,
      });

      await product.update({ qtyInStock: Number(product.qtyInStock) - qty });
      await models.StockMovement.create({
        id: `stk_seed_${saleData.id}_${productId}`,
        productId,
        type: 'sale_adjustment',
        quantityChange: -qty,
        reason: 'Seeded sale',
        referenceType: 'sale',
        referenceId: saleData.id,
        createdBy: 'administrator',
      });
    }

    await models.Sale.create({
      id: saleData.id,
      saleDate: saleData.saleDate,
      customerId: saleData.customerId,
      createdBy: 'administrator',
      totalAmount,
      amountPaid: saleData.amountPaid,
      balance: saleData.amountPaid - totalAmount,
    });
    await models.SaleItem.bulkCreate(saleItems);
  }

  return { created: true };
}
