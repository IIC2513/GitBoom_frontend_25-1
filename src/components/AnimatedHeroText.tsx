import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedHeroTextProps {
  words: string[];
  className?: string;
}

const AnimatedHeroText: React.FC<AnimatedHeroTextProps> = ({ words, className }) => {
  const [index, setIndex] = useState(0);

  console.log('AnimatedHeroText renderizado con palabras:', words, 'índice actual:', index);

  useEffect(() => {
    // Configuramos un intervalo para cambiar la palabra cada 2 segundos (2000 ms)
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);

    // Es crucial limpiar el intervalo cuando el componente se desmonte para evitar memory leaks
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedHeroText;