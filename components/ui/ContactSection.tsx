
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Info & Map */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Get in Touch</h2>
                    <p className="text-slate-600">
                        Have a question? Reach out to our front desk. For appointments, please use our online booking system or call us directly.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Visit Us</h4>
                            <p className="text-slate-600">6 Epping Street<br/>Milnerton, Cape Town<br/>7441</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Call Us</h4>
                            <a href="tel:+27215101441" className="text-slate-600 hover:text-primary font-bold">021 510 1441</a>
                            <p className="text-xs text-slate-400 mt-1">Mon-Fri 09:15-16:30</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Email</h4>
                            <a href="mailto:info@drsetzer.com" className="text-slate-600 hover:text-primary">info@drsetzer.com</a>
                        </div>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.493977508688!2d18.4901234!3d-33.8769345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5e0b0b0b0b0b%3A0x0!2s6%20Epping%20St%2C%20Milnerton%2C%20Cape%20Town%2C%207441!5e0!3m2!1sen!2sza!4v1630000000000!5m2!1sen!2sza" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        title="Practice Location"
                        className="grayscale group-hover:grayscale-0 transition-all duration-500"
                    ></iframe>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Send a Message</h3>
                
                {submitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800">Message Sent!</h4>
                        <p className="text-slate-500 mt-2">Thank you. We will get back to you shortly.</p>
                        <button onClick={() => setSubmitted(false)} className="mt-6 text-primary font-bold hover:underline">Send another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none transition-colors" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <input required type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none transition-colors" placeholder="+27..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input required type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none transition-colors" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                            <textarea required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none h-32 resize-none transition-colors" placeholder="How can we help you?"></textarea>
                        </div>
                        
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-4 h-4" /></>}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 text-center mt-4">
                            This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                        </p>
                    </form>
                )}
            </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
