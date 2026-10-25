# Dokumen Kebutuhan Pengguna (User Requirements)
## Proyek: Xeloz Diecast Management System

Dokumen ini mendefinisikan batasan, kebutuhan fungsional, dan aturan bisnis untuk aplikasi inventaris koleksi dan penjualan diecast (skala 1:64) berbasis PERN Stack (PostgreSQL, Express.js, React, Node.js).

---

## 1. Peran Pengguna (Roles & Access Control)

| Peran | Deskripsi | Hak Akses Utama |
| :--- | :--- | :--- |
| **Admin / Owner** | Pemilik koleksi dan pengelola toko diecast. | Login dengan PIN/Password, kelola inventaris (tambah, edit, hapus), melihat harga beli (HPP), mencatat transaksi penjualan, melihat laba/rugi. |
| **Publik / Buyer** *(Fase Lanjutan)* | Pengunjung atau calon pembeli etalase. | Melihat katalog item berstatus `FOR_SALE`, melihat foto & kondisi card/bubble, melihat harga jual. **Dilarang keras melihat harga modal (HPP) dan profit.** |

---

## 2. Kebutuhan Fungsional (Functional Requirements)

### Modul A: Autentikasi & Keamanan (Auth)
* **FR-A1:** Admin dapat login dengan kombinasi `username` dan `pinPassword`.
* **FR-A2:** Sistem memvalidasi kecocokan password menggunakan `bcrypt` terhadap hash yang tersimpan di PostgreSQL.
* **FR-A3:** Jika kredensial valid, sistem menerbitkan JSON Web Token (JWT) yang berlaku selama kurun waktu tertentu (misal 1 hari).
* **FR-A4:** Endpoint backend untuk aksi penambahan, pengubahan, penghapusan produk, dan pencatatan transaksi wajib diproteksi oleh middleware verifikasi JWT.

### Modul B: Manajemen Katalog & Inventaris (Products & Items)
* **FR-B1:** Admin dapat melihat daftar seluruh koleksi diecast beserta relasi katalognya (Brand, Casting, Series, Skala, Tahun Rilis).
* **FR-B2:** Admin dapat menambahkan item baru ke inventaris lengkap dengan harga beli, harga jual target, kondisi blister (`condition_card`, `condition_bubble`), dan status item.
* **FR-B3:** Admin dapat memperbarui detail item (harga, kondisi, atau status).
* **FR-B4:** Admin dapat memfilter item berdasarkan status (`FOR_SALE`, `ON_BOOK`, `SOLD`, `IN_COLLECTION`) dan merek/casting langsung melalui query database.

### Modul C: Pencatatan Transaksi Penjualan (Point of Sale)
* **FR-C1:** Admin dapat mencatat penjualan item diecast dengan memilih `item_id`, `platform` (SHOPEE, FB_COD, IG, OTHER), dan `actual_selling_price`.
* **FR-C2:** Sistem memverifikasi bahwa item berstatus `AVAILABLE` / `FOR_SALE` sebelum transaksi diproses.
* **FR-C3:** Sistem secara atomik (dalam 1 transaksi SQL):
  1. Menghitung `profit = actual_selling_price - purchase_price`.
  2. Mengubah status item menjadi `SOLD`.
  3. Memasukkan riwayat ke tabel `transactions`.
* **FR-C4:** Admin dapat melihat riwayat semua transaksi penjualan beserta rincian profit per transaksi.

---

## 3. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Integritas Data (ACID):** Operasi penjualan wajib dibungkus dalam blok transaksi database (`BEGIN ... COMMIT ... ROLLBACK`) untuk mencegah inkonsistensi stok saat terjadi gangguan jaringan/server.
2. **Keamanan Kredensial:** Password admin tidak boleh disimpan mentah (*plain text*), wajib menggunakan teknik *one-way salted hash* (Bcrypt, salt rounds minimal 10).
3. **Pencegahan SQL Injection:** Seluruh query ke PostgreSQL wajib menggunakan *parameterized queries* (contoh: `$1, $2`), dilarang menggabungkan string langsung (*string concatenation*).
4. **Respon API yang Terprediksi:** Setiap endpoint wajib mengembalikan struktur status HTTP yang standar (200, 201, 400, 401, 404, 500) dengan pesan error yang informatif.

---

## 4. Batasan & Penanganan Kasus Khusus (Edge Cases)

* **Penghapusan Item yang Memiliki Riwayat Transaksi:** Database PostgreSQL menggunakan aturan foreign key `ON DELETE RESTRICT` pada tabel `transactions`. Item yang sudah laku terjual **tidak boleh dihapus secara permanen** dari database karena akan merusak data audit keuangan. Jika ingin diarsipkan, gunakan mekanisme pembaruan status.
* **Pemisahan Data Sensitif:** Endpoint publik yang menyajikan etalase produk tidak boleh menyertakan kolom `purchase_price` pada respon JSON.
