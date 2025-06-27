import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import ValoracionModal from '../components/ValoracionModal'; 

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
  const [mostrarFormularioValoracion, setMostrarFormularioValoracion] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/reservas/mis`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      const estadosOrden = {
        pendiente: 0,
        aceptada: 1,
        entregada: 2,
        cancelada: 3,
        rechazada: 4,
      };

      data.sort((a: Reserva, b: Reserva) => estadosOrden[a.estado] - estadosOrden[b.estado]);

      setReservas(data);
    } catch (err) {
      setError('Error al cargar las reservas');
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const marcarComoEntregada = async (reserva: Reserva) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/api/reservas/${reserva.id_reserva}`,
        { estado: 'entregada' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchReservas();
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
      await axios.put(
        `${API_BASE}/api/reservas/${id}`,
        { estado: 'cancelada' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchReservas();
    } catch (error) {
      console.error('❌ Error al cancelar la reserva:', error);
      setError('No se pudo cancelar la reserva.');
    }
  };

  const eliminarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/reservas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReservas();
    } catch (err) {
      console.error('Error al eliminar reserva', err);
      setError('No se pudo eliminar la reserva.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Reservas</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-6">
        {reservas.map((reserva) => (
          <li key={reserva.id_reserva} className="border rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <p><strong>Producto:</strong> {reserva.producto_reservado?.nombre ?? 'Nombre no disponible'}</p>
                <p><strong>ID Producto:</strong> {reserva.id_producto}</p>
                <p><strong>Fecha Retiro:</strong> {new Date(reserva.fecha_retiro).toLocaleString()}</p>
                <p><strong>Mensaje:</strong> {reserva.mensaje}</p>
                <p><strong>Estado:</strong> {reserva.estado}</p>

                {reserva.estado === 'pendiente' ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => marcarComoEntregada(reserva)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Marcar como Recogido
                    </button>
                    <button
                      onClick={() => cancelarReserva(reserva.id_reserva)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
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
                ) : (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Esta reserva está <strong>{reserva.estado}</strong>.
                  </p>
                )}

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

              {reserva.producto_reservado?.imagen_url && (
                <img
                  src={reserva.producto_reservado.imagen_url}
                  alt={`Imagen de ${reserva.producto_reservado.nombre}`}
                  className="w-40 h-40 object-cover rounded"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyReservationsPage;
