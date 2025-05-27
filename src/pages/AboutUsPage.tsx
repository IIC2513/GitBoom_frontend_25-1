import React from 'react';
import TeamMemberCard from '../components/TeamMemberCard';
import victoriaImg from '../assets/victoria.jpeg';
import maxImg from '../assets/max.jpg';
import antoniaImg from '../assets/antonia.jpg';

const teamMembers = [
  {
    name: 'Victoria Errázuriz',
    role: 'Fundadora & CEO',
    description: 'Apasionada por crear soluciones sostenibles para los problemas alimentarios actuales.',
    image: victoriaImg
  },
  {
    name: 'Max Weinreich',
    role: 'Desarrollador',
    description: 'Experto en tecnología con enfoque en plataformas con impacto social positivo.',
    image: maxImg
  },
  {
    name: 'Antonia Parot',
    role: 'Directora de Operaciones',
    description: 'Dedicada a optimizar procesos para maximizar el impacto ambiental de REMEAL.',
    image: antoniaImg
  },
];

const AboutUsPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#e8c3a4] bg-opacity-30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d311e] mb-6">
            Conoce al Equipo Detrás de REMEAL
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-[#1d311e]">
            Somos un grupo de profesionales apasionados por la sostenibilidad y la tecnología. 
            Nuestra misión es crear una plataforma que transforme la forma en que gestionamos 
            los alimentos, reduciendo el desperdicio y fomentando una comunidad consciente.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d311e] text-center mb-12">
            Nuestro Equipo
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center text-center">
              {teamMembers.map((member, index) => (
                <TeamMemberCard 
                  key={index}
                  name={member.name}
                  role={member.role}
                  description={member.description}
                  image={member.image}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-[#1d311e] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Nuestra Misión
          </h2>
          <p className="text-lg max-w-3xl mx-auto mb-8">
            En REMEAL, nos dedicamos a reducir el desperdicio de alimentos 
            conectando a personas y negocios con excedentes de alimentos 
            con aquellos que pueden aprovecharlos. Creemos que pequeñas 
            acciones pueden generar grandes cambios para nuestro planeta.
          </p>
          <button className="px-6 py-3 bg-[#a4c766] text-[#1d311e] font-medium rounded-lg hover:bg-opacity-90 transition-colors duration-200">
            Únete a Nuestra Causa
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;