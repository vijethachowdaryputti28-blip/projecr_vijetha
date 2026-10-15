import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Search, 
  SlidersHorizontal, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Phone,
  Sparkles,
  School
} from 'lucide-react';
import { Student, ClassItem, SectionItem, SortField, SortOrder, UserRole } from '../../types';
import { StorageService } from '../../lib/storage';
import { StudentModal } from './StudentModal';
import { StudentImportModal } from './StudentImportModal';

interface StudentListProps {
  classes: ClassItem[];
  sections: SectionItem[];
  userRole: UserRole;
  onRefresh?: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  classes,
  sections,
  userRole,
  onRefresh,
}) => {
  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorting: strictly Alphabetical by first name by default
  const [sortBy, setSortBy] = useState<SortField>('first_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const availableSections = useMemo(
    () => (selectedClassId ? sections.filter((s) => s.class_id === selectedClassId) : sections),
    [sections, selectedClassId]
  );

  const students = useMemo(() => {
    return StorageService.getStudents({
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
      sortBy,
      sortOrder,
      searchQuery,
    });
  }, [selectedClassId, selectedSectionId, sortBy, sortOrder, searchQuery, isAddModalOpen, isImportModalOpen, editingStudent]);

  const handleSaveStudent = (data: Omit<Student, 'id' | 'created_at'>) => {
    if (editingStudent) {
      StorageService.updateStudent(editingStudent.id, data);
      setEditingStudent(null);
    } else {
      StorageService.addStudent(data);
    }
    if (onRefresh) onRefresh();
  };

  const handleBulkImport = (newStudents: Omit<Student, 'id' | 'created_at'>[]) => {
    StorageService.bulkAddStudents(newStudents);
    if (onRefresh) onRefresh();
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Are you sure you want to remove ${student.first_name} ${student.last_name}?`)) {
      StorageService.deleteStudent(student.id);
      if (onRefresh) onRefresh();
    }
  };

  const getClassCode = (classId: string) => {
    return classes.find((c) => c.id === classId)?.code || 'N/A';
  };

  const getSectionName = (secId: string) => {
    return sections.find((s) => s.id === secId)?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Student Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Alphabetical Default
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic roster management with individual consent tracking
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import CSV / Excel</span>
            </button>

            <button
              onClick={() => {
                setEditingStudent(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-1 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by first name, last name, roll number, email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('');
              }}
              className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">All Sections</option>
              {availableSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500 flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Order By:</span>
            </span>

            <button
              onClick={() => {
                if (sortBy === 'first_name') {
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('first_name');
                  setSortOrder('asc');
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                sortBy === 'first_name'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              First Name {sortBy === 'first_name' && (sortOrder === 'asc' ? '(A→Z)' : '(Z→A)')}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'last_name') {
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('last_name');
                  setSortOrder('asc');
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                sortBy === 'last_name'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Last Name {sortBy === 'last_name' && (sortOrder === 'asc' ? '(A→Z)' : '(Z→A)')}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'roll_number') {
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('roll_number');
                  setSortOrder('asc');
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                sortBy === 'roll_number'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Roll No {sortBy === 'roll_number' && (sortOrder === 'asc' ? '(Asc)' : '(Desc)')}
            </button>
          </div>

          <div className="text-slate-400 font-semibold text-[11px]">
            Total: <strong className="text-slate-700">{students.length}</strong> Students
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name (A-Z)</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Biometric Consent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students found. Click "Add Student" or "Import CSV / Excel" to get started.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {student.roll_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {student.first_name.charAt(0)}
                          {student.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {getClassCode(student.class_id)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {getSectionName(student.section_id)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold truncate max-w-[150px]">
                        {student.guardian_name || 'Not provided'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {student.guardian_email || student.guardian_phone || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {student.biometric_consent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Consented
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Manual Only
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        classes={classes}
        sections={sections}
        defaultClassId={selectedClassId}
        defaultSectionId={selectedSectionId}
      />

      {/* CSV / Excel Bulk Import Modal */}
      <StudentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        classes={classes}
        sections={sections}
        defaultClassId={selectedClassId || classes[0]?.id || ''}
        defaultSectionId={selectedSectionId || sections[0]?.id || ''}
      />
    </div>
  );
};
