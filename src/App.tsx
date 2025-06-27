// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import AboutUsPage from './pages/AboutUsPage';
import DocsPage from './pages/DocsPage';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import EditProfilePage from './pages/EditProfilePage';
import MyReservationsPage from './pages/MyReservationsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ReservasDeMisProductosPage from './pages/ReservasDeMisProductosPage';
import ValoracionesPage from './pages/ValoracionesPage';
import ValoracionesListPage from './pages/ValoracionesListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublicProfilePage from './pages/PublicProfilePage';

import socket from './socket';
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rol: 'usuario' | 'admin';
  fotoPerfil?: string;
}

function AdminRoute({ user, children }: { user: Usuario | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/auth" />;
  if (user.rol !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Acceso denegado: solo para administradores.</div>;
  }
  return <>{children}</>;
}

function ProtectedRoute({ user, children }: { user: Usuario | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
}

function AppContent({ user, setUser }: { user: Usuario | null, setUser: React.Dispatch<React.SetStateAction<Usuario | null>> }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNotificacion = (noti: any) => {
      console.log("🔔 Notificación recibida:", noti);
      Swal.fire({
        title: '¡Tienes una nueva reserva!',
        text: noti.mensaje,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ver reservas',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#557e35',
        cancelButtonColor: '#ccc',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/reservas-de-mis-productos');
        }
      });
    };

    socket.on('notificacion:nueva', handleNotificacion);
    return () => {
      socket.off('notificacion:nueva', handleNotificacion);
    };
  }, [navigate]);

  return (
    <>
      <Header user={user} onLogout={() => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        delete axios.defaults.headers.common['Authorization'];
      }} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage onAuth={handleAuthSuccess} user={user} />} />
          <Route path="/productos" element={<MainPage user={user} />} />
          <Route path="/nosotros" element={<AboutUsPage />} />
          <Route path="/como-funciona" element={<DocsPage />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/perfil" element={<ProtectedRoute user={user}><ProfilePage user={user!} onLogout={() => setUser(null)} /></ProtectedRoute>} />
          <Route path="/crear-producto" element={<ProtectedRoute user={user}><CreateProductPage /></ProtectedRoute>} />
          <Route path="/productos/editar/:id_producto" element={<EditProductPage user={user} />} />
          <Route path="/productos/:id_producto" element={<ProductDetailPage user={user} />} />
          <Route path="/mis-reservas" element={<ProtectedRoute user={user}><MyReservationsPage /></ProtectedRoute>} />
          <Route path="/perfil/editar" element={<ProtectedRoute user={user}><EditProfilePage user={user!} onProfileUpdate={setUser} /></ProtectedRoute>} />
          <Route path="/usuarios/:id" element={<PublicProfilePage />} />
          <Route path="/reservas-de-mis-productos" element={<ProtectedRoute user={user}><ReservasDeMisProductosPage /></ProtectedRoute>} />
          <Route path="/producto/:id_producto/valoraciones" element={<ValoracionesPage />} />
          <Route path="/productos/:id/valoraciones" element={<ValoracionesListPage />} />
          <Route path="/admin-dashboard" element={<AdminRoute user={user}><AdminDashboardPage /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </>
  );

  function handleAuthSuccess({ usuario, token }: { usuario: Usuario; token: string }) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(usuario);
  }
}

function App() {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user?.id_usuario) {
      socket.emit('registrar_usuario', user.id_usuario);
    }
  }, [user]);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}

export default App;
