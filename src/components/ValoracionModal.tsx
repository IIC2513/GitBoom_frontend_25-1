import React from 'react';
import ValoracionForm from './ValoracionForm';

interface ModalProps {
  id_producto: string;
  id_reserva: string;
  onClose: () => void;
}

const ValoracionModal: React.FC<ModalProps> = ({ id_producto, id_reserva, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-lg shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-[#1d311e]">
          ¡Califica al donador de alimentos en REMeal!
        </h2>
        <p className="text-center text-sm text-gray-600 mb-4">Danos tu opinión sobre el reemeler 💚</p>

        <ValoracionForm
          id_producto={id_producto}
          id_reserva={id_reserva}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
};

export default ValoracionModal;
