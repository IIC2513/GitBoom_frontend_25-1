// src/pages/ValoracionesPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface Valoracion {
  id_valoracion: string;
  comentario: string;
  puntuacion: number;
  usuario?: {
    nombre: string;
  };
}

const ValoracionesPage: React.FC = () => {
  const { id_producto } = useParams();
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/valoraciones/producto/${id_producto}`);
        setValoraciones(response.data);
      } catch (err) {
        console.error('Error al obtener valoraciones:', err);
        setError('No se pudieron cargar las valoraciones.');
      }
    };

    fetchValoraciones();
  }, [id_producto]);

  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Opiniones de otros usuarios</h2>
      {valoraciones.length === 0 ? (
        <p className="text-gray-500">Aún no hay valoraciones para este producto.</p>
      ) : (
        <ul className="space-y-4">
          {valoraciones.map((val) => (
            <li key={val.id_valoracion} className="border p-4 rounded shadow">
              <p className="font-semibold">⭐ {val.puntuacion} / 5</p>
              <p>{val.comentario}</p>
              {val.usuario?.nombre && <p className="text-sm text-gray-500 mt-1">— {val.usuario.nombre}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ValoracionesPage;
