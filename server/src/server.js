import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { closeDatabase, initializeDatabase } from './database/sequelize.js';
import { logger } from './utils/logger.js';

let server;

try {
  await initializeDatabase();

  server = http.createServer(app);
  server.on('error', async (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${env.PORT} is already in use. Stop the process using that port or start this server with a different PORT value.`);
    } else {
      logger.error('HTTP server failed', error);
    }

    await closeDatabase();
    process.exit(1);
  });

  server.listen(env.PORT, () => {
    logger.info(`${env.APP_NAME} listening on port ${env.PORT}`);
  });
} catch (error) {
  logger.error('Failed to start server', error);
  process.exit(1);
}

function shutdown(signal) {
  logger.info(`${signal} received. Closing HTTP server.`);

  if (!server) {
    process.exit(0);
  }

  server.close(async (error) => {
    if (error) {
      logger.error('HTTP server closed with an error', error);
      process.exit(1);
    }

    await closeDatabase();
    logger.info('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
