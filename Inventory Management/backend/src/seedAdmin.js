require('dotenv').config();

const bcrypt = require('bcrypt');
const db = require('./config/db');
// Mengambil koneksi DB yg sudah ada

const seedAdmin = async () => {
    try {
        const username = 'postgres';
        const pinPassword = '1234';

        // 1. Hashing Pin
        const saltRounds = 10;

        console.log(`Meng Hashing Pin: ${pinPassword}...`)

        const hashedPass = await bcrypt.hash(pinPassword, saltRounds);

        console.log('Menyimpan ke database..')

        await db.query(
            `INSERT INTO users(username, password_hash, created_at)
            VALUES ($1, $2, $3)
            `,
            [username, hashedPass, new Date()]
        );

        console.log(` Admin berhasil dibuat! `);
        console.log(` Username: ${username}`)
        console.log(` Hashed Pass: ${hashedPass}`);

    } catch (error) {
        console.error('Gagal membuat Admin: ', error);
    } finally {
        process.exit();
    }
};

seedAdmin();

