
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Calendar, Settings as SettingsIcon, Sparkles, LogOut, Lock, Loader2, Globe, Save, Plus, Edit2, Truck, Database, Image as ImageIcon, Trash2, Camera, Mail, BookOpen } from 'lucide-react';
import AiConsole from './AiConsole';
import PatientsTable from './PatientsTable';
import AppointmentCalendar from './AppointmentCalendar';
import DataImport from './DataImport';
import SuppliersTable from './SuppliersTable';
import Outbox from './Outbox';
import KnowledgeBase from './KnowledgeBase';
import { User, Appointment, PracticeConfig, Service, Doctor } from '../../types';
import { updateContent, useContent } from '../../hooks/useContent';
import { apiClient } from '../../libs/api';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState<'identity'|'services'|'doctors'>('identity');
  
  const heroImageUrl = useContent('hero_image');
  
  const [stats, setStats] = useState({ todayAppts: 0, totalPatients: 0, pending: 0 });
  const [practiceConfig, setPracticeConfig] = useState<PracticeConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (activeTab === 'dashboard') {
          const fetchStats = async () => {
              const allAppts = await apiClient.db.getAll<Appointment>('appointments');
              const allUsers = await apiClient.db.getAll<User>('users');
              const today = new Date().toDateString();
              setStats({
                  todayAppts: allAppts.filter(a => new Date(a.date).toDateString() === today).length,
                  totalPatients: allUsers.filter(u => u.role === 'patient').length,
                  pending: allAppts.filter(a => a.status === 'pending').length
              });
          };
          fetchStats();
      }
      if (activeTab === 'settings') {
          apiClient.practice.get().then(setPracticeConfig);
          apiClient.services.list().then(setServices);
          apiClient.doctors.list().then(setDoctors);
      }
  }, [activeTab]);

  const handleSaveIdentity = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!practiceConfig) return;
      setIsSaving(true);
      await apiClient.practice.update(practiceConfig);
      setIsSaving(false);
      alert("Practice identity updated.");
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          await updateContent('hero_image', base64);
      };
      reader.readAsDataURL(file);
  };

  const handleAddService = async () => {
      const name = prompt("Service Name:");
      if (!name) return;
      const price = parseFloat(prompt("Price (Numbers only):", "0") || "0");
      const newSvc: Service = {
          id: 's_' + Date.now(),
          name,
          category: 'General',
          duration: 30,
          price,
          description: 'Custom service added via Admin.'
      };
      await apiClient.services.save(newSvc);
      setServices(prev => [...prev, newSvc]);
  };

  const handleDeleteService = async (id: string) => {
      if (confirm("Delete this service?")) {
          await apiClient.services.delete(id);
          setServices(prev => prev.filter(s => s.id !== id));
      }
  };

  const handleEditDoctor = async (doc: Doctor) => {
      const newName = prompt("Practitioner Name:", doc.name);
      if (!newName) return;
      const newSpecialty = prompt("Specialty:", doc.specialty);
      const updated = { ...doc, name: newName, specialty: newSpecialty || doc.specialty };
      await apiClient.doctors.save(updated);
      setDoctors(prev => prev.map(d => d.id === doc.id ? updated : d));
  };

  const SidebarLink = ({ id, icon: Icon, label, restricted }: any) => {
    const isLocked = restricted && user.role !== 'admin' && user.role !== 'developer';
    return (
      <button
        onClick={() => setActiveTab(id)}
        disabled={isLocked}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === id ? 'bg-primary text-white shadow-lg' : isLocked ? 'text-slate-600 opacity-50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
      >
        <div className="relative">
            <Icon className="w-5 h-5" />
            {isLocked && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-slate-500" />}
        </div>
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold">PZ</div>
              <span className="font-display font-bold text-lg tracking-tight">Admin Console</span>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2 tracking-widest">Main Operations</p>
            <SidebarLink id="dashboard" icon={LayoutDashboard} label="Overview" />
            <SidebarLink id="calendar" icon={Calendar} label="Appointments" />
            <SidebarLink id="patients" icon={Users} label="Patient Directory" />
            <SidebarLink id="outbox" icon={Mail} label="Communications" />
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 mt-6 mb-2 tracking-widest">System Management</p>
            <SidebarLink id="suppliers" icon={Truck} label="Suppliers" restricted={true} />
            <SidebarLink id="import" icon={Database} label="Data Import" restricted={true} />
            <SidebarLink id="knowledge" icon={BookOpen} label="Knowledge Base" restricted={true} />
            <SidebarLink id="ai" icon={Sparkles} label="AI Control" restricted={true} />
            <SidebarLink id="settings" icon={SettingsIcon} label="Branding & Pricing" restricted={true} />
        </nav>
        <div className="p-4 border-t border-slate-800">
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-bold w-full p-2 rounded transition-colors text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                 <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')}</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{user.role}</p>
                </div>
            </div>
        </header>

        <div className="p-8">
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Daily Traffic</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.todayAppts} <span className="text-xs text-slate-400 font-normal">Appts</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Database Load</p>
                        <p className="text-3xl font-bold text-primary">{stats.totalPatients} <span className="text-xs text-slate-400 font-normal">Patients</span></p>
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && <AppointmentCalendar />}
            {activeTab === 'patients' && <PatientsTable />}
            {activeTab === 'suppliers' && <SuppliersTable />}
            {activeTab === 'import' && <DataImport />}
            {activeTab === 'knowledge' && <KnowledgeBase />}
            {activeTab === 'outbox' && <Outbox />}
            {activeTab === 'ai' && <AiConsole />}

            {activeTab === 'settings' && practiceConfig && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex gap-4 border-b border-slate-200 mb-6">
                        <button onClick={() => setSettingsTab('identity')} className={`pb-4 px-4 font-bold text-sm transition-all ${settingsTab === 'identity' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Identity & Contact</button>
                        <button onClick={() => setSettingsTab('services')} className={`pb-4 px-4 font-bold text-sm transition-all ${settingsTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Service Catalog</button>
                        <button onClick={() => setSettingsTab('doctors')} className={`pb-4 px-4 font-bold text-sm transition-all ${settingsTab === 'doctors' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Practitioners</button>
                    </div>

                    {settingsTab === 'identity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <form onSubmit={handleSaveIdentity} className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 h-fit">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Branding & Global Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Practice Name</label>
                                        <input type="text" value={practiceConfig.name} onChange={e => setPracticeConfig({...practiceConfig, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Public Phone</label>
                                        <input type="tel" value={practiceConfig.phone} onChange={e => setPracticeConfig({...practiceConfig, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Public Email</label>
                                        <input type="email" value={practiceConfig.email} onChange={e => setPracticeConfig({...practiceConfig, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Physical Address</label>
                                        <input type="text" value={practiceConfig.address} onChange={e => setPracticeConfig({...practiceConfig, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Business Hours String</label>
                                        <input type="text" value={practiceConfig.workingHours} onChange={e => setPracticeConfig({...practiceConfig, workingHours: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" placeholder="Mon-Fri: 09:00-17:00 | Sat: 09:00-13:00" />
                                    </div>
                                </div>
                                <div className="pt-6 flex justify-end">
                                    <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-all shadow-md shadow-primary/20">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Branding
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> Visual Assets</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Landing Hero Image</p>
                                            <div className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                <img src={heroImageUrl} className="w-full h-full object-cover" />
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} />
                                                    <Camera className="w-8 h-8 text-white" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100">
                                    <h4 className="font-bold text-cyan-900 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Persona</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-cyan-700 uppercase mb-1">Assistant Name</label>
                                            <input type="text" value={practiceConfig.aiName} onChange={e => setPracticeConfig({...practiceConfig, aiName: e.target.value})} className="w-full p-2 bg-white border border-cyan-200 rounded-lg text-xs outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-cyan-700 uppercase mb-1">Assistant Bio / Rules</label>
                                            <textarea value={practiceConfig.aiBio} onChange={e => setPracticeConfig({...practiceConfig, aiBio: e.target.value})} className="w-full p-2 bg-white border border-cyan-200 rounded-lg text-xs outline-none h-24 resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'services' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Services & Pricing Engine</h3>
                                <button onClick={handleAddService} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-all"><Plus className="w-4 h-4" /> New Service</button>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="p-4">Service Description</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4 text-center">Base Fee</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {services.map(svc => (
                                        <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-700">{svc.name}</td>
                                            <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">{svc.category}</span></td>
                                            <td className="p-4 text-center font-bold text-primary">{practiceConfig.currency} {svc.price}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteService(svc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {settingsTab === 'doctors' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                            <h3 className="font-bold text-slate-800 mb-6">Medical Practitioner Registry</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {doctors.map(doc => (
                                    <div key={doc.id} className="p-5 border border-slate-100 rounded-2xl flex items-center gap-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 transition-all group">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm bg-slate-200">
                                            <img src={doc.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{doc.name}</p>
                                            <p className="text-xs text-primary font-medium">{doc.specialty}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditDoctor(doc)} className="p-2 text-slate-300 group-hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                            {doc.id !== 'ai_assistant' && (
                                                <button onClick={async () => { if(confirm("Remove doc?")) { await apiClient.doctors.delete(doc.id); setDoctors(prev => prev.filter(d => d.id !== doc.id)); } }} className="p-2 text-slate-300 group-hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={async () => {
                                    const name = prompt("Name:");
                                    if(!name) return;
                                    const newDoc: Doctor = { id: 'd_' + Date.now(), name, specialty: 'General Practitioner', bio: 'New doctor bio...', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200' };
                                    await apiClient.doctors.save(newDoc);
                                    setDoctors(prev => [...prev, newDoc]);
                                }} className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-bold flex items-center justify-center gap-2">
                                    <Plus className="w-5 h-5" /> Register Practitioner
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
