import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StashPage } from './pages/StashPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { HolotapesPage } from './pages/HolotapesPage';
import { AdminPage } from './pages/AdminPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { useVaultStore } from './store/useVaultStore';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authChecked = useVaultStore((s) => s.authChecked);
  const isAuthed = useVaultStore((s) => s.isAuthed);
  if (!authChecked) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authChecked = useVaultStore((s) => s.authChecked);
  const isAuthed = useVaultStore((s) => s.isAuthed);
  const role = useVaultStore((s) => s.user.role);
  if (!authChecked) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (role !== 'overseer') return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  const loadCatalog = useVaultStore((s) => s.loadCatalog);
  const loadSettings = useVaultStore((s) => s.loadSettings);
  const loadUser = useVaultStore((s) => s.loadUser);
  const handleUnauthorized = useVaultStore((s) => s.handleUnauthorized);

  useEffect(() => {
    loadCatalog().catch(() => undefined);
    loadSettings().catch(() => undefined);
    loadUser().catch(() => undefined);
    window.addEventListener('vault67:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vault67:unauthorized', handleUnauthorized);
  }, [loadCatalog, loadSettings, loadUser, handleUnauthorized]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="stash" element={<StashPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="account" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="login" element={<AuthPage isRegister={false} />} />
          <Route path="register" element={<AuthPage isRegister={true} />} />
          <Route path="holotapes" element={<HolotapesPage />} />
          <Route path="delivery" element={<HolotapesPage />} />
          <Route path="payment" element={<HolotapesPage />} />
          <Route path="about" element={<HolotapesPage />} />
          <Route path="admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
