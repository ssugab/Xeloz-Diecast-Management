import { useState, useEffect } from 'react';
import { PackageSearch, Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // kontrol modal Create product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State untuk menampung data form input
  const [formData, setFormData] = useState({
    brand: '',
    casting_name: '',
    scale: '1:64',
    series: '',
    release_year: new Date().getFullYear(),
    purchase_price: '',
    selling_price: '',
    stock: 1,
    status: 'FOR_SALE',
    condition_card: 'MINT',
    condition_bubble: 'MINT'
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null)

  const openEditModal = (item) => {
    // 1. Saaveee the product id
    setSelectedId(item.item_id)

    // 2. timpa state FORMDATA dgn data MENTAH dari DB baris ini
    setFormData({
      brand: item.brand,
      casting_name: item.casting_name,
      scale: item.scale,
      series: item.series,
      release_year: item.release_year,
      purchase_price: item.purchase_price,
      selling_price: item.selling_price,
      stock: item.stock,
      status: item.status,
      condition_card: item.condition_card,
      condition_bubble: item.condition_bubble
    })

    // 3. Buka modalnyaaa
    setIsEditMode(true);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FOR_SALE': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">Dijual</span>;
      case 'ON_BOOK': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">Di-booking</span>;
      case 'SOLD': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">Terjual</span>;
      case 'IN_COLLECTION': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple/20 text-purple">Koleksi Pribadi</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const fetchProducts = async () => {
    try {
      // Menarik data dari Back End
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logika pencarian: Cocokkan teks dengan Nama Item atau Merk
  const filteredProducts = products.filter(item =>
    item.casting_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CREATE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah browser refresh saat form disubmit
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Memberitahu Express bahwa kita mengirim JSON
        },
        body: JSON.stringify(formData), // Mengubah objek State menjadi string JSON
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan produk');
      }

      // Jika sukses:
      setIsModalOpen(false); // 1. Tutup Modal
      fetchProducts();       // 2. Tarik ulang data agar tabel update

      // 3. Kosongkan form kembali
      setFormData({
        brand: '', casting_name: '', scale: '1:64', series: '', release_year: new Date().getFullYear(),
        purchase_price: '', selling_price: '', stock: 1, status: 'FOR_SALE', condition_card: 'MINT', condition_bubble: 'MINT'
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE PRODUCTS
  const handleEdit = async (e) => {
    e.preventDefault(); // Mencegah browser refresh saat form disubmit
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/products/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', // Memberitahu Express bahwa kita mengirim JSON
        },
        body: JSON.stringify(formData), // Mengubah objek State menjadi string JSON
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan produk');
      }

      // Jika sukses:
      setIsEditMode(false); // 1. Tutup Modal
      fetchProducts();       // 2. Tarik ulang data agar tabel update

      // 3. Kosongkan form kembali
      setFormData({
        brand: '', casting_name: '', scale: '1:64', series: '', release_year: new Date().getFullYear(),
        purchase_price: '', selling_price: '', stock: 1, status: 'FOR_SALE', condition_card: 'MINT', condition_bubble: 'MINT'
      });

    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-purple animate-pulse flex flex-col items-center gap-4">
          <PackageSearch size={48} />
          <p className="font-charon text-lg">Memuat Data Diecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg font-charon">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl mx-auto">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-golos font-bold text-dark mb-2">Katalog Diecast</h1>
          <p className="text-gray-400 font-stack">Total Inventaris: {products.length} diecast</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple hover:bg-purple/80 text-main px-4 py-2 rounded-lg font-stack flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Tambah Diecast
        </button>

      </div>

      {/* Search Bar Section */}
      <div className="mb-5 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari nama item atau merk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-dark font-stack focus:outline-none focus:ring-2 focus:ring-purple/50 focus:border-purple transition-all shadow-sm"
          />
        </div>
      </div>


      {/* Tabel Data (Grid Layout) */}
      <div className="bg-dark rounded-xl border border-background overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-stack">
            <thead className="bg-background text-gray-300">
              <tr>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Nama Item</th>
                <th className="p-4 font-semibold">Merk</th>
                <th className="p-4 font-semibold">Kondisi</th>
                <th className="p-4 font-semibold">Stok</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Harga Jual</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Belum ada data diecast di database.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-background/50 transition-colors text-gray-300">
                    <td className="p-4 text-xs font-mono">#{item.item_id}</td>
                    <td className="p-4 text-main font-medium">{item.casting_name}</td>
                    <td className="p-4">
                      <span className="text-sm">{item.brand}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-sm">
                        <span>Card: {item.condition_card}</span>
                        <span>Bubble: {item.condition_bubble}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-main font-mono">{item.stock}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4 text-green-400 font-mono">
                      Rp {Number(item.selling_price).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-dark hover:bg-purple/20 text-purple rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 bg-dark hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL TAMBAH PRODUK --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden font-stack">

            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark font-golos">Tambah Data Diecast</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Grid Layout untuk membagi form jadi 2 kolom */}
              <div className="grid grid-cols-2 gap-4 mb-6">

                {/* Kolom Kiri: Data Katalog */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Merk (Brand) *</label>
                    <input required type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full p-2 border rounded text-dark" placeholder="Hot Wheels, Tomica..." />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nama Item *</label>
                    <input required type="text" value={formData.casting_name} onChange={(e) => setFormData({ ...formData, casting_name: e.target.value })} className="w-full p-2 border rounded text-dark" placeholder="Nissan Skyline GT-R..." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Skala</label>
                      <input type="text" value={formData.scale} onChange={(e) => setFormData({ ...formData, scale: e.target.value })} className="w-full p-2 border rounded text-dark" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Stok *</label>
                      <input required type="number" min="1" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full p-2 border rounded text-dark" />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Keuangan & Kondisi */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Harga Beli (Rp) *</label>
                    <input required type="number" min="0" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} className="w-full p-2 border rounded text-dark" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Harga Jual (Rp) *</label>
                    <input required type="number" min="0" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })} className="w-full p-2 border rounded text-dark" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Kond. Card</label>
                      <input type="text" value={formData.condition_card} onChange={(e) => setFormData({ ...formData, condition_card: e.target.value })} className="w-full p-2 border rounded text-dark" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Kond. Bubble</label>
                      <input type="text" value={formData.condition_bubble} onChange={(e) => setFormData({ ...formData, condition_bubble: e.target.value })} className="w-full p-2 border rounded text-dark" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-purple rounded-lg">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-purple hover:bg-purple/80 rounded-lg flex items-center gap-2">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPDATE */}
      {isEditMode && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden font-stack">

            <div className="p-6 border-b border-gray-200 bg-purple flex justify-between items-center">
              <h2 className="text-xl font-bold text-white font-golos">Edit Data Diecast</h2>
            </div>

            <form onSubmit={handleEdit} className="p-4">
              {/* Grid Layout untuk membagi form jadi 2 kolom */}
              <div className="grid grid-cols-2 gap-4 mb-6">

                {/* Kolom Kiri: Data Katalog */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Merk (Brand) *</label>
                    <input required type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full p-2 border rounded text-dark" placeholder="Hot Wheels, Tomica..." />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nama Item *</label>
                    <input required type="text" value={formData.casting_name} onChange={(e) => setFormData({ ...formData, casting_name: e.target.value })} className="w-full p-2 border rounded text-dark" placeholder="Nissan Skyline GT-R..." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Skala</label>
                      <input type="text" value={formData.scale} onChange={(e) => setFormData({ ...formData, scale: e.target.value })} className="w-full p-2 border rounded text-dark" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Stok *</label>
                      <input required type="number" min="1" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full p-2 border rounded text-dark" />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Keuangan & Kondisi */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Harga Beli (Rp) *</label>
                    <input required type="number" min="0" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} className="w-full p-2 border rounded text-dark" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Harga Jual (Rp) *</label>
                    <input required type="number" min="0" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })} className="w-full p-2 border rounded text-dark" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Kond. Card</label>
                      <input type="text" value={formData.condition_card} onChange={(e) => setFormData({ ...formData, condition_card: e.target.value })} className="w-full p-2 border rounded text-dark" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Kond. Bubble</label>
                      <input type="text" value={formData.condition_bubble} onChange={(e) => setFormData({ ...formData, condition_bubble: e.target.value })} className="w-full p-2 border rounded text-dark" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsEditMode(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-purple hover:bg-purple/80 rounded-lg flex items-center gap-2">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}