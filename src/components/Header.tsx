// src/components/Header.tsx
import React from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/Logosinfondo.png';

interface HeaderProps {
  currentPage: 'landing' | 'about' | 'docs' | 'main';
  setCurrentPage: (page: 'landing' | 'about' | 'docs' | 'main') => void;
  user: any | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  user,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleNavigation = (
    page: 'landing' | 'about' | 'docs' | 'main',
    anchor?: string
  ) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    if (anchor && page === 'landing') {
      setTimeout(() => scrollToSection(anchor), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <div>
          <button
            onClick={() => handleNavigation('landing')}
            aria-label="Ir al inicio"
          >
            <img
              src={logo}
              alt="REMEAL Logo"
              className="h-12 md:h-18 w-auto rounded object-cover cursor-pointer"
            />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => handleNavigation('landing')}
            className={`font-medium transition-colors duration-200 ${
              currentPage === 'landing'
                ? 'text-[#557e35] font-semibold'
                : 'text-[#7b7b7b] hover:text-[#557e35]'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => handleNavigation('docs')}
            className={`font-medium transition-colors duration-200 ${
              currentPage === 'docs'
                ? 'text-[#557e35] font-semibold'
                : 'text-[#7b7b7b] hover:text-[#557e35]'
            }`}
          >
            Cómo Funciona
          </button>
          <button
            onClick={() => handleNavigation('main')}
            className="text-[#7b7b7b] font-medium hover:text-[#557e35] transition-colors duration-200"
          >
            Productos
          </button>

          <button
            onClick={() => handleNavigation('about')}
            className={`font-medium transition-colors duration-200 ${
              currentPage === 'about'
                ? 'text-[#557e35] font-semibold'
                : 'text-[#7b7b7b] hover:text-[#557e35]'
            }`}
          >
            Nosotros
          </button>

          {user ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={onLogout}
                className="text-sm text-[#557e35] hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation('landing', 'auth')}
              className="text-[#7b7b7b] font-medium hover:text-[#557e35] transition-colors duration-200"
            >
              Únete
            </button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-[#1d311e]" />
          ) : (
            <Menu className="w-6 h-6 text-[#1d311e]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavigation('landing')}
              className={`p-2 font-medium text-left ${
                currentPage === 'landing'
                  ? 'text-[#557e35] font-semibold'
                  : 'text-[#7b7b7b] hover:text-[#557e35]'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavigation('docs')}
              className={`p-2 font-medium text-left ${
                currentPage === 'docs'
                  ? 'text-[#557e35] font-semibold'
                  : 'text-[#7b7b7b] hover:text-[#557e35]'
              }`}
            >
              Cómo Funciona
            </button>
            <button
              onClick={() => handleNavigation('main')}
              className="p-2 font-medium text-left text-[#7b7b7b] hover:text-[#557e35]"
            >
              Productos
            </button>

            {user ? (
              <>
                <div className="p-2 text-left text-gray-700">
                  Hola, {user.nombre}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-left text-[#557e35] hover:underline"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation('landing', 'auth')}
                className="p-2 font-medium text-left text-[#7b7b7b] hover:text-[#557e35]"
              >
                Únete
              </button>
            )}

            <button
              onClick={() => handleNavigation('about')}
              className={`p-2 font-medium text-left ${
                currentPage === 'about'
                  ? 'text-[#557e35] font-semibold'
                  : 'text-[#7b7b7b] hover:text-[#557e35]'
              }`}
            >
              Nosotros
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
