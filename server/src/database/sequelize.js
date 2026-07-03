import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
import { initModels, models } from '../models/index.js';
import { seedAdministrator } from '../seeders/admin.seeder.js';
import { seedDemoData } from '../seeders/demo-data.seeder.js';
import nodeSqliteDialect from './node-sqlite-dialect.js';

function createSequelize() {
  const commonOptions = {
    logging: env.DB_LOGGING ? console.log : false,
    define: {
      freezeTableName: true,
    },
  };

  if (env.DB_DIALECT === 'sqlite') {
    fs.mkdirSync(path.dirname(env.DB_STORAGE), { recursive: true });

    return new Sequelize({
      ...commonOptions,
      dialect: 'sqlite',
      storage: env.DB_STORAGE,
      dialectModule: nodeSqliteDialect,
    });
  }

  const dialectOptions = env.DB_SSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {};

  if (env.DATABASE_URL) {
    return new Sequelize(env.DATABASE_URL, {
      ...commonOptions,
      dialect: env.DB_DIALECT,
      dialectOptions,
    });
  }

  return new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    ...commonOptions,
    dialect: env.DB_DIALECT,
    dialectOptions,
    host: env.DB_HOST,
    port: env.DB_PORT,
  });
}

export const sequelize = createSequelize();
initModels(sequelize);

let initialized = false;
let initializationPromise = null;

export async function initializeDatabase({ seed = true } = {}) {
  if (initialized) {
    return sequelize;
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      await sequelize.authenticate();

      try {
        await sequelize.sync({ alter: env.DB_SYNC_ALTER });
      } catch (error) {
        if (env.DB_SYNC_ALTER && error?.name === 'SequelizeDatabaseError') {
          console.warn('Database alter sync failed. Falling back to non-alter sync.');
          await sequelize.sync();
        } else {
          throw error;
        }
      }

      if (seed) {
        await seedAdministrator();
      }

      initialized = true;
      return sequelize;
    })();
  }

  try {
    return await initializationPromise;
  } finally {
    initializationPromise = null;
  }
}

export async function closeDatabase() {
  if (initialized) {
    await sequelize.close();
  }

  initialized = false;
  initializationPromise = null;
}

export { models };
