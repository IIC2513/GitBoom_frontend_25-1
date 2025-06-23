import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Reserva {
  id_reserva: string;
  estado: string;
  fecha_retiro: string;
  mensaje: string;
  id_producto: string;
  producto?: {
    name: string;
    image: string;
    price: string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MyReservationsPage: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/api/reservas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReservas(response.data);
      } catch (err: any) {
        console.error(err);
        setError('No se pudieron cargar las reservas.');
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#1d311e] mb-6">Mis Reservas</h1>
      {loading ? (
        <p>Cargando reservas...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : reservas.length === 0 ? (
        <p>No tienes reservas registradas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map((reserva) => (
            <div key={reserva.id_reserva} className="bg-white shadow-md rounded-xl overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img
                  src={reserva.producto?.image || '/placeholder.jpg'}
                  alt={reserva.producto?.name || 'Producto'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#1d311e] mb-1">
                  {reserva.producto?.name || 'Producto reservado'}
                </h3>
                <p className="text-sm text-gray-600 mb-1">Estado: <strong>{reserva.estado}</strong></p>
                <p className="text-sm text-gray-600 mb-1">Fecha de retiro: {new Date(reserva.fecha_retiro).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mb-2">Mensaje: {reserva.mensaje}</p>
                <button
                  onClick={() => nav(`/productos/${reserva.id_producto}`)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Ver producto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
