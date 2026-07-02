import { DataTypes, Model } from 'sequelize';

export class Customer extends Model {
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static initModel(sequelize) {
    Customer.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(140),
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(40),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(160),
          allowNull: true,
          validate: {
            isEmailOrBlank(value) {
              if (!value) {
                return;
              }

              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                throw new Error('Email must be valid');
              }
            },
          },
        },
      },
      {
        sequelize,
        modelName: 'Customer',
        tableName: 'customers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return Customer;
  }

  static associate(models) {
    Customer.hasMany(models.Sale, {
      foreignKey: 'customerId',
      as: 'sales',
    });
  }
}

export default Customer;
