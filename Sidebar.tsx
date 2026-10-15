import React from 'react';
import { 
  ClipboardCheck, 
  Users, 
  BookOpen, 
  BrainCircuit, 
  BarChart3, 
  FileClock, 
  ShieldAlert,
  Sparkles,
  School
} from 'lucide-react';
import { UserRole } from '../../types';

export type TabType = 'attendance' | 'students' | 'classes' | 'ai-insights' | 'reports' | 'audit-logs';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'attendance' as TabType,
      label: 'Mark Attendance',
      sublabel: 'Alphabetical Roster',
      icon: ClipboardCheck,
      badge: 'Live',
    },
    {
      id: 'students' as TabType,
      label: 'Students Directory',
      sublabel: 'CSV/Excel Import',
      icon: Users,
    },
    {
      id: 'classes' as TabType,
      label: 'Classes & Subjects',
      sublabel: userRole === 'admin' ? 'Manage Structure' : 'View Assigned',
      icon: BookOpen,
      adminOnly: false,
    },
    {
      id: 'ai-insights' as TabType,
      label: 'AI Attendance Insights',
      sublabel: 'Absenteeism & Patterns',
      icon: BrainCircuit,
      highlight: true,
    },
    {
      id: 'reports' as TabType,
      label: 'Reports & Export',
      sublabel: 'PDF & CSV Analytics',
      icon: BarChart3,
    },
    {
      id: 'audit-logs' as TabType,
      label: 'Audit Trail',
      sublabel: 'History & Tamper Checks',
      icon: FileClock,
    },
  ];

  const handleSelect = (tab: TabType) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 p-4 border-r border-slate-800">
      {/* Brand header */}
      <div className="px-3 py-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center space-x-2.5">
          <School className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-xs font-bold text-white tracking-wide uppercase">
              AlphabetAI Hub
            </div>
            <div className="text-[11px] text-slate-400">
              Role: <span className="font-semibold text-indigo-400 uppercase">{userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-indigo-400 group-hover:text-indigo-300'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <div className="truncate">
                  <div className="text-xs font-bold tracking-tight truncate">{item.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="ml-2 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Deterministic Sorting Guarantee Footer Banner */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center">
        <div className="flex items-center justify-center space-x-1.5 text-[11px] font-bold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A-Z Deterministic ID Link</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
          Records map strictly to student UUIDs. Sorting and filtering never scramble attendance.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-shrink-0 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
