import { DataTypes, Model } from 'sequelize';

export class SaleItem extends Model {
  toJSON() {
    return {
      id: this.id,
      saleId: this.saleId,
      productId: this.productId,
      product: this.product?.toJSON?.() ?? this.product ?? null,
      qty: Number(this.qty),
      unitPrice: Number(this.unitPrice),
      lineTotal: Number(this.lineTotal),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static initModel(sequelize) {
    SaleItem.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        saleId: {
          type: DataTypes.STRING(40),
          allowNull: false,
          field: 'sale_id',
        },
        productId: {
          type: DataTypes.STRING(40),
          allowNull: false,
          field: 'product_id',
        },
        qty: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        unitPrice: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          field: 'unit_price',
        },
        lineTotal: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          field: 'line_total',
        },
      },
      {
        sequelize,
        modelName: 'SaleItem',
        tableName: 'sale_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return SaleItem;
  }

  static associate(models) {
    SaleItem.belongsTo(models.Sale, {
      foreignKey: 'saleId',
      as: 'sale',
    });
    SaleItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  }
}

export default SaleItem;
