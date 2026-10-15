import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  ChevronDown, 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { StorageService } from '../../lib/storage';

interface NavbarProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onOpenSupabaseModal: () => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  onOpenSupabaseModal,
  onOpenMobileMenu,
  isMobileMenuOpen,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const users = StorageService.getAllUsers();

  const handleSwitchUser = (user: UserProfile) => {
    StorageService.setCurrentUser(user);
    onUserChange(user);
    setShowRoleMenu(false);
  };

  const handleResetData = () => {
    if (confirm('Reset demo database to original sample records?')) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl tracking-tighter">
                A
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    Alphabet<span className="text-indigo-600">AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Attendance
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                  Deterministic • Alphabetical • Audit-Protected
                </p>
              </div>
            </div>
          </div>

          {/* Right: DB Status, Role Switcher, Reset button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Supabase status pill */}
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold border transition shadow-sm bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              title="Click to view database schema and config"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured ? 'Supabase Live' : 'Demo Local DB'}
              </span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-sm text-left"
              >
                <div className="relative">
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-indigo-600'
                    }`}
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 capitalize flex items-center space-x-1">
                    {currentUser.role === 'admin' ? (
                      <span className="text-purple-600 font-bold">Admin</span>
                    ) : (
                      <span className="text-indigo-600 font-bold">Teacher</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Role
                    </p>
                  </div>
                  <div className="p-1 space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchUser(u)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition ${
                          currentUser.id === u.id
                            ? 'bg-indigo-50 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src={u.avatar_url}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 capitalize">
                            Role: <span className="font-semibold text-indigo-600">{u.role}</span>
                          </p>
                        </div>
                        {currentUser.id === u.id && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-100 px-2">
                    <button
                      onClick={handleResetData}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Database</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
