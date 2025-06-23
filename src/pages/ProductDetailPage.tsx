import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface Product {
  id_producto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  estado: string;
  ubicacion: string;
  imagen_url: string;
  // agrega otros campos si los necesitas
}

interface Props {
  user: any;
}

const ProductDetailPage: React.FC<Props> = ({ user }) => {
  const { id_producto } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/api/productos/${id_producto}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(response.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el producto.');
      }
    };
    fetchProduct();
  }, [id_producto]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!product) return <div className="text-gray-500 p-4">Cargando producto...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{product.nombre}</h1>
      <img src={product.imagen_url} alt={product.nombre} className="w-64 h-64 object-cover my-4" />
      <p className="text-lg">{product.descripcion}</p>
      <p className="mt-2 text-green-700 font-semibold">{product.categoria}</p>
      <p className="mt-2 text-gray-600">Estado: {product.estado}</p>
      <p className="mt-2 text-gray-600">Ubicación: {product.ubicacion}</p>
      {product.categoria === 'Compra Solidaria' && (
        <p className="mt-4 text-xl font-bold text-[#557e35]">${product.precio.toLocaleString('es-CL')}</p>
      )}
    </div>
  );
};

export default ProductDetailPage;
