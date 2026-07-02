import { DataTypes, Model } from 'sequelize';

export class Product extends Model {
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.categoryId,
      category: this.category?.toJSON?.() ?? this.category ?? null,
      price: Number(this.price),
      qtyInStock: Number(this.qtyInStock),
      reorderLevel: Number(this.reorderLevel),
      imageUrl: this.imageUrl,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static initModel(sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(180),
          allowNull: false,
        },
        categoryId: {
          type: DataTypes.STRING(40),
          allowNull: false,
          field: 'category_id',
        },
        price: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        qtyInStock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'qty_in_stock',
        },
        reorderLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 5,
          field: 'reorder_level',
        },
        imageUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'image_url',
        },
        createdBy: {
          type: DataTypes.STRING(120),
          allowNull: true,
          field: 'created_by',
        },
      },
      {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return Product;
  }

  static associate(models) {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Product.hasMany(models.SaleItem, {
      foreignKey: 'productId',
      as: 'saleItems',
    });
    Product.hasMany(models.StockMovement, {
      foreignKey: 'productId',
      as: 'stockMovements',
    });
  }
}

export default Product;
