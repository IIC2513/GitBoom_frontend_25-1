import React from 'react';

const AuthForms: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
      {/* Login Form */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-[#1d311e] mb-6 text-center">Iniciar Sesión</h3>
        <form className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-[#7b7b7b] mb-1">
              Email
            </label>
            <input
              type="email"
              id="login-email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#557e35] focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-[#7b7b7b] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="login-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#557e35] focus:border-transparent"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#557e35] text-white py-2 px-4 rounded-md hover:bg-[#4a6e2e] transition-colors duration-200 font-medium"
          >
            Ingresar
          </button>
        </form>
      </div>

      {/* Register Form */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-[#1d311e] mb-6 text-center">Crear Cuenta</h3>
        <form className="space-y-4">
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-[#7b7b7b] mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="register-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#557e35] focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-[#7b7b7b] mb-1">
              Email
            </label>
            <input
              type="email"
              id="register-email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#557e35] focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-[#7b7b7b] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="register-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#557e35] focus:border-transparent"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#557e35] text-white py-2 px-4 rounded-md hover:bg-[#4a6e2e] transition-colors duration-200 font-medium"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForms;