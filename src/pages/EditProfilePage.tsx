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

interface EditProfilePageProps {
  user: Usuario;
  onProfileUpdate: (usuario: Usuario) => void;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({
  user,
  onProfileUpdate
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [form, setForm] = useState<Omit<Usuario, 'id_usuario' | 'rol'>>({
    nombre: user.nombre,
    correo: user.correo,
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    fotoPerfil: user.fotoPerfil || '',
  });

  // Nuevo estado para el archivo de foto y preview
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.fotoPerfil || null);

  // Si quisieras precargar desde la API:
  useEffect(() => {
    axios
      .get<{ usuario: Usuario }>(`${API_BASE}/api/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const u = res.data.usuario;
        setForm({
          nombre: u.nombre,
          correo: u.correo,
          telefono: u.telefono || '',
          direccion: u.direccion || '',
          fotoPerfil: u.fotoPerfil || ''
        });
        setPhotoPreview(u.fotoPerfil || null);
      })
      .catch(err => console.error(err));
  }, [user.id_usuario, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Nuevo: manejar cambio de archivo
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let fotoPerfilUrl = form.fotoPerfil;

      // Si hay nueva foto, súbela primero
      if (photoFile) {
        const formData = new FormData();
        formData.append('foto', photoFile);
        const resFoto = await axios.post(
          `${API_BASE}/api/usuarios/perfil/foto`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        fotoPerfilUrl = resFoto.data.fotoPerfil;
      }

      // Actualiza el perfil con el resto de los datos y la URL de la foto (nueva o anterior)
      const res = await axios.put<{ usuario: Usuario }>(
        `${API_BASE}/api/usuarios/perfil`,
        { ...form, fotoPerfil: fotoPerfilUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = res.data.usuario;
      onProfileUpdate(updatedUser);
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

        {/* Foto de perfil */}
        <label className="block">
          Foto de perfil
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover my-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-[#e8e8e8] file:text-[#1d311e]
                       hover:file:bg-[#d4d4d4]"
          />
        </label>

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
