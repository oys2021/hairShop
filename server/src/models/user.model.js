import { DataTypes, Model } from 'sequelize';

export class User extends Model {
  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  static initModel(sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(80),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(160),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        passwordHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'password_hash',
        },
        role: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'staff',
        },
        status: {
          type: DataTypes.STRING(30),
          allowNull: false,
          defaultValue: 'active',
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          {
            unique: true,
            fields: ['username'],
          },
          {
            unique: true,
            fields: ['email'],
          },
        ],
      },
    );

    return User;
  }

  static associate(models) {
    User.hasMany(models.PasswordResetToken, {
      foreignKey: 'userId',
      as: 'passwordResetTokens',
    });
  }
}

export default User;
