import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceForm from '../components/ServiceForm';
import { Plus, Briefcase, FileText, Clock, Settings2 } from 'lucide-react';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const mockServices = [
    { id: 1, name: 'Passport Renewal', category: 'Identity & Civil', fee: '5,000 LKR', processingTime: '14 Working Days', documentsCount: 3 },
    { id: 2, name: 'Driving License Issue', category: 'Transport & Vehicles', fee: '2,500 LKR', processingTime: '7 Working Days', documentsCount: 4 },
    { id: 3, name: 'Land Registration', category: 'Property & Land', fee: '10,000 LKR', processingTime: '30 Working Days', documentsCount: 6 },
  ];

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/services');
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices(mockServices); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Service Manager</h1>
          <p className="text-slate-400">Configure public services, fees, and requirements.</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" /> Add New Service
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-slate-500">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{svc.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{svc.category}</p>

              <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <div className="flex items-center text-slate-300 text-sm">
                  <span className="w-24 text-slate-500">Fee:</span>
                  <span className="font-medium text-emerald-400">{svc.fee}</span>
                </div>
                <div className="flex items-center text-slate-300 text-sm">
                  <span className="w-24 text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Time:</span>
                  <span>{svc.processingTime}</span>
                </div>
                <div className="flex items-center text-slate-300 text-sm">
                  <span className="w-24 text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3" /> Docs:</span>
                  <span>{svc.documentsCount} Required</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Modal if Open */}
      {isFormOpen && (
        <ServiceForm
          onClose={() => setIsFormOpen(false)}
          onSave={() => {
            setIsFormOpen(false);
            fetchServices(); // Refresh list after saving
          }}
        />
      )}
    </div>
  );
};

export default ServiceManager;
