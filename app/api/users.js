// pages/api/users.js
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool);

export async function insertUser(email, name) {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO user_testing (email, name) VALUES ($1, $2)', [email, name]);
    console.log(`Usuario ${name} insertado con éxito`);
  } catch (error) {
    console.error("Error al insertar usuario:", error);
    throw error;
  } finally {
    client.release();
  }
}
