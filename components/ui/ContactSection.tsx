
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { PracticeConfig } from '../../types';

const ContactSection: React.FC = () => {
  const [config, setConfig] = useState<PracticeConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchConfig = () => apiClient.practice.get().then(setConfig);
    fetchConfig();
    window.addEventListener('practice-config-update', fetchConfig);
    return () => window.removeEventListener('practice-config-update', fetchConfig);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
    }, 1500);
  };

  if (!config) return null;

  return (
    <section id="contact" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Get in Touch</h2>
                    <p className="text-slate-600">
                        Have a question? Reach out to our front desk. For appointments, please use our online booking system.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Visit Us</h4>
                            <p className="text-slate-600 whitespace-pre-line">{config.address}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Call Us</h4>
                            <a href={`tel:${config.phone}`} className="text-slate-600 hover:text-primary font-bold">{config.phone}</a>
                            <p className="text-xs text-slate-400 mt-1">{config.workingHours.split('|')[0]}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Email</h4>
                            <a href={`mailto:${config.email}`} className="text-slate-600 hover:text-primary">{config.email}</a>
                        </div>
                    </div>
                </div>

                <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                       Map Location: {config.address.split(',')[0]}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Send a Message</h3>
                
                {submitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800">Message Sent!</h4>
                        <p className="text-slate-500 mt-2">We will get back to you shortly.</p>
                        <button onClick={() => setSubmitted(false)} className="mt-6 text-primary font-bold hover:underline">Send another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none transition-colors" placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <input required type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none transition-colors" placeholder="Contact No" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input required type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none transition-colors" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                            <textarea required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none h-32 resize-none transition-colors" placeholder="How can we help?"></textarea>
                        </div>
                        
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </form>
                )}
            </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
