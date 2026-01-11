
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../libs/api';
import { Service, Doctor, PracticeConfig } from '../../types';
import { X, Calendar, User, Clock, ChevronRight, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [config, setConfig] = useState<PracticeConfig | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [patientData, setPatientData] = useState({
      name: '',
      email: '',
      phone: '',
      reason: '',
      type: 'New Patient'
  });
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (isOpen) {
        apiClient.services.list().then(setServices);
        apiClient.doctors.list().then(setDoctors);
        apiClient.practice.get().then(setConfig);
    }
  }, [isOpen]);

  if (!isOpen || !config) return null;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const selectedService = services.find(s => s.id === serviceId);
  const selectedDoctor = doctors.find(d => d.id === doctorId);

  const handleSubmit = async () => {
      setLoading(true);
      try {
          await apiClient.appointments.create({
              patientId: 'guest_123',
              doctorId,
              serviceId,
              start: `${date}T${time}:00.000Z`,
              reason: patientData.reason,
              contactMethod: 'email'
          });
          setStep(5);
      } catch (err) {
          alert("Failed to book appointment. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const slots = ['09:15', '09:45', '10:15', '11:00', '11:45', '14:00', '15:30'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
           <div>
             <h2 className="font-display font-bold text-lg">Schedule Appointment</h2>
             <p className="text-xs text-white/80">{config.name} • Practice</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="h-1 bg-slate-100 w-full">
            <div 
                className="h-full bg-teal-400 transition-all duration-300 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
            ></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            
            {step === 1 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">1. Select Service & Provider</h3>
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medical Service</label>
                        <div className="grid grid-cols-1 gap-2">
                            {services.map(svc => (
                                <button 
                                    key={svc.id}
                                    onClick={() => setServiceId(svc.id)}
                                    className={`p-3 rounded-lg border text-left flex justify-between items-center transition-all ${serviceId === svc.id ? 'border-primary bg-teal-50 ring-1 ring-primary' : 'border-slate-200 hover:border-teal-300'}`}
                                >
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{svc.name}</p>
                                        <p className="text-xs text-slate-500">{svc.duration} mins</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary">{config.currency} {svc.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Practitioner</label>
                        <div className="grid grid-cols-2 gap-3">
                            {doctors.map(doc => (
                                <button 
                                    key={doc.id}
                                    onClick={() => setDoctorId(doc.id)}
                                    className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${doctorId === doc.id ? 'border-primary bg-teal-50 ring-1 ring-primary' : 'border-slate-200 hover:border-teal-300'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800 text-xs">{doc.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">2. Choose a Date & Time</h3>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Select Date</label>
                        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    {date && (
                        <div className="animate-in fade-in">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Available Slots</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {slots.map(s => (
                                    <button key={s} onClick={() => setTime(s)} className={`py-2 px-3 text-sm font-bold rounded-md transition-all ${time === s ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="space-y-5">
                    <h3 className="text-lg font-bold text-slate-800">3. Your Information</h3>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                                <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                                <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none" placeholder="+27..." value={patientData.phone} onChange={e => setPatientData({...patientData, phone: e.target.value})} />
                             </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                            <input type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none" value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Reason for Visit</label>
                            <textarea className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none h-20 resize-none" placeholder="Brief description..." value={patientData.reason} onChange={e => setPatientData({...patientData, reason: e.target.value})} />
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                        <div>
                            <p className="text-xs text-blue-800 leading-relaxed">I consent to data processing for medical administrative purposes.</p>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="accent-primary w-4 h-4" />
                                <span className="text-xs font-bold text-slate-700">I accept terms</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <h3 className="text-lg font-bold text-slate-800">4. Review & Confirm</h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                        <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Service</p>
                                <p className="font-bold text-slate-800 text-lg">{selectedService?.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{selectedService?.duration} minutes</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total</p>
                                <p className="font-bold text-primary text-xl">{config.currency} {selectedService?.price}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Provider</p>
                                <p className="font-bold text-slate-800 text-sm">{selectedDoctor?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">When</p>
                                <p className="font-bold text-slate-800 text-sm">{date} @ {time}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Patient</p>
                            <p className="font-bold text-slate-800">{patientData.name}</p>
                            <p className="text-sm text-slate-600">{patientData.email} • {patientData.phone}</p>
                        </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-orange-600 shrink-0" />
                        <div className="text-xs text-orange-800">Fees are settled after consultation.</div>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">Scheduled successfully at {config.name}.</p>
                    <button onClick={onClose} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-teal-700">Done</button>
                </div>
            )}

        </div>

        {step < 5 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <button onClick={handleBack} disabled={step === 1} className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed">Back</button>
                {step < 4 ? (
                    <button onClick={handleNext} disabled={(step === 1 && (!serviceId || !doctorId)) || (step === 2 && (!date || !time)) || (step === 3 && (!patientData.name || !patientData.email || !consent))} className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">Next Step <ChevronRight className="w-4 h-4" /></button>
                ) : (
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold shadow hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{loading ? 'Processing...' : 'Confirm Appointment'}</button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
