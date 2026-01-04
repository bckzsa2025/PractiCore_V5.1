
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Video, Calendar, Loader2 } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { Appointment, User as UserType } from '../../types';

const AppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, string>>({}); // Map ID to Name
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

  useEffect(() => {
      const fetchData = async () => {
          try {
              // 1. Get Appointments
              const appts = await apiClient.appointments.list('');
              setAppointments(appts);

              // 2. Get Patient Names for lookup
              const users = await apiClient.db.getAll<UserType>('users');
              const pMap: Record<string, string> = {};
              users.forEach(u => pMap[u.id] = u.name);
              setPatients(pMap);
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, []);

  // Filter for selected date
  const dailyAppointments = appointments.filter(appt => {
      const d = new Date(appt.date);
      return d.getDate() === selectedDate.getDate() && 
             d.getMonth() === selectedDate.getMonth() &&
             d.getFullYear() === selectedDate.getFullYear();
  });

  // Helper to place items on grid
  const getTopOffset = (dateStr: string) => {
      const d = new Date(dateStr);
      const hour = d.getHours();
      const mins = d.getMinutes();
      
      // Start at 9:00 (index 0). Each hour slot is 96px (h-24).
      // 9:00 -> 0px
      // 10:00 -> 96px
      const startHour = 9;
      if (hour < startHour) return -100; // Hide if too early
      
      const hourDiff = hour - startHour;
      return (hourDiff * 96) + (mins / 60 * 96);
  };

  const handlePrevDay = () => {
      const next = new Date(selectedDate);
      next.setDate(selectedDate.getDate() - 1);
      setSelectedDate(next);
  };

  const handleNextDay = () => {
      const next = new Date(selectedDate);
      next.setDate(selectedDate.getDate() + 1);
      setSelectedDate(next);
  };

  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Schedule
                </h3>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button onClick={handlePrevDay} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
                    <span className="text-sm font-bold text-slate-700 px-2 w-32 text-center">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <button onClick={handleNextDay} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={handleToday} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200">Today</button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto relative bg-slate-50/50">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex min-h-[800px]">
                    {/* Time Column */}
                    <div className="w-20 flex-shrink-0 border-r border-slate-100 bg-white z-10 sticky left-0">
                        {timeSlots.map(time => (
                            <div key={time} className="h-24 border-b border-slate-100 flex items-start justify-center pt-2">
                                <span className="text-xs font-bold text-slate-400">{time}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Events Column */}
                    <div className="flex-1 relative bg-white">
                        {/* Grid Lines */}
                        {timeSlots.map(time => (
                            <div key={time} className="h-24 border-b border-slate-100"></div>
                        ))}
                        
                        {/* Current Time Indicator (if today) */}
                        {new Date().toDateString() === selectedDate.toDateString() && (
                            <div 
                                className="absolute left-0 right-0 border-t-2 border-red-400 z-0 pointer-events-none"
                                style={{ top: `${getTopOffset(new Date().toISOString())}px` }}
                            >
                                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                        )}

                        {/* Appointments */}
                        {dailyAppointments.map(appt => {
                            const top = getTopOffset(appt.date);
                            const height = 48; // Assume 30 mins approx for visual
                            
                            // Color coding
                            let styles = 'bg-blue-50 border-primary text-primary';
                            if (appt.type === 'telehealth') styles = 'bg-purple-50 border-purple-500 text-purple-700';
                            if (appt.status === 'confirmed') styles = 'bg-green-50 border-green-500 text-green-700';

                            return (
                                <div 
                                    key={appt.id}
                                    className={`absolute left-4 right-4 border-l-4 rounded-r-lg p-3 cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${styles}`}
                                    style={{ top: `${top}px`, height: `${height}px` }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {appt.type === 'telehealth' ? <Video className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            <p className="font-bold text-sm truncate">{patients[appt.patientId] || 'Unknown Patient'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-80">
                                            <Clock className="w-3 h-3" />
                                            {new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {dailyAppointments.length === 0 && (
                            <div className="absolute top-1/3 left-0 right-0 text-center text-slate-400 pointer-events-none">
                                <p>No appointments scheduled for this day.</p>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AppointmentCalendar;
