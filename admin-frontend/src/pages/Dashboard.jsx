import React from 'react';
import StatCard from '../components/StatCard';
import {
  Files,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {

  // Mock data for the dashboard stats
  const stats = [
    {
      title: "Total Cases",
      value: "2,543",
      icon: Files,
      trend: 12,
      colorClass: "text-indigo-500 bg-indigo-500"
    },
    {
      title: "High Risk Cases",
      value: "142",
      icon: AlertOctagon,
      trend: -5,
      colorClass: "text-rose-500 bg-rose-500"
    },
    {
      title: "Pending Cases",
      value: "856",
      icon: Clock,
      trend: 8,
      colorClass: "text-amber-500 bg-amber-500"
    },
    {
      title: "Verified Crowd Reports",
      value: "1,204",
      icon: ShieldCheck,
      trend: 24,
      colorClass: "text-emerald-500 bg-emerald-500"
    },
    {
      title: "Most Requested Service",
      value: "Passport Renewal",
      icon: Sparkles,
      colorClass: "text-purple-500 bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full">
      {/* Page Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back to the admin panel. Here is what's happening today.</p>
      </header>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            colorClass={stat.colorClass}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


