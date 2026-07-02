import { DataTypes, Model } from 'sequelize';

export class StockMovement extends Model {
  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      type: this.type,
      quantityChange: Number(this.quantityChange),
      reason: this.reason,
      referenceType: this.referenceType,
      referenceId: this.referenceId,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static initModel(sequelize) {
    StockMovement.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        productId: {
          type: DataTypes.STRING(40),
          allowNull: false,
          field: 'product_id',
        },
        type: {
          type: DataTypes.STRING(40),
          allowNull: false,
        },
        quantityChange: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'quantity_change',
        },
        reason: {
          type: DataTypes.STRING(180),
          allowNull: true,
        },
        referenceType: {
          type: DataTypes.STRING(40),
          allowNull: true,
          field: 'reference_type',
        },
        referenceId: {
          type: DataTypes.STRING(40),
          allowNull: true,
          field: 'reference_id',
        },
        createdBy: {
          type: DataTypes.STRING(120),
          allowNull: true,
          field: 'created_by',
        },
      },
      {
        sequelize,
        modelName: 'StockMovement',
        tableName: 'stock_movements',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return StockMovement;
  }

  static associate(models) {
    StockMovement.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  }
}

export default StockMovement;
