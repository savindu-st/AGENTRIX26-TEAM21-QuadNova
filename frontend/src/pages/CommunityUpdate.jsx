import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import { MessageSquare, Landmark, HelpCircle, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function CommunityUpdate() {
  const { submitCrowdReport, loading, error } = useCitizenCase();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    officeVisited: '',
    roomCounter: '',
    frictionTypes: {
      undocumentedDocs: false,
      officerUnavailable: false,
      counterChanged: false,
    },
    comments: '',
  });

  const handleCheckboxChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      frictionTypes: {
        ...prev.frictionTypes,
        [key]: !prev.frictionTypes[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.officeVisited.trim() || !formData.comments.trim()) return;

    // Convert checkboxes into array format for submission
    const frictionArray = [];
    if (formData.frictionTypes.undocumentedDocs) frictionArray.push('Additional undocumented papers requested');
    if (formData.frictionTypes.officerUnavailable) frictionArray.push('Officer unavailable');
    if (formData.frictionTypes.counterChanged) frictionArray.push('Counter changed');

    const payload = {
      office: formData.officeVisited,
      counter: formData.roomCounter,
      friction_tags: frictionArray,
      comments: formData.comments,
    };

    try {
      const ok = await submitCrowdReport(payload);
      if (ok) {
        setSuccess(true);
        // Clear form
        setFormData({
          officeVisited: '',
          roomCounter: '',
          frictionTypes: {
            undocumentedDocs: false,
            officerUnavailable: false,
            counterChanged: false,
          },
          comments: '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const officesList = [
    'Colombo Divisional Secretariat',
    'Gampaha Divisional Secretariat',
    'Kandy Divisional Secretariat',
    'Galle Divisional Secretariat',
    'Jaffna Divisional Secretariat',
    'Other Office'
  ];

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full max-w-max mx-auto shadow-inner">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Report Submitted!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold">
            Thank you for reporting this change. Your feedback will update the VisitGuard scores and checklists for future citizens.
          </p>
        </div>
        <button
          onClick={handleGoHome}
          className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-700 font-bold text-sm">
            <MessageSquare className="h-4.5 w-4.5" />
            <span>COMMUNITY FEEDBACK LOOP</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Report Office Procedural Changes
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Did you face undocumented document requirements, or find that a counter changed? Share crowdsourced updates to help keep other citizens ready and reduce waiting queues.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Reporting Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Office Visited */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              Office Visited
            </label>
            <select
              required
              value={formData.officeVisited}
              onChange={(e) => setFormData({ ...formData, officeVisited: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
            >
              <option value="" disabled>Select the government branch...</option>
              {officesList.map((off) => (
                <option key={off} value={off}>
                  {off}
                </option>
              ))}
            </select>
          </div>

          {/* Counter/Room Number */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              Counter / Room Number
            </label>
            <input
              type="text"
              value={formData.roomCounter}
              onChange={(e) => setFormData({ ...formData, roomCounter: e.target.value })}
              placeholder="e.g. Room 12, Counter 3 or Reception Desk"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Friction Checkboxes */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-800">
              Structural Friction Encountered (Check all that apply)
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-gray-150 rounded-xl cursor-pointer hover:bg-gray-50/40 select-none transition-colors">
                <input
                  type="checkbox"
                  checked={formData.frictionTypes.undocumentedDocs}
                  onChange={() => handleCheckboxChange('undocumentedDocs')}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                />
                <div className="text-sm font-semibold text-gray-800">
                  Additional undocumented papers requested
                  <span className="block text-xs text-gray-400 font-medium mt-0.5">They asked for certificates not officially listed on gazettes.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-150 rounded-xl cursor-pointer hover:bg-gray-50/40 select-none transition-colors">
                <input
                  type="checkbox"
                  checked={formData.frictionTypes.officerUnavailable}
                  onChange={() => handleCheckboxChange('officerUnavailable')}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                />
                <div className="text-sm font-semibold text-gray-800">
                  Officer unavailable
                  <span className="block text-xs text-gray-400 font-medium mt-0.5">The officer scheduled was absent or out in the field.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-150 rounded-xl cursor-pointer hover:bg-gray-50/40 select-none transition-colors">
                <input
                  type="checkbox"
                  checked={formData.frictionTypes.counterChanged}
                  onChange={() => handleCheckboxChange('counterChanged')}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                />
                <div className="text-sm font-semibold text-gray-800">
                  Counter changed
                  <span className="block text-xs text-gray-400 font-medium mt-0.5">The room or desk number has been relocated.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Comments Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              Additional Details / Comments
            </label>
            <textarea
              required
              rows={4}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Detail exactly what happened so the AI model can verify. (e.g. 'Counter 4 has changed to Counter 6 inside Room 14. They also asked to see the certified copy of land assessment, which was not on the NIC checklist')."
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  Submit Report
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
