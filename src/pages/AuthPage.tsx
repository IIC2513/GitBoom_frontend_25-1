import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Interfaces actualizadas según el modelo
interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rol: 'usuario' | 'admin';
}

interface AuthPageProps {
  // Esta prop se llamará cuando el login o registro sea exitoso
  onAuthSuccess: (userData: { usuario: Usuario; token: string }) => void;
}

// URL de la API
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Estados para el formulario de registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  // Estados para el formulario de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados unificados para carga y mensajes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();

  // Función para cambiar de modo y limpiar el estado
  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    // Limpiamos los campos y mensajes al cambiar de pestaña
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTelefono('');
    setDireccion('');
    setLoginEmail('');
    setLoginPassword('');
    setMessage(null);
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!loginEmail || !loginPassword) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/usuarios/login`,
        { correo: loginEmail, contraseña: loginPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, usuario } = data;
      console.log('Datos recibidos del backend:', usuario);
      
      // Asegurarnos de que los campos opcionales se manejen correctamente
      const usuarioFormateado = {
        ...usuario,
        telefono: usuario.telefono || undefined,
        direccion: usuario.direccion || undefined,
        rol: usuario.rol || 'usuario'
      };
      console.log('Usuario formateado:', usuarioFormateado);
      
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuarioFormateado));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
      onAuthSuccess({ usuario: usuarioFormateado, token });
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setMessage({ type: 'error', text: error.response.data.error });
      } else {
        setMessage({ type: 'error', text: 'Error al iniciar sesión. Verifica tus credenciales.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!name || !email || !password) {
      setMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/usuarios/registro`,
        { 
          nombre: name, 
          correo: email, 
          contraseña: password,
          telefono: telefono || undefined,
          direccion: direccion || undefined
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, usuario } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setMessage({ type: 'success', text: '¡Registro exitoso! Redirigiendo...' });
      // Llama a la función del padre (App.tsx) para actualizar el estado global
      onAuthSuccess({ usuario, token });
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setMessage({ type: 'error', text: error.response.data.error });
      } else {
        setMessage({ type: 'error', text: 'Error en el registro. Inténtalo de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const commonInputClasses = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#557e35]";
  const commonButtonClasses = "w-full bg-[#557e35] text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const renderForm = () => {
    if (authMode === 'login') {
      return (
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
          {message && <p className={`text-center font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message.text}</p>}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className={commonInputClasses}/>
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className={commonInputClasses}/>
          </div>
          <button type="submit" disabled={loading} className={commonButtonClasses}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      );
    }
    return (
      <form onSubmit={handleRegisterSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Crear Cuenta</h2>
        {message && <p className={`text-center font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message.text}</p>}
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={commonInputClasses}/>
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={commonInputClasses}/>
        </div>
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input id="reg-phone" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={commonInputClasses}/>
        </div>
        <div>
          <label htmlFor="reg-address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input id="reg-address" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className={commonInputClasses}/>
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
          <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={commonInputClasses}/>
        </div>
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
          <input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={commonInputClasses}/>
        </div>
        <p className="text-sm text-gray-500">* Campos obligatorios</p>
        <button type="submit" disabled={loading} className={commonButtonClasses}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg space-y-8">
        <div className="flex justify-center mb-6">
          <button onClick={() => switchMode('login')} className={`w-1/2 py-3 text-lg font-semibold rounded-l-md transition-colors ${authMode === 'login' ? 'bg-[#557e35] text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Iniciar Sesión
          </button>
          <button onClick={() => switchMode('register')} className={`w-1/2 py-3 text-lg font-semibold rounded-r-md transition-colors ${authMode === 'register' ? 'bg-[#557e35] text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Registrarse
          </button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;