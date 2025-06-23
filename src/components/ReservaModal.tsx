import React, { useState } from 'react';
import axios from 'axios';

interface ReservaModalProps {
  id_producto: string;
  onClose: () => void;
  onSuccess?: () => void;
  updateProduct?: (updater: (prev: any) => any) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const ReservaModal: React.FC<ReservaModalProps> = ({
  id_producto,
  onClose,
  onSuccess,
  updateProduct
}) => {
  const [fechaRetiro, setFechaRetiro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReserva = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false); // Limpia estado previo

      const fechaInvalida = fechaRetiro !== '' && new Date(fechaRetiro) < new Date();


      const ahora = new Date();
      const retiro = new Date(fechaRetiro);

      if (isNaN(retiro.getTime()) || retiro < ahora) {
        setError('La fecha de retiro debe ser posterior al momento actual.');
        return;
      }

      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE}/api/reservas`,
        {
          id_producto,
          fecha_retiro: fechaRetiro,
          mensaje,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess(true);

      // Actualiza cantidad local en el producto
      if (updateProduct) {
        updateProduct((prev: any) => {
          const nuevaCantidad = prev.cantidad > 0 ? prev.cantidad - 1 : 0;
          return {
            ...prev,
            cantidad: nuevaCantidad,
            estado: nuevaCantidad === 0 ? 'reservado' : prev.estado,
          };
        });
      }

      if (onSuccess) onSuccess();

      // Opcional: ocultar mensaje verde tras unos segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError('No se pudo crear la reserva.');
      setSuccess(false); // Limpia éxito si hubo error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg relative">
        <h2 className="text-2xl font-bold text-[#1d311e] mb-4">Reservar Producto</h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">Fecha de Retiro</label>
        <input
          type="datetime-local"
          value={fechaRetiro}
          onChange={(e) => setFechaRetiro(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">Mensaje</label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">Reserva creada exitosamente.</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleReserva}
            disabled={ loading || !fechaRetiro || !mensaje || new Date(fechaRetiro) < new Date()}
            className="bg-[#557e35] text-white px-4 py-2 rounded-lg hover:bg-[#4a6d2f] disabled:opacity-50"
          >
            {loading ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservaModal;
