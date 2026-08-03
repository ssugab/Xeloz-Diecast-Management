require('dotenv').config();
const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

// Tes Koneksi Database saat Server dinyalakan
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Gagal terhubung ke PostgreSQL:', err.message);
  } else {
    console.log('✅ Berhasil terhubung ke PostgreSQL!');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});