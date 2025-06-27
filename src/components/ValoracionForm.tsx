import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface Props {
  id_producto: string;
  id_reserva: string;
  onSuccess?: () => void;
}

const ValoracionForm: React.FC<Props> = ({ id_producto, id_reserva, onSuccess }) => {
  const [comentario, setComentario] = useState('');
  const [puntuacion, setPuntuacion] = useState(5);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id_reserva) {
      setError('No se encontró una reserva válida.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/valoraciones`, {
        comentario,
        puntuacion,
        id_producto,
        id_reserva,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setComentario('');
      setPuntuacion(5);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error(err);
      setError('Error al enviar valoración.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white shadow p-4 rounded-md">
      <h3 className="text-lg font-bold text-[#1d311e]">Deja tu valoración</h3>

      {success && <p className="text-green-600">¡Valoración enviada con éxito!</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium">Comentario</label>
        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} required className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block text-sm font-medium">Puntuación</label>
        <select value={puntuacion} onChange={(e) => setPuntuacion(parseInt(e.target.value))} className="w-full border p-2 rounded">
          {[5, 4, 3, 2, 1].map((val) => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="bg-[#557e35] text-white px-4 py-2 rounded hover:bg-[#46652a]">
        Enviar valoración
      </button>
    </form>
  );
};

export default ValoracionForm;
