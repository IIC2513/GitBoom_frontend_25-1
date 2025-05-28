import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DocsPageRemealEnhanced: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const featuresPinRef = useRef<HTMLDivElement>(null);
  const featuresImageRef = useRef<HTMLDivElement>(null);
  const featureItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  const { scrollYProgress } = useScroll();

  const heroBgScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.15]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.1], ['0%', '-50%']);

  const sectionsData = [
    {
      id: 'overview',
      title: '¿Qué es REMeal?',
      content: 'REMeal es una plataforma web solidaria tipo marketplace sostenible donde cualquier usuario —personas, supermercados, restaurantes, panaderías, fábricas de alimentos— puede publicar alimentos que estén próximos a vencer, sobrantes o imperfectos.',
      icon: '🌱',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=75'
    },
    {
      id: 'sections',
      title: 'Secciones Principales',
      content: 'La plataforma cuenta con dos secciones principales: Compra Solidaria y Ayuda Social. Los productos en venta pasarán automáticamente a la sección de Ayuda Social 24 horas antes de su vencimiento.',
      icon: '🔄',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=75'
    },
    {
      id: 'users',
      title: 'Usuarios',
      content: 'REMeal está diseñada para cuatro tipos de usuarios: personas particulares, comercios de alimentos, organizaciones sociales y el equipo REMEAL.',
      icon: '👥',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=75'
    }
  ];

  const featuresList = [
    {
      text: "Publicación intuitiva de productos",
      icon: "📝",
      description: "Sube tus productos rápidamente con nuestro formulario simplificado y opciones de autocompletado."
    },
    {
      text: "Sistema eficiente de venta y donación",
      icon: "💸",
      description: "Gestiona ventas y coordina donaciones con herramientas integradas que facilitan cada paso."
    },
    {
      text: "Visualización en mapa para fácil ubicación",
      icon: "🗺️",
      description: "Encuentra y ofrece productos cerca de ti gracias a nuestra integración con mapas interactivos."
    },
    {
      text: "Agendamiento de retiros simplificado",
      icon: "🗓️",
      description: "Coordina horarios de recogida que funcionen para todos, evitando esperas y confusiones."
    },
    {
      text: "Notificaciones automáticas y alertas",
      icon: "🔔",
      description: "Mantente informado sobre nuevos productos, ventas, donaciones y mensajes importantes."
    },
    {
      text: "Panel de control para usuarios y comercios",
      icon: "📊",
      description: "Accede a estadísticas, gestiona tus publicaciones y configura tu perfil desde un solo lugar."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (featuresPinRef.current && featuresImageRef.current && featureItemsRef.current.length > 0) {
        const featureItems = featureItemsRef.current.filter(el => el !== null) as HTMLLIElement[];

        ScrollTrigger.create({
          trigger: featuresPinRef.current,
          start: 'top top',
          end: `+=${featureItems.length * 250}`, 
          pin: featuresImageRef.current,
          pinSpacing: true,
          // markers: true,
        });

        featureItems.forEach((item, _index) => {
          gsap.fromTo(item,
            { opacity: 0.3, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                end: 'bottom 60%',
                toggleActions: 'play reverse play reverse',
                // scrub: true,
              }
            }
          );
        });
      }

      const standardSections = document.querySelectorAll('.standard-section-animate');
      standardSections.forEach((section) => {
        gsap.fromTo(section,
          { opacity: 0, y: 70 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);


  return (
    <ParallaxProvider>
      <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 text-gray-800 overflow-x-hidden">

        <motion.section
          className="h-screen flex flex-col items-center justify-center text-white text-center p-6 relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-black opacity-50"
            style={{ scale: heroBgScale }}
          />
          <motion.div
            className="relative z-10"
            style={{ opacity: heroContentOpacity, y: heroContentY }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              Cómo Funciona <span className="text-[#8cd45e]">REMeal</span>
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl max-w-3xl mx-auto drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Conectando alimentos, personas y un futuro sostenible.
            </motion.p>
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5M4.5 12l7.5 7.5 7.5-7.5" />
            </svg>
          </motion.div>
        </motion.section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 space-y-24 md:space-y-32">
          {sectionsData.map((section, index) => (
            <motion.div
              key={section.id}
              className={`standard-section-animate flex flex-col items-center gap-10 md:gap-16 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className="md:w-1/2 w-full">
                <Parallax speed={index % 2 === 0 ? -6 : 6} className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-80 md:h-[500px] object-cover transform transition-transform duration-500 ease-out hover:scale-105"
                  />
                </Parallax>
              </div>
              <div className="md:w-1/2 w-full p-2 md:p-0 text-center md:text-left">
                <div className="inline-flex items-center mb-5">
                  <span className="text-4xl mr-4">{section.icon}</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#557e35]">
                    {section.title}
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}

         
          <section ref={featuresPinRef} className="features-section py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl md:text-5xl font-bold text-[#557e35] text-center mb-16 md:mb-20">
                ✨ Características Principales
              </h2>
              <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                <div ref={featuresImageRef} className="md:w-2/5 w-full md:sticky top-20 self-start">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=75"
                      alt="Características de REMeal"
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                  <p className="mt-6 text-center text-gray-600 italic text-sm">
                    Nuestra plataforma está diseñada para ser intuitiva y poderosa, facilitando la conexión y el aprovechamiento de alimentos.
                  </p>
                </div>

                <div className="md:w-3/5 w-full">
                  <ul className="space-y-10 md:space-y-12">
                    {featuresList.map((feature, itemIndex) => (
                      <li
                        key={itemIndex}
                        ref={el => { featureItemsRef.current[itemIndex] = el; }}
                        className="feature-item bg-white p-6 rounded-xl shadow-lg flex items-start space-x-4 ring-1 ring-gray-200 hover:ring-emerald-500 transition-all duration-300"
                        style={{ opacity: 0.3 }}
                      >
                        <span className="text-3xl pt-1 text-[#557e35]">{feature.icon}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">{feature.text}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </div>

        <footer className="text-center py-16 bg-gray-800 text-gray-300">
          <p className="text-lg">REMeal © {new Date().getFullYear()} - Transformando el desperdicio en oportunidad.</p>
          <p className="mt-2 text-sm">Uniendo comunidades, un alimento a la vez.</p>
        </footer>
      </div>
    </ParallaxProvider>
  );
};

export default DocsPageRemealEnhanced;