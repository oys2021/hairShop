import bcrypt from 'bcryptjs';

export function seedAdministrator(
  database,
  {
    id = 'usr_admin_001',
    username = process.env.ADMIN_USERNAME ?? 'administrator',
    email = process.env.ADMIN_EMAIL ?? 'administrator@hairmartpos.com',
    password = process.env.ADMIN_PASSWORD ?? 'password1234',
    role = process.env.ADMIN_ROLE ?? 'admin',
    status = 'active',
  } = {},
) {
  const existing = database
    .prepare(
      `
      SELECT id, username, email, role, status
      FROM users
      WHERE lower(username) = lower(?) OR lower(email) = lower(?)
      LIMIT 1
      `,
    )
    .get(username, email);

  if (existing) {
    return {
      created: false,
      user: existing,
    };
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  database
    .prepare(
      `
      INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      id,
      username,
      email,
      passwordHash,
      role,
      status,
      now,
      now,
    );

  return {
    created: true,
    user: {
      id,
      username,
      email,
      role,
      status,
    },
  };
}

export function runSqliteSeeds(database) {
  seedAdministrator(database);
}
