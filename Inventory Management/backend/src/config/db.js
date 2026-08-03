const { Pool } = require('pg');

// Konfigurasi pool via environment variables
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'xeloz_diecast',
    max: 20,                  // Maksimal koneksi simultan dalam pool
    idleTimeoutMillis: 30000, // Waktu koneksi idle sebelum ditutup
    connectionTimeoutMillis: 2000, // Timeout saat mencoba mendapatkan koneksi dari pool
});

// Handling unexpected error pada idle client
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool,
};