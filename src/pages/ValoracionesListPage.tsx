import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

interface Valoracion {
  id_valoracion: string;
  comentario: string;
  puntuacion: number;
  autor_valoracion?: {
    nombre: string;
  };
  producto_valorado?: {
    nombre: string;
  };
}

const ValoracionesListPage: React.FC = () => {
  const { id: id_producto } = useParams<{ id: string }>();
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const nombreProducto = valoraciones[0]?.producto_valorado?.nombre;

  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        const response = await axios.get(`${API_BASE}/valoraciones/producto/${id_producto}`);
        setValoraciones(response.data);
      } catch (err) {
        setError('Error al cargar valoraciones.');
        console.error(err);
      }
    };

    fetchValoraciones();
  }, [id_producto]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Opiniones sobre {nombreProducto ? `"${nombreProducto}"` : 'este producto'}
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      {valoraciones.length === 0 ? (
        <p className="text-gray-500">Este producto aún no tiene valoraciones.</p>
      ) : (
        <ul className="space-y-4">
          {valoraciones.map((valoracion) => (
            <li
              key={valoracion.id_valoracion}
              className="bg-white shadow p-4 rounded-md border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-1">
                Por: <strong>{valoracion.autor_valoracion?.nombre ?? 'Usuario anónimo'}</strong>
              </p>
              <p className="text-yellow-600 font-semibold">Puntuación: {valoracion.puntuacion}/5</p>
              <p className="text-gray-800 italic mt-1">"{valoracion.comentario}"</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ValoracionesListPage;
