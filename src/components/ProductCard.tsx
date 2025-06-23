import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import ReservaModal from './ReservaModal';

interface Product {
  id: string;
  id_usuario: string;
  name: string;
  type: string;
  price: string;
  image: string;
  seller: string;
  location: string;
  estado?: string;
  cantidad?: number;
  fechaPublicacion?: string;
  fechaVencimiento?: string;
  descripcion?: string;
}

interface Usuario {
  id_usuario: string;
}

interface ProductCardProps {
  product: Product;
  user: Usuario | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ product: initialProduct, user }) => {
  const [product, setProduct] = useState(initialProduct);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEdit = () => {
    alert(`Editar producto ${product.id}`);
  };

  const handleDelete = () => {
    alert(`Funcionalidad para eliminar el producto ${product.id} no implementada.`);
    setIsMenuOpen(false);
  };

  const estaVencido = product.fechaVencimiento
  ? new Date(product.fechaVencimiento) < new Date()
  : false;

  return (
    <>
      <div className="relative bg-white rounded-xl shadow-xl overflow-hidden flex flex-col group transform hover:scale-[1.02] transition-transform duration-300">
        {user?.id_usuario === product.id_usuario && (
          <div ref={menuRef} className="absolute top-3 right-3 z-20">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-green-700 transition-all"
              aria-label="Más opciones"
            >
              <FiMoreVertical size={20} />
            </button>

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
            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-[#557e35] text-white text-xs font-medium rounded-md hover:bg-[#4a6e2e] transition-colors"
              >
                Ver Detalle
              </button>

              {user && user.id_usuario !== product.id_usuario ? (
                product.cantidad && product.cantidad > 0 &&
                product.estado === 'disponible' &&
                !estaVencido ? (
                  <button
                    onClick={() => setShowReservaModal(true)}
                    className="px-3 py-1.5 bg-[#557e35] text-white text-xs font-medium rounded-md hover:bg-[#4a6e2e] transition-colors"
                  >
                    Reservar
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3 py-1.5 bg-gray-300 text-gray-600 text-xs font-medium rounded-md cursor-not-allowed"
                  >
                    Agotado
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>

        {showReservaModal && (
          <ReservaModal
            id_producto={product.id}
            onClose={() => setShowReservaModal(false)}
            onSuccess={() => {
              setShowReservaModal(false);
              alert('Reserva creada exitosamente');
            }}
            updateProduct={setProduct}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
            <img src={product.image} alt={product.name} className="w-full h-60 object-cover rounded" />
            <p className="mt-2 font-semibold">Tipo: <span className="font-normal">{product.type}</span></p>
            <p className="mt-1 font-semibold">Cantidad: <span className="font-normal">{product.cantidad ?? 'N/A'}</span></p>
            <p className="mt-1 font-semibold">Publicado por: <span className="font-normal">{product.seller}</span></p>
            <p className="mt-1 font-semibold">Ubicación: <span className="font-normal">{product.location}</span></p>
            <p className="mt-1 font-semibold">Estado: <span className="font-normal">{product.estado ?? 'N/A'}</span></p>
            <p className="mt-1 font-semibold">Publicado el: <span className="font-normal">{product.fechaPublicacion ?? 'N/A'}</span></p>
            <p className="mt-1 font-semibold">Vence el: <span className="font-normal">{product.fechaVencimiento ?? 'N/A'}</span></p>
            <p className="mt-4">{product.descripcion ?? ''}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
