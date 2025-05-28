// src/pages/MainPage.tsx
import React, { useState } from 'react';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useInView } from 'react-intersection-observer'; 
import FeatureCard from '../components/FeatureCard'; 
import AuthForms from '../components/AuthForms';     
import logo from '../assets/Logosinfondo.png';


const sampleProducts = [
  { id: 1, name: 'Pan Integral Artesanal', type: 'Compra Solidaria', price: '$1.500', image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Panadería El Sol', location: 'Santiago Centro' },
  { id: 2, name: 'Caja de Tomates Maduros', type: 'Ayuda Social', price: 'Gratis', image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Supermercado La Granja', location: 'Providencia' },
  { id: 3, name: 'Menú del Día Sobrante', type: 'Compra Solidaria', price: '$2.000', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Restaurante Sabor Casero', location: 'Ñuñoa' },
  { id: 4, name: 'Yogures Próximos a Vencer', type: 'Ayuda Social', price: 'Gratis', image: 'https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Lácteos Frescos SA', location: 'Maipú' },
  { id: 5, name: 'Bolsa de Naranjas', type: 'Compra Solidaria', price: '$1.000', image: 'https://images.pexels.com/photos/2090877/pexels-photo-2090877.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Frutería Doña Juanita', location: 'Las Condes'},
  { id: 6, name: 'Verduras Varias', type: 'Ayuda Social', price: 'Gratis', image: 'https://images.pexels.com/photos/2255999/pexels-photo-2255999.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Huerto Comunitario Verde', location: 'La Florida'},
];

const MainPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productFilter, setProductFilter] = useState<'all' | 'Compra Solidaria' | 'Ayuda Social'>('all');

  useEffect(() => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  const filteredProducts = sampleProducts.filter(p => 
    productFilter === 'all' || p.type === productFilter
  );

  const productsPerPage = 6; 
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const displayedProducts = filteredProducts.slice(
    currentSlide * productsPerPage,
    (currentSlide + 1) * productsPerPage
  );
  return (
    <div className="flex flex-col min-h-screen">


      {/* Descubre Productos */}
      <section id="products" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-6">
            Explora Productos Disponibles
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Encuentra alimentos a precios reducidos en "Compra Solidaria" o accede a donaciones en "Ayuda Social".
          </p>
          
          <div className="flex justify-center gap-4 mb-10">
            <button 
              onClick={() => { setProductFilter('all'); setCurrentSlide(0); }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${productFilter === 'all' ? 'bg-[#557e35] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => { setProductFilter('Compra Solidaria'); setCurrentSlide(0); }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${productFilter === 'Compra Solidaria' ? 'bg-[#557e35] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Compra Solidaria
            </button>
            <button 
              onClick={() => { setProductFilter('Ayuda Social'); setCurrentSlide(0); }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${productFilter === 'Ayuda Social' ? 'bg-[#557e35] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Ayuda Social
            </button>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}

              </div>
              {totalPages > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute top-1/2 -left-4 md:-left-6 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10">
                    <ChevronLeft className="w-6 h-6 text-[#557e35]" />
                  </button>
                  <button onClick={nextSlide} className="absolute top-1/2 -right-4 md:-right-6 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10">
                    <ChevronRight className="w-6 h-6 text-[#557e35]" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No hay productos disponibles para esta selección.</p>
          )}
           
        </div>
      </section>


    </div>
  );
};

export default MainPage;