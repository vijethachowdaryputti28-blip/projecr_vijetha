import { 
  Student, 
  ClassItem, 
  SectionItem, 
  SubjectItem, 
  AttendanceSession, 
  AttendanceRecord, 
  AuditLog, 
  UserProfile, 
  SortField, 
  SortOrder 
} from '../types';
import { 
  mockUsers, 
  mockClasses, 
  mockSections, 
  mockSubjects, 
  mockStudents, 
  mockSessions, 
  mockRecords, 
  mockAuditLogs 
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

const KEYS = {
  CURRENT_USER: 'alphabetai_current_user',
  CLASSES: 'alphabetai_classes',
  SECTIONS: 'alphabetai_sections',
  SUBJECTS: 'alphabetai_subjects',
  STUDENTS: 'alphabetai_students',
  SESSIONS: 'alphabetai_sessions',
  RECORDS: 'alphabetai_records',
  AUDIT_LOGS: 'alphabetai_audit_logs',
};

// Safe LocalStorage helpers
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

export const StorageService = {
  // Initialize storage if empty
  init(): void {
    if (!localStorage.getItem(KEYS.CLASSES)) {
      setStored(KEYS.CLASSES, mockClasses);
    }
    if (!localStorage.getItem(KEYS.SECTIONS)) {
      setStored(KEYS.SECTIONS, mockSections);
    }
    if (!localStorage.getItem(KEYS.SUBJECTS)) {
      setStored(KEYS.SUBJECTS, mockSubjects);
    }
    if (!localStorage.getItem(KEYS.STUDENTS)) {
      setStored(KEYS.STUDENTS, mockStudents);
    }
    if (!localStorage.getItem(KEYS.SESSIONS)) {
      setStored(KEYS.SESSIONS, mockSessions);
    }
    if (!localStorage.getItem(KEYS.RECORDS)) {
      setStored(KEYS.RECORDS, mockRecords);
    }
    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
      setStored(KEYS.AUDIT_LOGS, mockAuditLogs);
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      setStored(KEYS.CURRENT_USER, mockUsers[1]); // Default to Teacher for instant attendance access
    }
  },

  // Auth / Current User
  getCurrentUser(): UserProfile {
    return getStored<UserProfile>(KEYS.CURRENT_USER, mockUsers[1]);
  },

  setCurrentUser(user: UserProfile): void {
    setStored(KEYS.CURRENT_USER, user);
  },

  getAllUsers(): UserProfile[] {
    return mockUsers;
  },

  // Classes & Sections
  getClasses(): ClassItem[] {
    return getStored<ClassItem[]>(KEYS.CLASSES, mockClasses);
  },

  addClass(cls: Omit<ClassItem, 'id' | 'created_at'>): ClassItem {
    const classes = this.getClasses();
    const newClass: ClassItem = {
      ...cls,
      id: 'cls-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    classes.push(newClass);
    setStored(KEYS.CLASSES, classes);
    return newClass;
  },

  getSections(classId?: string): SectionItem[] {
    const all = getStored<SectionItem[]>(KEYS.SECTIONS, mockSections);
    if (!classId) return all;
    return all.filter((s) => s.class_id === classId);
  },

  addSection(sec: Omit<SectionItem, 'id' | 'created_at'>): SectionItem {
    const sections = getStored<SectionItem[]>(KEYS.SECTIONS, mockSections);
    const newSection: SectionItem = {
      ...sec,
      id: 'sec-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    sections.push(newSection);
    setStored(KEYS.SECTIONS, sections);
    return newSection;
  },

  getSubjects(classId?: string): SubjectItem[] {
    const all = getStored<SubjectItem[]>(KEYS.SUBJECTS, mockSubjects);
    if (!classId) return all;
    return all.filter((s) => !s.class_id || s.class_id === classId);
  },

  addSubject(sub: Omit<SubjectItem, 'id' | 'created_at'>): SubjectItem {
    const subjects = getStored<SubjectItem[]>(KEYS.SUBJECTS, mockSubjects);
    const newSubject: SubjectItem = {
      ...sub,
      id: 'sub-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    subjects.push(newSubject);
    setStored(KEYS.SUBJECTS, subjects);
    return newSubject;
  },

  // Students - strictly sorted alphabetically by default
  getStudents(options?: {
    classId?: string;
    sectionId?: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    searchQuery?: string;
  }): Student[] {
    let students = getStored<Student[]>(KEYS.STUDENTS, mockStudents);

    if (options?.classId) {
      students = students.filter((s) => s.class_id === options.classId);
    }
    if (options?.sectionId) {
      students = students.filter((s) => s.section_id === options.sectionId);
    }
    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      students = students.filter(
        (s) =>
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.roll_number.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Default sorting is strictly Alphabetical by First Name (A-Z)
    const sortBy = options?.sortBy || 'first_name';
    const sortOrder = options?.sortOrder || 'asc';

    return [...students].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'first_name') {
        valA = a.first_name.toLowerCase();
        valB = b.first_name.toLowerCase();
      } else if (sortBy === 'last_name') {
        valA = a.last_name.toLowerCase();
        valB = b.last_name.toLowerCase();
      } else if (sortBy === 'roll_number') {
        // Natural numeric/alphanumeric sort
        return sortOrder === 'asc'
          ? a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true })
          : b.roll_number.localeCompare(a.roll_number, undefined, { numeric: true });
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  },

  getStudentById(id: string): Student | undefined {
    const students = getStored<Student[]>(KEYS.STUDENTS, mockStudents);
    return students.find((s) => s.id === id);
  },

  addStudent(studentData: Omit<Student, 'id' | 'created_at'>): Student {
    const students = getStored<Student[]>(KEYS.STUDENTS, mockStudents);
    const newStudent: Student = {
      ...studentData,
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };
    students.push(newStudent);
    setStored(KEYS.STUDENTS, students);
    return newStudent;
  },

  bulkAddStudents(newStudents: Omit<Student, 'id' | 'created_at'>[]): Student[] {
    const students = getStored<Student[]>(KEYS.STUDENTS, mockStudents);
    const createdList: Student[] = [];

    newStudents.forEach((item, index) => {
      const student: Student = {
        ...item,
        id: 'stu-' + (Date.now() + index) + '-' + Math.random().toString(36).substring(2, 6),
        created_at: new Date().toISOString(),
      };
      students.push(student);
      createdList.push(student);
    });

    setStored(KEYS.STUDENTS, students);
    return createdList;
  },

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = getStored<Student[]>(KEYS.STUDENTS, mockStudents);
    const idx = students.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    students[idx] = { ...students[idx], ...updates };
    setStored(KEYS.STUDENTS, students);
    return students[idx];
  },

  deleteStudent(id: string): boolean {
    const students = getStored<Student[]>(KEYS.STUDENTS, mockStudents);
    const filtered = students.filter((s) => s.id !== id);
    if (filtered.length === students.length) return false;
    setStored(KEYS.STUDENTS, filtered);
    return true;
  },

  // Attendance Sessions
  getSessions(): AttendanceSession[] {
    return getStored<AttendanceSession[]>(KEYS.SESSIONS, mockSessions);
  },

  getSessionById(id: string): AttendanceSession | undefined {
    const sessions = this.getSessions();
    return sessions.find((s) => s.id === id);
  },

  getOrCreateSession(params: {
    class_id: string;
    section_id: string;
    subject_id: string;
    date: string;
    teacher_id: string;
  }): AttendanceSession {
    const sessions = this.getSessions();
    const existing = sessions.find(
      (s) =>
        s.class_id === params.class_id &&
        s.section_id === params.section_id &&
        s.subject_id === params.subject_id &&
        s.date === params.date
    );

    if (existing) {
      return existing;
    }

    const newSession: AttendanceSession = {
      id: 'ses-' + Date.now(),
      class_id: params.class_id,
      section_id: params.section_id,
      subject_id: params.subject_id,
      date: params.date,
      start_time: new Date().toTimeString().substring(0, 5),
      teacher_id: params.teacher_id,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    sessions.unshift(newSession);
    setStored(KEYS.SESSIONS, sessions);
    return newSession;
  },

  updateSession(id: string, updates: Partial<AttendanceSession>): AttendanceSession | null {
    const sessions = this.getSessions();
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    sessions[idx] = {
      ...sessions[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(KEYS.SESSIONS, sessions);
    return sessions[idx];
  },

  // Attendance Records - linked strictly to student_id!
  getRecordsForSession(sessionId: string): AttendanceRecord[] {
    const records = getStored<AttendanceRecord[]>(KEYS.RECORDS, mockRecords);
    return records.filter((r) => r.session_id === sessionId);
  },

  // Save or update records for a session (strict student_id mapping, no row-order dependence)
  saveSessionRecords(
    sessionId: string,
    recordsMap: Record<string, { status: AttendanceRecord['status']; remarks?: string; method?: 'manual' | 'face_recognition' }>,
    markedBy: string
  ): void {
    let allRecords = getStored<AttendanceRecord[]>(KEYS.RECORDS, mockRecords);
    const now = new Date().toISOString();

    Object.entries(recordsMap).forEach(([studentId, data]) => {
      const existingIdx = allRecords.findIndex(
        (r) => r.session_id === sessionId && r.student_id === studentId
      );

      if (existingIdx !== -1) {
        allRecords[existingIdx] = {
          ...allRecords[existingIdx],
          status: data.status,
          remarks: data.remarks ?? allRecords[existingIdx].remarks,
          marked_at: now,
          marked_by: markedBy,
          method: data.method ?? allRecords[existingIdx].method,
        };
      } else {
        allRecords.push({
          id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          session_id: sessionId,
          student_id: studentId,
          status: data.status,
          remarks: data.remarks,
          marked_at: now,
          marked_by: markedBy,
          method: data.method ?? 'manual',
          verified_by_teacher: true,
        });
      }
    });

    setStored(KEYS.RECORDS, allRecords);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(KEYS.AUDIT_LOGS, mockAuditLogs);
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStored(KEYS.AUDIT_LOGS, logs);
    return newLog;
  },

  // Reset demo data
  resetToDefaults(): void {
    localStorage.clear();
    this.init();
  },
};
