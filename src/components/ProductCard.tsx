import React from 'react';

interface Product {
  id: number;
  name: string;
  type: string;
  price: string;
  image: string;
  seller: string;
  location: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col group transform hover:scale-[1.02] transition-transform duration-300">
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
    </div>
  );
};

export default ProductCard;
