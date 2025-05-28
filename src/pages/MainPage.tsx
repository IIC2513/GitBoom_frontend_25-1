// src/pages/MainPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Removido useAnimation, useMotionValue, useTransform que no se usaban
import { useInView } from 'react-intersection-observer';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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

// Importa tu logo (solo si lo usas en el Header que no está en esta página, sino en App.tsx)
// import REMealLogo from '../assets/Logosinfondo.png'; // Comentado ya que no hay Hero section aquí

// --- Corregir el problema del icono de Leaflet ---
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});
// --- Fin de la corrección del icono ---


// --- Interfaces ---
interface Product {
  id: number;
  id_usuario: number;
  name: string;
  descripcion_corta: string;
  descripcion_larga?: string;
  modalidad: 'Compra Solidaria' | 'Ayuda Social';
  cantidad?: string;
  fecha_expiracion?: string;
  estado: 'Disponible' | 'Reservado' | 'Entregado';
  precio: string;
  fecha_publicacion: string;
  ubicacion_texto: string;
  lat: number;
  lng: number;
  horario_retiro?: string;
  image: string;
  seller_name: string;
}

// --- Sample Data ---
const sampleProducts: Product[] = [
  { id: 1, id_usuario: 101, name: 'Pan Integral Artesanal', modalidad: 'Compra Solidaria', precio: '$1.500', image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400', seller_name: 'Panadería El Sol', ubicacion_texto: 'Av. Providencia 123, Santiago', lat: -33.4372, lng: -70.6203, fecha_publicacion: '2024-07-20', fecha_expiracion: '2024-07-25', horario_retiro: '10:00 - 18:00', cantidad: '1 unidad', estado: 'Disponible', descripcion_corta: 'Delicioso pan integral hecho con masa madre.', descripcion_larga: 'Pan integral artesanal elaborado con ingredientes orgánicos y masa madre de larga fermentación. Perfecto para sándwiches o tostadas.' },
  { id: 2, id_usuario: 102, name: 'Caja de Tomates Maduros', modalidad: 'Ayuda Social', precio: 'Gratis', image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400', seller_name: 'Supermercado La Granja', ubicacion_texto: 'Merced 456, Santiago Centro', lat: -33.4379, lng: -70.6505, fecha_publicacion: '2024-07-19', estado: 'Disponible', descripcion_corta: 'Tomates frescos listos para consumir.', cantidad: '1 caja (aprox 2kg)' },
  { id: 3, id_usuario: 103, name: 'Menú del Día Sobrante', modalidad: 'Compra Solidaria', precio: '$2.000', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', seller_name: 'Restaurante Sabor Casero', ubicacion_texto: 'Irarrázaval 789, Ñuñoa', lat: -33.4589, lng: -70.6009, fecha_publicacion: '2024-07-21', estado: 'Disponible', descripcion_corta: 'Comida casera, porción generosa.', horario_retiro: 'Después de las 15:00' },
  { id: 4, id_usuario: 104, name: 'Yogures Próximos a Vencer', modalidad: 'Ayuda Social', precio: 'Gratis', image: 'https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=400', seller_name: 'Lácteos Frescos SA', ubicacion_texto: 'Pajaritos 1011, Maipú', lat: -33.5114, lng: -70.7685, fecha_publicacion: '2024-07-18', fecha_expiracion: '2024-07-23', estado: 'Disponible', descripcion_corta: 'Pack de yogures variados.', cantidad: 'Pack de 6 unidades' },
];

// --- Sub-Componentes (ProductCard, ProductDetailModal, InfoItem, FitBoundsToMarkers se mantienen igual que en tu código) ---

const ProductCard: React.FC<{ product: Product; onDetailsClick: (product: Product) => void; className?: string }> = ({ product, onDetailsClick, className }) => {
  const cardVariants = { // Esta variante se usa si ProductCard se anima individualmente.
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div // Si la lista completa se anima con AnimatePresence, esta moción individual puede ser redundante o causar doble animación.
      // variants={cardVariants} // Puedes comentar esto si la animación de la lista es suficiente.
      className={`bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col ${className}`}
    >
      <div className="w-full h-48 overflow-hidden">
        <img className="w-full h-full object-cover" src={product.image} alt={product.name} loading="lazy"/>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-[#1d311e] line-clamp-1">{product.name}</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${product.modalidad === 'Compra Solidaria' ? 'bg-[#ff8c00]' : 'bg-[#557e35]'}`}>
            {product.modalidad === 'Compra Solidaria' ? product.precio : 'GRATIS'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{product.descripcion_corta}</p>
        <div className="mt-auto pt-3">
            <p className="text-xs text-gray-500 flex items-center mb-1"><Users size={14} className="mr-1 text-[#557e35]" />{product.seller_name}</p>
            <p className="text-xs text-gray-500 flex items-center"><MapPin size={14} className="mr-1 text-[#557e35]" />{product.ubicacion_texto}</p>
            <button 
              onClick={() => onDetailsClick(product)}
              className="mt-3 w-full bg-[#557e35] text-white py-2 px-4 rounded-lg hover:bg-[#4a6d2f] transition-colors duration-300 text-sm font-medium"
            >
              Ver Detalles
            </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductDetailModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  if (!product) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1d311e]">{product.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={28} /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-lg shadow-md" />
          <div>
            <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full text-white mb-3 ${product.modalidad === 'Compra Solidaria' ? 'bg-[#ff8c00]' : 'bg-[#557e35]'}`}>
              {product.modalidad} {product.modalidad === 'Compra Solidaria' ? `- ${product.precio}` : '- GRATIS'}
            </span>
            <InfoItem icon={Info} label="Estado" value={product.estado} />
            {product.cantidad && <InfoItem icon={Package} label="Cantidad" value={product.cantidad} />}
            <InfoItem icon={Users} label="Publicado por" value={product.seller_name} />
            <InfoItem icon={MapPin} label="Ubicación" value={product.ubicacion_texto} />
            {product.horario_retiro && <InfoItem icon={Clock} label="Horario de Retiro" value={product.horario_retiro} />}
            <InfoItem icon={CalendarDays} label="Publicado el" value={new Date(product.fecha_publicacion).toLocaleDateString()} />
            {product.fecha_expiracion && <InfoItem icon={CalendarDays} label="Vence el" value={new Date(product.fecha_expiracion).toLocaleDateString()} colorClass="text-red-600 font-semibold" />}
          </div>
        </div>
        {product.descripcion_larga && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#1d311e] mb-2">Descripción Detallada</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.descripcion_larga}</p>
          </div>
        )}
        {!product.descripcion_larga && product.descripcion_corta && (
           <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#1d311e] mb-2">Descripción</h3>
            <p className="text-gray-700">{product.descripcion_corta}</p>
          </div>
        )}
        <div className="text-center md:text-right">
          <button className="bg-[#557e35] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#4a6d2f] transition-colors duration-300 shadow-md text-lg">
            {product.modalidad === 'Ayuda Social' ? 'Reservar Donación' : 'Contactar para Comprar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoItem: React.FC<{icon: React.ElementType, label: string, value: string, colorClass?: string}> = ({icon: Icon, label, value, colorClass = "text-gray-700"}) => (
  <div className="flex items-start mb-2">
    <Icon size={18} className="text-[#557e35] mr-2 mt-1 shrink-0" />
    <div>
      <span className="font-medium text-gray-600">{label}: </span>
      <span className={colorClass}>{value}</span>
    </div>
  </div>
);

const FitBoundsToMarkers: React.FC<{ products: Product[] }> = ({ products }) => {
  const map = useMap();
  useEffect(() => {
    if (products.length > 0) {
      const bounds = L.latLngBounds(products.map(p => [p.lat, p.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (products.length === 1) {
        map.setView([products[0].lat, products[0].lng], 13);
      }
    } else {
        map.setView([-33.45694, -70.64827], 6); // Vista de Chile si no hay productos
    }
  }, [products, map]);
  return null;
};

// --- MainPage Component (Simplificado) ---
const MainPage: React.FC = () => {
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [productFilter, setProductFilter] = useState<'all' | 'Compra Solidaria' | 'Ayuda Social'>('all');
  const [productsViewMode, setProductsViewMode] = useState<'list' | 'map'>('list');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  
  const { ref: productsSectionRef, inView: productsSectionInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const filteredRawProducts = sampleProducts.filter(p => 
    (productFilter === 'all' || p.modalidad === productFilter) && p.estado === 'Disponible'
  );

  const productsPerPageInList = 6; // Aumentado para mostrar más en la vista de lista por defecto
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
    hidden: { opacity: 0, y: 20 }, // Más sutil para la entrada de esta única sección
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 pt-8 pb-16 md:pt-12 md:pb-24"> {/* Añadido padding general */}
      
      {/* Descubre Productos Section */}
      <motion.section 
        id="products" 
        ref={productsSectionRef} 
        variants={sectionVariants} 
        initial="hidden" 
        animate={productsSectionInView ? "visible" : "hidden"}
        className="w-full" // Ocupa todo el ancho disponible
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
                    ${productFilter === filterType ? 'bg-[#557e35] text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {filterType === 'all' ? 'Todos' : filterType}
                </button>
              ))}
            </div>
            <div className="flex gap-2 p-1 bg-gray-200 rounded-full">
              <button onClick={() => setProductsViewMode('list')}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${productsViewMode === 'list' ? 'bg-white text-[#557e35] shadow' : 'text-gray-600 hover:text-gray-800'}`}> <List size={18}/> Lista </button>
              <button onClick={() => setProductsViewMode('map')}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${productsViewMode === 'map' ? 'bg-white text-[#557e35] shadow' : 'text-gray-600 hover:text-gray-800'}`}> <MapIcon size={18}/> Mapa </button>
            </div>
          </div>
          {filteredRawProducts.length > 0 ? (
            productsViewMode === 'list' ? (
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div key={productFilter + currentProductPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8"> {/* Ajustado para que quepan 3 en lg */}
                    {displayedListProducts.map((product) => (
                      <ProductCard key={`${product.id}-${productFilter}-${currentProductPage}`} product={product} onDetailsClick={handleOpenProductModal} />
                    ))}
                  </motion.div>
                </AnimatePresence>
                {totalProductListPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-10">
                    <button onClick={prevProductListPage} disabled={currentProductPage === 0} className="p-3 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Página anterior"><ChevronLeft className="w-6 h-6 text-[#557e35]" /></button>
                    <span className="text-gray-700 font-medium">Página {currentProductPage + 1} de {totalProductListPages}</span>
                    <button onClick={nextProductListPage} disabled={currentProductPage === totalProductListPages - 1} className="p-3 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Página siguiente"><ChevronRight className="w-6 h-6 text-[#557e35]" /></button>
                  </div>
                )}
                {/* Se elimina el botón "Ver Todos los Productos" ya que esta es la página principal de productos */}
              </div>
            ) : (
              // VISTA DE MAPA
              // Intenta quitar la animación de la sección si el error de Leaflet persiste para aislar el problema
              <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <MapContainer center={[-33.45694, -70.64827]} zoom={6} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                  {filteredRawProducts.map(product => (
                    <Marker key={product.id} position={[product.lat, product.lng]}>
                      <Popup>
                        <div className="w-48">
                          <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2"/>
                          <h3 className="text-sm font-semibold text-[#1d311e] mb-1 truncate">{product.name}</h3>
                          <p className={`text-xs font-bold mb-1 ${product.modalidad === 'Compra Solidaria' ? 'text-[#ff8c00]' : 'text-[#557e35]'}`}>
                            {product.modalidad === 'Compra Solidaria' ? product.precio : 'GRATIS'}
                          </p>
                          <p className="text-xs text-gray-500 truncate mb-2">{product.ubicacion_texto}</p>
                          <button onClick={() => handleOpenProductModal(product)} className="w-full bg-[#557e35] text-white py-1.5 px-3 rounded text-xs hover:bg-[#4a6d2f] transition-colors">Ver Detalles</button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <FitBoundsToMarkers products={filteredRawProducts} />
                </MapContainer>
              </div>
            )
          ) : (
            <p className="text-center text-gray-500 py-10 text-lg">Actualmente no hay productos disponibles para esta selección. ¡Vuelve pronto!</p>
          )}
        </div>
      </motion.section>

      {/* Modal para Detalles del Producto */}
      <AnimatePresence>
        {selectedProductModal && (<ProductDetailModal product={selectedProductModal} onClose={handleCloseProductModal} />)}
      </AnimatePresence>
    </div>
  );
};

export default MainPage;