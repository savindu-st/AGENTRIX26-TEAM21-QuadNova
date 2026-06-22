import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RiskBadge from '../components/RiskBadge';
import {
  ArrowLeft,
  MessageSquare,
  Bot,
  FileWarning,
  CheckCircle2,
  User,
  Save
} from 'lucide-react';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mock data fallback
  const mockData = {
    id: id || 'CAS-8921',
    citizenName: 'John Doe',
    riskLevel: 'Low',
    problem: 'I need to renew my passport but I lost my old one. I have a police report.',
    detectedService: 'Passport Renewal (Lost)',
    missingDocuments: ['Birth Certificate (Original)', 'Grama Niladhari Certificate'],
    visitGuardScore: 65,
    recommendedSteps: [
      'Verify police report authenticity',
      'Check identity against national registry',
      'Schedule biometric appointment'
    ],
    officerDetails: 'Counter 4 - Kamal Perera',
    aiResponse: 'Citizen appears genuine. The police report matches standard formats. Advise citizen to bring original birth certificate before approving the visit.',
    status: 'Pending'
  };

  const statusOptions = [
    'Pending',
    'Need More Information',
    'Ready to Visit',
    'Not Ready',
    'Resolved'
  ];

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/cases/${id}`);
        setCaseData(response.data);
        setStatus(response.data.status);
      } catch (error) {
        console.error("Failed to fetch case, using mock data:", error);
        setCaseData(mockData);
        setStatus(mockData.status);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`/api/v1/cases/${id}/status`, { status });
      alert('Status updated successfully!');
    } catch (error) {
      console.error("Failed to update status:", error);
      alert('Simulated status update successful! (Backend not connected)');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !caseData) {
    return <div className="min-h-screen bg-[#0B1120] p-8 text-slate-400">Loading case details...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 mr-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Case {caseData.id}</h1>
            <RiskBadge level={caseData.riskLevel} />
          </div>
          <p className="text-slate-400">Citizen: <span className="text-slate-200 font-medium">{caseData.citizenName}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Citizen Problem */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-white">Citizen's Request</h2>
            </div>
            <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              "{caseData.problem}"
            </p>
          </div>

          {/* AI Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="flex items-center gap-2 mb-6 text-purple-400">
              <Bot className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-white">AI Analysis & Breakdown</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <p className="text-sm text-slate-500 mb-1">Detected Service</p>
                <p className="text-slate-200 font-medium bg-slate-800/50 px-3 py-2 rounded-lg inline-block border border-slate-700/50">
                  {caseData.detectedService}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">VisitGuard Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${caseData.visitGuardScore > 80 ? 'bg-emerald-500' : caseData.visitGuardScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${caseData.visitGuardScore}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{caseData.visitGuardScore}%</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-500 mb-2">AI Response / Context</p>
                <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-purple-500 pl-4 py-1">
                  {caseData.aiResponse}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action & Details */}
        <div className="space-y-6">

          {/* Status Updater */}
          <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Case Status</h2>
            <div className="space-y-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={isSaving || status === caseData.status}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Actionable Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Action Plan</h2>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <FileWarning className="w-4 h-4" />
                <h3 className="font-medium text-sm">Missing Documents</h3>
              </div>
              <ul className="space-y-2">
                {caseData.missingDocuments.map((doc, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="font-medium text-sm">Recommended Steps</h3>
              </div>
              <ul className="space-y-2">
                {caseData.recommendedSteps.map((step, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-xs mt-0.5">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User className="w-4 h-4" />
                <h3 className="font-medium text-xs uppercase tracking-wider">Assigned To</h3>
              </div>
              <p className="text-slate-200">{caseData.officerDetails}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
