import React from 'react';
import { Users, CheckCircle2, XCircle, Clock, ShieldCheck, Percent } from 'lucide-react';
import { AttendanceStatus } from '../../types';

interface LiveCounterProps {
  total: number;
  counts: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    unmarked: number;
  };
}

export const LiveCounter: React.FC<LiveCounterProps> = ({ total, counts }) => {
  const attendanceRate = total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Top title and percentage progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Live Attendance Metrics</h3>
            <p className="text-xs text-slate-400">Real-time cohort presence breakdown</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {attendanceRate}%
            </span>
            <span className="text-xs text-slate-400 block font-medium">Present / Late Rate</span>
          </div>
          <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 rounded-l-full"
              style={{ width: `${total > 0 ? (counts.present / total) * 100 : 0}%` }}
              title={`Present: ${counts.present}`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${total > 0 ? (counts.late / total) * 100 : 0}%` }}
              title={`Late: ${counts.late}`}
            />
            <div
              className="bg-blue-400 h-full transition-all duration-500"
              style={{ width: `${total > 0 ? (counts.excused / total) * 100 : 0}%` }}
              title={`Excused: ${counts.excused}`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${total > 0 ? (counts.absent / total) * 100 : 0}%` }}
              title={`Absent: ${counts.absent}`}
            />
          </div>
        </div>
      </div>

      {/* 5 Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 leading-none">{total}</span>
            <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Total Roster</span>
          </div>
        </div>

        {/* Present */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-700 leading-none">{counts.present}</span>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">Present</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-500/20">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-black text-rose-700 leading-none">{counts.absent}</span>
            <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">Absent</span>
          </div>
        </div>

        {/* Late */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-black text-amber-700 leading-none">{counts.late}</span>
            <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">Late</span>
          </div>
        </div>

        {/* Excused */}
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 flex items-center space-x-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-black text-blue-700 leading-none">{counts.excused}</span>
            <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">Excused</span>
          </div>
        </div>
      </div>
    </div>
  );
};
