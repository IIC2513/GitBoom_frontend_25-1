import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      await axios.put(`${API_BASE}/api/productos/${id_producto}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/productos');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el producto');
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Editar Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Nombre</label>
          <input
            name="nombre"
            value={form.nombre || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Tipo de Producto</label>
          <input
            name="tipo_producto"
            value={form.tipo_producto || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Cantidad</label>
          <input
            name="cantidad"
            type="number"
            value={form.cantidad || 0}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Precio</label>
          <input
            name="precio"
            type="text"
            value={form.precio?.toString() || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Ubicación</label>
          <input
            name="ubicacion"
            value={form.ubicacion || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>

        <div>
          <label className="block">Imagen actual</label>
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="h-40 object-cover rounded mb-2" />
          ) : (
            <p className="text-sm text-gray-500">No hay imagen disponible</p>
          )}
        </div>
        <div>
          <label className="block">Cambiar imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border px-2 py-1"
          />
        </div>

        <button type="submit" className="bg-[#557e35] text-white px-4 py-2 rounded">
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
