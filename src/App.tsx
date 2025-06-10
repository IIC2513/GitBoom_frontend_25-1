// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import AboutUsPage from './pages/AboutUsPage';
import DocsPage from './pages/DocsPage';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import CreateProductPage from './pages/CreateProductPage';

interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rol: 'usuario' | 'admin';
  fotoPerfil?: string;
}

function App() {
  const [user, setUser] = useState<Usuario | null>(null);
  
  const handleAuthSuccess = ({ usuario }: { usuario: Usuario }) => {
    console.log('Autenticación exitosa para:', usuario.nombre);
    console.log('Datos del usuario recibidos en App:', usuario);
    setUser(usuario);
  };

  // Agregar un useEffect para cargar el usuario del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      console.log('Usuario encontrado en localStorage:', JSON.parse(storedUser));
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage onAuth={handleAuthSuccess} user={user} />} />
            <Route path="/productos" element={<MainPage />} />
            <Route path="/nosotros" element={<AboutUsPage />} />
            <Route path="/como-funciona" element={<DocsPage />} />
            <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
            <Route 
              path="/perfil" 
              element={user ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/crear-producto" 
              element={user ? <CreateProductPage /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;