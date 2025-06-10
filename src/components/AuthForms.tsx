import React, { useState } from 'react';
import axios from 'axios';

interface AuthFormsProps {
  onAuth: (userData: { usuario: any; token: string }) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const AuthForms: React.FC<AuthFormsProps> = ({ onAuth }) => {
  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState<{ type: 'error'|'success'; text: string } | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Registro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regMessage, setRegMessage] = useState<{ type: 'error'|'success'; text: string } | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(null);
    if (!loginEmail || !loginPassword) {
      setLoginMessage({ type: 'error', text: 'Completa todos los campos.' });
      return;
    }
    setLoginLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/usuarios/login`,
        { correo: loginEmail, contraseña: loginPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, usuario } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoginMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
      onAuth({ usuario, token });
    } catch (err: any) {
      setLoginMessage({
        type: 'error',
        text: err.response?.data?.error || 'Error al iniciar sesión'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);
    if (!regName || !regEmail || !regPassword) {
      setRegMessage({ type: 'error', text: 'Completa todos los campos.' });
      return;
    }
    if (regPassword !== regConfirm) {
      setRegMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    setRegLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/usuarios/registro`,
        { nombre: regName, correo: regEmail, contraseña: regPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, usuario } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setRegMessage({ type: 'success', text: 'Registro exitoso.' });
      onAuth({ usuario, token });
    } catch (err: any) {
      setRegMessage({
        type: 'error',
        text: err.response?.data?.error || 'Error en el registro'
      });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
      {/* Login */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-[#1d311e] mb-6 text-center">Iniciar Sesión</h3>
        <form onSubmit={handleLogin} className="space-y-4">
          {loginMessage && (
            <p className={`text-sm text-${loginMessage.type === 'error' ? 'red-500' : 'green-600'}`}>
              {loginMessage.text}
            </p>
          )}
          <div>
            <label htmlFor="login-email" className="block mb-1 text-gray-custom text-sm">Email</label>
            <input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-medium"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block mb-1 text-gray-custom text-sm">Contraseña</label>
            <input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-[#557e35] disabled:opacity-50 text-white py-2 px-4 rounded-md hover:bg-[#4a6e2e] transition-colors duration-200 font-medium"
          >
            {loginLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>

      {/* Registro */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-[#1d311e] mb-6 text-center">Crear Cuenta</h3>
        <form onSubmit={handleRegister} className="space-y-4">
          {regMessage && (
            <p className={`text-sm text-${regMessage.type === 'error' ? 'red-500' : 'green-600'}`}>
              {regMessage.text}
            </p>
          )}
          <div>
            <label htmlFor="reg-name" className="block mb-1 text-gray-custom text-sm">Nombre</label>
            <input
              id="reg-name"
              type="text"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-medium"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block mb-1 text-gray-custom text-sm">Email</label>
            <input
              id="reg-email"
              type="email"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-medium"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block mb-1 text-gray-custom text-sm">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-medium"
            />
          </div>
          <div>
            <label htmlFor="reg-confirm" className="block mb-1 text-gray-custom text-sm">Confirmar Contraseña</label>
            <input
              id="reg-confirm"
              type="password"
              value={regConfirm}
              onChange={e => setRegConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-medium"
            />
          </div>
          <button
            type="submit"
            disabled={regLoading}
            className="w-full bg-[#557e35] disabled:opacity-50 text-white py-2 px-4 rounded-md hover:bg-[#4a6e2e] transition-colors duration-200 font-medium"
          >
            {regLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForms;
