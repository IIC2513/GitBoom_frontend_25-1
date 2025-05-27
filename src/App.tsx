import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import AboutUsPage from './pages/AboutUsPage';
import DocsPage from './pages/DocsPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'about' | 'docs'>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <MainPage />;
      case 'about':
        return <AboutUsPage />;
      case 'docs':
        return <DocsPage />;
      default:
        return <MainPage />;
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