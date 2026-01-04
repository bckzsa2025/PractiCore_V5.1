
import React, { useState } from 'react';
import { User, EmergencyContact } from '../../types';
import { apiClient } from '../../libs/api';
import { User as UserIcon, Phone, Mail, Save, Heart, AlertCircle, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [emergencyData, setEmergencyData] = useState<EmergencyContact>(user.emergencyContact || { name: '', relationship: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    
    try {
        const updatedUser = {
            ...formData,
            emergencyContact: emergencyData
        };
        
        // This handles both online and offline cases via libs/api.ts
        const result = await apiClient.patients.update(updatedUser);
        
        onUpdate(result); // Update parent state
        setMsg({ type: 'success', text: !navigator.onLine ? 'Changes saved offline. Will sync when connected.' : 'Profile updated successfully.' });
    } catch (err) {
        setMsg({ type: 'error', text: 'Failed to update profile.' });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-blue-50 text-primary rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <UserIcon className="w-12 h-12" />
            </div>
            <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{formData.name}</h2>
                <p className="text-slate-500">Patient ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{formData.id}</span></p>
            </div>
            {msg && (
                <div className={`px-4 py-2 rounded-lg text-sm font-bold ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msg.text}
                </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" /> Personal Information
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                type="tel"
                                value={formData.phone || ''}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" /> Emergency Contact
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Name</label>
                        <input 
                            type="text"
                            value={emergencyData.name}
                            onChange={e => setEmergencyData({...emergencyData, name: e.target.value})}
                            placeholder="e.g. Spouse, Parent"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Relationship</label>
                            <input 
                                type="text"
                                value={emergencyData.relationship}
                                onChange={e => setEmergencyData({...emergencyData, relationship: e.target.value})}
                                placeholder="e.g. Partner"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                            <input 
                                type="tel"
                                value={emergencyData.phone}
                                onChange={e => setEmergencyData({...emergencyData, phone: e.target.value})}
                                placeholder="+27..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2 text-xs text-red-800">
                         <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                         <p>This contact will be called in case of medical emergency during procedures.</p>
                    </div>
                </div>
            </div>

            {/* Medical Summary (Read Only) */}
            <div className="md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                 <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-slate-600" /> Clinical Summary <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Read Only</span>
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Chronic Conditions</p>
                        <div className="flex flex-wrap gap-2">
                            {formData.medicalSummary?.conditions.map(c => (
                                <span key={c} className="px-3 py-1.5 bg-white text-slate-700 text-sm font-bold rounded border border-slate-200 shadow-sm">{c}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Known Allergies</p>
                        <div className="flex flex-wrap gap-2">
                            {formData.medicalSummary?.allergies.map(a => (
                                <span key={a} className="px-3 py-1.5 bg-red-100 text-red-800 text-sm font-bold rounded border border-red-200 shadow-sm">{a}</span>
                            ))}
                        </div>
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 mt-4 italic">To update clinical information, please schedule a consultation with Dr. Sester.</p>
            </div>

            <div className="md:col-span-2 flex justify-end">
                <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-primary text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 transition-all"
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
            </div>

        </form>
    </div>
  );
};

export default Profile;
    