import { DataTypes, Model } from 'sequelize';

export class AuditLog extends Model {
  toJSON() {
    return {
      id: this.id,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      userId: this.userId,
      userUsername: this.user?.username ?? 'Unknown',
      changes: this.changes ? JSON.parse(this.changes) : null,
      ipAddress: this.ipAddress,
      createdAt: this.createdAt,
    };
  }

  static initModel(sequelize) {
    AuditLog.init(
      {
        id: {
          type: DataTypes.STRING(40),
          primaryKey: true,
          allowNull: false,
        },
        action: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: 'login, logout, create, update, delete, upload, etc.',
        },
        entityType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'entity_type',
          comment: 'product, sale, customer, user, category, etc.',
        },
        entityId: {
          type: DataTypes.STRING(40),
          allowNull: true,
          field: 'entity_id',
          comment: 'id of the affected record',
        },
        userId: {
          type: DataTypes.STRING(40),
          allowNull: true,
          field: 'user_id',
        },
        changes: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'JSON object of what changed',
        },
        ipAddress: {
          type: DataTypes.STRING(45),
          allowNull: true,
          field: 'ip_address',
        },
      },
      {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
          {
            fields: ['user_id'],
          },
          {
            fields: ['entity_type', 'entity_id'],
          },
          {
            fields: ['action'],
          },
          {
            fields: ['created_at'],
          },
        ],
      },
    );

    return AuditLog;
  }

  static associate(models) {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default AuditLog;
