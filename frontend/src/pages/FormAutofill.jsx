import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import { FileDown, CheckCircle2, ArrowLeft, Layers, Bookmark } from 'lucide-react';

export default function FormAutofill() {
  const { citizenData, caseId } = useCitizenCase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!caseId) {
      navigate('/request');
    }
  }, [caseId, navigate]);

  const handleBack = () => {
    navigate('/plan');
  };

  const handleDownload = () => {
    alert('Downloading pre-filled PDF Form (Form 102-B)...');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Strategy
        </button>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <FileDown className="h-4.5 w-4.5" />
          Download Filled PDF
        </button>
      </div>

      <div className="text-center md:text-left space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          AI Government Form Autofill
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          PrajaNavigator AI has automatically filled out the official felling of trees application form using your intake answers. Download, print, sign, and bring it to Counter 4.
        </p>
      </div>

      {/* Form Mockup Wrapper */}
      <div className="bg-amber-50/20 border border-amber-200/60 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        
        {/* Validation stamp */}
        <div className="absolute right-6 top-6 transform rotate-6 bg-emerald-100 border-2 border-emerald-500/50 rounded p-2 text-center text-emerald-800 text-[10px] font-black uppercase tracking-wider select-none">
          <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-600 mb-0.5" />
          Validated &amp; Signed
        </div>

        {/* Paper Form Representation */}
        <div className="bg-white border border-gray-250 p-8 shadow-md rounded max-w-2xl mx-auto space-y-8 font-mono text-xs text-gray-800 leading-relaxed relative">
          
          {/* Header */}
          <div className="text-center space-y-1 border-b border-gray-200 pb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase">
              Schedule II - Form A
            </h2>
            <h3 className="font-bold text-gray-700 uppercase">
              Felling of Trees (Control) Act, No. 9 of 1951
            </h3>
            <p className="text-[10px] text-gray-500">
              Application for Permission to Cut down or Remove a Jak, Breadfruit, or Palmyra Tree
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex border-b border-gray-150 pb-2">
              <span className="w-48 font-bold text-gray-500">1. Name of Applicant:</span>
              <span className="font-bold text-gray-900">{citizenData?.fullName || 'Pasindu Bandara'}</span>
            </div>

            <div className="flex border-b border-gray-150 pb-2">
              <span className="w-48 font-bold text-gray-500">2. District / Location:</span>
              <span className="font-bold text-gray-900">{citizenData?.district || 'Colombo District'}</span>
            </div>

            <div className="flex border-b border-gray-150 pb-2">
              <span className="w-48 font-bold text-gray-500">3. Preferred Communication:</span>
              <span className="font-bold text-gray-900">Sri Lankan Language Mode &bull; {citizenData?.language || 'English'}</span>
            </div>

            <div className="flex border-b border-gray-150 pb-2">
              <span className="w-48 font-bold text-gray-500">4. Species of Tree:</span>
              <span className="font-bold text-gray-900">Jak Tree (Artocarpus heterophyllus)</span>
            </div>

            <div className="space-y-2 border-b border-gray-150 pb-2">
              <span className="font-bold text-gray-500 block">5. Description of land and reasons for the request:</span>
              <p className="font-bold text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-150 font-sans italic">
                "{citizenData?.serviceNeed || 'Requesting tree felling permit due to structural hazard'}"
              </p>
            </div>

            <div className="flex border-b border-gray-150 pb-2">
              <span className="w-48 font-bold text-gray-500">6. Verification ID Token:</span>
              <span className="font-bold text-gray-800 font-mono select-all bg-gray-100 px-2 py-0.5 rounded">{caseId || 'CASE-MOCK'}</span>
            </div>
          </div>

          {/* Section 2 (Autofill checkmark details) */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 font-sans text-emerald-950 space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-emerald-700" />
              Autofill Verification
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
              The details above match the OCR analysis of your uploaded identity cards. No further handwritten entries are required for this section.
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-12 text-center text-[10px] font-sans font-bold">
            <div className="w-40 border-t border-gray-300 pt-2 text-gray-500">
              Signature of Applicant
            </div>
            <div className="w-40 border-t border-gray-300 pt-2 text-gray-500">
              Grama Niladhari Endorsement
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
