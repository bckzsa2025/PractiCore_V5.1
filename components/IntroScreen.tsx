
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, ShieldCheck, Activity, ChevronRight, User } from 'lucide-react';
import { apiClient } from '../libs/api';
import { Service, PracticeConfig } from '../types';

interface LandingPageProps {
  onBookNow: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onBookNow, onLogin }) => {
  const [config, setConfig] = useState<PracticeConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const conf = await apiClient.practice.get();
        const svcs = await apiClient.services.list();
        setConfig(conf);
        setServices(svcs.slice(0, 6)); // Top 6 services
    };
    loadData();
    
    // Listen for real-time updates from Admin Console
    window.addEventListener('practice-config-update', loadData);
    return () => window.removeEventListener('practice-config-update', loadData);
  }, []);

  if (!config) return null;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-secondary/20 pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Professional Healthcare
              </div>
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-800 leading-tight">
                Your Health, <br/>
                <span className="text-primary">Our Priority.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                Welcome to {config.name}. providing comprehensive, patient-centered care. 
                From preventative screenings to chronic disease management, we are dedicated to your well-being.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onBookNow}
                  className="px-8 py-4 bg-primary hover:bg-teal-600 text-white rounded-lg font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </button>
                <button 
                  onClick={onLogin}
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Patient Portal
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-auto bg-slate-200 flex items-center justify-center aspect-[4/3] text-slate-400">
                  <Activity className="w-20 h-20 opacity-20" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 z-20 bg-white p-6 rounded-xl shadow-xl border-l-4 border-primary max-w-xs animate-in fade-in zoom-in delay-300 duration-700">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <Activity className="w-5 h-5" />
                   </div>
                   <span className="font-bold text-slate-800 text-sm">Accepting New Patients</span>
                </div>
                <p className="text-xs text-slate-500">Schedule your consultation today for personalized care plans.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <div className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-3">
              <MapPin className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-bold text-sm">Visit Us</p>
                <p className="text-xs opacity-90">{config.address}</p>
              </div>
           </div>
           <div className="flex items-center justify-center md:justify-start gap-3">
              <Clock className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-bold text-sm">Working Hours</p>
                <p className="text-xs opacity-90">{config.workingHours}</p>
              </div>
           </div>
           <div className="flex items-center justify-center md:justify-start gap-3">
              <Phone className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-bold text-sm">Contact</p>
                <p className="text-xs opacity-90">{config.phone}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">Our Medical Services</h2>
             <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
             <p className="mt-4 text-slate-500 max-w-2xl mx-auto">We provide a wide range of primary care services tailored to your family's needs.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {services.map((service) => (
               <div key={service.id} className="group p-8 bg-slate-50 hover:bg-white rounded-2xl transition-all hover:shadow-xl border border-slate-100 hover:border-primary/20">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">{service.name}</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-6">{service.description}</p>
                 <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-200">
                    <span className="text-sm font-bold text-slate-900">{config.currency} {service.price}</span>
                    <button onClick={onBookNow} className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                      Book <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Meet the Team Placeholder - Handled dynamically in AboutUs.tsx generally, but included here for completeness of landing flow if needed, 
          though usually AboutUs component handles the specific "Meet the Team" details. 
          We'll use a generic call to action here instead. */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
             <div className="w-full md:w-1/3">
               <div className="w-full aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Activity className="w-24 h-24 opacity-20" />
               </div>
             </div>
             <div className="flex-1 space-y-6">
                <div>
                   <h2 className="text-3xl font-display font-bold text-slate-800">Expert Care</h2>
                   <p className="text-primary font-bold text-lg">Qualified Practitioners</p>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Our practice is staffed by experienced medical professionals committed to upholding the highest standards of healthcare. 
                  We focus on accurate diagnosis, effective treatment plans, and long-term wellness strategies for all our patients.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> General Medicine</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Pediatric Care</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Chronic Disease Management</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Wellness Screening</li>
                </ul>
                <button onClick={onBookNow} className="inline-block px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                  Schedule Consultation
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer - Now Dynamic */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-display font-bold text-xl mb-4">{config.name}</h3>
            <p className="max-w-sm text-sm">Providing quality, accessible healthcare. Your health journey starts here.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary">Privacy Policy (POPIA)</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">PAIA Manual</a></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4">Emergency</h4>
             <p className="text-sm mb-2">For medical emergencies, please dial:</p>
             <p className="text-2xl font-bold text-red-500">{config.emergencyPhone}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-xs text-center">
          &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
