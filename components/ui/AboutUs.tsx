
import React, { useState, useEffect } from 'react';
import { Heart, Globe, GraduationCap, Activity } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { apiClient } from '../../libs/api';
import { Doctor, PracticeConfig } from '../../types';

const AboutUs: React.FC = () => {
  const [primaryDoctor, setPrimaryDoctor] = useState<Doctor | null>(null);
  const [config, setConfig] = useState<PracticeConfig | null>(null);
  
  const img1 = useContent('about_team_1');
  const img2 = useContent('about_team_2');
  const img3 = useContent('about_team_3');
  const img4 = useContent('about_team_4');

  useEffect(() => {
    // Dynamically fetch the first doctor that isn't the AI assistant
    apiClient.doctors.list().then(docs => {
        const humanDocs = docs.filter(d => d.id !== 'ai_assistant');
        if (humanDocs.length > 0) {
            setPrimaryDoctor(humanDocs[0]);
        }
    });
    apiClient.practice.get().then(setConfig);
  }, []);

  if (!config) return null;

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
               <Heart className="w-4 h-4" /> Professional Excellence
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
              {config.name} <br/>
              <span className="text-primary block text-2xl mt-2 font-normal">Patient-Centered Care</span>
            </h2>
            
            <div className="prose prose-slate text-slate-600 leading-relaxed">
              <p>
                Welcome to {config.name}. We are dedicated to providing top-tier medical services to our community. 
                Our practice combines modern technology with compassionate care to ensure the best outcomes for your health.
              </p>
              {primaryDoctor && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                      <p className="font-bold text-slate-800 text-sm mb-1">Lead Practitioner</p>
                      <p className="font-display font-bold text-lg text-primary">{primaryDoctor.name}</p>
                      <p className="text-sm italic mt-2">"{primaryDoctor.bio}"</p>
                  </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
               <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Certified</h4>
                    <p className="text-sm text-slate-500">Qualified Professionals</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Modern Care</h4>
                    <p className="text-sm text-slate-500">Advanced Facilities</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right duration-700">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4 translate-y-8">
                  <div className="bg-slate-200 rounded-2xl h-64 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg">
                      <img src={img1} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Professional" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Patient Focused</span>
                  </div>
                  <div className="bg-slate-200 rounded-2xl h-48 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg border border-slate-100">
                      <img src={img2} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Care" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Modern Facility</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="bg-slate-200 rounded-2xl h-48 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg border border-slate-100">
                      <img src={img3} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Excellence" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Compassionate</span>
                  </div>
                  <div className="bg-slate-200 rounded-2xl h-64 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg">
                      <img src={img4} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Results" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Clinical Results</span>
                  </div>
               </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/10 to-transparent rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
