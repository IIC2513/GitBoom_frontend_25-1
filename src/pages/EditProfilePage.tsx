import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePhotoForm from '../components/ProfilePhotoForm';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rol: 'usuario' | 'admin';
  fotoPerfil?: string;
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const stored = localStorage.getItem('usuario');
  if (!stored) {
    navigate('/auth');
    return null;
  }
  const user: Usuario = JSON.parse(stored);

  const [form, setForm] = useState<Omit<Usuario, 'id_usuario' | 'rol'>>({
    nombre: user.nombre,
    correo: user.correo,
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    fotoPerfil: user.fotoPerfil || '',
  });

const handlePhotoUploaded = (url: string) => {
  setForm(prev => ({ ...prev, fotoPerfil: url }));
  const updatedUser = { ...user, fotoPerfil: url };
  localStorage.setItem('usuario', JSON.stringify(updatedUser));
};

  // Si quisieras precargar desde la API:
  useEffect(() => {
    axios
      .get<Usuario>(`${API_BASE}/api/usuarios/${user.id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const u = res.data;
        setForm({
          nombre: u.nombre,
          correo: u.correo,
          telefono: u.telefono || '',
          direccion: u.direccion || '',
          fotoPerfil: u.fotoPerfil || ''
        });
      })
      .catch(err => console.error(err));
  }, [user.id_usuario, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API_BASE}/api/usuarios/${user.id_usuario}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Actualiza localStorage y contexto si usas
      const updated: Usuario = { ...user, ...res.data };
      localStorage.setItem('usuario', JSON.stringify(updated));
      navigate('/perfil');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar perfil');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl mb-4">Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Nombre
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </label>

        <label className="block">
          Correo
          <input
            name="correo"
            type="email"
            value={form.correo}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </label>

        <label className="block">
          Teléfono
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </label>

        <label className="block">
          Dirección
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </label>

        
        {/* Formulario para subir foto */}
        <div className="mt-4">
            <ProfilePhotoForm onUploaded={handlePhotoUploaded} />
        </div>

        <button
          type="submit"
          className="bg-[#557e35] text-white px-4 py-2 rounded"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
