// src/pages/MainPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  List,
  Map as MapIcon,
  X,
  CalendarDays,
  Clock,
  Package,
  Info,
} from 'lucide-react';

// React Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Importar CSS de Leaflet
import 'leaflet/dist/leaflet.css';

// URL de la API
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// --- Corregir el problema del icono de Leaflet ---
// @ts-expect-error - Leaflet types are not complete
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});
// --- Fin de la corrección del icono ---

// --- Interfaces ---
interface Product {
  id_producto: string;
  nombre: string;
  descripcion: string;
  tipo_producto: string;
  cantidad: number;
  fecha_expiracion: string;
  precio: number;
  horario_retiro: string;
  fecha_publicacion: string;
  categoria: 'Compra Solidaria' | 'Ayuda Social';
  estado: 'disponible' | 'reservado' | 'entregado' | 'expirado';
  ubicacion: string;
  lat: number;
  lng: number;
  id_usuario: string;
  createdAt: string;
  updatedAt: string;
  // Campos adicionales que necesitamos para la UI
  seller_name: string;
  image: string;
}

// --- Componentes ---
const formatPrice = (price: number) => {
  const roundedPrice = Math.floor(price);
  return `$${roundedPrice.toLocaleString('es-CL')}`;
};

const ProductCard: React.FC<{ product: Product; onDetailsClick: (product: Product) => void }> = ({ product, onDetailsClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
  >
    <div className="w-full h-48 overflow-hidden">
      <img className="w-full h-full object-cover" src={product.image} alt={product.nombre} loading="lazy"/>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-[#1d311e] line-clamp-1">{product.nombre}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${product.categoria === 'Compra Solidaria' ? 'bg-[#ff8c00]' : 'bg-[#557e35]'}`}>
          {product.categoria === 'Compra Solidaria' ? formatPrice(product.precio) : 'GRATIS'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1 line-clamp-2">{product.descripcion}</p>
      <div className="mt-auto pt-3">
        <p className="text-xs text-gray-500 flex items-center mb-1"><Users size={14} className="mr-1 text-[#557e35]" />{product.seller_name}</p>
        <p className="text-xs text-gray-500 flex items-center mb-3"><MapPin size={14} className="mr-1 text-[#557e35]" />{product.ubicacion}</p>
        <button 
          onClick={() => onDetailsClick(product)}
          className="w-full bg-[#557e35] text-white py-2 px-4 rounded-lg hover:bg-[#4a6d2f] transition-colors text-sm font-medium"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  </motion.div>
);

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value: string | number; colorClass?: string }> = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex items-center mb-2">
    <Icon size={18} className="text-[#557e35] mr-2" />
    <span className="text-gray-600 mr-2">{label}:</span>
    <span className={colorClass}>{value}</span>
  </div>
);

const ProductDetailModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-[#1d311e]">{product.nombre}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <img src={product.image} alt={product.nombre} className="w-full h-64 object-cover rounded-lg shadow-md" />
          <div>
            <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full text-white mb-3 ${product.categoria === 'Compra Solidaria' ? 'bg-[#ff8c00]' : 'bg-[#557e35]'}`}>
              {product.categoria} {product.categoria === 'Compra Solidaria' ? `- ${formatPrice(product.precio)}` : '- GRATIS'}
            </span>
            <InfoItem icon={Info} label="Estado" value={product.estado} />
            <InfoItem icon={Package} label="Cantidad" value={product.cantidad} />
            <InfoItem icon={Users} label="Publicado por" value={product.seller_name} />
            <InfoItem icon={MapPin} label="Ubicación" value={product.ubicacion} />
            {product.horario_retiro && <InfoItem icon={Clock} label="Horario de Retiro" value={product.horario_retiro} />}
            <InfoItem icon={CalendarDays} label="Publicado el" value={new Date(product.fecha_publicacion).toLocaleDateString()} />
            {product.fecha_expiracion && <InfoItem icon={CalendarDays} label="Vence el" value={new Date(product.fecha_expiracion).toLocaleDateString()} colorClass="text-red-600 font-semibold" />}
          </div>
        </div>

        {product.descripcion && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#1d311e] mb-2">Descripción</h3>
            <p className="text-gray-700">{product.descripcion}</p>
          </div>
        )}

        <div className="text-center md:text-right">
          <button className="bg-[#557e35] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#4a6d2f] transition-colors duration-300 shadow-md text-lg">
            {product.categoria === 'Ayuda Social' ? 'Reservar Donación' : 'Contactar para Comprar'}
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const FitBoundsToMarkers: React.FC<{ products: Product[] }> = ({ products }) => {
  const map = useMap();
  
  useEffect(() => {
    if (products.length > 0) {
      const bounds = L.latLngBounds(products.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, products]);

  return null;
};

// --- MainPage Component ---
const MainPage: React.FC = () => {
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [productFilter, setProductFilter] = useState<'all' | 'Compra Solidaria' | 'Ayuda Social'>('all');
  const [productsViewMode, setProductsViewMode] = useState<'list' | 'map'>('list');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { ref: productsSectionRef, inView: productsSectionInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Función para obtener productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/productos`);
        const productosData = response.data.map((producto: Product) => ({
          ...producto,
          // Agregar campos adicionales necesarios para la UI
          seller_name: producto.nombre, // Por ahora usamos el nombre del producto como seller_name
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', // Imagen por defecto
        }));
        setProducts(productosData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredRawProducts = products.filter(p => 
    (productFilter === 'all' || p.categoria === productFilter) && p.estado === 'disponible'
  );

  const productsPerPageInList = 6; 
  const totalProductListPages = Math.ceil(filteredRawProducts.length / productsPerPageInList);
  const displayedListProducts = filteredRawProducts.slice(
    currentProductPage * productsPerPageInList,
    (currentProductPage + 1) * productsPerPageInList
  );

  const nextProductListPage = () => setCurrentProductPage((prev) => Math.min(prev + 1, totalProductListPages - 1));
  const prevProductListPage = () => setCurrentProductPage((prev) => Math.max(prev - 1, 0));
  
  const handleOpenProductModal = (product: Product) => setSelectedProductModal(product);
  const handleCloseProductModal = () => setSelectedProductModal(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#557e35]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 pt-8 pb-16 md:pt-12 md:pb-24">
      
      {/* Descubre Productos Section */}
      <motion.section 
        id="products" 
        ref={productsSectionRef} 
        variants={sectionVariants} 
        initial="hidden" 
        animate={productsSectionInView ? "visible" : "hidden"}
        className="w-full" 
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-6">
            Alimentos Disponibles
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Explora los productos que nuestra comunidad ha publicado para ti. Filtra por tipo o cambia a la vista de mapa.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
              {(['all', 'Compra Solidaria', 'Ayuda Social'] as const).map(filterType => (
                <button key={filterType} onClick={() => { setProductFilter(filterType); setCurrentProductPage(0); }}
                  className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-medium text-sm transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#557e35]
                    ${productFilter === filterType 
                      ? 'bg-[#557e35] text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  {filterType === 'all' ? 'Todos' : filterType}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setProductsViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-300 ${productsViewMode === 'list' ? 'bg-[#557e35] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setProductsViewMode('map')}
                className={`p-2 rounded-lg transition-colors duration-300 ${productsViewMode === 'map' ? 'bg-[#557e35] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <MapIcon size={20} />
              </button>
            </div>
          </div>

          {/* Vista de Lista */}
          {productsViewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedListProducts.map((product) => (
                <ProductCard 
                  key={product.id_producto} 
                  product={product} 
                  onDetailsClick={handleOpenProductModal}
                />
              ))}
            </div>
          )}

          {/* Vista de Mapa */}
          {productsViewMode === 'map' && (
            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg">
              <MapContainer 
                center={[-33.45694, -70.64827]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FitBoundsToMarkers products={filteredRawProducts} />
                {filteredRawProducts.map((product) => (
                  <Marker 
                    key={product.id_producto} 
                    position={[product.lat, product.lng]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-[#1d311e]">{product.nombre}</h3>
                        <p className="text-sm text-gray-600">{product.descripcion}</p>
                        <p className="text-sm font-medium mt-2">
                          {product.categoria === 'Compra Solidaria' ? `$${product.precio.toLocaleString('es-CL', { maximumFractionDigits: 0 })}` : 'GRATIS'}
                        </p>
                        <button 
                          onClick={() => handleOpenProductModal(product)}
                          className="mt-2 w-full bg-[#557e35] text-white py-1 px-2 rounded text-sm hover:bg-[#4a6d2f] transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Paginación */}
          {productsViewMode === 'list' && totalProductListPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button 
                onClick={prevProductListPage}
                disabled={currentProductPage === 0}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} className="text-[#557e35]" />
              </button>
              <span className="text-gray-600">
                Página {currentProductPage + 1} de {totalProductListPages}
              </span>
              <button 
                onClick={nextProductListPage}
                disabled={currentProductPage === totalProductListPages - 1}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={24} className="text-[#557e35]" />
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Modal de Detalles del Producto */}
      <AnimatePresence>
        {selectedProductModal && (
          <ProductDetailModal 
            product={selectedProductModal} 
            onClose={handleCloseProductModal} 
          />
        )}
      </AnimatePresence>

      {/* Botón Flotante para Publicar Producto */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/crear-producto')}
        className="fixed bottom-8 right-8 bg-[#557e35] text-white p-4 rounded-full shadow-lg hover:bg-[#4a6d2f] transition-colors duration-300 flex items-center gap-2 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">Publicar Producto</span>
      </motion.button>
    </div>
  );
};

export default MainPage;