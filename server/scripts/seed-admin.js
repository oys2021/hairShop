import { closeDatabase, initializeDatabase } from '../src/database/sequelize.js';
import { seedAdministrator } from '../src/seeders/admin.seeder.js';

await initializeDatabase({ seed: false });

const result = await seedAdministrator({
  username: process.env.ADMIN_USERNAME ?? 'administrator',
  email: process.env.ADMIN_EMAIL ?? 'administrator@hairmartpos.com',
  password: process.env.ADMIN_PASSWORD ?? 'password',
  role: process.env.ADMIN_ROLE ?? 'admin',
});

if (result.created) {
  console.log(`Seeded administrator: ${result.user.username} <${result.user.email}>`);
} else {
  console.log(`Administrator already exists: ${result.user.username} <${result.user.email}>`);
}

await closeDatabase();
