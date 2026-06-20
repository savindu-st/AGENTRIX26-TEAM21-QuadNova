import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Clock,
  AlertTriangle,
  BookOpen,
  LogOut
} from 'lucide-react';

const AdminSidebar = () => {
  const { admin, logout } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Citizen Cases', path: '/dashboard/cases', icon: Users },
    { name: 'Services', path: '/dashboard/services', icon: Briefcase },
    { name: 'Offices', path: '/dashboard/offices', icon: Building2 },
    { name: 'Officer Availability', path: '/dashboard/officers', icon: Clock },
    { name: 'Crowd Reports', path: '/dashboard/reports', icon: AlertTriangle },
    { name: 'Knowledge Base', path: '/dashboard/knowledge', icon: BookOpen },
  ];

  return (
    <aside className="h-screen w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl flex-shrink-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50 bg-slate-950/30">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3 flex-shrink-0">
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
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-sm font-medium ${isActive
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User + Logout */}
      <div className="p-4 border-t border-slate-800/50 space-y-2">
        {/* Admin info */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm leading-none uppercase">
              {admin?.username?.[0] || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-200 text-sm font-semibold truncate">{admin?.username || 'Admin'}</p>
            <p className="text-slate-500 text-xs capitalize">{admin?.role || 'admin'}</p>
          </div>
        </div>
        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 text-sm font-medium group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

  );
};

export default AdminSidebar;
