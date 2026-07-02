# HairMart POS Backend

ES module Express backend skeleton with layered controllers, services, repositories, Sequelize models, and seeders.

## Scripts

```powershell
npm install
npm run dev
npm run seed:admin
npm test
```

## Database

Local testing uses Sequelize with SQLite storage.

Default database file:

```text
server/data/kalon-pos.sqlite
```

The app initializes Sequelize models with `sequelize.sync()` and seeds the admin account plus demo catalog data on first startup:

```json
{
  "username": "administrator",
  "password": "password"
}
```

You can also run the admin seed manually:

```powershell
npm run seed:admin
```

SQLite config:

```env
DB_DIALECT=sqlite
DB_STORAGE=./data/kalon-pos.sqlite
```

For PostgreSQL later, install the `pg` driver and switch the env values:

```env
DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=hairmart_pos
DB_USER=postgres
DB_PASSWORD=your-password
```

Override the first admin credentials with environment variables:

```powershell
$env:ADMIN_USERNAME="admin"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="change-me"
$env:ADMIN_ROLE="owner"
npm run seed:admin
```

Health endpoint:

```text
GET http://localhost:5090/api/v1/health
```

Authentication endpoints:

```text
POST http://localhost:5090/api/v1/auth/login
POST http://localhost:5090/api/v1/auth/forgot-password
POST http://localhost:5090/api/v1/auth/reset-password
GET  http://localhost:5090/api/v1/auth/me
POST http://localhost:5090/api/v1/auth/logout
```

Feature endpoints:

```text
GET  http://localhost:5090/api/v1/dashboard
GET  http://localhost:5090/api/v1/products
POST http://localhost:5090/api/v1/products
GET  http://localhost:5090/api/v1/products/:id
PUT  http://localhost:5090/api/v1/products/:id
GET  http://localhost:5090/api/v1/categories
POST http://localhost:5090/api/v1/categories
PUT  http://localhost:5090/api/v1/categories/:id
GET  http://localhost:5090/api/v1/customers
POST http://localhost:5090/api/v1/customers
PUT  http://localhost:5090/api/v1/customers/:id
GET  http://localhost:5090/api/v1/sales
POST http://localhost:5090/api/v1/sales
GET  http://localhost:5090/api/v1/sales/:id
PUT  http://localhost:5090/api/v1/sales/:id
GET  http://localhost:5090/api/v1/users
POST http://localhost:5090/api/v1/users
PUT  http://localhost:5090/api/v1/users/:id
DELETE http://localhost:5090/api/v1/users/:id
```

Seed login for local testing:

```json
{
  "username": "administrator",
  "password": "password"
}
```

Auth strategy:

- The browser receives an HTTP-only session cookie.
- The server stores a JWT inside that session.
- Protected routes verify the JWT from `req.session.auth.token`.
- In production, configure strong `SESSION_SECRET`, `JWT_SECRET`, HTTPS, and a durable session store such as Redis.

## Structure

```text
src/
  app.js
  server.js
  config/
  controllers/
  database/
  middlewares/
  models/
  repositories/
  seeders/
  routes/
  services/
  utils/
tests/
```

Current feature layers:

- `src/routes/health.routes.js`
- `src/controllers/health.controller.js`
- `src/services/health.service.js`
- `src/repositories/health.repository.js`
- `src/routes/auth.routes.js`
- `src/controllers/auth.controller.js`
- `src/services/auth.service.js`
- `src/repositories/auth.repository.js`
- `src/routes/product.routes.js`
- `src/routes/category.routes.js`
- `src/routes/customer.routes.js`
- `src/routes/sale.routes.js`
- `src/routes/user.routes.js`
- `src/routes/dashboard.routes.js`
- `src/models/user.model.js`
- `src/models/product.model.js`
- `src/models/category.model.js`
- `src/models/customer.model.js`
- `src/models/sale.model.js`
- `src/models/sale-item.model.js`
- `src/models/stock-movement.model.js`
- `src/database/sequelize.js`
- `src/seeders/admin.seeder.js`
- `src/seeders/demo-data.seeder.js`
