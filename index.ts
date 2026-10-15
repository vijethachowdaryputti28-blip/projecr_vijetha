export type UserRole = 'admin' | 'teacher';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "Grade 10", "Computer Science Year 2"
  code: string; // e.g. "CS-101"
  description?: string;
  created_at: string;
}

export interface SectionItem {
  id: string;
  class_id: string;
  name: string; // e.g. "Section A", "Morning Batch"
  created_at: string;
}

export interface SubjectItem {
  id: string;
  name: string; // e.g. "Advanced Mathematics", "Physics"
  code: string; // e.g. "MATH-401"
  class_id?: string;
  created_at: string;
}

export interface Student {
  id: string; // Unique UUID (Never tied to row index)
  roll_number: string;
  first_name: string;
  last_name: string;
  email: string;
  gender?: 'Male' | 'Female' | 'Other';
  class_id: string;
  section_id: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
  avatar_url?: string;
  biometric_consent: boolean; // Consent flag for face recognition
  face_registered: boolean;
  notes?: string;
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  date: string; // YYYY-MM-DD
  start_time?: string;
  teacher_id: string;
  status: 'draft' | 'finalized';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string; // Unique student UUID guarantee
  status: AttendanceStatus;
  marked_at: string;
  marked_by: string; // user id
  method: 'manual' | 'face_recognition';
  verified_by_teacher: boolean;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  changed_by: string;
  changed_by_name: string;
  previous_status: AttendanceStatus;
  new_status: AttendanceStatus;
  reason: string;
  timestamp: string;
}

export type SortField = 'first_name' | 'last_name' | 'roll_number';
export type SortOrder = 'asc' | 'desc';

export interface AIInsightReport {
  summary: string;
  totalSessionsAnalyzed: number;
  averageAttendanceRate: number;
  frequentAbsentees: {
    student: Student;
    absenceRate: number;
    absentCount: number;
    totalClasses: number;
    trend: 'deteriorating' | 'improving' | 'stable';
    patternNote?: string;
  }[];
  trends: {
    dayOfWeekBreakdown: { day: string; rate: number }[];
    recentSessions: { date: string; rate: number; sessionName: string }[];
    consecutiveAbsenceAlerts: { studentName: string; count: number; days: string[] }[];
  };
  recommendations: string[];
}
