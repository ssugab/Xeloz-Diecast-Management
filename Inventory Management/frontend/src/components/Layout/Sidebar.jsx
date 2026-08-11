import { Link, useLocation } from 'react-router-dom';
import { User, LayoutDashboard, PackageSearch, ReceiptText, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  // Highlight menu dengan gaya Sidebar (background dan border kiri)
  const isActive = (path) => {
    return location.pathname === path
      ? "bg-purple/20 text-main border-l-4 border-purple"
      : "text-gray-400 hover:bg-dark hover:text-main border-l-4 border-transparent transition-colors";
  };

  return (
    // Lebar statis (w-64), tinggi penuh layar (h-screen), posisi tetap (sticky)
    <aside className="w-64 h-screen sticky top-0 bg-[#1A1A1D] flex flex-col shadow-2xl">

      {/* Header Sidebar (Logo) */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="w-10 h-10 bg-purple rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/Frame 1.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold text-main font-golos">
          Xeloz Diecast
        </span>
      </div>

      {/* Area Menu Navigasi Utama (Vertikal) */}
      <div className="flex-1 py-6 flex flex-col gap-2 font-stack">
        <Link to="/" className={`flex items-center gap-3 px-6 py-3 ${isActive('/')}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/products" className={`flex items-center gap-3 px-6 py-3 ${isActive('/products')}`}>
          <PackageSearch size={20} />
          <span>Katalog</span>
        </Link>
        <Link to="/transactions" className={`flex items-center gap-3 px-6 py-3 ${isActive('/transactions')}`}>
          <ReceiptText size={20} />
          <span>Transaksi</span>
        </Link>
      </div>

      {/* Area Bawah (User/Settings) */}
      <div className="p-6 border-t border-gray-800">
        <Link to="/settings" className="flex items-center gap-3 text-gray-400 hover:text-main transition-colors mb-6 font-stack">
          <Settings size={20} />
          <span>Pengaturan</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-dark p-3 rounded-xl border border-gray-800">
          <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center text-purple">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-main">Sasha Admin</p>
            <p className="text-xs text-green-400">● Online</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
