import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import UploadBox from '../components/UploadBox';
import ResultCard from '../components/ResultCard';
import { FileUp, ArrowRight, Loader2, AlertCircle, ShieldAlert, FileText, CheckCircle2, Sparkles } from 'lucide-react';

export default function DocumentUpload() {
  const { uploadFile, updateCitizenData, loading, error, caseId, citizenData } = useCitizenCase();
  const navigate = useNavigate();
  const [isManual, setIsManual] = useState(false);

  const [manualFields, setManualFields] = useState({
    fullName: citizenData?.fullName || '',
    district: citizenData?.district || '',
    serviceNeed: citizenData?.serviceNeed || '',
    language: citizenData?.language || 'English',
    nicNumber: citizenData?.nicNumber || '',
  });

  // Sync initial context data if it loads later
  useEffect(() => {
    if (citizenData) {
      setManualFields((prev) => ({
        ...prev,
        fullName: citizenData.fullName || prev.fullName,
        district: citizenData.district || prev.district,
        serviceNeed: citizenData.serviceNeed || prev.serviceNeed,
        language: citizenData.language || prev.language,
        nicNumber: citizenData.nicNumber || prev.nicNumber,
      }));
    }
  }, [citizenData]);

  // Redirect if no case active
  useEffect(() => {
    if (!caseId) {
      navigate('/request');
    }
  }, [caseId, navigate]);

  const handleFileUpload = async (file) => {
    try {
      await uploadFile(file);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualFieldChange = (field, val) => {
    const updated = { ...manualFields, [field]: val };
    setManualFields(updated);
    updateCitizenData(updated);
  };

  const handleNext = () => {
    navigate('/autofill');
  };

  // Determine what documents are recommended to upload
  const getRequiredList = () => {
    const list = ['National Identity Card (NIC) - Front & Back'];
    if (citizenData?.availableDocuments?.includes('Land Deed')) {
      list.push('Original Land Deed copy');
    }
    if (citizenData?.availableDocuments?.includes('GN Letter')) {
      list.push('Certified Grama Niladhari Recommendation Letter');
    }
    return list;
  };

  const requiredDocs = getRequiredList();

  const districts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Page Header */}
        <div className="text-center md:text-left space-y-2 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 text-teal-700 font-bold text-sm bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            <FileUp className="h-4 w-4" />
            <span>Step 4 of 5: Document & Autofill Verification</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Autofill Your Official Paperwork
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-semibold">
            To prepare your completed form, we need a few details. Scan your identity documents for automatic AI extraction, or fill out the clean fields below manually.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Submission Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-200/60 rounded-2xl p-5 gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug">Choose Form Filling Mode</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-semibold">
              Drop files to automatically scan fields using AI OCR, or type them directly using our simple web form.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#FAF8F5] p-1.5 border border-slate-200 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                !isManual ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scan ID Photo
            </button>
            <button
              type="button"
              onClick={() => setIsManual(true)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                isManual ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enter Manually
            </button>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Drag & Drop OR Manual Form */}
          <div className="lg:col-span-7 space-y-6">
            {!isManual ? (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-850 text-base leading-snug flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-teal-600" />
                  Mode A: Drag & Drop ID / Birth Certificate
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Drop a clear photograph or scan of your National Identity Card (NIC) or Birth Certificate. Our civic AI automatically extracts the name, address, and ID registration token.
                </p>
                <UploadBox onUpload={handleFileUpload} />

                {/* AI Extracted Profile Preview Card */}
                {citizenData?.extractedDetails && (
                  <div className="bg-emerald-50/40 border border-emerald-250/30 rounded-2xl p-5 mt-4 space-y-4 animate-fade-in">
                    <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                      AI OCR Extraction Results
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                      {citizenData.extractedDetails.fullName && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">Full Name</span>
                          <span className="text-slate-800 font-bold">{citizenData.extractedDetails.fullName}</span>
                        </div>
                      )}
                      {citizenData.extractedDetails.nicNumber && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">NIC Number</span>
                          <span className="text-slate-800 font-bold">{citizenData.extractedDetails.nicNumber}</span>
                        </div>
                      )}
                      {citizenData.extractedDetails.dob && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">Date of Birth</span>
                          <span className="text-slate-800 font-bold">{citizenData.extractedDetails.dob}</span>
                        </div>
                      )}
                      {citizenData.extractedDetails.gender && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">Gender</span>
                          <span className="text-slate-800 font-bold">{citizenData.extractedDetails.gender}</span>
                        </div>
                      )}
                      {citizenData.extractedDetails.address && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm sm:col-span-2">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">Residential Address</span>
                          <span className="text-slate-800 font-bold">{citizenData.extractedDetails.address}</span>
                        </div>
                      )}
                      {citizenData.extractedDetails.landDeedNo && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">Land Deed Serial</span>
                          <span className="text-slate-800 font-bold text-emerald-800">{citizenData.extractedDetails.landDeedNo}</span>
                        </div>
                      )}
                      {citizenData.extractedDetails.landOwner && (
                        <div className="bg-white/85 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                          <span className="text-slate-400 uppercase tracking-wider block text-[9px] mb-0.5">Deed Registered Owner</span>
                          <span className="text-slate-800 font-bold text-emerald-800">{citizenData.extractedDetails.landOwner}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-850 bg-emerald-100/40 p-2.5 rounded-lg border border-emerald-100 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>These details have been saved to your profile and will be automatically filled into your application forms.</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-850 text-base leading-snug flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Mode B: Direct Manual Registration Form
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Type your details below as you would on a standard form. We will automatically format and write this information onto the official paperwork layout.
                </p>
                
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      value={manualFields.fullName}
                      onChange={(e) => handleManualFieldChange('fullName', e.target.value)}
                      placeholder="e.g. Pasindu Bandara"
                      className="w-full px-4 py-2.5 border border-slate-200 focus:border-teal-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">NIC Number (National Identity Card)</label>
                    <input
                      type="text"
                      value={manualFields.nicNumber}
                      onChange={(e) => handleManualFieldChange('nicNumber', e.target.value)}
                      placeholder="e.g. 199512345678 or 951234567V"
                      className="w-full px-4 py-2.5 border border-slate-200 focus:border-teal-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">District Jurisdiction</label>
                      <select
                        value={manualFields.district}
                        onChange={(e) => handleManualFieldChange('district', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 focus:border-teal-600 rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer transition-colors"
                      >
                        <option value="">Select district...</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Communication Language</label>
                      <select
                        value={manualFields.language}
                        onChange={(e) => handleManualFieldChange('language', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 focus:border-teal-600 rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer transition-colors"
                      >
                        <option value="English">English</option>
                        <option value="Sinhala">Sinhala</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Purpose / Reasons for Request</label>
                    <textarea
                      rows={3}
                      value={manualFields.serviceNeed}
                      onChange={(e) => handleManualFieldChange('serviceNeed', e.target.value)}
                      placeholder="Describe your request reasons..."
                      className="w-full px-4 py-2.5 border border-slate-200 focus:border-teal-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Live Form Result Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldAlert className="h-4.5 w-4.5 text-teal-600" />
                Live Strategy Dossier
              </h3>
              
              <ResultCard />

              <button
                onClick={handleNext}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Generate Completed Form
              </button>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold">
            All set? Click next to review and download your completed form
          </span>
          <button
            onClick={handleNext}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Formulating Form...
              </>
            ) : (
              <>
                Next: Get Filled Form
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
