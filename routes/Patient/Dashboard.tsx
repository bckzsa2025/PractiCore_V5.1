
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../libs/api';
import { User, Appointment } from '../../types';
import { LogOut, Calendar, FileText, User as UserIcon, CreditCard, MessageSquare, WifiOff, Download, Upload, Pill, X, Printer, Send } from 'lucide-react';
import Profile from './Profile';
import TokenWidget from '../../components/ui/TokenWidget';

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

type ViewState = 'overview' | 'profile' | 'billing' | 'messages';

const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [view, setView] = useState<ViewState>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Doc state
  const [showPrescription, setShowPrescription] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);

  // Message State
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
      { id: 1, sender: 'staff', text: 'Good morning Alex, just confirming your appointment for tomorrow.', time: 'Yesterday 10:30 AM' },
      { id: 2, sender: 'user', text: 'Yes, I will be there. Thanks!', time: 'Yesterday 10:45 AM' }
  ]);

  useEffect(() => {
    // Network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Data Fetch
    const fetchData = async () => {
        // 1. Appointments
        const apptData = await apiClient.appointments.list(user.id);
        setAppointments(apptData);
        
        // 2. Documents (From DB)
        const docData = await apiClient.documents.list(user.id);
        setDocs(docData);
    };
    fetchData();

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [user.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          // Upload to persistent DB
          const newDoc = await apiClient.documents.upload(user.id, file);
          setDocs(prev => [newDoc, ...prev]);
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageInput.trim()) return;
      
      const newMsg = {
          id: Date.now(),
          sender: 'user',
          text: messageInput,
          time: 'Just now'
      };
      setChatMessages(prev => [...prev, newMsg]);
      setMessageInput('');
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
      <button 
        onClick={() => setView(id)}
        className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-colors border-b border-slate-50 ${view === id ? 'text-primary bg-blue-50/50' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
      >
          <Icon className="w-4 h-4" /> {label}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-display font-bold text-slate-800 text-xl">PractiZone™ Portal</span>
                    {!isOnline && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold animate-pulse">
                            <WifiOff className="w-3 h-3" /> Offline Mode
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-primary mx-auto mb-4 border-2 border-white shadow-sm">
                        <UserIcon className="w-10 h-10" />
                    </div>
                    <h2 className="font-bold text-slate-800">{user.name}</h2>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded mt-2">
                        Active Patient
                    </span>
                </div>

                <TokenWidget balance={750} />

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <nav className="flex flex-col">
                        <button 
                            onClick={() => setView('overview')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-colors border-b border-slate-50 ${view === 'overview' ? 'text-primary bg-blue-50/50' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                        >
                            <Calendar className="w-4 h-4" /> Overview
                        </button>
                        <SidebarItem id="profile" label="My Profile" icon={UserIcon} />
                        <SidebarItem id="billing" label="Billing & Invoices" icon={CreditCard} />
                        <SidebarItem id="messages" label="Messages" icon={MessageSquare} />
                    </nav>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="font-bold text-slate-400 text-xs uppercase mb-4">Medical Summary</h3>
                     <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500">Conditions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {user.medicalSummary?.conditions.map(c => (
                                    <span key={c} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-100 font-bold">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500">Allergies</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {user.medicalSummary?.allergies.map(c => (
                                    <span key={c} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100 font-bold">{c}</span>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            </aside>

            <div className="lg:col-span-3 space-y-6">
                
                {view === 'overview' && (
                    <>
                        {/* Appointments Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" /> Appointments
                                </h2>
                                <button className="text-sm font-bold text-primary hover:underline">+ Book New</button>
                            </div>

                            <div className="space-y-4">
                                {appointments.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8 italic">No appointments found.</p>
                                ) : (
                                    appointments.map(appt => (
                                        <div key={appt.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center min-w-[70px]">
                                                <span className="block text-xs font-bold text-slate-400 uppercase">
                                                    {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="block text-xl font-bold text-slate-800">
                                                    {new Date(appt.date).getDate()}
                                                </span>
                                            </div>
                                            <div className="flex-1 text-center sm:text-left">
                                                <h4 className="font-bold text-slate-800">
                                                    {appt.type === 'telehealth' ? 'Telehealth Consultation' : 'In-Person Visit'}
                                                </h4>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Dr. B Setzer
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                {appt.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Documents
                            </h3>
                            
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 mb-4 text-center hover:bg-slate-50 transition-colors relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                    <Upload className="w-6 h-6" />
                                    <p className="text-xs font-bold">Click to Upload</p>
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {docs.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-2">No documents yet.</p>
                                ) : (
                                    docs.map((doc) => (
                                        <li 
                                            key={doc.id}
                                            onClick={() => doc.type === 'prescription' && setShowPrescription(true)}
                                            className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group ${doc.type === 'prescription' ? 'cursor-pointer ring-1 ring-transparent hover:ring-primary/20' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {doc.type === 'prescription' ? <Pill className="w-5 h-5 text-slate-400" /> : <FileText className="w-5 h-5 text-slate-400" />}
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{doc.name}</p>
                                                    <p className="text-[10px] text-slate-500">{doc.date} • {doc.source}</p>
                                                </div>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-400" />
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </>
                )}

                {/* Profile, Billing, Messages View Logic (Unchanged) */}
                {view === 'profile' && <Profile user={user} onUpdate={setUser} />}
                {view === 'billing' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-lg text-slate-800">Billing History</h2>
                        <p className="text-slate-500 text-sm mt-2">No invoices found.</p>
                    </div>
                )}
                {view === 'messages' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col animate-in fade-in">
                         <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                 <UserIcon className="w-5 h-5 text-slate-400" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800">Front Desk</h3>
                                 <p className="text-xs text-slate-500">Usually replies within 1 hour</p>
                             </div>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                             {chatMessages.map(msg => (
                                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                                         <p>{msg.text}</p>
                                         <span className="text-[10px] opacity-70 block text-right mt-1">{msg.time}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                             <input 
                                type="text" 
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:outline-none focus:border-primary"
                                placeholder="Type a secure message..."
                             />
                             <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:bg-blue-700"><Send className="w-5 h-5" /></button>
                         </form>
                    </div>
                )}
            </div>
        </main>

        {/* Prescription Modal (Keep existing) */}
        {showPrescription && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Prescription</h3>
                        <button onClick={() => setShowPrescription(false)}><X className="w-5 h-5" /></button>
                    </div>
                    <p className="text-sm text-slate-600">Sample Prescription Data.</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;
