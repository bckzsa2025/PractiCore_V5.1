
import React, { useState, useEffect } from 'react';
import { Award, Star, Stethoscope, Bot, Cpu } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { Doctor } from '../../types';

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    apiClient.doctors.list().then(setDoctors);
  }, []);

  return (
    <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                    <Stethoscope className="w-4 h-4" /> Practice Professionals
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Our Dedicated Team</h2>
                <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
                    Meet the healthcare experts committed to your well-being.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                {doctors.map((doc) => (
                    <div 
                        key={doc.id} 
                        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 group hover:-translate-y-2 transition-transform duration-300 max-w-md mx-auto w-full"
                    >
                        <div className={`h-64 overflow-hidden relative ${doc.id === 'ai_assistant' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                            <img 
                                src={doc.image} 
                                alt={doc.name} 
                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${doc.id === 'ai_assistant' ? 'p-12 object-contain' : ''}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-6">
                                <div>
                                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                        {doc.name}
                                    </h3>
                                    <p className={`${doc.id === 'ai_assistant' ? 'text-cyan-400' : 'text-primary-300'} text-sm font-medium`}>{doc.specialty}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-2 mb-4">
                                {doc.id === 'ai_assistant' ? (
                                    <>
                                        <span className="bg-cyan-50 text-cyan-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                            <Bot className="w-3 h-3" /> Digital Assistant
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                            <Cpu className="w-3 h-3" /> AI Powered
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                            <Award className="w-3 h-3" /> Certified
                                        </span>
                                        <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                            <Star className="w-3 h-3" /> Experienced
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 min-h-[60px]">
                                {doc.bio}
                            </p>
                            <button 
                                className={`w-full py-3 border rounded-lg font-bold text-sm transition-colors ${doc.id === 'ai_assistant' ? 'border-cyan-200 text-cyan-700 hover:bg-cyan-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                            >
                                {doc.id === 'ai_assistant' ? 'Open Assistant' : 'View Profile'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default DoctorsList;
