
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { SaILabsBadge } from './SaILabsBadge';
import { apiClient } from '../../libs/api';
import { PracticeConfig } from '../../types';

interface FooterProps {
    onLegalClick?: () => void;
    onLoginClick?: () => void;
    onHomeClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onLegalClick, onLoginClick, onHomeClick }) => {
  const [config, setConfig] = useState<PracticeConfig | null>(null);

  useEffect(() => {
    const fetchConfig = () => apiClient.practice.get().then(setConfig);
    fetchConfig();
    window.addEventListener('practice-config-update', fetchConfig);
    return () => window.removeEventListener('practice-config-update', fetchConfig);
  }, []);

  if (!config) return null;

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-display font-bold text-xl mb-4">{config.name}</h3>
            <p className="max-w-sm mb-6">Providing quality, accessible healthcare. Your health journey starts here.</p>
            <div className="flex flex-col gap-2">
                <a href={`tel:${config.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" /> {config.phone}
                </a>
                <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" /> {config.email}
                </a>
                <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {config.address}
                </span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={onHomeClick} className="hover:text-primary transition-colors">Book Appointment</button></li>
              <li><button onClick={onLoginClick} className="hover:text-primary transition-colors">Patient Portal</button></li>
              <li><button onClick={onHomeClick} className="hover:text-primary transition-colors">Our Services</button></li>
              <li><button onClick={onHomeClick} className="hover:text-primary transition-colors">Contact Us</button></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4">Legal & Emergency</h4>
             <ul className="space-y-2 mb-6">
                <li><button onClick={onLegalClick} className="hover:text-primary transition-colors">Legal & Compliance</button></li>
                <li><button onClick={onLegalClick} className="hover:text-primary transition-colors">Privacy Policy (POPIA)</button></li>
                <li><button onClick={onLegalClick} className="hover:text-primary transition-colors">Terms of Service</button></li>
             </ul>
             <p className="text-xs mb-1">Medical Emergency?</p>
             <p className="text-2xl font-bold text-red-500">{config.emergencyPhone}</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
          </div>
          <SaILabsBadge theme="dark" size="sm" />
        </div>
    </footer>
  );
};

export default Footer;
