import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Producto {
  nombre: string;
  imagen_url: string;
}

interface Reserva {
  id_reserva: string;
  id_producto: string;
  fecha_retiro: string;
  mensaje: string;
  estado: string;
  producto_reservado: Producto;
}

const ReservasDeMisProductosPage: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/reservas/mis-productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
          // Ordenar por estado
      const estadosOrden = {
        pendiente: 0,
        aceptada: 1,
        entregada: 2,
        cancelada: 3,
        rechazada: 4
     };
      data.sort((a, b) => estadosOrden[a.estado] - estadosOrden[b.estado]);

      setReservas(response.data);

      
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError('No se pudieron cargar las reservas.');
    }
  };

  const actualizarEstado = async (id: string, nuevoEstado: 'aceptada' | 'rechazada') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/reservas/${id}/aprobar`, {
        estado: nuevoEstado,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReservas(); // Recargar después de actualizar
    } catch (err) {
      console.error('Error al cambiar estado de la reserva:', err);
      setError('No se pudo cambiar el estado de la reserva.');
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reservas de mis productos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {reservas.length === 0 ? (
        <p>No hay reservas sobre tus productos.</p>
      ) : (
        <ul className="space-y-4">
          {reservas.map((reserva) => (
            <li key={reserva.id_reserva} className="border rounded-lg p-4 shadow-sm flex justify-between items-center">
              <div>
                <p><strong>Producto:</strong> {reserva.producto_reservado?.nombre}</p>
                <p><strong>Fecha de retiro:</strong> {new Date(reserva.fecha_retiro).toLocaleString()}</p>
                <p><strong>Mensaje:</strong> {reserva.mensaje}</p>
                <p><strong>Estado:</strong> {reserva.estado}</p>

                {reserva.estado === 'pendiente' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => actualizarEstado(reserva.id_reserva, 'aceptada')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => actualizarEstado(reserva.id_reserva, 'rechazada')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
              {reserva.producto_reservado?.imagen_url && (
                <img
                  src={reserva.producto_reservado.imagen_url}
                  alt="Producto"
                  className="w-28 h-28 object-cover rounded"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReservasDeMisProductosPage;
