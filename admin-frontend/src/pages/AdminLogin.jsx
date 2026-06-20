import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Eye, EyeOff, AlertCircle, MapPin, ChevronDown } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', city: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [districts, setDistricts] = useState([]);

  // Load districts from backend for dropdown
  useEffect(() => {
    axios.get('/api/v1/auth/districts')
      .then(res => setDistricts(res.data))
      .catch(() => {
        // Fallback list if backend is unreachable
        setDistricts([
          { name: 'Colombo' }, { name: 'Gampaha' }, { name: 'Kalutara' },
          { name: 'Kandy' }, { name: 'Matale' }, { name: 'Nuwara Eliya' },
          { name: 'Galle' }, { name: 'Matara' }, { name: 'Hambantota' },
          { name: 'Jaffna' }, { name: 'Kilinochchi' }, { name: 'Mannar' },
          { name: 'Mullaitivu' }, { name: 'Vavuniya' }, { name: 'Trincomalee' },
          { name: 'Batticaloa' }, { name: 'Ampara' }, { name: 'Kurunegala' },
          { name: 'Puttalam' }, { name: 'Anuradhapura' }, { name: 'Polonnaruwa' },
          { name: 'Badulla' }, { name: 'Monaragala' }, { name: 'Ratnapura' },
          { name: 'Kegalle' },
        ]);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        username: form.username,
        password: form.password,
        ...(form.city ? { city: form.city } : {}),
      };
      const res = await axios.post('/api/v1/auth/login', payload);
      login(res.data.user);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[20%] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-indigo-200/80 text-sm mt-1">PrajaNavigator Administration</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8 space-y-5">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-rose-400 text-sm leading-snug">{error}</p>
              </div>
            )}

            {/* District / City */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                District <span className="text-slate-600 font-normal normal-case">(optional for super admin)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  id="admin-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">— Super Admin (all districts) —</option>
                  {districts.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-slate-200 text-sm placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-btn"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Credentials hint */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 space-y-1">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Quick reference</p>
              <p className="text-slate-400 text-xs">
                <span className="text-slate-300 font-medium">Super Admin:</span> admin / admin123
              </p>
              <p className="text-slate-400 text-xs">
                <span className="text-slate-300 font-medium">District Admin:</span> {'{district}_admin'} / {'{district}2024'}
              </p>
              <p className="text-slate-500 text-xs mt-1 italic">
                e.g. colombo_admin / colombo2024
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6">
          © 2026 PrajaNavigator · Agentrix Hackathon
        </p>
      </div>
    </div>
  );
}
