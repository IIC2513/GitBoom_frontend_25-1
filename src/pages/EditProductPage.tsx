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
  const token = localStorage.getItem('token') || '';

  // Carga inicial
  useEffect(() => {
    if (!id_producto) return;
    axios.get<Product>(`${API_BASE}/api/productos/${id_producto}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // La API entrega el objeto directamente
      setForm(res.data);
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo cargar el producto');
    });
  }, [id_producto, token]);

  // Manejo de cambios de inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id_producto) return;
    try {
      await axios.put(
        `${API_BASE}/api/productos/${id_producto}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/productos');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el producto');
    }
  };

  // Si no hay usuario, redirigir
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
            value={form.nombre as string}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion as string}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Tipo de Producto</label>
          <input
            name="tipo_producto"
            value={form.tipo_producto as string}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Cantidad</label>
          <input
            name="cantidad"
            type="number"
            value={form.cantidad as number}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Precio</label>
          <input
            name="precio"
            type="text"
            value={form.precio as string}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block">Ubicación</label>
          <input
            name="ubicacion"
            value={form.ubicacion as string}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        {/* Agrega más campos según tu modelo */}
        <button type="submit" className="bg-[#557e35] text-white px-4 py-2 rounded">
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
