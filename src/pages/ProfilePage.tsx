import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, LogOut, Phone, Mail, Clock, DollarSign, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfilePhotoForm from '../components/ProfilePhotoForm';

interface ProfilePageProps {
  user: {
    id_usuario: string;
    nombre: string;
    correo: string;
    telefono?: string;
    direccion?: string;
    rol: 'usuario' | 'admin';
    fotoPerfil?: string;
  };
  onLogout: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    tipo_producto: string;
    cantidad: number;
    fecha_expiracion: string;
    precio: number;
    categoria: string;
    ubicacion: string;
    lat: number;
    lng: number;
    estado: string;
    imagen_url?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const [photoUrl, setPhotoUrl] = useState<string>(user.fotoPerfil || '');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No se encontró token, redirigiendo a auth...');
          navigate('/auth');
          return;
        }

        // Obtener el ID del usuario del localStorage
        const userData = localStorage.getItem('usuario');
        console.log('Datos del usuario en localStorage:', userData);
        
        if (!userData) {
          // Si no hay datos en localStorage, intentar obtenerlos del token decodificado
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          console.log('Datos del token:', tokenData);
          
          if (!tokenData || !tokenData.id) {
            throw new Error('No se encontró información del usuario en el token');
          }

          const userInfo = {
            id_usuario: tokenData.id,
            nombre: tokenData.nombre || '',
            correo: tokenData.correo
          };
          
          console.log('Datos del usuario obtenidos del token:', userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        }

        let user;
        try {
          user = JSON.parse(userData || localStorage.getItem('user') || '{}');
          console.log('Usuario parseado:', user);
        } catch (e) {
          console.error('Error al parsear datos del usuario:', e);
          throw new Error('Error al procesar información del usuario');
        }

        if (!user || !user.id_usuario) {
          console.error('Datos del usuario incompletos:', user);
          throw new Error('Información del usuario incompleta');
        }

        console.log('Obteniendo productos del usuario...');
        const productsResponse = await fetch(`${API_BASE}/api/productos?id_usuario=${user.id_usuario}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Respuesta del servidor:', {
          status: productsResponse.status,
          statusText: productsResponse.statusText
        });

        if (!productsResponse.ok) {
          const errorData = await productsResponse.json().catch(() => null);
          console.error('Error detallado del servidor:', errorData);
          throw new Error(errorData?.message || `Error al obtener productos: ${productsResponse.status} ${productsResponse.statusText}`);
        }
        const raw: any[] = await productsResponse.json();
        console.log('Productos crudos obtenidos:', raw);
        // Mapea cada objeto para renombrar id_producto → id
        const normalized: Product[] = raw.map((p: any) => ({
          id: p.id_producto,
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipo_producto: p.tipo_producto,
          cantidad: p.cantidad,
          fecha_expiracion: p.fecha_expiracion,
          precio: p.precio,
          categoria: p.categoria,
          ubicacion: p.ubicacion,
          lat: p.lat,
          lng: p.lng,
          estado: p.estado,
          imagen_url: p.imagen_url,
        }));
        console.log('Productos normalizados:', normalized);
        setProducts(normalized);
      } catch (err) {
        console.error('Error completo:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePhotoUploaded = (url: string) => {
    setPhotoUrl(url);
    const updatedUser = { ...user, fotoPerfil: url };
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-t-2 border-b-2 border-[#557e35] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sección de Perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <User className="w-12 h-12 text-gray-400 mx-auto mt-6" />
                )}
              </div>

              {/* Formulario para subir foto */}
              <div className="mt-4">
                <ProfilePhotoForm onUploaded={handlePhotoUploaded} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#1d311e]">{user.nombre}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-[#557e35]" />
                  <span className="text-gray-700">{user.correo}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-[#557e35]" />
                  <span className="text-gray-700">{user.telefono || 'No se ha proporcionado teléfono'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-[#557e35]" />
                  <span className="text-gray-700">{user.direccion || 'No se ha proporcionado dirección'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1d311e] flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Mis Productos
            </h2>
            <button 
              onClick={() => navigate('/crear-producto')}
              className="bg-[#557e35] text-white px-4 py-2 rounded-md hover:bg-[#4a6e2e] transition-colors"
            >
              Publicar Nuevo
            </button>
          </div>
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No has publicado ningún producto aún.</p>
                <button
                  onClick={() => navigate('/crear-producto')}
                  className="mt-4 px-4 py-2 bg-[#557e35] text-white rounded-lg font-semibold hover:bg-[#4a6d2f] transition-colors"
                >
                  Publicar mi primer producto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      {product.imagen_url ? (
                        <img
                          src={product.imagen_url}
                          alt={product.nombre}
                          className="object-cover w-full h-48"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-[#1d311e] mb-2">{product.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.descripcion}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{product.ubicacion}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Expira: {new Date(product.fecha_expiracion).toLocaleDateString()}</span>
                        </div>
                        {product.categoria === 'Compra Solidaria' && (
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>{formatPrice(product.precio)}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                          product.estado === 'reservado' ? 'bg-yellow-100 text-yellow-800' :
                          product.estado === 'entregado' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.estado.charAt(0).toUpperCase() + product.estado.slice(1)}
                        </span>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-[#557e35] hover:text-[#4a6d2f] font-medium text-sm flex items-center gap-1"
                        >
                          <Info className="w-4 h-4" />
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Cerrar Sesión */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 transition-colors py-3 border border-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#1d311e]">{selectedProduct.nombre}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4">
                {selectedProduct.imagen_url ? (
                  <img
                    src={selectedProduct.imagen_url}
                    alt={selectedProduct.nombre}
                    className="object-cover w-full h-64 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Descripción</h3>
                  <p className="text-gray-600">{selectedProduct.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Tipo de Producto</h3>
                    <p className="text-gray-600">{selectedProduct.tipo_producto}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Cantidad</h3>
                    <p className="text-gray-600">{selectedProduct.cantidad}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Categoría</h3>
                    <p className="text-gray-600">{selectedProduct.categoria}</p>
                  </div>
                  {selectedProduct.categoria === 'Compra Solidaria' && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Precio</h3>
                      <p className="text-gray-600">{formatPrice(selectedProduct.precio)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Ubicación</h3>
                  <p className="text-gray-600">{selectedProduct.ubicacion}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Fecha de Expiración</h3>
                  <p className="text-gray-600">{new Date(selectedProduct.fecha_expiracion).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Estado</h3>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                    selectedProduct.estado === 'reservado' ? 'bg-yellow-100 text-yellow-800' :
                    selectedProduct.estado === 'entregado' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProduct.estado.charAt(0).toUpperCase() + selectedProduct.estado.slice(1)}
                  </span>
                </div>
                <div className="mt-6 text-right">
                  {/* Botón Editar */}
                  <button
                    onClick={() => navigate(`/productos/editar/${selectedProduct.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Producto
                  </button>
                  {/* Botón Eliminar */}
                  <button
                    onClick={async () => {
                      const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este producto?');
                      if (!confirmDelete) return;

                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_BASE}/api/productos/${selectedProduct.id}`, {
                          method: 'DELETE',
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        });

                        if (!res.ok) {
                          throw new Error('Error al eliminar el producto');
                        }

                        // Actualizar la lista de productos (eliminar el que fue borrado)
                        setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
                        setSelectedProduct(null); // Cerrar el modal
                      } catch (err) {
                        console.error(err);
                        alert('Hubo un problema al eliminar el producto.');
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Eliminar Producto
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 