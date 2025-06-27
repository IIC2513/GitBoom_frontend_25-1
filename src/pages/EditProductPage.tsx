import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Tag, Hash, MapPin, Calendar, DollarSign, Image, Save, ArrowLeft, Upload, FileText, Box, Trash2 } from 'lucide-react';

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

interface Product {
  id_producto: string;
  nombre: string;
  descripcion: string;
  tipo_producto: string;
  cantidad: number;
  fecha_expiracion: string;
  precio: number | string;
  categoria: string;
  ubicacion: string;
  lat: number | string;
  lng: number | string;
  estado: string;
  imagen_url?: string;
}

interface EditProductPageProps {
  user: Usuario | null;
}

const EditProductPage: React.FC<EditProductPageProps> = ({ user }) => {
  const { id_producto } = useParams<{ id_producto: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<Partial<Product>>({
    nombre: '',
    descripcion: '',
    tipo_producto: '',
    cantidad: 0,
    fecha_expiracion: '',
    precio: '',
    categoria: '',
    ubicacion: '',
    lat: '',
    lng: '',
    estado: '',
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!id_producto) return;
    axios.get<Product>(`${API_BASE}/api/productos/${id_producto}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setForm(res.data);
      if (res.data.imagen_url) {
        setPreviewUrl(res.data.imagen_url);
      }
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo cargar el producto');
    });
  }, [id_producto, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImagenFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // preview temporal
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id_producto) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      if (imagenFile) {
        setIsUploading(true);
        formData.append('imagen', imagenFile);
      }

      await axios.put(`${API_BASE}/api/productos/${id_producto}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/perfil');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el producto');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/productos/${id_producto}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al eliminar el producto');
      }

      alert('Producto eliminado exitosamente');
      navigate('/perfil');
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al eliminar el producto.');
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
          <h1 className="text-3xl font-bold text-[#1d311e] mb-2">Editar Producto</h1>
          <p className="text-gray-600">Actualiza la información de tu producto</p>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección de Imagen */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 border-4 border-white shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Imagen del producto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-[#557e35] text-white p-3 rounded-full cursor-pointer hover:bg-[#4a6d2f] transition-colors shadow-lg">
                  <Image className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Haz clic en la imagen para cambiar la foto del producto
              </p>
            </div>

            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Nombre del producto
                </label>
                <input
                  name="nombre"
                  value={form.nombre || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ej: Pan integral casero"
                />
              </div>

              {/* Tipo de Producto */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Box className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Tipo de producto
                </label>
                <input
                  name="tipo_producto"
                  value={form.tipo_producto || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Ej: Panadería"
                />
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Hash className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Cantidad disponible
                </label>
                <input
                  name="cantidad"
                  type="number"
                  value={form.cantidad || 0}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Precio (CLP)
                </label>
                <input
                  name="precio"
                  type="number"
                  value={form.precio?.toString() || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Fecha de Expiración */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Fecha de expiración
                </label>
                <input
                  name="fecha_expiracion"
                  type="date"
                  value={form.fecha_expiracion || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 inline mr-2 text-[#557e35]" />
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={form.categoria || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Donación">Donación</option>
                  <option value="Compra Solidaria">Compra Solidaria</option>
                  <option value="Intercambio">Intercambio</option>
                </select>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 inline mr-2 text-[#557e35]" />
                Ubicación
              </label>
              <input
                name="ubicacion"
                value={form.ubicacion || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Ej: Providencia, Santiago"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 inline mr-2 text-[#557e35]" />
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                placeholder="Describe tu producto, ingredientes, estado, etc."
              />
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
                    {isUploading ? 'Subiendo imagen...' : 'Guardando...'}
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

            {/* Botón de eliminar producto */}
            <div className="text-center pt-4">
              <motion.button
                type="button"
                onClick={handleDeleteProduct}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center mx-auto hover:underline transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar producto
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProductPage;
