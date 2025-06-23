import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Reserva {
  id_reserva: string;
  id_producto: string;
  id_usuario: string;
  fecha_retiro: string;
  mensaje: string;
  estado: string;
  producto_reservado?: {
    nombre: string;
    imagen_url: string;
  };
}

const MyReservationsPage: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      // Ordenar antes de setear
      const estadosOrden = {
        pendiente: 0,
        aceptada: 1,
        entregada: 2,
        cancelada: 3,
        rechazada: 4
      };

      data.sort((a, b) => estadosOrden[a.estado] - estadosOrden[b.estado]);

      setReservas(data);
    } catch (err) {
      setError('Error al cargar las reservas');
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

const marcarComoEntregada = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE}/api/reservas/${id}`, {
      estado: 'entregada'
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    fetchReservas();
  } catch (error) {
    console.error('❌ Error al marcar como entregada:', error);
    setError('No se pudo marcar como entregada.');
  }
};

  const cancelarReserva = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE}/api/reservas/${id}`, {
      estado: 'cancelada'
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    fetchReservas();
  } catch (error) {
    console.error('❌ Error al cancelar la reserva:', error);
    setError('No se pudo cancelar la reserva.');
  }
};

  const editarReserva = async (id: string, nuevaFecha: string, nuevoMensaje: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/reservas/${id}`, {
        fecha_retiro: nuevaFecha,
        mensaje: nuevoMensaje,
        estado: 'pendiente'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Reserva actualizada');
      fetchReservas(); // Recarga la lista
    } catch (err) {
      console.error('Error al actualizar reserva:', err);
      setError('No se pudo actualizar la reserva');
    }
  };

  const eliminarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/reservas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReservas(); // Recargar después de eliminar
    } catch (err) {
      console.error('Error al eliminar reserva', err);
      setError('No se pudo eliminar la reserva.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Reservas</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-4">
        {reservas.map((reserva) => (
          <li key={reserva.id_reserva} className="border rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <p><strong>Producto:</strong> {reserva.producto_reservado?.nombre ?? 'Nombre no disponible'}</p>
              <p><strong>Producto ID:</strong> {reserva.id_producto}</p>
              <p><strong>Fecha Retiro:</strong> {new Date(reserva.fecha_retiro).toLocaleString()}</p>
              <p><strong>Mensaje:</strong> {reserva.mensaje}</p>
              <p><strong>Estado:</strong> {reserva.estado}</p>

              {reserva.estado === 'pendiente' && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => marcarComoEntregada(reserva.id_reserva)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Marcar como Recogido
                  </button>
                  <button
                    onClick={() => cancelarReserva(reserva.id_reserva)}
                    className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => eliminarReserva(reserva.id_reserva)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              )}

              {reserva.estado !== 'pendiente' && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  Esta reserva está {reserva.estado === 'entregada' ? 'marcada como entregada' : 'cancelada'} y no puede modificarse.
                </p>
              )}
            </div>

            {reserva.producto_reservado?.imagen_url && (
              <img
                src={reserva.producto_reservado.imagen_url}
                alt="Producto"
                className="w-40 h-40 object-cover rounded"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyReservationsPage;
