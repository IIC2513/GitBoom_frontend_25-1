// src/components/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import logo from '../assets/Logosinfondo.png';

interface HeaderProps {
  user: any | null;
  onLogout: () => void;
} 

const Header: React.FC<HeaderProps> = ({
  user, onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <div>
          <Link to="/" aria-label="Ir al inicio">
            <img 
              src={logo} 
              alt="REMEAL Logo" 
              className="h-12 md:h-18 w-auto object-cover cursor-pointer"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`font-medium transition-colors duration-200 focus:outline-none ${
              isActive('/')
                ? 'text-[#557e35] font-semibold'
                : 'text-[#7b7b7b] hover:text-[#557e35]'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/como-funciona"
            className={`font-medium transition-colors duration-200 focus:outline-none ${
              isActive('/como-funciona')
                ? 'text-[#557e35] font-semibold'
                : 'text-[#7b7b7b] hover:text-[#557e35]'
            }`}
          >
            Cómo Funciona
          </Link>
          <Link
            to="/productos"
            className={`font-medium transition-colors duration-200 focus:outline-none text-[#7b7b7b] hover:text-[#557e35] ${
              isActive('/productos') ? 'text-[#557e35] font-semibold' : ''
            }`}
          >
            Productos
          </Link>
          <Link
            to="/nosotros"
            className={`font-medium transition-colors duration-200 focus:outline-none ${
              isActive('/nosotros')
                ? 'text-[#557e35] font-semibold'
                : 'text-[#7b7b7b] hover:text-[#557e35]'
            }`}
          >
            Nosotros
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              {user.fotoPerfil && (
                <img
                  src={user.fotoPerfil}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <Link
                to="/perfil"
                className="flex items-center space-x-2 bg-[#557e35] text-white px-4 py-2 rounded-md hover:bg-[#4a6e2e] transition"
              >
                <User className="w-5 h-5" />
                <span>Mi ReMeal</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center space-x-2 bg-[#557e35] text-white px-4 py-2 rounded-md hover:bg-[#4a6e2e] transition"
            >
              <User className="w-5 h-5" />
              <span>Regístrate / Login</span>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="lg:hidden text-gray-600 hover:text-[#557e35] focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className={`p-2 font-medium text-left focus:outline-none ${
                isActive('/')
                  ? 'text-[#557e35] font-semibold'
                  : 'text-[#7b7b7b] hover:text-[#557e35]'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/como-funciona"
              className={`p-2 font-medium text-left focus:outline-none ${
                isActive('/como-funciona')
                  ? 'text-[#557e35] font-semibold'
                  : 'text-[#7b7b7b] hover:text-[#557e35]'
              }`}
            >
              Cómo Funciona
            </Link>
            <Link
              to="/productos"
              className="p-2 font-medium text-left text-[#7b7b7b] hover:text-[#557e35] focus:outline-none"
            >
              Productos
            </Link>
            <Link
              to="/nosotros"
              className={`p-2 font-medium text-left focus:outline-none ${
                isActive('/nosotros')
                  ? 'text-[#557e35] font-semibold'
                  : 'text-[#7b7b7b] hover:text-[#557e35]'
              }`}
            >
              Nosotros
            </Link>

            {user ? (
              <>
                {user.fotoPerfil && (
                  <img
                    src={user.fotoPerfil}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover mb-2"
                  />
                )}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2 p-2 text-left text-[#557e35] hover:underline focus:outline-none"
                >
                  <User className="w-5 h-5" />
                  <span>Mi ReMeal</span>
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="p-2 font-medium text-left text-[#557e35] hover:underline focus:outline-none"
              >
                Regístrate / Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;