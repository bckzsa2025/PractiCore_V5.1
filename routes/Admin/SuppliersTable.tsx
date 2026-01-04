
import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, Truck } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { Supplier } from '../../types';

const SuppliersTable: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
      apiClient.suppliers.list().then(setSuppliers);
  }, []);

  const filtered = suppliers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-500" /> Supplier Database
                </h3>
                <p className="text-sm text-slate-500">Managed External Vendors</p>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search suppliers..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary" 
                />
            </div>
        </div>
        
        {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No suppliers found. Use the "Import Data" tab to upload a CSV.</p>
            </div>
        ) : (
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                        <th className="p-4">Company Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Contact Person</th>
                        <th className="p-4">Contact Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-800">{s.name}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{s.category}</span>
                            </td>
                            <td className="p-4 text-slate-600">{s.contactPerson}</td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1 text-xs">
                                    <span className="flex items-center gap-2 text-slate-600"><Mail className="w-3 h-3" /> {s.email}</span>
                                    <span className="flex items-center gap-2 text-slate-600"><Phone className="w-3 h-3" /> {s.phone}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
  );
};

export default SuppliersTable;
