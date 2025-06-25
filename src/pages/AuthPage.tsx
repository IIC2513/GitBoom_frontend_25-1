import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { API_BASE } from '../config';
import AnimatedHeroText from '../components/AnimatedHeroText';

// Interfaces y componente FormInput (sin cambios)
interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rol: 'usuario' | 'admin';
}
interface AuthPageProps {
  onAuthSuccess: (userData: { usuario: Usuario; token: string }) => void;
}
const FormInput: React.FC<{
  id: string; label: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode; required?: boolean;
}> = ({ id, label, type, value, onChange, icon, required = false }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
    <input id={id} type={type} value={value} onChange={onChange} required={required} placeholder={label} className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg text-gray-700 focus:outline-none focus:border-green-500 focus:bg-white transition-colors" />
  </div>
);


const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  // ... (toda la lógica de estados y handlers permanece igual)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setMessage(null);
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // ... Lógica de login sin cambios
    setMessage(null);
    if (!loginEmail || !loginPassword) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(`${API_BASE}/api/usuarios/login`, { correo: loginEmail, contraseña: loginPassword });
      const { token, usuario } = data;
      const usuarioFormateado = {
        ...usuario,
        telefono: usuario.telefono || undefined,
        direccion: usuario.direccion || undefined,
        rol: usuario.rol || 'usuario'
      };
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuarioFormateado));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onAuthSuccess({ usuario: usuarioFormateado, token });
      navigate('/');
    } catch (error: any) {
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
    setLoading(true);
    // ... Lógica de registro sin cambios
    setMessage(null);
    if (!name || !email || !password) {
      setMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios.' });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(`${API_BASE}/api/usuarios/registro`, { 
          nombre: name, correo: email, contraseña: password,
          telefono: telefono || undefined, direccion: direccion || undefined
        });
      const { token, usuario } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onAuthSuccess({ usuario, token });
      navigate('/');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setMessage({ type: 'error', text: error.response.data.error });
      } else {
        setMessage({ type: 'error', text: 'Error en el registro. Inténtalo de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // <-- 2. Define las palabras que quieres mostrar
  const palabrasClave = [
    "la Calidad.",
    "la Frescura.",
    "lo Sostenible.",
    "la Comunidad.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-green-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-4xl w-full grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white"
      >
        {/* Panel Izquierdo - Visual (AQUÍ ESTÁN LOS CAMBIOS) */}
        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#557e35] to-[#7a9e63] opacity-80"></div>
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1887&auto=format&fit=crop" 
            alt="Alimentos frescos y sostenibles" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-8 lg:p-12 text-white">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Descubre el poder de
                <br />
                <div className="mt-4">
                  <AnimatedHeroText 
                    words={palabrasClave}
                    className="text-green-200 text-4xl lg:text-5xl font-bold" 
                  />
                </div>
              </h1>
              <p className="mt-4 text-lg text-green-100">
                Accede a tu cuenta o regístrate para ser parte de nuestra comunidad.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Panel Derecho - Formulario (sin cambios) */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {/* ... (el resto del JSX del panel derecho permanece igual) ... */}
           <div>
            {/* Selector de modo */}
            <div className="relative flex justify-center border-b-2 border-gray-200 mb-8">
              <button onClick={() => switchMode('login')} className={`w-1/2 pb-3 text-lg font-semibold transition-colors focus:outline-none ${authMode === 'login' ? 'text-[#557e35]' : 'text-gray-500'}`}>
                Iniciar Sesión
              </button>
              <button onClick={() => switchMode('register')} className={`w-1/2 pb-3 text-lg font-semibold transition-colors focus:outline-none ${authMode === 'register' ? 'text-[#557e35]' : 'text-gray-500'}`}>
                Registrarse
              </button>
              <motion.div layoutId="underline" className="absolute bottom-[-2px] h-1 bg-[#557e35] w-1/2" transition={{ type: 'spring', stiffness: 300, damping: 25 }} style={{ left: authMode === 'login' ? '0%' : '50%' }} />
            </div>

            {/* Contenedor de formularios con animación */}
            <AnimatePresence mode="wait">
              <motion.div key={authMode} variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                {authMode === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">¡Hola de nuevo!</h2>
                    <p className="text-center text-gray-500 mb-6">Ingresa tus credenciales para continuar.</p>
                    {message && <p className={`text-center font-medium py-2 px-4 rounded-lg ${message.type === 'error' ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>{message.text}</p>}
                    <FormInput id="login-email" label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} icon={<Mail size={20} />} required />
                    <FormInput id="login-password" label="Contraseña" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} icon={<Lock size={20} />} required />
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-[#557e35] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-green-500/20">
                      {loading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Crea tu Cuenta</h2>
                    <p className="text-center text-gray-500 mb-6">Es rápido y fácil.</p>
                    {message && <p className={`text-center font-medium py-2 px-4 rounded-lg ${message.type === 'error' ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>{message.text}</p>}
                    <FormInput id="reg-name" label="Nombre Completo" type="text" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={20} />} required />
                    <FormInput id="reg-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={20} />} required />
                    <FormInput id="reg-phone" label="Teléfono (Opcional)" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} icon={<Phone size={20} />} />
                    <FormInput id="reg-address" label="Dirección (Opcional)" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} icon={<MapPin size={20} />} />
                    <FormInput id="reg-password" label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock size={20} />} required />
                    <FormInput id="reg-confirm" label="Confirmar Contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock size={20} />} required />
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-[#557e35] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-green-500/20 mt-6">
                      {loading ? <Loader2 className="animate-spin" /> : 'Crear Cuenta'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default AuthPage;