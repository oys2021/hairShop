import { DataTypes, Model } from 'sequelize';

export class Sale extends Model {
  toJSON() {
    return {
      id: this.id,
      saleDate: this.saleDate,
      customerId: this.customerId,
      customer: this.customer?.toJSON?.() ?? this.customer ?? null,
      createdBy: this.createdBy,
      totalAmount: Number(this.totalAmount),
      amountPaid: Number(this.amountPaid),
      balance: Number(this.balance),
      items: this.items?.map((item) => item.toJSON()) ?? [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static initModel(sequelize) {
    Sale.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        saleDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'sale_date',
        },
        customerId: {
          type: DataTypes.STRING(40),
          allowNull: true,
          field: 'customer_id',
        },
        createdBy: {
          type: DataTypes.STRING(120),
          allowNull: true,
          field: 'created_by',
        },
        totalAmount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
          field: 'total_amount',
        },
        amountPaid: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
          field: 'amount_paid',
        },
        balance: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'Sale',
        tableName: 'sales',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return Sale;
  }

  static associate(models) {
    Sale.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer',
    });
    Sale.hasMany(models.SaleItem, {
      foreignKey: 'saleId',
      as: 'items',
      onDelete: 'CASCADE',
    });
  }
}

export default Sale;
