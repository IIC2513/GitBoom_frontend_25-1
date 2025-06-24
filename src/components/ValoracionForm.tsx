import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface Props {
  id_producto: string;
}

const ValoracionForm: React.FC<Props> = ({ id_producto }) => {
  const [comentario, setComentario] = useState('');
  const [puntuacion, setPuntuacion] = useState(5);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [idReservaValida, setIdReservaValida] = useState<string | null>(null);

  useEffect(() => {
    const fetchReserva = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/api/reservas/mis`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const reservas = response.data;
        const reservaEncontrada = reservas.find((res: any) => res.id_producto === id_producto);

        if (reservaEncontrada) {
          setIdReservaValida(reservaEncontrada.id_reserva);
        } else {
          setError('No tienes una reserva válida para este producto.');
        }
      } catch (err) {
        console.error('Error al obtener reserva:', err);
        setError('No se pudo verificar tu reserva.');
      }
    };

    fetchReserva();
  }, [id_producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idReservaValida) {
      setError('No se encontró una reserva válida.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/valoraciones`, {
        comentario,
        puntuacion,
        id_producto,
        id_reserva: idReservaValida,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setComentario('');
      setPuntuacion(5);
    } catch (err) {
      console.error(err);
      setError('Error al enviar valoración.');
    }
  };

  if (error) {
    return <div className="mt-4 text-red-600">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white shadow p-4 rounded-md">
      <h3 className="text-lg font-bold text-[#1d311e]">Deja tu valoración</h3>

      {success && <p className="text-green-600">¡Valoración enviada con éxito!</p>}

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

