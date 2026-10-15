import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Layers 
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Student, ClassItem, SectionItem } from '../../types';
import { ExportUtils } from '../../lib/exportUtils';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newStudents: Omit<Student, 'id' | 'created_at'>[]) => void;
  classes: ClassItem[];
  sections: SectionItem[];
  defaultClassId: string;
  defaultSectionId: string;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  classes,
  sections,
  defaultClassId,
  defaultSectionId,
}) => {
  const [targetClassId, setTargetClassId] = useState(defaultClassId);
  const [targetSectionId, setTargetSectionId] = useState(defaultSectionId);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          validateAndSetRows(json);
        } catch (err: any) {
          setError('Failed to parse Excel file: ' + (err?.message || err));
        }
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parse notes:', results.errors);
          }
          validateAndSetRows(results.data);
        },
        error: (err) => {
          setError('Failed to parse CSV file: ' + err.message);
        },
      });
    }
  };

  const validateAndSetRows = (rows: any[]) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setError('File appears empty or does not contain valid data rows.');
      setParsedRows([]);
      return;
    }

    const mapped = rows.map((r, i) => {
      const firstName = (r.first_name || r['First Name'] || r.FirstName || '').toString().trim();
      const lastName = (r.last_name || r['Last Name'] || r.LastName || '').toString().trim();
      const rollNumber = (r.roll_number || r['Roll Number'] || r.RollNumber || `R-${200 + i}`).toString().trim();
      const email = (r.email || r.Email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`).toString().trim();
      const gender = (r.gender || r.Gender || 'Other').toString().trim();
      const guardianName = (r.guardian_name || r['Guardian Name'] || '').toString().trim();
      const guardianEmail = (r.guardian_email || r['Guardian Email'] || '').toString().trim();
      const guardianPhone = (r.guardian_phone || r['Guardian Phone'] || '').toString().trim();
      const consentRaw = (r.biometric_consent || r['Biometric Consent'] || '').toString().toLowerCase();
      const biometricConsent = consentRaw === 'true' || consentRaw === 'yes' || consentRaw === '1';

      return {
        first_name: firstName || `Student_${i + 1}`,
        last_name: lastName || 'User',
        roll_number: rollNumber,
        email: email,
        gender: (gender === 'Male' || gender === 'Female' ? gender : 'Other') as any,
        guardian_name: guardianName,
        guardian_email: guardianEmail,
        guardian_phone: guardianPhone,
        biometric_consent: biometricConsent,
        face_registered: biometricConsent,
        class_id: targetClassId,
        section_id: targetSectionId,
        notes: 'Imported via CSV/Excel roster import',
      };
    });

    setParsedRows(mapped);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    // Stamp current selected class & section
    const finalStudents = parsedRows.map((s) => ({
      ...s,
      class_id: targetClassId,
      section_id: targetSectionId,
    }));

    onImport(finalStudents);
    onClose();
  };

  const filteredSections = sections.filter((s) => s.class_id === targetClassId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Bulk Import Student Roster</h3>
              <p className="text-xs text-slate-500">Supports CSV and Microsoft Excel (.xlsx, .xls)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Destination Class & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign to Class:
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign to Section:
              </label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Download Sample Templates Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 gap-3">
            <div className="text-xs text-indigo-900">
              <span className="font-bold">Need a starting template?</span> Download our pre-formatted headers.
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={ExportUtils.downloadSampleImportCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </button>
              <button
                type="button"
                onClick={ExportUtils.downloadSampleImportExcel}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-sm flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Excel</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-6 text-center transition bg-slate-50/50">
            <input
              type="file"
              id="fileUpload"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Click or drag CSV or Excel file here to upload'}
              </div>
              <p className="text-[11px] text-slate-400">
                Columns recognized: roll_number, first_name, last_name, email, gender, biometric_consent
              </p>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Roster Preview ({parsedRows.length} valid students detected)</span>
                <span className="text-[11px] text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready to import</span>
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Roll No</th>
                      <th className="py-2 px-3">First Name</th>
                      <th className="py-2 px-3">Last Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Bio Consent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {row.roll_number}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.first_name}
                        </td>
                        <td className="py-2 px-3 text-slate-700">{row.last_name}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                          {row.email}
                        </td>
                        <td className="py-2 px-3">
                          {row.biometric_consent ? (
                            <span className="text-emerald-600 font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 15 && (
                <p className="text-[11px] text-slate-400 text-center">
                  Showing first 15 of {parsedRows.length} students.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
          >
            Import {parsedRows.length} Students
          </button>
        </div>
      </div>
    </div>
  );
};
