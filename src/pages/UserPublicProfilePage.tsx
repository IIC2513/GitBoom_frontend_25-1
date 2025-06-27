import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fotoPerfil?: string;
}

interface Valoracion {
  id_valoracion: number;
  puntaje: number;
  comentario?: string;
}

interface Producto {
  id: string;
  name: string;
  price: string;
  image: string;
}

const UserPublicProfilePage = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const resUsuario = await axios.get(`${API_BASE}/api/usuarios/${id}/publico`);
        const resValoraciones = await axios.get(`${API_BASE}/api/valoraciones/usuario/${id}`);
        const resProductos = await axios.get(`${API_BASE}/api/productos/usuario/${id}`);
        setUsuario(resUsuario.data.usuario);
        setValoraciones(resValoraciones.data.valoraciones);
        setProductos(resProductos.data.productos);
      } catch (err) {
        console.error('Error cargando perfil público:', err);
      }
    };
    fetchDatos();
  }, [id]);

const calcularPromedio = () => {
  if (!valoraciones || valoraciones.length === 0) return 'Sin valoraciones';
  const suma = valoraciones.reduce((acc, val) => acc + val.puntaje, 0);
  return (suma / valoraciones.length).toFixed(1);
};

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {usuario && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            {usuario.fotoPerfil ? (
              <img src={usuario.fotoPerfil} alt="Perfil" className="w-20 h-20 rounded-full object-cover border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-xl">
                {usuario.nombre[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{usuario.nombre}</h1>
              <p className="text-gray-600">{usuario.correo}</p>
              {usuario.telefono && <p className="text-gray-600">📞 {usuario.telefono}</p>}
              {usuario.direccion && <p className="text-gray-600">📍 {usuario.direccion}</p>}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700">⭐ Puntuación promedio</h2>
            <p className="text-3xl font-bold text-green-700">{calcularPromedio()}</p>

            <h3 className="mt-4 text-md font-semibold text-gray-600">Comentarios recientes</h3>
            <ul className="mt-2 space-y-2">
              {valoraciones?.slice(0, 3).map((val) => (
                <li key={val.id_valoracion} className="border-l-4 border-green-500 pl-4 text-gray-700">
                  <span className="font-bold">★ {val.puntaje}</span> — {val.comentario || 'Sin comentario'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {productos?.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#557e35]">Otros productos publicados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {productos?.map((p) => (
              <div key={p.id} className="border rounded-xl shadow p-4">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mb-2" />
                <h4 className="text-lg font-semibold">{p.name}</h4>
                <p className="text-green-700 font-bold">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPublicProfilePage;
