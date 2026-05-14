import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState } from 'react';
import api from '@/services/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import CatalogPage from '@/pages/CatalogPage';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/admin/AdminPanel';
import KnowledgeBase from '@/pages/KnowledgeBase';
import ComponentDetailPage from '@/pages/ComponentDetailPage';
import ComponentEdit from '@/pages/admin/ComponentEdit';
import ComponentCreate from './pages/admin/ComponentCreate';
import CartPage from './pages/CartPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import PrebuiltPcCreate from './pages/admin/PrebuiltPcCreate';
import PrebuiltPcEdit from './pages/admin/PrebuiltPcEdit';
import '@/App.css';

// Компонент для защиты роутов
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-300">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const location = useLocation();
  const isAppPage = location.pathname.includes("config");
  return (
    <div>
      {!isAppPage && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/components/:id" element={<ComponentDetailPage />} />
          <Route path="/config" element={<ConfiguratorPage />} />
          
          {/* Защищённые админ-роуты */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/components/:id/edit" element={<ComponentEdit />} />
          <Route path="/admin/components/create" element={<ComponentCreate />} />
          
          {/* Роуты для готовых ПК */}
          <Route path="/admin/prebuilt-pcs/create" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PrebuiltPcCreate /></ProtectedRoute>} />
          <Route path="/admin/prebuilt-pcs/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PrebuiltPcEdit /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
      </main>
    {!isAppPage && <Footer />}
    </div>
  );
}

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;