import React from 'react';
import { User, Package, Calendar, MapPin, LogOut, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  user: {
    id_usuario: string;
    nombre: string;
    correo: string;
    telefono?: string;
    direccion?: string;
    rol: 'usuario' | 'admin';
  };
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Datos de ejemplo - Estos vendrían de tu backend
  const userProducts = [
    { id: 1, name: 'Pan Integral', type: 'Compra Solidaria', status: 'Activo' },
    { id: 2, name: 'Tomates', type: 'Ayuda Social', status: 'Reservado' },
  ];

  const userReservations = [
    { id: 1, product: 'Yogures', date: '2024-03-20', status: 'Pendiente' },
    { id: 2, product: 'Frutas Varias', date: '2024-03-21', status: 'Confirmado' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sección de Perfil */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <User className="w-12 h-12 text-gray-400" />
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
          {userProducts.map(product => (
            <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-[#1d311e]">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                product.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Reservas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1d311e] flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Mis Reservas
          </h2>
        </div>
        <div className="space-y-4">
          {userReservations.map(reservation => (
            <div key={reservation.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-[#1d311e]">{reservation.product}</h3>
                <p className="text-sm text-gray-600">Fecha: {reservation.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                reservation.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {reservation.status}
              </span>
            </div>
          ))}
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
  );
};

export default ProfilePage; 