
import React from 'react';
import { Calendar } from 'lucide-react';
import { useContent } from '../../hooks/useContent';

interface HeroProps {
  onBookClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookClick }) => {
  const heroImage = useContent('hero_image');

  return (
    <div className="bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 skew-x-12 transform translate-x-20 hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center py-16 lg:py-24 gap-12 lg:gap-20">
          
          {/* Left: Image (Side Profile) */}
          <div className="w-full lg:w-[48%] order-2 lg:order-1 relative">
             <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white h-[400px] lg:h-[500px] w-full bg-slate-100">
                <img 
                  src={heroImage}
                  alt="Mother and Child - Family Health" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent p-8">
                   <p className="text-white font-medium italic">"Compassionate care for the whole family."</p>
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-[52%] order-1 lg:order-2 text-center lg:text-left space-y-6">
             <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider animate-in slide-in-from-bottom-4 duration-500">
                Welcome to SilverStar Practice
             </div>
             <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900 leading-[1.1]">
                Dr. B Setzer <br/>
                <span className="text-primary">Family Doctor</span>
             </h1>
             <p className="text-lg text-slate-500 leading-relaxed font-light max-w-xl mx-auto lg:mx-0">
                Providing comprehensive, patient-centered medical care in Milnerton. 
                We combine modern medical expertise with traditional family values to ensure 
                your health is always our priority.
             </p>
             
             <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onBookClick}
                  className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  SCHEDULE AN APPOINTMENT
                </button>
             </div>
             
             <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
                {/* Trust Badges placeholder */}
                <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div> HPASA Registered
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div> BHF Certified
                </span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
