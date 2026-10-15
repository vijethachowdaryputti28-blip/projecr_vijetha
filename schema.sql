-- =========================================================================
-- AlphabetAI Attendance - Complete Supabase PostgreSQL Schema
-- Includes Row Level Security (RLS), Tables, Indexes, and Demo Seed Data
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User Accounts & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, name)
);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENTS TABLE
-- Notice: Sorted alphabetically by default in application queries!
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    guardian_name TEXT,
    guardian_email TEXT,
    guardian_phone TEXT,
    avatar_url TEXT,
    biometric_consent BOOLEAN DEFAULT FALSE,
    face_registered BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, section_id, roll_number)
);

-- Index for speedy alphabetical sorting by first_name and last_name
CREATE INDEX IF NOT EXISTS idx_students_first_name ON public.students(first_name ASC, last_name ASC);
CREATE INDEX IF NOT EXISTS idx_students_class_section ON public.students(class_id, section_id);

-- 6. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME WITHOUT TIME ZONE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'finalized')) DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.attendance_sessions(date DESC);

-- 7. ATTENDANCE RECORDS TABLE
-- CRITICAL REQUIREMENT: Attendance records are strictly tied to student_id (UUID),
-- NEVER to table row index or position!
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    marked_by UUID NOT NULL REFERENCES public.profiles(id),
    method TEXT NOT NULL CHECK (method IN ('manual', 'face_recognition')) DEFAULT 'manual',
    verified_by_teacher BOOLEAN DEFAULT TRUE,
    remarks TEXT,
    -- Prevent duplicate records for the same student in the same session!
    CONSTRAINT unique_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_records_session ON public.attendance_records(session_id);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id),
    changed_by_name TEXT NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Authenticated users can view profiles; users can update own profile
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins full access to profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin());

-- Classes, Sections, Subjects: Viewable by all authenticated users; Admins can modify
CREATE POLICY "Classes viewable by authenticated" ON public.classes
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Classes editable by admins" ON public.classes
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Sections viewable by authenticated" ON public.sections
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sections editable by admins" ON public.sections
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Subjects viewable by authenticated" ON public.subjects
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Subjects editable by admins" ON public.subjects
    FOR ALL TO authenticated USING (public.is_admin());

-- Students: Viewable by authenticated teachers and admins; editable by admins
CREATE POLICY "Students viewable by authenticated" ON public.students
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students managed by admins" ON public.students
    FOR ALL TO authenticated USING (public.is_admin());

-- Attendance Sessions: Viewable by teachers and admins; created and modified by assigned teachers or admins
CREATE POLICY "Attendance sessions viewable by authenticated" ON public.attendance_sessions
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attendance sessions insertable by teachers" ON public.attendance_sessions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id OR public.is_admin());
CREATE POLICY "Attendance sessions updatable by session teacher or admin" ON public.attendance_sessions
    FOR UPDATE TO authenticated USING (auth.uid() = teacher_id OR public.is_admin());

-- Attendance Records:
CREATE POLICY "Records viewable by authenticated" ON public.attendance_records
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Records manageable by session teacher or admin" ON public.attendance_records
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.attendance_sessions s
            WHERE s.id = attendance_records.session_id
            AND (s.teacher_id = auth.uid() OR public.is_admin())
        )
    );

-- Audit Logs:
CREATE POLICY "Audit logs readable by authenticated" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit logs insertable by authenticated" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- =========================================================================
-- SEED DEMO DATA
-- =========================================================================
INSERT INTO public.classes (id, name, code, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Grade 10 - Alpha', 'G10-A', 'Secondary school sophomore grade'),
    ('22222222-2222-2222-2222-222222222222', 'Grade 11 - STEM', 'G11-STEM', 'Senior school science, tech, engineering & math')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.sections (id, class_id, name) VALUES
    ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Section A'),
    ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Section B'),
    ('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222', 'Section A')
ON CONFLICT (class_id, name) DO NOTHING;

INSERT INTO public.subjects (id, name, code, class_id) VALUES
    ('55555555-5555-5555-5555-555555555551', 'Advanced Mathematics', 'MATH-101', '11111111-1111-1111-1111-111111111111'),
    ('55555555-5555-5555-5555-555555555552', 'Computer Science & AI', 'CS-102', '11111111-1111-1111-1111-111111111111'),
    ('55555555-5555-5555-5555-555555555553', 'Physics Fundamentals', 'PHYS-103', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (code) DO NOTHING;
