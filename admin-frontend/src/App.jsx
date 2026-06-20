import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './pages/Dashboard';
import CitizenCases from './pages/CitizenCases';


function App() {
  return (
    <BrowserRouter>
      {/* App Layout Container */}
      <div className="flex h-screen w-full bg-[#0B1120] overflow-hidden selection:bg-indigo-500/30">

        {/* Sidebar fixed on the left */}
        <AdminSidebar />

        {/* Main Content scrollable area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* We will add other routes here later */}
            <Route path="/cases" element={<CitizenCases />} />
            <Route path="*" element={<div className="p-8 text-white">Page coming soon...</div>} />
          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;

