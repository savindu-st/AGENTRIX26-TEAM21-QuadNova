import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Activity, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 border border-white/10 backdrop-blur-sm">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight">
            PrajaNavigator Admin Portal
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage citizen cases, monitor crowd levels, and maintain service office availability across Sri Lanka from a single unified dashboard.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-10">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <Activity className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Live Case Tracking</h3>
            <p className="text-slate-500 text-sm">Monitor and resolve citizen requests in real-time.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">District Segregation</h3>
            <p className="text-slate-500 text-sm">Admins focus only on the cases within their assigned area.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Secure Access</h3>
            <p className="text-slate-500 text-sm">Role-based authentication protects sensitive citizen data.</p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            Go to Login
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} PrajaNavigator · Agentrix Hackathon
      </div>

    </div>
  );
};

export default Landing;
