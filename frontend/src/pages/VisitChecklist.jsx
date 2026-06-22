import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import ChecklistCard from '../components/ChecklistCard';
import { Printer, ArrowLeft, Landmark, QrCode, AlertTriangle, FileCheck } from 'lucide-react';

export default function VisitChecklist() {
  const { visitPlan, citizenData, caseId } = useCitizenCase();
  const navigate = useNavigate();

  // Redirect if no case active
  useEffect(() => {
    if (!caseId) {
      navigate('/request');
    }
  }, [caseId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/plan');
  };

  // Safe defaults if loading
  const plan = visitPlan || {
    score: 85,
    riskLevel: 'Ready',
    officeName: 'Colombo Divisional Secretariat Office',
    roomCounter: 'Room 14, Environment & Land Branch (Counter 4)',
    officerName: 'Mr. K. A. Perera (Assistant Divisional Secretary)',
    checklist: {
      verified: [
        'National Identity Card (NIC) - OCR Verified',
        'Original Land Deed - Checked',
        'Grama Niladhari Letter - Checked'
      ],
      missing: [
        'LKR 750.00 cash for processing fee'
      ],
      talkingPoints: [
        'I wish to apply for a tree felling permit under the Felling of Trees Control Act for a Jak tree on my private property.',
        'I have brought the original Land Deed and the Grama Niladhari validation certificate.'
      ]
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back Button (Hidden in Print) */}
      <div className="flex items-center justify-between no-print border-b border-gray-150 pb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Strategy
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Printer className="h-4.5 w-4.5" />
          Print Visit Pack
        </button>
      </div>

      {/* Main Dossier Container */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Dossier Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-150 pb-6 print:border-black print:pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider print:text-black">
              <Landmark className="h-4.5 w-4.5" />
              Democratic Socialist Republic of Sri Lanka
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight print:text-black">
              PrajaNavigator Visit Dossier
            </h1>
            <p className="text-xs text-gray-400 font-bold print:text-black">
              Generated for: {citizenData?.fullName || 'Citizen User'} &bull; District: {citizenData?.district || 'Colombo'}
            </p>
          </div>

          {/* QR Token Code */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-150 p-3 rounded-xl print:border-black print:bg-transparent shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
                Verification Token
              </span>
              <span className="text-sm font-extrabold text-gray-800 uppercase block font-mono print:text-black">
                {caseId || 'CASE-TOKEN'}
              </span>
            </div>
            <QrCode className="h-10 w-10 text-gray-700 print:text-black" />
          </div>
        </div>

        {/* Target Destination Block */}
        <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-5 space-y-2 print:border-black print:bg-transparent print:text-black">
          <h2 className="text-sm font-bold uppercase text-emerald-850 tracking-wider flex items-center gap-1.5 print:text-black">
            <Landmark className="h-4.5 w-4.5" />
            Destination Directory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Government Branch</span>
              <span className="text-gray-800 font-semibold print:text-black">{plan.officeName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Room & Counter</span>
              <span className="text-gray-800 font-semibold print:text-black">{plan.roomCounter}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Responsible Official</span>
              <span className="text-gray-800 font-semibold print:text-black">{plan.officerName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Public Hours</span>
              <span className="text-gray-800 font-semibold print:text-black">{plan.availableHours}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Checklist Cards */}
        <div className="space-y-6">
          {/* 1. Verified Documents */}
          <ChecklistCard
            title="Verified & Ready Documents (Bring Originals)"
            items={plan.checklist.verified}
            type="verified"
          />

          {/* 2. Critical Missing Documents */}
          <ChecklistCard
            title="Critical Action Items & Missing Papers"
            items={plan.checklist.missing}
            type="missing"
          />

          {/* 3. Dialogue Prompts */}
          <ChecklistCard
            title="Counter Dialogue Guide (What to say to the officer)"
            items={plan.checklist.talkingPoints}
            type="talkingPoints"
          />
        </div>

        {/* Legal disclaimer on print */}
        <div className="border-t border-gray-150 pt-6 text-[10px] text-gray-400 font-medium leading-relaxed text-center print:border-black print:text-black">
          This dossier was generated by PrajaNavigator AI based on citizen answers and OCR file analyses on {new Date().toLocaleDateString()}. It serves as a preparation guide and does not guarantee permit issuance. Permitting decisions remain solely at the discretion of the Divisional Secretary.
        </div>
      </div>
    </div>
  );
}
