import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import { Landmark, ArrowRight, Loader2, AlertCircle, MapPin } from 'lucide-react';

export default function CitizenRequest() {
  const { createCase, loading, error } = useCitizenCase();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    district: '',
    serviceNeed: location.state?.serviceNeed || '',
    language: 'English',
  });

  const districts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.district || !formData.serviceNeed.trim()) {
      return;
    }

    try {
      // Create case and analyze context
      await createCase({
        ...formData,
        availableDocuments: [] // initialized empty, verified later
      });
      
      // Navigate directly to the A-to-Z Guidelines Page
      setTimeout(() => {
        navigate('/plan');
      }, 800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-teal-700 font-bold text-sm bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            <MapPin className="h-4 w-4" />
            <span>Step 2 of 4: Details Gathering</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Tell us where you are located
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto font-semibold">
            We need basic details like your current district to map local Grama Niladhari guidelines and Divisional Secretariat boundaries accurately.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
          


          {/* District Select */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              District Jurisdiction
            </label>
            <select
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 focus:border-teal-600 rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer transition-colors"
            >
              <option value="" disabled>Select your Sri Lankan District...</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Service Need Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Describe your need or problem (pre-filled)
            </label>
            <textarea
              required
              rows={4}
              value={formData.serviceNeed}
              onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
              placeholder="Describe what you want to do..."
              className="w-full px-4 py-3 border border-slate-200 focus:border-teal-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-colors"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-bold text-slate-700">
              Preferred Language for Strategy Output
            </label>
            <div className="flex gap-6">
              {['English', 'Sinhala'].map((lang) => (
                <label key={lang} className="flex items-center gap-2.5 text-sm font-bold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang}
                    checked={formData.language === lang}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="text-teal-600 focus:ring-teal-600 h-4.5 w-4.5"
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  Generate A-to-Z Guide
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
