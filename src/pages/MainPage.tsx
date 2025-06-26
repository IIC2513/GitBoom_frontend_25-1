// src/pages/MainPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import socket from '../socket';
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

import ProductCard from '../components/ProductCard';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

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
  seller_name: string;
  image: string;
}

interface Usuario {
  id_usuario: string;
}

const formatPrice = (price: number) => {
  const roundedPrice = Math.floor(price);
  return `$${roundedPrice.toLocaleString('es-CL')}`;
};

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

interface MainPageProps {
  user: Usuario | null;
}

const MainPage: React.FC<MainPageProps> = ({ user }) => {
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [productFilter, setProductFilter] = useState<'all' | 'Compra Solidaria' | 'Ayuda Social'>('all');
  const [productsViewMode, setProductsViewMode] = useState<'list' | 'map'>('list');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { ref: productsSectionRef, inView: productsSectionInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/api/productos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('🟢 Respuesta cruda del backend:', response.data);

        const productosData = response.data.map((producto: any) => {
          console.log('📦 Producto antes de normalizar:', producto);

          const normalizado = {
            ...producto,
            seller_name: producto.Usuario?.nombre ?? 'Usuario desconocido',
            image: producto.imagen_url,
            ubicacion: producto.ubicacion ?? 'Ubicación no disponible',
            estado: producto.estado ?? 'desconocido',
            cantidad: producto.cantidad ?? 0,
            precio: producto.precio ?? 0,
            fechaVencimiento: producto.fecha_expiracion ?? null,       // ✅ este cambio
            fechaPublicacion: producto.fecha_publicacion ?? null, 
          };

          console.log('🛠 Producto normalizado:', normalizado);
          return normalizado;
        });  
        setProducts(productosData);
        setError(null);
      } catch (err) {
        console.error('🔴 Error al obtener productos:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    socket.on("producto:nuevo", (nuevoProducto: Product) => {
      console.log("🆕 Producto recibido por socket:", nuevoProducto);
  
      const productoNormalizado = {
        ...nuevoProducto,
        seller_name: nuevoProducto.Usuario?.nombre ?? 'Usuario desconocido',
        image: nuevoProducto.imagen_url,
        ubicacion: nuevoProducto.ubicacion ?? 'Ubicación no disponible',
        estado: nuevoProducto.estado ?? 'desconocido',
        cantidad: nuevoProducto.cantidad ?? 0,
        precio: nuevoProducto.precio ?? 0,
        fechaVencimiento: nuevoProducto.fecha_expiracion ?? null,
        fechaPublicacion: nuevoProducto.fecha_publicacion ?? null,
      };
  
      setProducts((prev) => [productoNormalizado, ...prev]);
    });
  
    return () => {
      socket.off("producto:nuevo");
    };
  }, []);
  
  useEffect(() => {
    socket.on("producto:eliminado", ({ id_producto }) => {
      console.log("🗑 Producto eliminado vía socket:", id_producto);
      setProducts(prev => prev.filter(p => p.id_producto !== id_producto));
    });
  
    return () => {
      socket.off("producto:eliminado");
    };
  }, []);
  
  useEffect(() => {
    const handleProductoActualizado = (productoActualizado: Product) => {
      const normalizado = {
        ...productoActualizado,
        seller_name: productoActualizado.Usuario?.nombre ?? 'Usuario desconocido',
        image: productoActualizado.imagen_url,
        ubicacion: productoActualizado.ubicacion ?? 'Ubicación no disponible',
        estado: productoActualizado.estado ?? 'desconocido',
        cantidad: productoActualizado.cantidad ?? 0,
        precio: productoActualizado.precio ?? 0,
        fechaVencimiento: productoActualizado.fecha_expiracion ?? null,
        fechaPublicacion: productoActualizado.fecha_publicacion ?? null,
      };
  
      setProducts((prev) =>
        prev.map((p) => (p.id_producto === normalizado.id_producto ? normalizado : p))
      );
    };
  
    socket.on("producto:actualizado", handleProductoActualizado);
    return () => {
      socket.off("producto:actualizado", handleProductoActualizado);
    };
  }, []);
  
  

  const filteredRawProducts = products
    .filter(p => productFilter === 'all' || p.categoria === productFilter)
    .sort((a, b) => {
      // Primero los disponibles, luego los agotados
      if (a.estado === 'disponible' && b.estado !== 'disponible') return -1;
      if (a.estado !== 'disponible' && b.estado === 'disponible') return 1;
      return 0;
    });

  const productsPerPageInList = 6; 
  const totalProductListPages = Math.ceil(filteredRawProducts.length / productsPerPageInList);
  const displayedListProducts = filteredRawProducts.slice(
    currentProductPage * productsPerPageInList,
    (currentProductPage + 1) * productsPerPageInList
  );

  const nextProductListPage = () => setCurrentProductPage((prev) => Math.min(prev + 1, totalProductListPages - 1));
  const prevProductListPage = () => setCurrentProductPage((prev) => Math.max(prev - 1, 0));

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const handleCloseProductModal = () => setSelectedProductModal(null);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#557e35]"></div></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500 text-center">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 pt-8 pb-16 md:pt-12 md:pb-24">
      <motion.section id="products" ref={productsSectionRef} variants={sectionVariants} initial="hidden" animate={productsSectionInView ? "visible" : "hidden"} className="w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-6">Alimentos Disponibles</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Explora los productos que nuestra comunidad ha publicado para ti. Filtra por tipo o cambia a la vista de mapa.</p>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
              {(['all', 'Compra Solidaria', 'Ayuda Social'] as const).map(filterType => (
                <button key={filterType} onClick={() => { setProductFilter(filterType); setCurrentProductPage(0); }}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${productFilter === filterType ? 'bg-[#557e35] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                  {filterType === 'all' ? 'Todos' : filterType}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setProductsViewMode('list')} className={`p-2 rounded-lg ${productsViewMode === 'list' ? 'bg-[#557e35] text-white' : 'bg-white text-gray-700'}`}><List size={20} /></button>
              <button onClick={() => setProductsViewMode('map')} className={`p-2 rounded-lg ${productsViewMode === 'map' ? 'bg-[#557e35] text-white' : 'bg-white text-gray-700'}`}><MapIcon size={20} /></button>
            </div>
          </div>

          {productsViewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedListProducts.map((product) => (
                <ProductCard 
                  key={product.id_producto}
                  product={{
                    id: product.id_producto,
                    id_usuario: product.id_usuario,
                    name: product.nombre,
                    type: product.categoria,
                    price: product.categoria === 'Compra Solidaria' ? formatPrice(product.precio) : 'GRATIS',
                    image: product.image,
                    seller: product.seller_name,
                    location: product.ubicacion,
                    estado: product.estado,
                    cantidad: product.cantidad,
                    fechaPublicacion: product.fecha_publicacion,
                    fechaVencimiento: product.fecha_expiracion,
                    descripcion: product.descripcion
                  }}
                  user={user}
                />
              ))}
            </div>
          )}

          {productsViewMode === 'map' && (
            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg">
              <MapContainer center={[-33.45694, -70.64827]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <FitBoundsToMarkers products={filteredRawProducts} />
                {filteredRawProducts.map((product) => (
                  <Marker key={product.id_producto} position={[product.lat, product.lng]}>
                    <Popup>
                      <div className="w-52">
                        <h3 className="font-semibold text-[#1d311e] text-sm mb-1">{product.nombre}</h3>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">{product.descripcion}</p>
                        <p className="text-xs font-medium text-[#557e35] mb-2">{product.categoria === 'Compra Solidaria' ? `$${product.precio.toLocaleString('es-CL')}` : 'GRATIS'}</p>
                        <button onClick={() => setSelectedProductModal(product)} className="w-full bg-[#557e35] text-white py-1 px-2 rounded text-xs hover:bg-[#4a6d2f] transition-colors">Ver Detalles</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {productsViewMode === 'list' && totalProductListPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button onClick={prevProductListPage} disabled={currentProductPage === 0} className="p-2 rounded-full bg-white shadow-md"><ChevronLeft size={24} className="text-[#557e35]" /></button>
              <span className="text-gray-600">Página {currentProductPage + 1} de {totalProductListPages}</span>
              <button onClick={nextProductListPage} disabled={currentProductPage === totalProductListPages - 1} className="p-2 rounded-full bg-white shadow-md"><ChevronRight size={24} className="text-[#557e35]" /></button>
            </div>
          )}
        </div>
      </motion.section>

<AnimatePresence>
  {selectedProductModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={handleCloseProductModal}
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
            <h2 className="text-2xl font-bold text-[#1d311e]">{selectedProductModal.nombre}</h2>
            <button onClick={handleCloseProductModal} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>

          <img
            src={selectedProductModal.image}
            alt={selectedProductModal.nombre}
            className="w-full h-64 object-cover rounded-lg shadow-md mb-6"
          />

          <p className="text-gray-700 mb-4">{selectedProductModal.descripcion}</p>

          {/* ✅ BOTÓN VER VALORACIONES */}
          <button
            onClick={() => navigate(`/productos/${selectedProductModal.id_producto}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            Ver valoraciones
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      <motion.button onClick={() => navigate('/crear-producto')} className="fixed bottom-8 right-8 bg-[#557e35] text-white p-4 rounded-full shadow-lg hover:bg-[#4a6d2f] flex items-center gap-2 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">Publicar Producto</span>
      </motion.button>
    </div>
  );
};

export default MainPage;
