/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { User, Appointment } from '../types';
import { SERVICES, DOCTORS } from '../services/geminiService';
import { FileText, Calendar, MessageSquare, Pill, LogOut, Video, Download, CreditCard, User as UserIcon, X, Printer, Upload } from 'lucide-react';

interface PatientPortalProps {
  user: User;
  appointments: Appointment[];
  onLogout: () => void;
}

interface DocItem {
  id: string;
  name: string;
  source: string;
  date: string;
  type: 'lab' | 'prescription' | 'upload';
}

const PatientPortal: React.FC<PatientPortalProps> = ({ user, appointments, onLogout }) => {
  const [showPrescription, setShowPrescription] = useState(false);
  
  const STORAGE_KEY_DOCS = 'dr_sester_patient_docs';

  // Load docs from localStorage or use defaults
  const [docs, setDocs] = useState<DocItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse docs", e);
      }
    }
    return [
      { id: '1', name: 'Blood Test Results', source: 'PathCare', date: 'Oct 12, 2023', type: 'lab' },
      { id: '2', name: 'Prescription Script', source: 'Dr. Sester', date: 'Sep 28, 2023', type: 'prescription' }
    ];
  });

  // Persist docs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
  }, [docs]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to add files to state
  const handleFiles = (files: FileList) => {
    const newDocs: DocItem[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        name: file.name,
        source: 'Patient Upload',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'upload'
    }));
    setDocs(prev => [...newDocs, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    DS
                </div>
                <span className="font-display font-bold text-slate-800 hidden md:block">Patient Portal</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">ID: {user.id}</p>
                </div>
                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar / Profile Card */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <UserIcon className="w-12 h-12" />
                    </div>
                    <h2 className="font-bold text-xl text-slate-800">{user.name}</h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Medical Summary</p>
                        <div className="flex flex-wrap gap-2">
                             {user.medicalSummary?.conditions.map(c => (
                                <span key={c} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-100">{c}</span>
                             ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Allergies</p>
                        <div className="flex flex-wrap gap-2">
                             {user.medicalSummary?.allergies.map(a => (
                                <span key={a} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-100">{a}</span>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-secondary/20 rounded-xl p-4 border border-secondary/50">
                <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                        <p className="font-bold text-sm text-slate-800">Direct Message</p>
                        <p className="text-xs text-slate-600 mt-1">Have a quick question for Dr. Sester? Start a secure chat thread.</p>
                        <button className="mt-3 text-xs font-bold text-primary hover:underline">Start New Thread</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8 lg:col-span-9 space-y-8">
            
            {/* Appointments Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" /> Upcoming Appointments
                    </h3>
                    <button className="text-sm font-bold text-primary hover:bg-primary/5 px-3 py-1 rounded transition-colors">+ New Booking</button>
                </div>

                <div className="space-y-4">
                    {appointments.length > 0 ? appointments.map((appt) => {
                        const doctor = DOCTORS.find(d => d.id === appt.doctorId);
                        const service = SERVICES.find(s => s.id === appt.serviceId);
                        
                        return (
                            <div key={appt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex flex-col items-center justify-center min-w-[80px] text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-2xl font-bold text-slate-800">{new Date(appt.date).getDate()}</span>
                                    <span className="text-xs font-bold text-primary">{new Date(appt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className="font-bold text-lg text-slate-800">{service?.name}</h4>
                                    <p className="text-sm text-slate-500 mb-2">with {doctor?.name}</p>
                                    <div className="flex gap-2 justify-center sm:justify-start">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                            {appt.status}
                                        </span>
                                        {appt.type === 'telehealth' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                                                <Video className="w-3 h-3" /> Telehealth
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     {appt.type === 'telehealth' && (
                                         <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-teal-600 shadow-sm flex items-center gap-2">
                                            <Video className="w-4 h-4" /> Join Call
                                         </button>
                                     )}
                                     <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50">
                                        Reschedule
                                     </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No upcoming appointments.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Documents / Invoices */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Recent Documents
                        </h3>
                    </div>
                    
                    {/* Drag and Drop Zone */}
                    <div 
                        className={`border-2 border-dashed rounded-lg p-4 mb-4 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload} 
                            accept=".pdf,.jpg,.png,.doc,.docx"
                            multiple
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                             <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-slate-300'}`} />
                             <div>
                                <p className="text-sm font-bold text-slate-700">Click or Drag to Upload</p>
                                <p className="text-xs">PDF, JPG, PNG (Max 5MB)</p>
                             </div>
                        </div>
                    </div>

                    <ul className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                        {docs.map((doc) => (
                            <li 
                                key={doc.id}
                                onClick={() => doc.type === 'prescription' && setShowPrescription(true)}
                                className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group ${doc.type === 'prescription' ? 'cursor-pointer' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    {doc.type === 'prescription' ? (
                                        <Pill className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                    ) : (
                                        <FileText className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{doc.name}</p>
                                        <p className="text-xs text-slate-500">{doc.source} • {doc.date}</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </li>
                        ))}
                    </ul>
                 </div>
                 
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" /> Billing & Invoices
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border-b border-slate-50">
                            <div>
                                <p className="text-sm font-bold text-slate-700">Invoice #INV-2023-001</p>
                                <p className="text-xs text-slate-500">Consultation • Paid</p>
                            </div>
                            <span className="text-sm font-bold text-slate-900">R 450.00</span>
                        </div>
                        <button className="w-full py-2 mt-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-all">
                            View All Invoices
                        </button>
                    </div>
                 </div>
            </section>

        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescription && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                 <Pill className="w-5 h-5" /> Prescription Details
              </h3>
              <button onClick={() => setShowPrescription(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between border-b border-slate-100 pb-4">
                  <div>
                     <p className="text-xs text-slate-500 uppercase font-bold">Prescribing Doctor</p>
                     <p className="font-bold text-slate-800">Dr. Beate Sester</p>
                     <p className="text-xs text-slate-400">MBBCh | Lic #1234567</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-500 uppercase font-bold">Date</p>
                     <p className="font-bold text-slate-800">Sep 28, 2023</p>
                  </div>
               </div>
               
               <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-3">Medications</p>
                  <div className="space-y-3">
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-800">Amoxicillin 500mg</p>
                        <p className="text-sm text-slate-600">1 tablet every 8 hours</p>
                        <p className="text-xs text-slate-400 mt-1">Duration: 5 days</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-800">Paracetamol (Panado) 500mg</p>
                        <p className="text-sm text-slate-600">2 tablets every 6 hours as needed</p>
                        <p className="text-xs text-slate-400 mt-1">For pain/fever</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="bg-slate-50 p-4 flex justify-end gap-2 border-t border-slate-100">
               <button onClick={() => setShowPrescription(false)} className="px-4 py-2 text-slate-600 text-sm font-bold hover:bg-slate-200 rounded-lg">Close</button>
               <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-teal-600 flex items-center gap-2">
                 <Printer className="w-4 h-4" /> Print
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientPortal;