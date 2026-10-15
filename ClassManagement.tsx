import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Trash2, 
  School, 
  Sparkles, 
  CheckCircle2, 
  FolderPlus,
  Hash
} from 'lucide-react';
import { ClassItem, SectionItem, SubjectItem, UserRole } from '../../types';
import { StorageService } from '../../lib/storage';

interface ClassManagementProps {
  classes: ClassItem[];
  sections: SectionItem[];
  subjects: SubjectItem[];
  userRole: UserRole;
  onRefresh: () => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  sections,
  subjects,
  userRole,
  onRefresh,
}) => {
  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // New Section Form State
  const [targetClassForSection, setTargetClassForSection] = useState(classes[0]?.id || '');
  const [newSectionName, setNewSectionName] = useState('');

  // New Subject Form State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [targetClassForSubject, setTargetClassForSubject] = useState(classes[0]?.id || '');

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) return;

    StorageService.addClass({
      name: newClassName.trim(),
      code: newClassCode.trim().toUpperCase(),
      description: newClassDesc.trim(),
    });

    setNewClassName('');
    setNewClassCode('');
    setNewClassDesc('');
    showToast('Class created successfully.');
    onRefresh();
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !targetClassForSection) return;

    StorageService.addSection({
      class_id: targetClassForSection,
      name: newSectionName.trim(),
    });

    setNewSectionName('');
    showToast('Section added to class.');
    onRefresh();
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCode.trim()) return;

    StorageService.addSubject({
      name: newSubjectName.trim(),
      code: newSubjectCode.trim().toUpperCase(),
      class_id: targetClassForSubject || undefined,
    });

    setNewSubjectName('');
    setNewSubjectCode('');
    showToast('Subject created successfully.');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50">
          <div className="px-4 py-2.5 rounded-2xl shadow-xl bg-slate-900 text-white text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Academic Structure Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Classes • Sections • Subjects
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize institutional departments, grade cohorts, and curricular courses
          </p>
        </div>

        {userRole !== 'admin' && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-semibold">
            Teacher Mode: View-Only Mode
          </div>
        )}
      </div>

      {/* Grid of Classes & Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List & Add Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <School className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Classes & Grades</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {classes.length}
            </span>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {classes.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{c.name}</div>
                  <div className="font-mono text-[10px] text-indigo-600 font-semibold">{c.code}</div>
                  {c.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{c.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Admin Add Form */}
          {userRole === 'admin' && (
            <form onSubmit={handleCreateClass} className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700">Add New Class</h4>
              <input
                type="text"
                placeholder="Class Name (e.g. Grade 10 - Alpha)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
                required
              />
              <input
                type="text"
                placeholder="Code (e.g. G10-A)"
                value={newClassCode}
                onChange={(e) => setNewClassCode(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
                required
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={newClassDesc}
                onChange={(e) => setNewClassDesc(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Create Class
              </button>
            </form>
          )}
        </div>

        {/* Sections List & Add Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Class Sections</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {sections.length}
            </span>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sections.map((s) => {
              const parentClass = classes.find((c) => c.id === s.class_id);
              return (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-500">
                      Class: <span className="font-semibold text-slate-700">{parentClass?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Add Form */}
          {userRole === 'admin' && (
            <form onSubmit={handleCreateSection} className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700">Add Section to Class</h4>
              <select
                value={targetClassForSection}
                onChange={(e) => setTargetClassForSection(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Section Name (e.g. Section C - Evening)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Add Section
              </button>
            </form>
          )}
        </div>

        {/* Subjects List & Add Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Curricular Subjects</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {subjects.length}
            </span>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{sub.name}</div>
                  <div className="font-mono text-[10px] text-indigo-600 font-semibold">{sub.code}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Add Form */}
          {userRole === 'admin' && (
            <form onSubmit={handleCreateSubject} className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700">Add New Subject</h4>
              <input
                type="text"
                placeholder="Subject Name (e.g. Data Structures)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
                required
              />
              <input
                type="text"
                placeholder="Code (e.g. CS-301)"
                value={newSubjectCode}
                onChange={(e) => setNewSubjectCode(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
                required
              />
              <select
                value={targetClassForSubject}
                onChange={(e) => setTargetClassForSubject(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">All / General Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Add Subject
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
