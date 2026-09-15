import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar  from '@/components/Navbar';
import Dashboard     from '@/pages/Dashboard';
import SalesReport   from '@/pages/SalesReport';
import CustomerList  from '@/pages/CustomerList';
import ProductCatalog from '@/pages/ProductCatalog';

// Placeholder pages
function Analytics() {
  return (
    <div className="page-container">
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h2>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          SQL-powered deep-dive reports — coming soon
        </p>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="page-container">
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-lg font-semibold text-white mb-2">Settings</h2>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          System configuration — coming soon
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="main-content flex-1">
          {/* Fixed top navbar */}
          <Navbar />

          {/* Page routes */}
          <Routes>
            <Route path="/"          element={<Dashboard />}     />
            <Route path="/sales"     element={<SalesReport />}   />
            <Route path="/customers" element={<CustomerList />}  />
            <Route path="/products"  element={<ProductCatalog />}/>
            <Route path="/analytics" element={<Analytics />}     />
            <Route path="/settings"  element={<Settings />}      />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
