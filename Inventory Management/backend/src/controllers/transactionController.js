const db = require('../config/db');

// @route   POST /api/transactions
// @desc    Mencatat transaksi penjualan & mengupdate status item
// @access  Public (Sementara)

const createTransaction = async (req, res) => {
    const { item_id, platform, actual_selling_price } = req.body;

    if (!item_id || !platform || actual_selling_price === undefined) {
        return res.status(400).json({ error: 'Data tidak lengkap. Harap isi item_id, platform, dan actual_selling_price' });
    }

    const platformUpper = platform.toUpperCase();

    // Mendapatkan koneksi khusus dari pool (wajib untuk transaksi)
    const client = await db.getClient();

    try {
        // 1. Mulai transaksi SQL
        await client.query('BEGIN');

        // 2. Cek apakah item ada dan berstatus AVAILABLE
        const itemResult = await client.query(
            'SELECT * FROM items WHERE id = $1',
            [item_id]
        );

        if (itemResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Item tidak ditemukan' });
        }

        const item = itemResult.rows[0];

        if (item.status !== 'AVAILABLE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Item tidak bisa dijual. Status saat ini: ${item.status}` });
        }

        if (item.category !== 'FOR_SALE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Item ini adalah koleksi pribadi, tidak untuk dijual.' });
        }

        // 3. Hitung profit
        const profit = actual_selling_price - item.purchase_price;

        // 4. Update status item menjadi SOLD
        await client.query(
            'UPDATE items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['SOLD', item_id]
        );

        // 5. Insert ke tabel transactions
        const transactionResult = await client.query(
            `INSERT INTO transactions 
            (item_id, platform, actual_selling_price, profit) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [item_id, platformUpper, actual_selling_price, profit]
        );

        // 6. Commit transaksi
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Transaksi sukses, item berhasil terjual!',
            transaction: transactionResult.rows[0]
        });

    } catch (error) {
        // Jika ada yang gagal di langkah manapun, kembalikan semua perubahan
        await client.query('ROLLBACK');
        console.error('Error in createTransaction:', error);
        res.status(500).json({ error: 'Internal Server Error selama proses transaksi' });
    } finally {
        // Wajib mengembalikan client ke pool agar tidak bocor
        client.release();
    }
};

// @route   GET /api/transactions
// @desc    Melihat semua transaksi
// @access  Public (Sementara)
const getAllTransactions = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                t.id AS transaction_id,
                t.platform,
                t.actual_selling_price,
                t.profit,
                t.transaction_date,
                i.id AS item_id,
                c.brand,
                c.casting_name,
                c.scale
            FROM transactions t
            JOIN items i ON t.item_id = i.id
            JOIN catalogs c ON i.catalog_id = c.id
            ORDER BY t.transaction_date DESC
        `);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error in getAllTransactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createTransaction,
    getAllTransactions
};