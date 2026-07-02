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

  return new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    ...commonOptions,
    dialect: env.DB_DIALECT,
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
      await sequelize.sync();

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
