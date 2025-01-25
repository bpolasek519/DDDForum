import pool from './db';

console.log('PG_PASSWORD:', process.env.PG_PASSWORD);

const createTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        password VARCHAR(255) NOT NULL
    );`
    
    try {
        await pool.query(createTableQuery);
        console.log('Table created or already exists')
    } catch (error) {
        console.error('Error creating table', error)
    } finally {
        await pool.end()
    }
}

createTable()
