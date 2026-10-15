import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { Student, AttendanceStatus } from '../../types';

interface AuditModalProps {
  isOpen: boolean;
  student: Student | null;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  student,
  previousStatus,
  newStatus,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A factual reason is required for institutional audit compliance.');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Audit Trail Verification</h3>
              <p className="text-xs text-slate-500">Record modification reason required</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-800">
                {student.first_name} {student.last_name} ({student.roll_number})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Change:</span>
              <span>
                <span className="font-bold text-slate-600 uppercase">{previousStatus}</span>
                {' → '}
                <span className="font-bold text-indigo-600 uppercase">{newStatus}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Status Modification:
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Student presented doctor note, transit delay proof, or administrative clearance..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
            >
              Log Change & Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
