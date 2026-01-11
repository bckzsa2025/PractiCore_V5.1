
import React, { useState, useEffect } from 'react';
import { Clock, Phone, CalendarCheck } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { PracticeConfig } from '../../types';

const FeatureTiles: React.FC = () => {
  const [config, setConfig] = useState<PracticeConfig | null>(null);

  useEffect(() => {
    const fetchConfig = () => apiClient.practice.get().then(setConfig);
    fetchConfig();
    window.addEventListener('practice-config-update', fetchConfig);
    return () => window.removeEventListener('practice-config-update', fetchConfig);
  }, []);

  if (!config) return null;

  // Split working hours if they follow the "Mon-Fri: ... | Sat: ..." format
  const hoursParts = config.workingHours.split('|').map(s => s.trim());

  return (
    <div className="bg-white pb-20 relative z-20 -mt-8 lg:-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tile 1: Emergency */}
          <div className="bg-gradient-to-br from-primary to-teal-800 rounded-xl p-8 text-white shadow-xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
               <Phone className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold font-display mb-3">Emergency Care</h3>
             <p className="text-white/80 text-sm leading-relaxed mb-6">
               For life-threatening emergencies, please call {config.emergencyPhone} immediately. For urgent practice inquiries:
             </p>
             <a href={`tel:${config.phone}`} className="mt-auto font-bold text-lg border-b border-white/30 pb-1 hover:text-white hover:border-white transition-all">
               {config.phone}
             </a>
          </div>

          {/* Tile 2: Hours */}
          <div className="bg-slate-800 rounded-xl p-8 text-white shadow-xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
               <Clock className="w-8 h-8 text-secondary" />
             </div>
             <h3 className="text-xl font-bold font-display mb-3">Opening Hours</h3>
             <div className="text-sm text-slate-300 space-y-2 w-full max-w-[240px] mx-auto text-left">
                {hoursParts.map((part, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/10 pb-1">
                        <span className="font-bold text-white uppercase text-[10px] tracking-wider">{part.split(':')[0]}</span>
                        <span className="text-xs">{part.split(':').slice(1).join(':')}</span>
                    </div>
                ))}
             </div>
          </div>

          {/* Tile 3: Appointment */}
          <div className="bg-gradient-to-br from-teal-600 to-primary rounded-xl p-8 text-white shadow-xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
               <CalendarCheck className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold font-display mb-3">Online Booking</h3>
             <p className="text-white/80 text-sm leading-relaxed mb-6">
               Avoid the queue. Schedule your consultation online instantly. Real-time availability for all practitioners.
             </p>
             <button 
                onClick={() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-auto px-6 py-2 bg-white text-primary rounded-full text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg"
             >
               Book Now &rarr;
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeatureTiles;
