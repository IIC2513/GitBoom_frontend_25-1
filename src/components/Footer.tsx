import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1d311e] text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <p className="text-sm">© 2025 REMEAL. Todos los derechos reservados.</p>
          </div>
          <p className="text-sm text-gray-300">Un proyecto de IIC2513 - Tecnologías y Aplicaciones Web</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;