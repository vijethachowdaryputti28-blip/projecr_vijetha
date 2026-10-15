import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  Copy, 
  Check, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react';
import { Student, AttendanceSession, AttendanceRecord, ClassItem } from '../../types';
import { AIEngine } from '../../lib/aiEngine';

interface AIInsightsPanelProps {
  students: Student[];
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  classes: ClassItem[];
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  students,
  sessions,
  records,
  classes,
}) => {
  const [selectedStudentForAlert, setSelectedStudentForAlert] = useState<{
    student: Student;
    absentCount: number;
    totalClasses: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate factual AI insights
  const report = useMemo(() => {
    return AIEngine.generateInsights(students, sessions, records);
  }, [students, sessions, records]);

  const handleOpenAlertModal = (
    student: Student,
    absentCount: number,
    totalClasses: number
  ) => {
    setSelectedStudentForAlert({ student, absentCount, totalClasses });
  };

  const emailDraft = useMemo(() => {
    if (!selectedStudentForAlert) return null;
    return AIEngine.generateGuardianAlertEmail(
      selectedStudentForAlert.student,
      selectedStudentForAlert.absentCount,
      selectedStudentForAlert.totalClasses
    );
  }, [selectedStudentForAlert]);

  const handleCopyEmail = () => {
    if (!emailDraft) return;
    navigator.clipboard.writeText(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* AI Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-indigo-400">
              AlphabetAI Predictive Intelligence
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Factual Attendance Insights & Risk Detection
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {report.summary}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 font-semibold text-slate-200">
              Analyzed Sessions: <strong className="text-white">{report.totalSessionsAnalyzed}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 font-semibold text-slate-200">
              Cohort Rate: <strong className="text-white">{report.averageAttendanceRate}%</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 font-semibold text-slate-200">
              Risk Threshold: <strong className="text-amber-400">≥ 15% Absences</strong>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Frequent Absentees & Pattern Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequent Absentees List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Frequent Absenteeism Watchlist
                </h3>
                <p className="text-xs text-slate-400">
                  Students exhibiting chronic or deteriorating attendance patterns
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {report.frequentAbsentees.length} Flagged
            </span>
          </div>

          {report.frequentAbsentees.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No chronic absenteeism detected!</p>
              <p className="text-slate-400 mt-0.5">
                All student records are currently meeting standard attendance benchmarks.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.frequentAbsentees.map((item) => (
                <div
                  key={item.student.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      {item.student.first_name.charAt(0)}
                      {item.student.last_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          {item.student.first_name} {item.student.last_name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          ({item.student.roll_number})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.trend === 'deteriorating'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.trend === 'deteriorating' ? 'Deteriorating' : 'High Risk'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.patternNote}</p>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Guardian: {item.student.guardian_name || 'Not on file'} •{' '}
                        {item.student.guardian_email || item.student.guardian_phone || 'No direct phone'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <div className="text-right mr-2 hidden sm:block">
                      <span className="text-sm font-black text-rose-600">{item.absenceRate}%</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Absence Rate</span>
                    </div>

                    <button
                      onClick={() =>
                        handleOpenAlertModal(item.student, item.absentCount, item.totalClasses)
                      }
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Draft Guardian Notice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day-of-Week Trends & Consecutive Alerts (1 Col) */}
        <div className="space-y-6">
          {/* Day of Week */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Day-of-Week Attendance</h3>
                <p className="text-[11px] text-slate-400">Weekly attendance rhythm analysis</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {report.trends.dayOfWeekBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No day patterns recorded yet.</p>
              ) : (
                report.trends.dayOfWeekBreakdown.map((d) => (
                  <div key={d.day} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{d.day}</span>
                      <span className="font-bold">{d.rate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          d.rate >= 90
                            ? 'bg-emerald-500'
                            : d.rate >= 80
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${d.rate}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Explainable Recommendations */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Actionable AI Insights</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Guardian Alert Email Modal */}
      {selectedStudentForAlert && emailDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5" />
                <div>
                  <h3 className="text-base font-bold">AI-Generated Guardian Notification</h3>
                  <p className="text-xs text-indigo-200">
                    Recipient: {selectedStudentForAlert.student.guardian_name || 'Guardian'} ({selectedStudentForAlert.student.guardian_email || 'No email on file'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForAlert(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject:</label>
                <input
                  type="text"
                  readOnly
                  value={emailDraft.subject}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Letter Body:</label>
                <textarea
                  readOnly
                  rows={12}
                  value={emailDraft.body}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-700 leading-relaxed"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Notice generated using verified institutional records.
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Notice Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
