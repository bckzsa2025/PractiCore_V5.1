
import React, { useState } from 'react';
import { Activity, ChevronRight, Clock, ShieldCheck, Stethoscope, Heart, Syringe, Video } from 'lucide-react';
import { SERVICES } from '../../services/geminiService';

const ServicesList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(SERVICES.map(s => s.category)))];

  const filteredServices = activeCategory === 'All' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === activeCategory);

  // Helper for category icon
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'Pediatrics': return <Heart className="w-4 h-4" />;
        case 'Procedures': return <Syringe className="w-4 h-4" />;
        case 'Telehealth': return <Video className="w-4 h-4" />;
        default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-12 animate-in slide-in-from-bottom-8 duration-700">
           <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Our Medical Services</h2>
           <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
           <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
             Comprehensive primary care tailored to your family's needs. Browse our service categories below.
           </p>
         </div>

         {/* Category Filter */}
         <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeCategory === cat ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                    {cat !== 'All' && getCategoryIcon(cat)}
                    {cat}
                </button>
            ))}
         </div>

         {/* Services Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
           {filteredServices.map((service, index) => (
             <div 
                key={service.id} 
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-slate-100 hover:border-primary/20 transition-all duration-300 animate-in fade-in zoom-in"
                style={{ animationDelay: `${index * 50}ms` }}
             >
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {getCategoryIcon(service.category)}
                 </div>
                 <div className="flex flex-col items-end gap-1">
                     <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">
                        {service.category}
                     </span>
                     <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration} mins
                     </span>
                 </div>
               </div>
               
               <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                 {service.name}
               </h3>
               <p className="text-slate-500 text-sm leading-relaxed mb-6">
                 {service.description}
               </p>
               
               <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Starting from</span>
                    <span className="text-lg font-bold text-slate-900">R {service.price}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
             </div>
           ))}
         </div>

         {filteredServices.length === 0 && (
             <div className="text-center py-20 text-slate-400">
                 <p>No services found in this category.</p>
             </div>
         )}

         <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Medical Aid Accepted</h4>
                    <p className="text-sm text-slate-500">Discovery, Bonitas, Fedhealth, and more.</p>
                </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">After Hours Care</h4>
                    <p className="text-sm text-slate-500">Available for registered patients.</p>
                </div>
            </div>
            <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
                View Full Rate Card
            </button>
         </div>
      </div>
    </section>
  );
};

export default ServicesList;
