import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CitizenRequest from './pages/CitizenRequest';
import FollowUpQuestions from './pages/FollowUpQuestions';
import DocumentUpload from './pages/DocumentUpload';
import VisitPlan from './pages/VisitPlan';
import VisitChecklist from './pages/VisitChecklist';
import FormAutofill from './pages/FormAutofill';
import CommunityUpdate from './pages/CommunityUpdate';
import { CitizenCaseProvider } from './hooks/useCitizenCase';

function App() {
  return (
    <CitizenCaseProvider>
      <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-slate-800 antialiased selection:bg-teal-100">
        {/* Navigation Bar */}
        <Navbar />
        
        {/* Page Content Outlet */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/request" element={<CitizenRequest />} />
            <Route path="/follow-up" element={<FollowUpQuestions />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/plan" element={<VisitPlan />} />
            <Route path="/checklist" element={<VisitChecklist />} />
            <Route path="/autofill" element={<FormAutofill />} />
            <Route path="/community-update" element={<CommunityUpdate />} />
          </Routes>
        </main>
      </div>
    </CitizenCaseProvider>
  );
}

export default App;
