import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RiskBadge from '../components/RiskBadge';
import { Search, Eye } from 'lucide-react';

const CitizenCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data fallback in case backend is down
  const mockCases = [
    { id: 'CAS-8921', name: 'John Doe', district: 'Colombo', service: 'Passport', score: 92, risk: 'Low', status: 'Verified' },
    { id: 'CAS-8922', name: 'Jane Smith', district: 'Kandy', service: 'ID Renewal', score: 45, risk: 'High', status: 'Pending Review' },
    { id: 'CAS-8923', name: 'Kamal Perera', district: 'Galle', service: 'License', score: 78, risk: 'Medium', status: 'In Progress' },
  ];

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Attempt to fetch from your backend
        const response = await axios.get('/api/v1/cases');
        setCases(response.data);
      } catch (error) {
        console.error("Failed to fetch cases, using mock data:", error);
        setCases(mockCases); // Use mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Citizen Cases</h1>
          <p className="text-slate-400">Review and manage all incoming citizen requests.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search cases..."
            className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-64"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-sm font-medium uppercase tracking-wider">
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Citizen Name</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4">Detected Service</th>
                <th className="px-6 py-4">VisitGuard Score</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">Loading cases...</td>
                </tr>
              ) : (
                cases.map((citizenCase) => (
                  <tr key={citizenCase.id} className="hover:bg-slate-800/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 text-indigo-400 font-medium">{citizenCase.id}</td>
                    <td className="px-6 py-4 text-slate-200">{citizenCase.name}</td>
                    <td className="px-6 py-4 text-slate-400">{citizenCase.district}</td>
                    <td className="px-6 py-4 text-slate-300">{citizenCase.service}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-slate-800 rounded-full h-2 mr-3 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${citizenCase.score > 80 ? 'bg-emerald-500' : citizenCase.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${citizenCase.score}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-sm">{citizenCase.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RiskBadge level={citizenCase.risk} /></td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{citizenCase.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CitizenCases;
