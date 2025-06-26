import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoreVertical, FiEdit, FiTrash2, FiX, FiClock, FiPackage, FiMapPin, FiUser, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import ReservaModal from './ReservaModal';

// Interfaces y el resto del componente ProductCard (sin cambios)
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

const ProductCard = ({ product: initialProduct, user }: ProductCardProps) => {
  const [product, setProduct] = useState(initialProduct);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Este estado ahora controla nuestro modal aesthetic
  const menuRef = useRef<HTMLDivElement>(null);
  const [puedeOpinar, setPuedeOpinar] = useState(false);

  // ... (toda la lógica de hooks y handlers permanece igual)
  useEffect(() => {
    const validarReserva = async () => {
      if (!user || user.id_usuario === product.id_usuario) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservas/producto/${product.id}/tiene-reserva`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setPuedeOpinar(data.tieneReserva);
      } catch (err) {
        console.error('Error verificando reserva válida:', err);
      }
    };
    validarReserva();
  }, [product.id, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleEdit = () => alert(`Editar producto ${product.id}`);
  const handleDelete = async () => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (!confirmacion) return;
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/productos/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el producto');
      }
  
      alert("Producto eliminado correctamente.");
  
      // Emitir evento de WebSocket si quieres
      // socket.emit("producto:eliminado", product.id);  <-- solo si haces algo en cliente
  
      // También puedes usar un callback o recargar la página:
      window.location.reload();
  
    } catch (err) {
      console.error('❌ Error eliminando producto:', err);
      alert(`Error al eliminar producto: ${err.message}`);
    }
  };
  
  const estaVencido = product.fechaVencimiento ? new Date(product.fechaVencimiento) < new Date() : false;
  
  // Función para formatear fechas de manera legible
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return (
    <>
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:scale-[1.02] transition-transform duration-300">
        {/* ... (código de la tarjeta sin cambios) ... */}
        {user && user.id_usuario === product.id_usuario && (
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
                <button onClick={handleEdit} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <FiEdit className="text-gray-500" /><span>Editar</span>
                </button>
                <button onClick={handleDelete} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                  <FiTrash2 className="text-red-500" /><span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        )}
        <div className="h-56 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full self-start mb-2 ${product.type === 'Compra Solidaria' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
            {product.type}
          </span>
          <h3 className="text-lg font-semibold text-[#1d311e] mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-1">por: {product.seller}</p>
          <p className="text-sm text-gray-500 mb-3">📍 {product.location}</p>
          <div className="mt-auto flex justify-between items-center">
            <p className="text-xl font-bold text-[#557e35]">{product.price}</p>
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(true)} className="px-3 py-1.5 bg-[#557e35] text-white text-xs font-medium rounded-md hover:bg-[#4a6e2e] transition-colors">
                Ver Detalle
              </button>
              {user && user.id_usuario !== product.id_usuario && product.cantidad && product.cantidad > 0 && product.estado === 'disponible' && !estaVencido ? (
                <button onClick={() => setShowReservaModal(true)} className="px-3 py-1.5 bg-[#557e35] text-white text-xs font-medium rounded-md hover:bg-[#4a6e2e] transition-colors">
                  Reservar
                </button>
              ) : (
                <button disabled className="px-3 py-1.5 bg-gray-300 text-gray-600 text-xs font-medium rounded-md cursor-not-allowed">
                  Agotado
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showReservaModal && (
        <ReservaModal id_producto={product.id} onClose={() => setShowReservaModal(false)} onSuccess={() => { setShowReservaModal(false); alert('Reserva creada exitosamente'); }} updateProduct={setProduct} />
      )}

      {/*********** SECCIÓN DEL MODAL MEJORADO ***********/}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={() => setIsModalOpen(false)} // Cierra el modal al hacer clic en el fondo
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el modal
            >
              {/* Columna de la Imagen */}
              <div className="w-full md:w-1/2 h-64 md:h-auto">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Columna de Contenido */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${product.type === 'Compra Solidaria' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {product.type}
                  </span>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <FiX size={24} />
                  </button>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-2">{product.name}</h2>
                <p className="text-4xl font-bold text-[#557e35] mb-6">{product.price}</p>
                
                <p className="text-gray-600 mb-6">{product.descripcion ?? 'No hay descripción disponible.'}</p>

                {/* Sección de detalles con iconos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-b border-gray-200 py-6 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiPackage size={20} className="text-green-600" />
                    <span><strong>Cantidad:</strong> {product.cantidad ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiUser size={20} className="text-green-600" />
                    <span><strong>Vendedor:</strong> {product.seller}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiMapPin size={20} className="text-green-600" />
                    <span><strong>Ubicación:</strong> {product.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiClock size={20} className="text-green-600" />
                    <span><strong>Estado:</strong> <span className="font-semibold capitalize">{product.estado ?? 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiCalendar size={20} className="text-green-600" />
                    <span><strong>Publicado:</strong> {formatDate(product.fechaPublicacion)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiCalendar size={20} className="text-red-500" />
                    <span><strong>Vence:</strong> {formatDate(product.fechaVencimiento)}</span>
                  </div>
                </div>

                {/* Botones de acción al final */}
                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  {puedeOpinar ? (
                    <button
                      onClick={() => window.location.href = `/productos/${product.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-5 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      <FiMessageSquare />
                      <span>Deja tu opinión</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      title="Debes haber reservado este producto para poder opinar"
                      className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-500 py-3 px-5 rounded-lg font-semibold cursor-not-allowed"
                    >
                      <FiMessageSquare />
                      <span>Deja tu opinión</span>
                    </button>
                  )}
                  <button
                    onClick={() => window.location.href = `/productos/${product.id}/valoraciones`}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Ver opiniones
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;