import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Files, AlertOctagon, Clock, ShieldCheck, Sparkles,
  MapPin, User, BadgeCheck, TrendingUp, PieChart as PieChartIcon, BarChart2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="relative group bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden hover:-translate-y-1 hover:border-slate-600 transition-all duration-300">
    <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${color}`} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl border border-slate-800 bg-slate-950/60 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${color}`} />
  </div>
);

const Dashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const district = admin?.city || null;
  const isDistrictAdmin = !!district;

  useEffect(() => {
    const params = district ? `?district=${encodeURIComponent(district)}` : '';
    Promise.all([
      axios.get(`/api/v1/admin/stats${params}`),
      axios.get(`/api/v1/crowd-reports${params}`),
    ]).then(([s, r]) => {
      setStats(s.data);
      setReports(r.data.slice(0, 5));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [district]);

  const now = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Colors for charts
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full space-y-8">

      {/* ── Admin Profile Card ── */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <span className="text-white font-bold text-2xl uppercase">{admin?.username?.[0] || 'A'}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{admin?.username}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3 h-3" /> {admin?.role?.toUpperCase()}
              </span>
              {district && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {district} District
                </span>
              )}
              {!district && (
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">All Districts</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs">{now}</p>
          <p className="text-slate-300 text-sm mt-1 font-medium">
            {isDistrictAdmin ? `Managing ${district} District` : 'System-wide Overview'}
          </p>
        </div>
      </div>

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isDistrictAdmin ? `${district} District Dashboard` : 'System Dashboard'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isDistrictAdmin
            ? `Showing cases and reports for ${district} district only.`
            : 'Showing data across all districts.'}
        </p>
      </div>

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <StatCard title="Total Cases"            value={stats?.total_cases ?? 0}          icon={Files}       color="text-indigo-400 bg-indigo-500" />
          <StatCard title="High Risk Cases"        value={stats?.high_risk_cases ?? 0}      icon={AlertOctagon} color="text-rose-400 bg-rose-500" />
          <StatCard title="Pending Cases"          value={stats?.pending_cases ?? 0}        icon={Clock}       color="text-amber-400 bg-amber-500" />
          <StatCard title="Verified Reports"       value={stats?.verified_reports ?? 0}     icon={ShieldCheck} color="text-emerald-400 bg-emerald-500" />
          <StatCard title="Top Requested Service"  value={stats?.most_requested_service ?? '—'} icon={Sparkles} color="text-purple-400 bg-purple-500" sub="Most submitted service type" />
        </div>
      )}

      {/* ── Charts Grid ── */}
      {!loading && stats?.chart_data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Risk Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chart_data.risk_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.chart_data.risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'High Risk' ? '#f43f5e' : entry.name === 'Low Risk' ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Case Status Breakdown</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart_data.status_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stats.chart_data.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Area Crowd Reports ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {isDistrictAdmin ? `${district} — Recent Crowd Reports` : 'Recent Crowd Reports (All)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest 5 crowd reports from your area</p>
          </div>
          <TrendingUp className="w-4 h-4 text-slate-600" />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-600 text-sm">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-sm">
            No crowd reports found{isDistrictAdmin ? ` for ${district} district` : ''}.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {reports.map((r) => (
              <div key={r.id} className="flex items-start justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm text-slate-200 font-medium truncate">{r.report_text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Report #{r.id} · {r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  r.verification_status === 'Verified'  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  r.verification_status === 'Rejected'  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {r.verification_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
