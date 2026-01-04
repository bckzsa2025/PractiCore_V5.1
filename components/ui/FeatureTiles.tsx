import React from 'react';
import { Clock, Phone, CalendarCheck } from 'lucide-react';

const FeatureTiles: React.FC = () => {
  return (
    <div className="bg-white pb-20 relative z-20 -mt-8 lg:-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tile 1: Emergency */}
          <div className="bg-gradient-to-br from-[#0b67d0] to-[#0f8fe6] rounded-xl p-8 text-white shadow-xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
               <Phone className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold font-display mb-3">Emergency Care</h3>
             <p className="text-white/80 text-sm leading-relaxed mb-6">
               For life-threatening emergencies, please call 10177 immediately. For urgent practice inquiries:
             </p>
             <a href="tel:+27215101441" className="mt-auto font-bold text-lg border-b border-white/30 pb-1 hover:text-white hover:border-white transition-all">
               021 510 1441
             </a>
          </div>

          {/* Tile 2: Hours */}
          <div className="bg-slate-800 rounded-xl p-8 text-white shadow-xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
               <Clock className="w-8 h-8 text-secondary" />
             </div>
             <h3 className="text-xl font-bold font-display mb-3">Opening Hours</h3>
             <ul className="text-sm text-slate-300 space-y-2 w-full max-w-[200px] mx-auto text-left">
               <li className="flex justify-between border-b border-white/10 pb-1">
                 <span>Mon – Fri</span>
                 <span className="font-bold text-white">09:15 – 16:30</span>
               </li>
               <li className="flex justify-between border-b border-white/10 pb-1">
                 <span>Saturday</span>
                 <span className="font-bold text-white">09:00 – 11:30</span>
               </li>
               <li className="flex justify-between text-slate-500">
                 <span>Sunday</span>
                 <span>Closed</span>
               </li>
             </ul>
          </div>

          {/* Tile 3: Appointment */}
          <div className="bg-gradient-to-br from-[#0b67d0] to-[#0f8fe6] rounded-xl p-8 text-white shadow-xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
               <CalendarCheck className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold font-display mb-3">Online Booking</h3>
             <p className="text-white/80 text-sm leading-relaxed mb-6">
               Avoid the queue. Schedule your consultation online instantly. Real-time availability.
             </p>
             <button className="mt-auto px-6 py-2 bg-white text-primary rounded-full text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg">
               Book Now &rarr;
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeatureTiles;