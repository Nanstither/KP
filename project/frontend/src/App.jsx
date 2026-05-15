import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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

// Конфигурация маршрутов
const PUBLIC_ROUTES = [
  { path: "/", element: HomePage },
  { path: "/about", element: AboutPage },
  { path: "/catalog", element: CatalogPage },
  { path: "/login", element: LoginPage },
  { path: "/knowledge", element: KnowledgeBase },
  { path: "/cart", element: CartPage },
  { path: "/components/:id", element: ComponentDetailPage },
  { path: "/config", element: ConfiguratorPage },
];

const ADMIN_ROUTES = [
  { path: "/admin/components/:id/edit", element: ComponentEdit },
  { path: "/admin/components/create", element: ComponentCreate },
];

export default function App() {
  const location = useLocation();
  const isAppPage = location.pathname.includes("config");

  return (
    <div>
      {!isAppPage && <Navigation />}
      <main>
        <Routes>
          {/* Публичные маршруты */}
          {PUBLIC_ROUTES.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
          
          {/* Защищённые админ-маршруты */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Дополнительные админ-маршруты */}
          {ADMIN_ROUTES.map(({ path, element: Element }) => (
            <Route 
              key={path} 
              path={path} 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Element />
                </ProtectedRoute>
              } 
            />
          ))}
          
          {/* Маршруты для готовых ПК */}
          <Route 
            path="/admin/prebuilt-pcs/create" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <PrebuiltPcCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/prebuilt-pcs/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <PrebuiltPcEdit />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback маршрут */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAppPage && <Footer />}
    </div>
  );
}