import React, { useState, useEffect } from 'react';
import { X, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { Student, ClassItem, SectionItem } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id' | 'created_at'>) => void;
  initialData?: Student | null;
  classes: ClassItem[];
  sections: SectionItem[];
  defaultClassId?: string;
  defaultSectionId?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  classes,
  sections,
  defaultClassId,
  defaultSectionId,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [classId, setClassId] = useState(defaultClassId || classes[0]?.id || '');
  const [sectionId, setSectionId] = useState(defaultSectionId || sections[0]?.id || '');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [biometricConsent, setBiometricConsent] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name);
      setLastName(initialData.last_name);
      setRollNumber(initialData.roll_number);
      setEmail(initialData.email);
      setGender(initialData.gender || 'Male');
      setClassId(initialData.class_id);
      setSectionId(initialData.section_id);
      setGuardianName(initialData.guardian_name || '');
      setGuardianEmail(initialData.guardian_email || '');
      setGuardianPhone(initialData.guardian_phone || '');
      setBiometricConsent(initialData.biometric_consent);
      setNotes(initialData.notes || '');
    } else {
      setFirstName('');
      setLastName('');
      setRollNumber('');
      setEmail('');
      setGender('Male');
      setClassId(defaultClassId || classes[0]?.id || '');
      setSectionId(defaultSectionId || sections[0]?.id || '');
      setGuardianName('');
      setGuardianEmail('');
      setGuardianPhone('');
      setBiometricConsent(false);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, defaultClassId, defaultSectionId, classes, sections]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !rollNumber.trim() || !email.trim()) {
      setError('First name, last name, roll number, and email are required.');
      return;
    }

    onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      roll_number: rollNumber.trim(),
      email: email.trim(),
      gender,
      class_id: classId,
      section_id: sectionId,
      guardian_name: guardianName.trim(),
      guardian_email: guardianEmail.trim(),
      guardian_phone: guardianPhone.trim(),
      biometric_consent: biometricConsent,
      face_registered: biometricConsent ? (initialData?.face_registered ?? false) : false,
      notes: notes.trim(),
    });
    onClose();
  };

  const filteredSections = sections.filter((s) => s.class_id === classId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialData ? 'Edit Student Record' : 'Register New Student'}
              </h3>
              <p className="text-xs text-slate-500">Student is indexed alphabetically by default</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Aaron"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Vance"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Roll Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. R-101"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aaron.vance@student.edu"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Guardian Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Parent Name"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Guardian Email</label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Guardian Phone</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Biometric Consent Toggle */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start space-x-3">
            <input
              type="checkbox"
              id="biometricConsent"
              checked={biometricConsent}
              onChange={(e) => setBiometricConsent(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="biometricConsent" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 block">Biometric Consent Granted</span>
              Student / guardian has signed the institutional biometric verification consent form.
              If unchecked, student is restricted to manual attendance only.
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              {initialData ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
