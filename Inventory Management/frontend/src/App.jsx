import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Transactions from './pages/Transactions'
import Auth from './pages/Auth'
import Settings from './pages/Settings'

import Sidebar from './components/Layout/Sidebar'

function App() {
  return (
    <BrowserRouter>
      {/* Ubah flex-col menjadi flex saja (otomatis menyamping Kiri-Kanan) */}
      <div className="min-h-screen flex bg-offwhite">

        {/* Sidebar di Kiri */}
        <Sidebar />

        {/* Konten Utama di Kanan */}
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App
