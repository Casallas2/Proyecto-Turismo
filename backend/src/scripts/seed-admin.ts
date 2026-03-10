/**
 * Crea un usuario administrador si no existe.
 * Uso: npm run seed:admin
 * Credenciales por defecto: admin@example.com / Admin123!
 */
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';
const DEFAULT_ADMIN_NAME = 'Administrador';

async function seedAdmin() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '123456',
    database: process.env.DB_NAME ?? 'proyecto_turismo',
  });

  await client.connect();

  const res = await client.query(
    `SELECT id, role FROM users WHERE email = $1`,
    [DEFAULT_ADMIN_EMAIL],
  );

  if (res.rows.length > 0) {
    const row = res.rows[0];
    if (row.role === 'ADMIN') {
    } else {
      await client.query(
        `UPDATE users SET role = 'ADMIN'::user_role, updated_at = NOW() WHERE id = $1`,
        [row.id],
      );
    }
    await client.end();
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await client.query(
    `INSERT INTO users (full_name, email, password_hash, role, language, created_at, updated_at)
     VALUES ($1, $2, $3, 'ADMIN'::user_role, 'ES'::user_language, NOW(), NOW())`,
    [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, passwordHash],
  );

  await client.end();
}

seedAdmin().catch((err) => {
  console.error('Error creando admin:', err);
  process.exit(1);
});
