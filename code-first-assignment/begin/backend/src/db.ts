import { Pool } from 'pg';
import dotenv from 'dotenv'

dotenv.config();

// Create a pool with the DB config
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.PG_PASSWORD,
    port: 5432
})

// Export the pool instance
export default pool;