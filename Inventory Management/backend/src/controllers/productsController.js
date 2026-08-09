
const db = require('../config/db.js');

const getAllProducts = async (req, res) => {
  try {
    // 1. Jalankan Query ke database menggunakan await
    const result = await db.query(`
      SELECT 
      i.id AS item_id,
      c.brand,
      c.casting_name,
      c.scale,
      c.series,
      c.release_year,
      i.purchase_price,
      i.selling_price,
      i.category,
      i.status,
      i.condition_card,
      i.condition_bubble
      FROM items i
      JOIN catalogs c ON i.catalog_id = c.id;
    `);

    // 2. result.rows berisi array of objects data dari database
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
}

const getProductsFiltered = (req, res) => {
  const { segment, status } = req.query;

  const filtered = products.filter(
    product => (product.segment === segment && product.status === status)
  )

  res.json(filtered);
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await db.query(
      `SELECT 
      i.id AS item_id,
      c.brand,
      c.casting_name,
      c.scale,
      c.series,
      i.purchase_price,
      i.selling_price,
      i.category,
      i.status,
      i.condition_card,
      i.condition_bubble
      FROM items i
      JOIN catalogs c ON i.catalog_id = c.id
      WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' })
    }

    // Ambil baris pertama (index 0)
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Gagal mengambil data produk' })
  }
}

const addProduct = async (req, res) => {
  try {
    const {
      brand,
      casting_name,
      scale,
      series,
      release_year,
      condition_card,
      condition_bubble,
      purchase_price,
      selling_price,
      category,
      status
    } = req.body;

    // 2. Validasi field
    if (!brand || !casting_name || !purchase_price) {
      return res.status(400).json({ error: 'Brand, Nama Casting, dan Harga Beli wajib diisi!' });
    }

    // 3. Step A: Insert ke tabel catalogs & dapatkan ID-nya
    const catalogResult = await db.query(
      `INSERT INTO catalogs (brand, casting_name, scale, series, release_year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [brand, casting_name, scale || '1:64', series, release_year]
    );

    const newCatalogId = catalogResult.rows[0].id;

    // 4. Step B: Insert ke tabel items menggunakan catalog_id baru
    const itemResult = await db.query(
      `INSERT INTO items (catalog_id, condition_card, condition_bubble, purchase_price, selling_price, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        newCatalogId,
        condition_card || 'MINT',
        condition_bubble || 'MINT',
        purchase_price,
        selling_price,
        category || 'FOR_SALE',
        status || 'AVAILABLE'
      ]
    );

    // 5. Kirim res sukses
    res.status(201).json({
      message: 'Produk berhasil ditambahkan',
      product: itemResult.rows[0]
    });

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
}

const updateProducts = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { // Field dari Catalogs
      brand,
      casting_name,
      scale,
      series,
      release_year,
      // Field dari Items
      purchase_price,
      selling_price,
      category,
      status,
      condition_card,
      condition_bubble
    } = req.body;

    // 1. Cek apakah barangnya ada & dapatkan catalog_id-nya
    const itemCheck = await db.query('SELECT catalog_id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan di database' });
    }
    const catalogId = itemCheck.rows[0].catalog_id;

    // 2. Update tabel Catalogs
    await db.query(`
      UPDATE catalogs
      SET 
        brand = COALESCE($1, brand),
        casting_name = COALESCE($2, casting_name),
        scale = COALESCE($3, scale),
        series = COALESCE($4, series),
        release_year = COALESCE($5, release_year),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [brand, casting_name, scale, series, release_year, catalogId]);

    // 3. Update tabel Items    
    await db.query(`
      UPDATE items
    SET
    purchase_price = COALESCE($1, purchase_price),
      selling_price = COALESCE($2, selling_price),
      category = COALESCE($3, category),
      status = COALESCE($4, status),
      condition_card = COALESCE($5, condition_card),
      condition_bubble = COALESCE($6, condition_bubble),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      `, [purchase_price, selling_price, category, status, condition_card, condition_bubble, id]);


    // 4. Ambil data terbaru gabungan setelah diupdate
    const updatedResult = await db.query(`
      SELECT 
        i.id AS item_id,
        c.brand,
        c.casting_name,
        c.scale,
        c.series,
        c.release_year,
        i.purchase_price,
        i.selling_price,
        i.category,
        i.status,
        i.condition_card,
        i.condition_bubble
      FROM items i
      JOIN catalogs c ON i.catalog_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (updatedResult.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json({
      message: 'Produk berhasil diupdate!',
      product: updatedResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Gagal update produk' })
  }
}

const deleteProducts = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await db.query(`
    DELETE FROM items WHERE id = $1 RETURNING * `,
      [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json({
      message: 'Produk berhasil dihapus',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Gagal menghapus produk' })
  }
}

module.exports = {
  getAllProducts,
  getProductsFiltered,
  getProductById,
  addProduct,
  updateProducts,
  deleteProducts
}