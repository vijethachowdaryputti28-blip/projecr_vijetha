import React, { useState } from 'react';
import { ShieldCheck, FileClock, Search, UserCheck, AlertCircle, History } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.changed_by_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Institutional Audit Trail
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Immutable Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete historical modification logs with mandatory justification reasons
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit-Protected Compliance Mode</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, modified by, or reason..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Status Change</th>
                <th className="py-3 px-4">Authorized By</th>
                <th className="py-3 px-4">Reason / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {log.student_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-slate-100 text-slate-600">
                          {log.previous_status}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-indigo-50 text-indigo-700">
                          {log.new_status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.changed_by_name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                      <p className="line-clamp-2 italic">"{log.reason}"</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
