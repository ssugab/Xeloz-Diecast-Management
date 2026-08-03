
const db = require('../config/db.js');

const getAllProducts = async (req, res) => {
  try {
    const resutl = await db.query('SELECT * FROM items ORDER BY id ASC');

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

    const result = await db.query('SELECT * FROM items WHERE id = $1', [id])

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
  const { name, merk, kategori, skala, harga, stok, gambar_url } = req.body;

  if (!name || !merk || !kategori || !skala || !harga || !stok || !gambar_url) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const newProduct = {
    id: products.length ? (products[products.length - 1].id || Date.now()) + 1 : 1,
    name,
    merk,
    kategori,
    skala,
    harga,
    stok,
    gambar_url,
    status: 'available'
  }

  products.push(newProduct);

  res.status(201).json({ message: 'Produk berhasil ditambahkan', product: newProduct });

}

const updateProducts = (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });

  const { name, merk, kategori, skala, harga, stok, gambar_url, status } = req.body;
  if (name !== undefined) product.name = name;
  if (merk !== undefined) product.merk = merk;
  if (kategori !== undefined) product.kategori = kategori;
  if (skala !== undefined) product.skala = skala;
  if (harga !== undefined) product.harga = harga;
  if (stok !== undefined) product.stok = stok;
  if (gambar_url !== undefined) product.gambar_url = gambar_url;
  if (status !== undefined) product.status = status;

  res.json({ message: 'Produk berhasil diperbarui', product });
}

const deleteProducts = (req, res) => {
  const id = parseInt(req.params.id);

  const productIndex = products.findIndex(product => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.json({ message: 'Produk berhasil dihapus', product: deletedProduct });
}

module.exports = {
  getAllProducts,
  getProductsFiltered,
  getProductById,
  addProduct,
  updateProducts,
  deleteProducts
}