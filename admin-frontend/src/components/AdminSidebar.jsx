import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Clock,
  AlertTriangle,
  BookOpen,
  Star,
  LogOut
} from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Citizen Cases', path: '/cases', icon: Users },
    { name: 'Services', path: '/services', icon: Briefcase },
    { name: 'Offices', path: '/offices', icon: Building2 },
    { name: 'Officer Availability', path: '/officers', icon: Clock },
    { name: 'Crowd Reports', path: '/reports', icon: AlertTriangle },
    { name: 'Customer Reviews', path: '/reviews', icon: Star },
    { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
  ];

  return (
    <aside className="h-screen w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50 bg-slate-950/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3">
          <span className="text-white font-bold text-xl leading-none">A</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Admin Portal
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
                <item.icon
                  className={`w-5 h-5 mr-3.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                />
                <span className="relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/20">
        <button className="flex items-center w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors duration-300 group">
          <LogOut className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

