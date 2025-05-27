import React from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/Logosinfondo.png';

interface HeaderProps {
  currentPage: 'landing' | 'about' | 'docs'| 'main';
  setCurrentPage: (page: 'landing' | 'about' | 'docs' | 'main') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleNavigation = (page: 'landing' | 'about' | 'docs', anchor?: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    
    if (anchor && page === 'landing') {
      // Wait for page to render before scrolling
      setTimeout(() => {
        scrollToSection(anchor);
      }, 100);
    } else {
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="REMEAL Logo" 
            className="h-12 md:h-18 w-auto rounded object-cover"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => handleNavigation('landing')}
            className={`font-medium transition-colors duration-200 ${currentPage === 'landing' ? 'text-[#557e35] font-semibold' : 'text-[#7b7b7b] hover:text-[#557e35]'}`}
          >
            Inicio
          </button>
          <button 
            onClick={() => handleNavigation('docs')}
            className={`font-medium transition-colors duration-200 ${currentPage === 'docs' ? 'text-[#557e35] font-semibold' : 'text-[#7b7b7b] hover:text-[#557e35]'}`}
          >
            Cómo Funciona
          </button>
          <button 
            onClick={() => setCurrentPage('main')}
            className="text-[#7b7b7b] font-medium hover:text-[#557e35] transition-colors duration-200"
          >
            Productos
          </button>

          <button 
            onClick={() => handleNavigation('landing', 'auth')}
            className="text-[#7b7b7b] font-medium hover:text-[#557e35] transition-colors duration-200"
          >
            Únete
          </button>
          <button 
            onClick={() => handleNavigation('about')}
            className={`font-medium transition-colors duration-200 ${currentPage === 'about' ? 'text-[#557e35] font-semibold' : 'text-[#7b7b7b] hover:text-[#557e35]'}`}
          >
            Nosotros
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              className={`p-2 font-medium text-left ${currentPage === 'landing' ? 'text-[#557e35] font-semibold' : 'text-[#7b7b7b]'}`}
            >
              Inicio
            </button>
            <button 
              onClick={() => handleNavigation('docs')}
              className={`p-2 font-medium text-left ${currentPage === 'docs' ? 'text-[#557e35] font-semibold' : 'text-[#7b7b7b]'}`}
            >
              Cómo Funciona
            </button>

            <button 
              onClick={() => setCurrentPage('main')}
              className="p-2 text-[#7b7b7b] font-medium text-left"
            >
              Productos
            </button>

            
            <button 
              onClick={() => handleNavigation('landing', 'auth')}
              className="p-2 text-[#7b7b7b] font-medium text-left"
            >
              Únete
            </button>
            <button 
              onClick={() => handleNavigation('about')}
              className={`p-2 font-medium text-left ${currentPage === 'about' ? 'text-[#557e35] font-semibold' : 'text-[#7b7b7b]'}`}
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