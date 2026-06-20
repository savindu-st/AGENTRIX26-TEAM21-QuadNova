import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OfficerForm from '../components/OfficerForm';
import { Plus, UserCircle, MapPin, Clock, Edit2 } from 'lucide-react';

const OfficerAvailability = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const mockOfficers = [
    { id: 1, office: 'Immigration Head Office', role: 'Counter 4 - Passport Issuance', room: '2nd Floor, Wing B', days: 'Monday - Friday', time: '09:00 AM - 04:00 PM', status: 'Active' },
    { id: 2, office: 'Immigration Head Office', role: 'Counter 2 - Biometrics', room: 'Ground Floor', days: 'Monday - Friday', time: '09:00 AM - 04:00 PM', status: 'Unavailable' },
    { id: 3, office: 'RMV Regional Office', role: 'License Renewal Desk', room: 'Counter 12', days: 'Monday - Saturday', time: '08:30 AM - 03:30 PM', status: 'Active' },
  ];

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/officers');
      setOfficers(response.data);
    } catch (error) {
      console.error("Failed to fetch officers:", error);
      setOfficers(mockOfficers); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Officer Availability</h1>
          <p className="text-slate-400">Manage counter assignments and availability schedules.</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" /> Assign Officer
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading schedules...</div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {officers.map((officer) => (
              <div key={officer.id} className="p-6 hover:bg-slate-800/30 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group">

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 ${officer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      {officer.role}
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${officer.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {officer.status}
                      </span>
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
                      <div className="flex items-center text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-500" />
                        {officer.office} <span className="mx-2 text-slate-600">|</span> {officer.room}
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                        <Clock className="w-4 h-4 mr-1.5 text-slate-500" />
                        {officer.days}, {officer.time}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <OfficerForm
          onClose={() => setIsFormOpen(false)}
          onSave={() => {
            setIsFormOpen(false);
            fetchOfficers();
          }}
        />
      )}
    </div>
  );
};

export default OfficerAvailability;
