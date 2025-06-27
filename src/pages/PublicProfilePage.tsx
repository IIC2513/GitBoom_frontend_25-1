// src/pages/PublicProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fotoPerfil?: string;
}

interface Valoracion {
  id_valoracion: string;
  puntuacion: number;
  comentario: string;
}

interface Producto {
  id_producto: string;
  nombre: string;
  imagen_url: string;
}

const PublicProfilePage: React.FC = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPerfil = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/usuarios/${id}/publico`);
        setUsuario(res.data.usuario);
      } catch (err) {
        setError('Error al cargar el perfil del usuario.');
      }
    };

    const fetchValoraciones = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/valoraciones/usuario/${id}`);
        setValoraciones(res.data);
      } catch (err) {
        console.error('Error cargando valoraciones:', err);
      }
    };

    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/productos/usuario/${id}`);
        setProductos(res.data);
      } catch (err) {
        console.error('Error cargando productos:', err);
      }
    };

    fetchPerfil();
    fetchValoraciones();
    fetchProductos();
  }, [id]);

  const promedio = valoraciones.length
    ? (valoraciones.reduce((acc, val) => acc + val.puntuacion, 0) / valoraciones.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && <p className="text-red-500 text-center">{error}</p>}

      {usuario && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
          <img
            src={usuario.fotoPerfil || '/default-user.png'}
            alt="Foto de perfil"
            className="w-28 h-28 rounded-full mx-auto mb-4 object-cover"
          />
          <h2 className="text-2xl font-bold text-green-700">{usuario.nombre}</h2>
          <div className="text-gray-600 mt-2 space-y-1">
            <p><FaEnvelope className="inline mr-2" />{usuario.correo}</p>
            {usuario.telefono && <p><FaPhone className="inline mr-2" />{usuario.telefono}</p>}
            {usuario.direccion && <p><FaMapMarkerAlt className="inline mr-2" />{usuario.direccion}</p>}
          </div>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-center mb-4 text-green-800">Valoraciones del Donador</h3>
        {valoraciones.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <span className="text-yellow-500 text-3xl flex justify-center items-center gap-2">
                <FaStar /> {promedio} / 5
              </span>
              <p className="text-sm text-gray-600">{valoraciones.length} valoración(es)</p>
            </div>
            <div className="space-y-4">
              {valoraciones.slice(0, 3).map((v) => (
                <div key={v.id_valoracion} className="bg-white p-4 rounded shadow-sm">
                  <div className="flex items-center mb-2 text-yellow-500">
                    {Array.from({ length: v.puntuacion }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">“{v.comentario || 'Sin comentario'}”</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center italic text-gray-500">Este usuario aún no ha recibido valoraciones.</p>
        )}
      </div>

      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-center mb-4 text-green-800">Otros productos publicados</h3>
        {productos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productos.map((producto) => (
              <div key={producto.id_producto} className="bg-white rounded shadow p-2">
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <p className="text-center font-medium">{producto.nombre}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center italic text-gray-500">Este usuario no tiene productos publicados actualmente.</p>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
