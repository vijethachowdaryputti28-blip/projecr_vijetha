import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Filter,
  CheckCheck,
  TrendingUp
} from 'lucide-react';
import { AttendanceSession, AttendanceRecord, Student, ClassItem, SectionItem, SubjectItem } from '../../types';
import { ExportUtils } from '../../lib/exportUtils';
import { StorageService } from '../../lib/storage';

interface ReportsViewProps {
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  students: Student[];
  classes: ClassItem[];
  sections: SectionItem[];
  subjects: SubjectItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sessions,
  records,
  students,
  classes,
  sections,
  subjects,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const filteredSessions = sessions.filter(
    (s) => !selectedClassId || s.class_id === selectedClassId
  );

  const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || 'Class';
  const getSectionName = (id: string) => sections.find((s) => s.id === id)?.name || 'Section';
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || 'Subject';

  const handleDownloadCSV = (session: AttendanceSession) => {
    const sessionRecords = StorageService.getRecordsForSession(session.id);
    const sessionStudents = StorageService.getStudents({
      classId: session.class_id,
      sectionId: session.section_id,
    });
    const cls = classes.find((c) => c.id === session.class_id);
    const sec = sections.find((s) => s.id === session.section_id);
    const sub = subjects.find((s) => s.id === session.subject_id);

    ExportUtils.exportSessionCSV(session, sessionStudents, sessionRecords, cls, sec, sub);
  };

  const handleDownloadPDF = (session: AttendanceSession) => {
    const sessionRecords = StorageService.getRecordsForSession(session.id);
    const sessionStudents = StorageService.getStudents({
      classId: session.class_id,
      sectionId: session.section_id,
    });
    const cls = classes.find((c) => c.id === session.class_id);
    const sec = sections.find((s) => s.id === session.section_id);
    const sub = subjects.find((s) => s.id === session.subject_id);

    ExportUtils.exportSessionPDF(session, sessionStudents, sessionRecords, cls, sec, sub);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Attendance Reports & Export Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              CSV & PDF Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical attendance session archives, downloadable rosters, and analytical metrics
          </p>
        </div>

        {/* Class Filter */}
        <div className="w-full sm:w-64">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Historical Sessions Roster */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Recorded Sessions Archive</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredSessions.length} Recorded Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Class & Section</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Attendance Stats</th>
                <th className="py-3.5 px-4 text-right">Download Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No attendance sessions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const sessionRecords = records.filter((r) => r.session_id === session.id);
                  const present = sessionRecords.filter(
                    (r) => r.status === 'present' || r.status === 'late'
                  ).length;
                  const total = sessionRecords.length;
                  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {session.date}
                        {session.start_time && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {session.start_time}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {getClassName(session.class_id)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {getSectionName(session.section_id)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {getSubjectName(session.subject_id)}
                      </td>

                      <td className="py-3.5 px-4">
                        {session.status === 'finalized' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Finalized
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{rate}%</span>
                          <span className="text-[11px] text-slate-400">
                            ({present}/{total} present)
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDownloadCSV(session)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center space-x-1"
                            title="Download CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>CSV</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(session)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition flex items-center space-x-1"
                            title="Download Formatted PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
