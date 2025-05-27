import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import AboutUsPage from './pages/AboutUsPage';
import DocsPage from './pages/DocsPage';
import LandingPage from './pages/LandingPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'about' | 'docs' | 'main'>('landing');
  const [scrollToProducts, setScrollToProducts] = useState(false);

  useEffect(() => {
    if (scrollToProducts) {
      const timeout = setTimeout(() => setScrollToProducts(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [scrollToProducts]);
  


  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onVerProductosClick={() => setCurrentPage('main')} />;
      case 'main':
        return <MainPage />;
      case 'about':
        return <AboutUsPage />;
      case 'docs':
        return <DocsPage />;
      default:
        return <LandingPage />;
    }
  };
  
  

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;