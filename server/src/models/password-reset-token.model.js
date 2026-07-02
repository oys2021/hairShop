import { DataTypes, Model } from 'sequelize';

export class PasswordResetToken extends Model {
  static initModel(sequelize) {
    PasswordResetToken.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.STRING(40),
          allowNull: false,
          field: 'user_id',
        },
        tokenHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'token_hash',
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'expires_at',
        },
        usedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'used_at',
        },
      },
      {
        sequelize,
        modelName: 'PasswordResetToken',
        tableName: 'password_reset_tokens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return PasswordResetToken;
  }

  static associate(models) {
    PasswordResetToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default PasswordResetToken;
