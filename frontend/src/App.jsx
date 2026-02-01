import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Analytics from './pages/Analytics';
import MenuManagement from './pages/MenuManagement';
import OrdersDashboard from './pages/OrdersDashboard';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Analytics />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/orders" element={<OrdersDashboard />} />
        </Routes>
      </Layout>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e232d',
            color: '#f2f2f2',
            border: '1px solid #3a4150'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </Router>
  );
};

export default App;