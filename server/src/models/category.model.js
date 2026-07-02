import { DataTypes, Model } from 'sequelize';

export class Category extends Model {
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static initModel(sequelize) {
    Category.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
          unique: true,
        },
        code: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        createdBy: {
          type: DataTypes.STRING(120),
          allowNull: true,
          field: 'created_by',
        },
      },
      {
        sequelize,
        modelName: 'Category',
        tableName: 'categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return Category;
  }

  static associate(models) {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products',
    });
  }
}

export default Category;
