import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './lib/storage';
import { UserProfile, UserRole } from './types';
import { Navbar } from './components/common/Navbar';
import { Sidebar, TabType } from './components/common/Sidebar';
import { SupabaseSetupModal } from './components/common/SupabaseSetupModal';
import { AttendanceSheet } from './components/attendance/AttendanceSheet';
import { StudentList } from './components/students/StudentList';
import { ClassManagement } from './components/classes/ClassManagement';
import { AIInsightsPanel } from './components/ai/AIInsightsPanel';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogView } from './components/reports/AuditLogView';

export function App() {
  // Initialize storage with pre-seeded demo data on first load
  useEffect(() => {
    StorageService.init();
  }, []);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Core Data States
  const [classes, setClasses] = useState(() => StorageService.getClasses());
  const [sections, setSections] = useState(() => StorageService.getSections());
  const [subjects, setSubjects] = useState(() => StorageService.getSubjects());
  const [students, setStudents] = useState(() => StorageService.getStudents());
  const [sessions, setSessions] = useState(() => StorageService.getSessions());
  const [auditLogs, setAuditLogs] = useState(() => StorageService.getAuditLogs());

  // Refresh data callback
  const refreshData = useCallback(() => {
    setClasses(StorageService.getClasses());
    setSections(StorageService.getSections());
    setSubjects(StorageService.getSubjects());
    setStudents(StorageService.getStudents());
    setSessions(StorageService.getSessions());
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  const handleUserChange = (newUser: UserProfile) => {
    setCurrentUser(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'attendance' && (
            <AttendanceSheet
              currentUser={currentUser}
              classes={classes}
              sections={sections}
              subjects={subjects}
              onOpenAuditLogs={() => setActiveTab('audit-logs')}
            />
          )}

          {activeTab === 'students' && (
            <StudentList
              classes={classes}
              sections={sections}
              userRole={currentUser.role}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'classes' && (
            <ClassManagement
              classes={classes}
              sections={sections}
              subjects={subjects}
              userRole={currentUser.role}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'ai-insights' && (
            <AIInsightsPanel
              students={students}
              sessions={sessions}
              records={StorageService.getSessions().flatMap((s) =>
                StorageService.getRecordsForSession(s.id)
              )}
              classes={classes}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sessions={sessions}
              records={StorageService.getSessions().flatMap((s) =>
                StorageService.getRecordsForSession(s.id)
              )}
              students={students}
              classes={classes}
              sections={sections}
              subjects={subjects}
            />
          )}

          {activeTab === 'audit-logs' && <AuditLogView logs={auditLogs} />}
        </main>
      </div>

      {/* Supabase Setup / Connection Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}

export default App;
