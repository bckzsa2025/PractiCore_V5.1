
import React from 'react';
import Header from '../components/ui/Header';
import Hero from '../components/ui/Hero';
import FeatureTiles from '../components/ui/FeatureTiles';
import AboutUs from '../components/ui/AboutUs';
import ServicesList from '../components/ui/ServicesList';
import DoctorsList from '../components/ui/DoctorsList';
import ContactSection from '../components/ui/ContactSection';
import AppointmentModal from '../components/ui/AppointmentModal';
import Footer from '../components/ui/Footer';

interface HomeProps {
    onLoginClick: () => void;
    onLegalClick: () => void;
    onAiClick: () => void;
}

const Home: React.FC<HomeProps> = ({ onLoginClick, onLegalClick, onAiClick }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header 
        onLoginClick={onLoginClick} 
        onHomeClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
        onAiClick={onAiClick}
      />
      
      <main>
        <Hero onBookClick={() => setIsModalOpen(true)} />
        <FeatureTiles />
        <div id="about"><AboutUs /></div>
        <div id="services"><ServicesList /></div>
        <div id="doctors"><DoctorsList /></div>
        <div id="contact"><ContactSection /></div>
      </main>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <Footer onLegalClick={onLegalClick} />
    </div>
  );
};

export default Home;
