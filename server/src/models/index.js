import AuditLog from './audit-log.model.js';
import Category from './category.model.js';
import Customer from './customer.model.js';
import PasswordResetToken from './password-reset-token.model.js';
import Product from './product.model.js';
import SaleItem from './sale-item.model.js';
import Sale from './sale.model.js';
import StockMovement from './stock-movement.model.js';
import User from './user.model.js';

export const models = {};

export function initModels(sequelize) {
  models.User = User.initModel(sequelize);
  models.PasswordResetToken = PasswordResetToken.initModel(sequelize);
  models.Category = Category.initModel(sequelize);
  models.Product = Product.initModel(sequelize);
  models.Customer = Customer.initModel(sequelize);
  models.Sale = Sale.initModel(sequelize);
  models.SaleItem = SaleItem.initModel(sequelize);
  models.StockMovement = StockMovement.initModel(sequelize);
  models.AuditLog = AuditLog.initModel(sequelize);

  Object.values(models).forEach((model) => {
    model.associate?.(models);
  });

  return models;
}
