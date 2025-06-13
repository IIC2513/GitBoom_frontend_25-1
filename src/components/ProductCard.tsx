import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';

// --- Interfaces (sin cambios) ---
interface Product {
  id: number;
  id_usuario: string;
  name: string;
  type: string;
  price: string;
  image: string;
  seller: string;
  location: string;
}

interface Usuario {
  id_usuario: string;
}

interface ProductCardProps {
  product: Product;
  user: Usuario | null;
}

// --- Componente ---
const ProductCard: React.FC<ProductCardProps> = ({ product, user }) => {
  const nav = useNavigate();
  
  // Estado para controlar la visibilidad del menú de opciones
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hook para detectar clics fuera del menú y cerrarlo
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    // Añadir el listener cuando el menú está abierto
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Limpiar el listener al desmontar el componente o cuando el menú se cierra
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);


  const handleEdit = () => {
    nav(`/productos/editar/${product.id}`);
  };

  const handleDelete = () => {
    // Aquí iría la lógica para eliminar, por ejemplo, mostrar un modal de confirmación
    alert(`Funcionalidad para eliminar el producto ${product.id} no implementada.`);
    setIsMenuOpen(false); // Cierra el menú después de la acción
  };

  return (
    // Añadimos `relative` para que el menú de opciones se posicione correctamente
    <div className="relative bg-white rounded-xl shadow-xl overflow-hidden flex flex-col group transform hover:scale-[1.02] transition-transform duration-300">
      
      {/* --- Menú de Opciones para el dueño del producto --- */}
      {user?.id_usuario === product.id_usuario && (
        // Usamos `ref` para detectar clics fuera de este contenedor
        <div ref={menuRef} className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-green-700 transition-all"
            aria-label="Más opciones"
          >
            <FiMoreVertical size={20} />
          </button>

          {/* --- Menú Desplegable (se muestra si isMenuOpen es true) --- */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
              <button
                onClick={handleEdit}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiEdit className="text-gray-500" />
                <span>Editar</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <FiTrash2 className="text-red-500" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Contenido de la Tarjeta (sin cambios) --- */}
      <div className="h-56 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full self-start mb-2 ${
            product.type === 'Compra Solidaria'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {product.type}
        </span>

        <h3 className="text-lg font-semibold text-[#1d311e] mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-1">por: {product.seller}</p>
        <p className="text-sm text-gray-500 mb-3">📍 {product.location}</p>

        <div className="mt-auto flex justify-between items-center">
          <p className="text-xl font-bold text-[#557e35]">{product.price}</p>
          <button
            onClick={() => nav(`/productos/${product.id}`)}
            className="px-4 py-2 bg-[#557e35] text-white text-sm font-medium rounded-lg hover:bg-[#4a6e2e] transition-colors"
          >
            Ver Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;