import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import UploadBox from '../components/UploadBox';
import { FileUp, ArrowRight, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function DocumentUpload() {
  const { uploadFile, loading, error, caseId, status, citizenData } = useCitizenCase();
  const navigate = useNavigate();

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

  const handleNext = () => {
    navigate('/plan');
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-700 font-bold text-sm">
            <FileUp className="h-4.5 w-4.5" />
            <span>STEP 3 OF 5</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Document Pre-Validation
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Upload scans or clear photographs of your paperwork. Our AI-OCR engine will check if the official signatures, stamps, and texts are legible to prevent rejection at the counter.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Upload Box */}
          <div className="lg:col-span-8 space-y-6">
            <UploadBox onUpload={handleFileUpload} />
          </div>

          {/* Sidebar Guidelines */}
          <div className="lg:col-span-4 bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
              Requirements Checklist
            </h3>
            
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">
                Upload at least one of these documents to get an accurate VisitGuard readiness score:
              </p>
              <ul className="space-y-2">
                {requiredDocs.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-3">
              <h4 className="text-xs font-bold text-emerald-950 mb-1">OCR Privacy Guarantee</h4>
              <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                Documents are analyzed locally in Sri Lanka and encrypted. Personal metadata is automatically redacted.
              </p>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="pt-6 border-t border-gray-200 flex justify-between items-center bg-gray-50 p-4 border border-gray-150 rounded-xl">
          <span className="text-xs text-gray-500 font-semibold">
            Click Next once you have uploaded your documents
          </span>
          <button
            onClick={handleNext}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                Next: Get Visit Plan
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
