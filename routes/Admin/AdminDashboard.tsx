
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Settings, Sparkles, LogOut, Bell, Search, Lock, Image as ImageIcon, Upload, Loader2, CheckCircle, Trash2, RefreshCw, AlertTriangle, Database, Truck } from 'lucide-react';
import AiConsole from './AiConsole';
import PatientsTable from './PatientsTable';
import AppointmentCalendar from './AppointmentCalendar';
import DataImport from './DataImport';
import SuppliersTable from './SuppliersTable';
import { User, Appointment } from '../../types';
import { updateContent, ContentKey, useContent } from '../../hooks/useContent';
import { apiClient } from '../../libs/api';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Live Content Hooks
  const adminLogo = useContent('admin_logo');
  const heroImage = useContent('hero_image');
  const about1 = useContent('about_team_1');
  const about2 = useContent('about_team_2');
  const about3 = useContent('about_team_3');
  const about4 = useContent('about_team_4');
  
  // Real Data Stats
  const [stats, setStats] = useState({
      todayAppts: 0,
      totalPatients: 0,
      pending: 0
  });

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const allAppts = await apiClient.db.getAll<Appointment>('appointments');
              const allUsers = await apiClient.db.getAll<User>('users');
              
              const today = new Date().toDateString();
              const todayCount = allAppts.filter(a => new Date(a.date).toDateString() === today).length;
              const pendingCount = allAppts.filter(a => a.status === 'pending').length;
              const patientCount = allUsers.filter(u => u.role === 'patient').length;

              setStats({
                  todayAppts: todayCount,
                  totalPatients: patientCount,
                  pending: pendingCount
              });
          } catch (e) {
              console.error("Stats fetch failed", e);
          }
      };
      
      if (activeTab === 'dashboard') {
          fetchStats();
      }
  }, [activeTab]);

  const SidebarLink = ({ id, icon: Icon, label, restricted }: any) => {
    const isLocked = restricted && user.role !== 'admin' && user.role !== 'developer';
    
    if (isLocked) {
        return (
            <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-slate-600 opacity-50 cursor-not-allowed"
            >
                <div className="relative">
                    <Icon className="w-5 h-5" />
                    <Lock className="w-3 h-3 absolute -top-1 -right-1 text-slate-500" />
                </div>
                {label}
            </button>
        );
    }
    
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
      >
        <Icon className="w-5 h-5" />
        {label}
      </button>
    );
  };

  // Image Upload Handler
  const ImageUploader = ({ label, contentKey, currentUrl }: { label: string, contentKey: ContentKey, currentUrl: string }) => {
      const [uploading, setUploading] = useState(false);
      const [success, setSuccess] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              
              // 🛡️ IndexedDB can handle larger files, upped limit to 5MB
              if (file.size > 5 * 1024 * 1024) {
                  setError("File too large. Max 5MB allowed.");
                  return;
              }

              setError(null);
              setUploading(true);
              setSuccess(false);
              
              const reader = new FileReader();
              reader.onload = async (event) => {
                  const base64 = event.target?.result as string;
                  // Save to IndexedDB via the API helper
                  try {
                      await updateContent(contentKey, base64);
                      setUploading(false);
                      setSuccess(true);
                      setTimeout(() => setSuccess(false), 3000); // Reset success msg
                  } catch (err) {
                      setUploading(false);
                      setError("Database write failed.");
                  }
              };
              reader.readAsDataURL(file);
          }
      };

      return (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                  {currentUrl ? (
                      <img src={currentUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                      </div>
                  )}
              </div>
              <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
                  <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-slate-600" />}
                          <span className="text-sm font-bold text-slate-700">{uploading ? 'Saving...' : 'Change Image'}</span>
                          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      </label>
                      {success && <span className="text-green-600 text-xs font-bold flex items-center gap-1 animate-in fade-in"><CheckCircle className="w-3 h-3" /> Saved!</span>}
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
              </div>
          </div>
      );
  };

  const handleSystemReset = async () => {
      if (confirm("⚠️ FACTORY RESET: This will wipe all patients, appointments, suppliers, and custom images from this device. Are you sure?")) {
          localStorage.clear();
          
          const db = apiClient.db['db']; // Access internal IDB reference if needed, or simply delete stores
          // Since we use IDB, simplest way to wipe is deleting the DB or clearing stores via api
          // We'll use the API for a soft reset of known stores
          const stores = ['users', 'appointments', 'logs', 'documents', 'suppliers', 'content', 'vectors'];
          try {
             // Basic clear implementation requires transaction. 
             // For "Factory Reset", deleting the database is cleaner.
             const req = indexedDB.deleteDatabase('PRACTIZONE_DB_LIVE');
             req.onsuccess = () => {
                 alert("System Reset Complete. Reloading...");
                 window.location.reload();
             };
          } catch(e) {
              alert("Reset failed. Please clear browser data manually.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-2 text-white">
              {adminLogo ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 flex items-center justify-center">
                      <img src={adminLogo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
              ) : (
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold">DS</div>
              )}
              <span className="font-display font-bold text-lg">AdminPortal</span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarLink id="dashboard" icon={LayoutDashboard} label="Overview" />
            <SidebarLink id="calendar" icon={Calendar} label="Appointments" />
            <SidebarLink id="patients" icon={Users} label="Patient Directory" />
            <SidebarLink id="suppliers" icon={Truck} label="Suppliers" />
            
            <div className="py-2">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Management</p>
                <SidebarLink id="import" icon={Database} label="Data Import (CSV)" restricted={true} />
                <SidebarLink id="branding" icon={ImageIcon} label="Branding & Images" restricted={true} />
                <SidebarLink id="ai" icon={Sparkles} label="AI Console" restricted={true} />
                <SidebarLink id="settings" icon={Settings} label="Settings" restricted={true} />
            </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="mb-4 px-4 py-2 bg-slate-800 rounded text-xs text-slate-400">
                Logged in as <span className="text-white font-bold">{user.role}</span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-bold w-full">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab === 'ai' ? 'AI Management' : activeTab}</h2>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <button className="relative p-2 text-slate-400 hover:text-slate-600">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 text-xs font-bold uppercase">Today's Appointments</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.todayAppts}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 text-xs font-bold uppercase">Pending Actions</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2 text-amber-500">{stats.pending}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 text-xs font-bold uppercase">Total Patients</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2 text-primary">{stats.totalPatients}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4">Quick Schedule</h3>
                            <AppointmentCalendar />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[600px] flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4">Recent Patients</h3>
                            <div className="flex-1 overflow-hidden">
                                <PatientsTable />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="animate-in fade-in">
                    <AppointmentCalendar />
                </div>
            )}

            {activeTab === 'patients' && (
                <div className="animate-in fade-in h-[calc(100vh-160px)]">
                    <PatientsTable />
                </div>
            )}

            {activeTab === 'suppliers' && (
                <div className="animate-in fade-in">
                    <SuppliersTable />
                </div>
            )}

            {activeTab === 'import' && (
                (user.role === 'admin' || user.role === 'developer') ? (
                    <DataImport />
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
                        <p className="text-slate-500 max-w-sm mt-2">You do not have permission to import data.</p>
                    </div>
                )
            )}

            {activeTab === 'branding' && (
                (user.role === 'admin' || user.role === 'developer') ? (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-6 h-6 text-primary" /> Site Branding & Images
                                </h3>
                                <p className="text-slate-500">Update website imagery in real-time. Images are saved to the local database.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ImageUploader label="Admin Dashboard Logo (Sidebar)" contentKey="admin_logo" currentUrl={adminLogo} />
                                <ImageUploader label="Main Hero Image (Home)" contentKey="hero_image" currentUrl={heroImage} />
                                <ImageUploader label="About Us: Feature 1" contentKey="about_team_1" currentUrl={about1} />
                                <ImageUploader label="About Us: Feature 2" contentKey="about_team_2" currentUrl={about2} />
                                <ImageUploader label="About Us: Feature 3" contentKey="about_team_3" currentUrl={about3} />
                                <ImageUploader label="About Us: Feature 4" contentKey="about_team_4" currentUrl={about4} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
                        <p className="text-slate-500 max-w-sm mt-2">You do not have permission to manage site branding.</p>
                    </div>
                )
            )}

            {activeTab === 'ai' && (
                (user.role === 'admin' || user.role === 'developer') ? (
                    <AiConsole />
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
                        <p className="text-slate-500 max-w-sm mt-2">You do not have permission to view the AI Management Console.</p>
                    </div>
                )
            )}

            {activeTab === 'settings' && (
                (user.role === 'admin' || user.role === 'developer') ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-slate-400" /> System Settings
                        </h3>
                        <p className="text-slate-500 mb-8">Global application configurations and practice details.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Settings Tiles - Visual only for MVP */}
                            <div className="p-6 border border-slate-200 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-700">General Branding</h4>
                                <p className="text-xs text-slate-400 mt-1">Configure logo, practice name, and primary colors.</p>
                            </div>
                            {/* ... other tiles ... */}
                        </div>

                        {/* System Reset Zone */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Danger Zone
                            </h4>
                            <p className="text-xs text-red-700 mb-4">
                                Resetting the system will clear all Local Storage and IndexedDB data (Patients, Appointments, Images) from this browser. Use this to test a "Fresh Install" state.
                            </p>
                            <button 
                                onClick={handleSystemReset}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Factory Reset App
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
                        <p className="text-slate-500 max-w-sm mt-2">You do not have permission to view System Settings.</p>
                    </div>
                )
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
