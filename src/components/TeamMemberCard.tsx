import React from 'react';

interface TeamMemberCardProps {
  name: string;
  role: string;
  description: string;
  image: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ name, role, description, image }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="h-56 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-[#1d311e] mb-1">{name}</h3>
        <p className="text-[#557e35] font-medium mb-3">{role}</p>
        <p className="text-[#7b7b7b] text-sm">{description}</p>
      </div>
    </div>
  );
};

export default TeamMemberCard;