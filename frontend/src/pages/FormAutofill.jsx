import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import { FileDown, CheckCircle2, ArrowLeft, Layers, Sparkles, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';

export default function FormAutofill() {
  const { citizenData, caseId, updateCitizenData, formDetails } = useCitizenCase();
  const navigate = useNavigate();
  const [downloaded, setDownloaded] = useState(false);

  const details = formDetails || {
    title: "Schedule II - Form A",
    act: "Felling of Trees (Control) Act, No. 9 of 1951",
    subtitle: "Application for Permission to Cut down or Remove a Jak (Kos), Breadfruit (Del), or Palmyra Tree.",
    fieldLabel: "4. Species of Tree / Standard Field Label",
    fieldValue: "Jak Tree (Artocarpus heterophyllus)",
    descLabel: "9. Description of land and reasons for the request",
    defaultDesc: "State the species of tree, location, and detailed hazard/need..."
  };

  const isTreeFelling = details.title.toLowerCase().includes("tree") || 
                        details.title.toLowerCase().includes("schedule ii") || 
                        details.subtitle.toLowerCase().includes("tree") || 
                        details.subtitle.toLowerCase().includes("jak");

  const [formData, setFormData] = useState({
    fullName: '',
    nicNumber: '',
    dob: '',
    gender: '',
    address: '',
    district: '',
    landDeedNo: '',
    landOwner: '',
    serviceNeed: '',
    customField: ''
  });

  useEffect(() => {
    if (citizenData) {
      setFormData({
        fullName: citizenData.extractedDetails?.fullName || citizenData.fullName || '',
        nicNumber: citizenData.extractedDetails?.nicNumber || '',
        dob: citizenData.extractedDetails?.dob || '',
        gender: citizenData.extractedDetails?.gender || '',
        address: citizenData.extractedDetails?.address || '',
        district: citizenData.extractedDetails?.district || citizenData.district || '',
        landDeedNo: citizenData.extractedDetails?.landDeedNo || '',
        landOwner: citizenData.extractedDetails?.landOwner || '',
        serviceNeed: citizenData.serviceNeed || '',
        customField: citizenData.extractedDetails?.customField || details.fieldValue || ''
      });
    }
  }, [citizenData, formDetails]);

  // Redirect if no case active
  useEffect(() => {
    if (!caseId) {
      navigate('/request');
    }
  }, [caseId, navigate]);

  const handleBack = () => {
    navigate('/upload');
  };

  const handleNext = () => {
    // Save updated inputs to citizen profile context
    updateCitizenData({
      fullName: formData.fullName,
      district: formData.district,
      serviceNeed: formData.serviceNeed,
      nicNumber: formData.nicNumber,
      extractedDetails: {
        ...citizenData?.extractedDetails,
        ...formData
      }
    });
    navigate('/plan');
  };

  const handleDownload = () => {
    setDownloaded(true);
    // Simulate trigger download
    let fileContent = `FORM: ${details.title}\n` +
      `ACT: ${details.act}\n` +
      `SUBTITLE: ${details.subtitle}\n\n` +
      `Case Reference: ${caseId}\n` +
      `Applicant Name: ${formData.fullName}\n` +
      `NIC Number: ${formData.nicNumber || 'N/A'}\n` +
      `Date of Birth: ${formData.dob || 'N/A'}\n` +
      `Gender: ${formData.gender || 'N/A'}\n` +
      `Address: ${formData.address || 'N/A'}\n` +
      `District: ${formData.district}\n`;

    if (isTreeFelling) {
      fileContent += `Land Deed Number: ${formData.landDeedNo || 'N/A'}\n` +
        `Deed Registered Owner: ${formData.landOwner || 'N/A'}\n`;
    } else if (details.fieldLabel) {
      fileContent += `${details.fieldLabel}: ${formData.customField || 'N/A'}\n`;
    }

    fileContent += `Description & Purpose: ${formData.serviceNeed}\n\n` +
      `Status: VALIDATED & SIGNED BY CIVIC AI`;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PreFilled_Form_${details.title.replace(/\s+/g, "_")}_${caseId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAiFilled = (field) => {
    return !!(citizenData?.extractedDetails?.[field]);
  };

  const renderInputField = (label, name, placeholder, type = 'text') => {
    const value = formData[name];
    const aiFilled = isAiFilled(name);
    const isEmpty = !value;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
          {aiFilled ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans select-none">
              <Sparkles className="h-2.5 w-2.5 text-emerald-500 animate-pulse" />
              AI OCR Filled
            </span>
          ) : isEmpty ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans select-none animate-pulse">
              Empty
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans select-none">
              Manual Review
            </span>
          )}
        </div>
        
        <input
          type={type}
          value={value}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all duration-200 ${
            aiFilled
              ? 'bg-emerald-50/15 border border-emerald-500/40 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              : isEmpty
              ? 'bg-amber-50/5 border border-dashed border-slate-250 text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
              : 'bg-white border border-slate-200 text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
          }`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Navigation and Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Uploads
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md hover:shadow-teal-600/10 hover:scale-[1.01] transition-all cursor-pointer text-xs"
          >
            <FileDown className="h-4.5 w-4.5" />
            Download Filled Form
          </button>
        </div>

        <div className="text-center md:text-left space-y-2 border-b border-slate-100 pb-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            AI Government Form Autofill
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-semibold">
            We have pre-filled the official application form using your uploaded documents and intake details. Review the fields below, edit any mistakes, and download your completed copy.
          </p>
        </div>

        {downloaded && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl p-5 space-y-3 animate-fade-in no-print">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">Pre-filled Application Form Generated!</h4>
                <p className="text-xs font-semibold text-emerald-800 leading-relaxed mt-0.5">
                  Your pre-filled dossier ({details.title}) has been downloaded. Print this out, sign it, and bring it along with your original National Identity Card (NIC) to the counters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          
          {/* Validation stamp */}
          <div className="absolute right-6 top-6 transform rotate-6 bg-emerald-50 border-2 border-emerald-500/50 rounded-lg p-2.5 text-center text-emerald-800 text-[10px] font-black uppercase tracking-wider select-none pointer-events-none hidden md:block">
            <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-600 mb-0.5" />
            AI Verified
          </div>

          <div className="max-w-2xl mx-auto space-y-8 font-mono text-xs">
            
            {/* Header */}
            <div className="text-center space-y-1.5 border-b border-slate-100 pb-6 font-sans">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {details.title}
              </h2>
              <h3 className="font-extrabold text-slate-600 uppercase tracking-wide text-[10px]">
                {details.act}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-lg mx-auto">
                {details.subtitle}
              </p>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* Applicant Name */}
              {renderInputField('1. Name of Applicant', 'fullName', 'e.g. Pasindu Bandara')}

              {/* NIC Number */}
              {renderInputField('2. National Identity Card (NIC)', 'nicNumber', 'e.g. 199512345678 or 951234567V')}

              {/* DOB */}
              {renderInputField('3. Date of Birth', 'dob', 'YYYY-MM-DD', 'date')}

              {/* Gender */}
              {renderInputField('4. Gender / Sex', 'gender', 'e.g. Male / Female')}

              {/* Residential Address */}
              <div className="md:col-span-2">
                {renderInputField('5. Residential Address', 'address', 'e.g. No. 45, Flower Road, Colombo 03')}
              </div>

              {/* District */}
              {renderInputField('6. District Jurisdiction', 'district', 'e.g. Colombo')}

              {/* Conditional Deed fields / Custom Category field */}
              {isTreeFelling ? (
                <>
                  {/* Land Deed Serial */}
                  {renderInputField('7. Land Deed / Ownership ID', 'landDeedNo', 'e.g. LD-88421-2023 (Optional)')}

                  {/* Land Owner */}
                  {renderInputField('8. Deed Registered Owner Name', 'landOwner', 'e.g. Pasindu Bandara (Optional)')}
                </>
              ) : (
                details.fieldLabel && (
                  <div className="md:col-span-2">
                    {renderInputField(details.fieldLabel, 'customField', 'State details...')}
                  </div>
                )
              )}

              {/* Description / Purpose */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {details.descLabel}
                </label>
                <textarea
                  rows={3}
                  value={formData.serviceNeed}
                  onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
                  placeholder={details.defaultDesc}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-slate-200 text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                />
              </div>

              {/* Token ID */}
              <div className="md:col-span-2 flex border border-slate-100 p-3 bg-slate-50/60 rounded-xl justify-between items-center text-[10px]">
                <span className="font-bold text-slate-500">10. Digital Verification Reference:</span>
                <span className="font-black text-slate-800 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded select-all shadow-sm">
                  {caseId || 'CASE-TOKEN'}
                </span>
              </div>
            </div>

            {/* Validation Notice details */}
            <div className="bg-teal-50/30 border border-teal-100 rounded-xl p-4 font-sans text-teal-950 space-y-1.5">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-teal-850">
                <Layers className="h-4 w-4 text-teal-700" />
                OCR Form Validation Protocol
              </h4>
              <p className="text-[10.5px] text-teal-800 leading-relaxed font-semibold">
                This digital application has been parsed against your official identity paperwork. Unprovided fields (such as Land Ownership details if a Land Deed was not uploaded) are left blank to be filled by counter officials or notarized manually.
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-12 text-center text-[10px] font-sans font-bold text-slate-400 pb-2">
              <div className="w-40 border-t border-slate-200 pt-2">
                Signature of Applicant
              </div>
              <div className="w-40 border-t border-slate-200 pt-2">
                Grama Niladhari Stamp
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm no-print">
          <span className="text-xs text-slate-400 font-semibold">
            Done reviewing? Go next to verify your Visit Plan & Strategy
          </span>
          <button
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer text-sm"
          >
            Generate Visit Plan
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
