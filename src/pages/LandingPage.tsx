import React, { useState, useEffect } from 'react';
import { Leaf, Users, Recycle, ShoppingCart, Gift, Utensils, Building, UserCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer'; // Para animar al scrollear
import FeatureCard from '../components/FeatureCard'; // Asumo que este componente existe
import AuthForms from '../components/AuthForms';     // Asumo que este componente existe
import logo from '../assets/Logosinfondo.png'; // Asegúrate que la ruta sea correcta
import MainPage from './MainPage';

// Datos Hardcodeados para Productos
const sampleProducts = [
  { id: 1, name: 'Pan Integral Artesanal', type: 'Compra Solidaria', price: '$1.500', image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Panadería El Sol', location: 'Santiago Centro' },
  { id: 2, name: 'Caja de Tomates Maduros', type: 'Ayuda Social', price: 'Gratis', image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Supermercado La Granja', location: 'Providencia' },
  { id: 3, name: 'Menú del Día Sobrante', type: 'Compra Solidaria', price: '$2.000', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Restaurante Sabor Casero', location: 'Ñuñoa' },
  { id: 4, name: 'Yogures Próximos a Vencer', type: 'Ayuda Social', price: 'Gratis', image: 'https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Lácteos Frescos SA', location: 'Maipú' },
  { id: 5, name: 'Bolsa de Naranjas', type: 'Compra Solidaria', price: '$1.000', image: 'https://images.pexels.com/photos/2090877/pexels-photo-2090877.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Frutería Doña Juanita', location: 'Las Condes'},
  { id: 6, name: 'Verduras Varias', type: 'Ayuda Social', price: 'Gratis', image: 'https://images.pexels.com/photos/2255999/pexels-photo-2255999.jpeg?auto=compress&cs=tinysrgb&w=400', seller: 'Huerto Comunitario Verde', location: 'La Florida'},
];

// Componente para Contador Animado
const AnimatedCounter: React.FC<{ to: number; label: string }> = ({ to, label }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
      });

      let startTime: number | null = null;
      const duration = 2000; // 2 segundos

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        setCount(Math.round(to * percentage));

        if (progress < duration) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [inView, to, controls]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={controls} className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-[#557e35]">{count.toLocaleString()}+</p>
      <p className="text-sm md:text-base text-[#1d311e]">{label}</p>
    </motion.div>
  );
};


interface LandingPageProps {
  scrollToProducts?: boolean;
  onVerProductosClick?: () => void;
}


const LandingPage: React.FC<LandingPageProps> = ({ scrollToProducts, onVerProductosClick}) => {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [productFilter, setProductFilter] = useState<'all' | 'Compra Solidaria' | 'Ayuda Social'>('all');

  useEffect(() => {
    if (scrollToProducts) {
      setTimeout(() => {
        const el = document.getElementById('products');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // Ajusta el delay si es necesario
    }
  }, [scrollToProducts]);
  

  const filteredProducts = sampleProducts.filter(p => 
    productFilter === 'all' || p.type === productFilter
  );

  const productsPerPage = 3; 
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
      {/* Hero Section */}
      <section
        className="relative pt-20 pb-12 md:pt-32 md:pb-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(240, 240, 240, 0.6), rgba(240, 240, 240, 0.7)), url('https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 flex justify-center"
          >
            <img
              src={logo}
              alt="REMEAL Logo"
              className="h-28 md:h-36 w-auto" // Ajustado
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#1d311e] font-semibold max-w-3xl mx-auto mb-10"
          >
            Tu plataforma para combatir el desperdicio de alimentos. <br className="hidden sm:block"/>Conecta, comparte y consume de forma sostenible.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onVerProductosClick}
              className="px-8 py-3 bg-[#557e35] text-white font-medium rounded-lg shadow-md hover:bg-[#4a6e2e] transition-all duration-300 transform hover:scale-105 min-w-[180px]">
              Ver Productos
            </button>
            <button className="px-8 py-3 bg-white border-2 border-[#557e35] text-[#557e35] font-medium rounded-lg shadow-md hover:bg-[#557e35] hover:text-white transition-all duration-300 transform hover:scale-105 min-w-[180px]">
              Quiero Publicar
            </button>
          </motion.div>
        </div>
        {/* Impact Section */}
        <div className="container mx-auto px-4 mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <AnimatedCounter to={1250} label="Kilos de comida salvada" />
            <AnimatedCounter to={800} label="Conexiones exitosas" />
            <AnimatedCounter to={300} label="Miembros activos" />
          </div>
        </div>
      </section>

      {/* Cómo Funciona REMEAL */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-16">
            Así Transformamos Alimentos en Oportunidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            {[
              { icon: <Utensils className="w-16 h-16 text-[#557e35] mx-auto mb-4" />, title: "1. Publica Excedentes", description: "Comercios y personas ofrecen alimentos próximos a vencer, imperfectos o sobrantes." },
              { icon: <ShoppingCart className="w-16 h-16 text-[#557e35] mx-auto mb-4" />, title: "2. Encuentra y Conecta", description: "Usuarios exploran productos en Compra Solidaria o Ayuda Social cerca de ellos." },
              { icon: <Gift className="w-16 h-16 text-[#557e35] mx-auto mb-4" />, title: "3. Rescata y Disfruta", description: "Se coordinan entregas, evitando el desperdicio y apoyando a la comunidad." }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2}}
                className="p-6 bg-white rounded-xl shadow-lg"
              >
                {step.icon}
                <h3 className="text-xl font-semibold text-[#1d311e] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
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
                  <motion.div 
                    key={product.id}
                    className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col group transform hover:scale-[1.02] transition-transform duration-300"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="h-56 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full self-start mb-2 ${product.type === 'Compra Solidaria' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {product.type}
                      </span>
                      <h3 className="text-lg font-semibold text-[#1d311e] mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">por: {product.seller}</p>
                      <p className="text-sm text-gray-500 mb-3">📍 {product.location}</p>
                      <div className="mt-auto flex justify-between items-center">
                        <p className="text-xl font-bold text-[#557e35]">{product.price}</p>
                        <button className="px-4 py-2 bg-[#557e35] text-white text-sm font-medium rounded-lg hover:bg-[#4a6e2e] transition-colors">
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
           <div className="text-center mt-12">
           <button
              onClick={onVerProductosClick}
              className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-[#557e35] text-[#557e35] font-semibold rounded-lg hover:bg-[#557e35] hover:text-white transition-colors duration-300"
            >
              Ver Todos los Productos <ArrowRight className="w-5 h-5 ml-2" />
            </button>
           </div>
        </div>
      </section>

      
          
      {/* ¿Quiénes Hacen Posible REMEAL? */}
      <section id="community-actors" className="py-16 md:py-24 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-16">
            Nuestra Comunidad REMEAL
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Users className="w-12 h-12 text-[#557e35]" />, title: "Personas Particulares", description: "Compran, venden o donan alimentos, participando activamente." },
              { icon: <Building className="w-12 h-12 text-[#557e35]" />, title: "Comercios de Alimentos", description: "Supermercados, restaurantes y más, gestionan excedentes responsablemente." },
              { icon: <Gift className="w-12 h-12 text-[#557e35]" />, title: "Organizaciones Sociales", description: "Fundaciones y comedores que acceden a donaciones para ayudar a quienes lo necesitan." },
              { icon: <UserCheck className="w-12 h-12 text-[#557e35]" />, title: "Equipo REMEAL", description: "Administradores que aseguran el buen funcionamiento y la confianza en la plataforma." }
            ].map((actor, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.15}}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-20 h-20 bg-[#e6f0e1] rounded-full flex items-center justify-center mx-auto mb-4">
                  {actor.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#1d311e] mb-2">{actor.title}</h3>
                <p className="text-gray-600 text-sm">{actor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section (Tu sección actual) */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-12">
            ¿Por Qué Elegir REMEAL?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Leaf className="w-12 h-12 text-[#557e35]" />}
              title="Reduce Desperdicio"
              description="Aprovecha alimentos que estarían destinados a ser desechados, contribuyendo a reducir la huella ecológica y el desperdicio."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-[#557e35]" />}
              title="Apoya a la Comunidad"
              description="Crea vínculos comunitarios conectando a quienes tienen excedentes con quienes pueden aprovecharlos."
            />
            <FeatureCard
              icon={<Recycle className="w-12 h-12 text-[#557e35]" />}
              title="Promueve Sostenibilidad"
              description="Fomenta hábitos de consumo responsable y un estilo de vida más sostenible para el medio ambiente."
            />
          </div>
        </div>
      </section>

      {/* Auth Section (Tu sección actual) */}
      <section id="auth" className="py-16 md:py-24 bg-[#e8c3a4] bg-opacity-30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d311e] text-center mb-12">
            Únete a la Comunidad REMEAL
          </h2>
          <AuthForms />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#1d311e] text-gray-300 text-center">
        <div className="container mx-auto px-4">
          <img src={logo} alt="REMEAL Logo" className="h-12 w-auto mx-auto mb-4 opacity-70" />
          <p>© {new Date().getFullYear()} REMEAL. Todos los derechos reservados.</p>
          <p className="text-sm mt-1">Transformando el desperdicio en oportunidad.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;