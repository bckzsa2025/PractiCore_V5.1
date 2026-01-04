
import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, FileText, User as UserIcon, Loader2 } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { User } from '../../types';

const PatientsTable: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch all users and filter for patients
            const allUsers = await apiClient.db.getAll<User>('users');
            setPatients(allUsers.filter(u => u.role === 'patient'));
        } catch (e) {
            console.error("Failed to load patients", e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const filtered = patients.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
            <div>
                <h3 className="font-bold text-lg text-slate-800">Patient Directory</h3>
                <p className="text-sm text-slate-500">Total Patients: {patients.length}</p>
            </div>
            <div className="flex gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search patients..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary" 
                    />
                </div>
                <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                    + Add Patient
                </button>
            </div>
        </div>
        
        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                        <th className="p-4">Patient Name</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Medical Info</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading Directory...
                                </div>
                            </td>
                        </tr>
                    ) : filtered.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                                No patients found matching your search.
                            </td>
                        </tr>
                    ) : (
                        filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary font-bold">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{p.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{p.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">
                                    <p>{p.email}</p>
                                    <p className="text-xs text-slate-400">{p.phone || 'No phone'}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {p.medicalSummary?.conditions.slice(0, 2).map((c, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-100">{c}</span>
                                        ))}
                                        {(p.medicalSummary?.conditions.length || 0) > 2 && (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded">+{p.medicalSummary!.conditions.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700`}>
                                        Active
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-primary rounded hover:bg-blue-50" title="View Profile">
                                            <UserIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-primary rounded hover:bg-blue-50" title="Medical Records">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500 shrink-0">
            Showing {filtered.length} of {patients.length} records
        </div>
    </div>
  );
};

export default PatientsTable;
