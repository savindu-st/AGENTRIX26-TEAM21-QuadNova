import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import { Landmark, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function CitizenRequest() {
  const { createCase, loading, error } = useCitizenCase();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    district: '',
    serviceNeed: '',
    availableDocuments: [],
    language: 'English',
  });

  const districts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
  ];

  const documentOptions = [
    { label: 'National Identity Card (NIC)', value: 'NIC' },
    { label: 'Birth Certificate', value: 'Birth Certificate' },
    { label: 'Land Deed / Ownership Certificate', value: 'Land Deed' },
    { label: 'Grama Niladhari Recommendation Letter', value: 'GN Letter' },
  ];

  const handleCheckboxChange = (value) => {
    setFormData((prev) => {
      const exists = prev.availableDocuments.includes(value);
      if (exists) {
        return {
          ...prev,
          availableDocuments: prev.availableDocuments.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          availableDocuments: [...prev.availableDocuments, value],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.district || !formData.serviceNeed.trim()) {
      return;
    }

    try {
      // Create case and trigger AI analysis
      await createCase(formData);
      
      // The context will fetch the updated status (e.g. clarification, upload, or plan).
      // We navigate based on the resulting status in localStorage or next page
      // To ensure React State transitions are handled, we evaluate the status immediately
      // but we can also use setTimeouts or check local state.
      // A clean way is to let App.jsx handle route guard OR let this submit method route
      // to /follow-up directly because we mock clarification as the first step!
      setTimeout(() => {
        const nextStatus = localStorage.getItem('praja_case_status') || 'clarification';
        if (nextStatus === 'clarification') {
          navigate('/follow-up');
        } else if (nextStatus === 'upload') {
          navigate('/upload');
        } else if (nextStatus === 'plan') {
          navigate('/plan');
        }
      }, 800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-700 font-bold text-sm">
            <Landmark className="h-4.5 w-4.5" />
            <span>STEP 1 OF 5</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Citizen Visit-Readiness Intake
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Fill in your details and describe what government permit or service you need. Our AI will analyze your requirements.
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
        <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Pasindu Bandara"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* District Jurisdiction */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              District Jurisdiction
            </label>
            <select
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
            >
              <option value="" disabled>Select your Sri Lankan District...</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 font-medium">
              We need this to locate your target Divisional Secretariat.
            </p>
          </div>

          {/* Service Need Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              Service Need / Problem Description
            </label>
            <textarea
              required
              rows={4}
              value={formData.serviceNeed}
              onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
              placeholder="Describe what you want to do (e.g. 'I want to get a permit to cut down a mature Jak tree in my garden as the roots are damaging my home structure')."
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Available Documents */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-800">
              Documents You Currently Have
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documentOptions.map((opt) => {
                const isChecked = formData.availableDocuments.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleCheckboxChange(opt.value)}
                    className={`flex items-start gap-3 p-3.5 border rounded-xl text-left transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/45 ring-1 ring-emerald-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-800 block leading-tight">
                        {opt.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-bold text-gray-800">
              Preferred Language for Strategy Output
            </label>
            <div className="flex gap-6">
              {['English', 'Sinhala', 'Tamil'].map((lang) => (
                <label key={lang} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang}
                    checked={formData.language === lang}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5"
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Analyzing Request...
                </>
              ) : (
                <>
                  Analyze Readiness
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
