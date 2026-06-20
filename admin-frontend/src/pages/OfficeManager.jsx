import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OfficeForm from '../components/OfficeForm';
import { Plus, Building2, MapPin, Phone, Settings2 } from 'lucide-react';

const OfficeManager = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const mockOffices = [
    { id: 1, name: 'Immigration Head Office', district: 'Colombo', type: 'Head Office', address: 'Suhurupaya, Battaramulla', contactNote: '011-2833331' },
    { id: 2, name: 'RMV Regional Office', district: 'Kandy', type: 'Regional Office', address: 'Pallekele, Kandy', contactNote: '081-2224445 (Closed on Sundays)' },
    { id: 3, name: 'Galle Secretariat', district: 'Galle', type: 'Divisional Secretariat', address: 'Fort, Galle', contactNote: '091-2234567' },
  ];

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/offices');
      setOffices(response.data);
    } catch (error) {
      console.error("Failed to fetch offices:", error);
      setOffices(mockOffices); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Office Manager</h1>
          <p className="text-slate-400">Manage government office locations and contact details.</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" /> Add New Office
        </button>
      </div>

      {/* Offices Grid */}
      {loading ? (
        <div className="text-slate-500">Loading offices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((office) => (
            <div key={office.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-full">
                    {office.type}
                  </span>
                  <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">{office.name}</h3>

              <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200">{office.address}</p>
                    <p className="text-slate-500 mt-0.5">{office.district} District</p>
                  </div>
                </div>

                {office.contactNote && (
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>{office.contactNote}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Modal if Open */}
      {isFormOpen && (
        <OfficeForm
          onClose={() => setIsFormOpen(false)}
          onSave={() => {
            setIsFormOpen(false);
            fetchOffices(); // Refresh list
          }}
        />
      )}
    </div>
  );
};

export default OfficeManager;
