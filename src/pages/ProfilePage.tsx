import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, LogOut, Phone, Mail, Clock, DollarSign, Info, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ValoracionModal from '../components/ValoracionModal';

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

interface Reserva {
  id_reserva: string;
  id_producto: string;
  fecha_retiro: string;
  mensaje: string;
  estado: string;
  producto_reservado: {
    nombre: string;
    imagen_url: string;
    categoria: string;
    precio: number;
  };
}

interface ReservaDeMiProducto {
  id_reserva: string;
  id_producto: string;
  fecha_retiro: string;
  mensaje: string;
  estado: string;
  producto_reservado: {
    nombre: string;
    imagen_url: string;
    categoria: string;
    precio: number;
  };
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const [photoUrl, setPhotoUrl] = useState<string>(user.fotoPerfil || '');

  const [products, setProducts] = useState<Product[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservasDeMisProductos, setReservasDeMisProductos] = useState<ReservaDeMiProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormularioValoracion, setMostrarFormularioValoracion] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);

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

      // Obtener reservas del usuario
      console.log('Obteniendo reservas del usuario...');
      const reservasResponse = await fetch(`${API_BASE}/api/reservas/mis`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (reservasResponse.ok) {
        const reservasData = await reservasResponse.json();
        console.log('Reservas obtenidas:', reservasData);
        setReservas(reservasData);
      } else {
        console.error('Error al obtener reservas:', reservasResponse.status);
      }

      // Obtener reservas de mis productos
      console.log('Obteniendo reservas de mis productos...');
      const reservasProductosResponse = await fetch(`${API_BASE}/api/reservas/mis-productos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (reservasProductosResponse.ok) {
        const reservasProductosData = await reservasProductosResponse.json();
        console.log('Reservas de mis productos obtenidas:', reservasProductosData);
        setReservasDeMisProductos(reservasProductosData);
      } else {
        console.error('Error al obtener reservas de mis productos:', reservasProductosResponse.status);
      }

    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const marcarComoEntregada = async (reserva: Reserva) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${API_BASE}/api/reservas/${reserva.id_reserva}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'entregada' }),
        }
      );

      await fetchUserData();
      setReservaSeleccionada(reserva);
      setMostrarFormularioValoracion(true);
    } catch (error) {
      console.error('❌ Error al marcar como entregada:', error);
      setError('No se pudo marcar como entregada.');
    }
  };

  const cancelarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${API_BASE}/api/reservas/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'cancelada' }),
        }
      );
      fetchUserData();
    } catch (error) {
      console.error('❌ Error al cancelar la reserva:', error);
      setError('No se pudo cancelar la reserva.');
    }
  };

  const eliminarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserData();
    } catch (err) {
      console.error('Error al eliminar reserva', err);
      setError('No se pudo eliminar la reserva.');
    }
  };

  const aceptarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${API_BASE}/api/reservas/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'aceptada' }),
        }
      );
      fetchUserData();
    } catch (error) {
      console.error('❌ Error al aceptar la reserva:', error);
      setError('No se pudo aceptar la reserva.');
    }
  };

  const rechazarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${API_BASE}/api/reservas/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'rechazada' }),
        }
      );
      fetchUserData();
    } catch (error) {
      console.error('❌ Error al rechazar la reserva:', error);
      setError('No se pudo rechazar la reserva.');
    }
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
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <User className="w-20 h-20 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#1d311e]">{user.nombre}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  user.rol === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'
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
                <button 
                  onClick={() => navigate('/perfil/editar')}
                  className="flex items-center justify-center space-x-2 border border-[#557e35] text-[#557e35] hover:bg-[#e8f5e9] transition-colors py-2 px-6 rounded-md font-medium"
                >
                  Editar perfil
                </button> 
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
              className="border border-[#557e35] text-[#557e35] bg-white px-4 py-2 rounded-md font-semibold hover:bg-[#e8f5e9] transition-colors"
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
                          onClick={() => navigate(`/productos/editar/${product.id}`)}
                          className="text-[#557e35] hover:text-[#4a6d2f] transition-colors p-1 rounded hover:bg-gray-100"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Mis Reservas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1d311e] flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Mis Reservas
            </h2>
          </div>
          <div className="space-y-4">
            {reservas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No has hecho ninguna reserva aún.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-4 py-2 bg-[#557e35] text-white rounded-lg font-semibold hover:bg-[#4a6d2f] transition-colors"
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservas.map((reserva) => (
                  <motion.div
                    key={reserva.id_reserva}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      {reserva.producto_reservado?.imagen_url ? (
                        <img
                          src={reserva.producto_reservado.imagen_url}
                          alt={reserva.producto_reservado.nombre}
                          className="object-cover w-full h-48"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-[#1d311e] mb-2">{reserva.producto_reservado?.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reserva.mensaje}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Retiro: {new Date(reserva.fecha_retiro).toLocaleDateString()}</span>
                        </div>
                        {reserva.producto_reservado?.categoria === 'Compra Solidaria' && (
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>{formatPrice(reserva.producto_reservado.precio)}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          reserva.estado === 'aceptada' ? 'bg-green-100 text-green-800' :
                          reserva.estado === 'entregada' ? 'bg-blue-100 text-blue-800' :
                          reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                      </div>

                      {/* Botones de acción para reservas pendientes */}
                      {reserva.estado === 'pendiente' && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          <button
                            onClick={() => marcarComoEntregada(reserva)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            ✅ Marcar como Recogido
                          </button>
                          <button
                            onClick={() => cancelarReserva(reserva.id_reserva)}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            ⏹️ Cancelar
                          </button>
                          <button
                            onClick={() => eliminarReserva(reserva.id_reserva)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}

                      {/* Modal de valoración */}
                      {mostrarFormularioValoracion &&
                        reservaSeleccionada?.id_reserva === reserva.id_reserva && (
                          <ValoracionModal
                            id_producto={reserva.id_producto}
                            id_reserva={reserva.id_reserva}
                            onClose={() => {
                              setMostrarFormularioValoracion(false);
                              setReservaSeleccionada(null);
                            }}
                          />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Reservas sobre Mis Productos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1d311e] flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Reservas sobre Mis Productos
            </h2>
          </div>
          <div className="space-y-4">
            {reservasDeMisProductos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No hay reservas sobre tus productos aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservasDeMisProductos.map((reserva) => (
                  <motion.div
                    key={reserva.id_reserva}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      {reserva.producto_reservado?.imagen_url ? (
                        <img
                          src={reserva.producto_reservado.imagen_url}
                          alt={reserva.producto_reservado.nombre}
                          className="object-cover w-full h-48"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-[#1d311e] mb-2">{reserva.producto_reservado?.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reserva.mensaje}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Retiro: {new Date(reserva.fecha_retiro).toLocaleDateString()}</span>
                        </div>
                        {reserva.producto_reservado?.categoria === 'Compra Solidaria' && (
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>{formatPrice(reserva.producto_reservado.precio)}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          reserva.estado === 'aceptada' ? 'bg-green-100 text-green-800' :
                          reserva.estado === 'entregada' ? 'bg-blue-100 text-blue-800' :
                          reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                          reserva.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                      </div>

                      {/* Botones de acción para reservas pendientes */}
                      {reserva.estado === 'pendiente' && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          <button
                            onClick={() => aceptarReserva(reserva.id_reserva)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            ✅ Aceptar
                          </button>
                          <button
                            onClick={() => rechazarReserva(reserva.id_reserva)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de Cerrar Sesión y Dashboard Admin */}
        {user.rol === 'admin' && (
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); navigate('/admin-dashboard'); }}
            className="w-full flex items-center justify-center space-x-2 mb-4 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:from-red-700 hover:to-pink-600 transition-all text-lg"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2l.4 2M7 13h10l1.4 2M17 13h2m-9 4h4m-2-4V7m0 0L5 7m7 0l7 0" /></svg>
            Dashboard Administrador
          </button>
        )}
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
    </div>
  );
};

export default ProfilePage;