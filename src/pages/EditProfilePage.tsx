import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, Trash2, ArrowLeft, Upload } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE}/api/usuarios/perfil`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.status === 204) {
        // limpieza local y redirección
        localStorage.removeItem('token');
        navigate('/'); // o a la ruta que decidas
      } else {
        const { error } = await res.json();
        alert(error || 'No se pudo eliminar la cuenta');
      }
    } catch (err) {
      console.error(err);
      alert('Error en la solicitud de eliminación');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let fotoPerfilUrl = form.fotoPerfil;

      // Si hay nueva foto, súbela primero
      if (photoFile) {
        setIsUploading(true);
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
        setIsUploading(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center text-[#557e35] hover:text-[#4a6d2f] mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al perfil
          </button>
          <h1 className="text-3xl font-bold text-[#1d311e] mb-2">Editar Perfil</h1>
          <p className="text-gray-600">Actualiza tu información personal y foto de perfil</p>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección de Foto de Perfil */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 border-4 border-white shadow-lg">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#557e35] text-white p-2 rounded-full cursor-pointer hover:bg-[#4a6d2f] transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Haz clic en la cámara para cambiar tu foto
              </p>
            </div>

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Nombre completo
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Correo electrónico
                </label>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Teléfono
                </label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Dirección
                </label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Tu dirección"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-[#557e35] to-[#4a6d2f] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#4a6d2f] hover:to-[#3d5a28] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    {isUploading ? 'Subiendo foto...' : 'Guardando...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" />
                    Guardar cambios
                  </div>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate('/perfil')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancelar
              </motion.button>
            </div>

            {/* Botón de eliminar cuenta */}
            <div className="text-center pt-4">
              <motion.button
                type="button"
                onClick={handleDeleteAccount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center mx-auto hover:underline transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar mi cuenta
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfilePage;
