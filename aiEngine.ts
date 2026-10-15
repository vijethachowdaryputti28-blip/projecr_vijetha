import { Student, AttendanceSession, AttendanceRecord, AIInsightReport } from '../types';

export const AIEngine = {
  /**
   * Generates a strictly factual, explainable AI insight report based on recorded attendance sessions.
   */
  generateInsights(
    students: Student[],
    sessions: AttendanceSession[],
    records: AttendanceRecord[]
  ): AIInsightReport {
    if (sessions.length === 0 || students.length === 0) {
      return {
        summary: 'No attendance sessions recorded yet. Mark attendance to generate AI insights.',
        totalSessionsAnalyzed: 0,
        averageAttendanceRate: 0,
        frequentAbsentees: [],
        trends: {
          dayOfWeekBreakdown: [],
          recentSessions: [],
          consecutiveAbsenceAlerts: [],
        },
        recommendations: [
          'Begin by creating attendance sessions for each scheduled class.',
          'Consistently mark student presence, absence, late arrivals, or excused status.',
        ],
      };
    }

    const totalSessions = sessions.length;
    let totalPresentCount = 0;
    let totalOpportunities = 0;

    // Map student stats: student_id -> { totalClasses, present, absent, late, excused, dates: [] }
    const studentStats: Record<
      string,
      {
        total: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
        recentStatuses: AttendanceRecord['status'][];
      }
    > = {};

    students.forEach((s) => {
      studentStats[s.id] = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        recentStatuses: [],
      };
    });

    // Sort sessions chronologically for trend analysis
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Day of week analysis
    const dayStats: Record<string, { present: number; total: number }> = {
      Monday: { present: 0, total: 0 },
      Tuesday: { present: 0, total: 0 },
      Wednesday: { present: 0, total: 0 },
      Thursday: { present: 0, total: 0 },
      Friday: { present: 0, total: 0 },
      Saturday: { present: 0, total: 0 },
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    sortedSessions.forEach((session) => {
      const sessionRecords = records.filter((r) => r.session_id === session.id);
      const sessionDate = new Date(session.date + 'T00:00:00');
      const dayName = days[sessionDate.getDay()];

      sessionRecords.forEach((rec) => {
        if (!studentStats[rec.student_id]) {
          studentStats[rec.student_id] = {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            recentStatuses: [],
          };
        }

        const stat = studentStats[rec.student_id];
        stat.total += 1;
        totalOpportunities += 1;

        if (rec.status === 'present' || rec.status === 'late') {
          totalPresentCount += 1;
          if (rec.status === 'present') stat.present += 1;
          if (rec.status === 'late') stat.late += 1;
        } else if (rec.status === 'absent') {
          stat.absent += 1;
        } else if (rec.status === 'excused') {
          stat.excused += 1;
        }

        stat.recentStatuses.push(rec.status);

        if (dayStats[dayName]) {
          dayStats[dayName].total += 1;
          if (rec.status === 'present' || rec.status === 'late') {
            dayStats[dayName].present += 1;
          }
        }
      });
    });

    const averageRate =
      totalOpportunities > 0 ? Math.round((totalPresentCount / totalOpportunities) * 100) : 0;

    // Detect Frequent Absentees (Absence rate >= 20% or >= 2 absences in short span)
    const frequentAbsentees: AIInsightReport['frequentAbsentees'] = [];

    students.forEach((student) => {
      const stat = studentStats[student.id];
      if (!stat || stat.total === 0) return;

      const absenceRate = Math.round((stat.absent / stat.total) * 100);

      // Trend determination based on last 3 records
      const last3 = stat.recentStatuses.slice(-3);
      const recentAbsentCount = last3.filter((s) => s === 'absent').length;

      let trend: 'deteriorating' | 'improving' | 'stable' = 'stable';
      if (recentAbsentCount >= 2) {
        trend = 'deteriorating';
      } else if (stat.absent > 0 && last3.every((s) => s === 'present')) {
        trend = 'improving';
      }

      // Chronic absenteeism standard threshold: >15% absence rate
      if (absenceRate >= 15 || stat.absent >= 2) {
        let patternNote = `Absent in ${stat.absent} of ${stat.total} recorded sessions (${absenceRate}% unexcused absence rate).`;
        if (stat.late >= 2) {
          patternNote += ` Also has ${stat.late} late arrivals on record.`;
        }

        frequentAbsentees.push({
          student,
          absenceRate,
          absentCount: stat.absent,
          totalClasses: stat.total,
          trend,
          patternNote,
        });
      }
    });

    frequentAbsentees.sort((a, b) => b.absenceRate - a.absenceRate);

    // Consecutive absences alerts
    const consecutiveAlerts: { studentName: string; count: number; days: string[] }[] = [];
    students.forEach((student) => {
      const stat = studentStats[student.id];
      if (!stat) return;

      // Check for consecutive absences
      let maxConsecutive = 0;
      let currentConsecutive = 0;
      stat.recentStatuses.forEach((status) => {
        if (status === 'absent') {
          currentConsecutive++;
          if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
        } else {
          currentConsecutive = 0;
        }
      });

      if (maxConsecutive >= 2) {
        consecutiveAlerts.push({
          studentName: `${student.first_name} ${student.last_name}`,
          count: maxConsecutive,
          days: [`Last recorded streak: ${maxConsecutive} consecutive missed classes`],
        });
      }
    });

    // Day of week breakdown
    const dayOfWeekBreakdown = Object.entries(dayStats)
      .filter(([_, data]) => data.total > 0)
      .map(([day, data]) => ({
        day,
        rate: Math.round((data.present / data.total) * 100),
      }));

    // Recent sessions trend
    const recentSessions = sortedSessions.slice(-7).map((s) => {
      const sRecords = records.filter((r) => r.session_id === s.id);
      const presentCount = sRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
      const rate = sRecords.length > 0 ? Math.round((presentCount / sRecords.length) * 100) : 0;
      return {
        date: s.date,
        rate,
        sessionName: s.date,
      };
    });

    // Recommendations (Factual, Actionable)
    const recommendations: string[] = [];
    if (frequentAbsentees.length > 0) {
      recommendations.push(
        `Immediate Intervention: ${frequentAbsentees.length} student(s) exhibit absence rates exceeding standard institutional risk thresholds (≥15%). Review guardian contact records.`
      );
    }
    if (consecutiveAlerts.length > 0) {
      recommendations.push(
        `Consecutive Absence Flags: ${consecutiveAlerts.map((c) => c.studentName).join(', ')} require follow-up regarding missed course assignments.`
      );
    }

    const lowestDay = [...dayOfWeekBreakdown].sort((a, b) => a.rate - b.rate)[0];
    if (lowestDay && lowestDay.rate < 85) {
      recommendations.push(
        `Weekly Pattern: ${lowestDay.day} has the lowest average attendance (${lowestDay.rate}%). Consider scheduling key coursework or reviews on higher-attendance days.`
      );
    }

    if (averageRate >= 90) {
      recommendations.push(
        `Class cohort exhibits high overall attendance compliance (${averageRate}%). Continue positive reinforcement incentives.`
      );
    }

    // Factual Summary sentence
    const summary = `Overall attendance stands at ${averageRate}% across ${totalSessions} sessions. ${
      frequentAbsentees.length > 0
        ? `${frequentAbsentees.length} student(s) identified with frequent absences requiring monitoring.`
        : 'All students are currently within normal attendance tolerance thresholds.'
    }`;

    return {
      summary,
      totalSessionsAnalyzed: totalSessions,
      averageAttendanceRate: averageRate,
      frequentAbsentees,
      trends: {
        dayOfWeekBreakdown,
        recentSessions,
        consecutiveAbsenceAlerts: consecutiveAlerts,
      },
      recommendations,
    };
  },

  /**
   * Generates a formal, personalized guardian notification letter
   */
  generateGuardianAlertEmail(
    student: Student,
    absentCount: number,
    totalClasses: number,
    subjectName?: string
  ): { subject: string; body: string } {
    const absenceRate = Math.round((absentCount / totalClasses) * 100);
    const subject = `Official Attendance Notice: ${student.first_name} ${student.last_name} (${student.roll_number})`;
    
    const body = `Dear ${student.guardian_name || 'Parent/Guardian'},

This is an automated attendance notice from AlphabetAI Attendance System regarding your student, ${student.first_name} ${student.last_name} (Roll No: ${student.roll_number}).

Our records indicate that ${student.first_name} has been marked absent for ${absentCount} out of ${totalClasses} recent class sessions (${absenceRate}% absence rate)${subjectName ? ` in ${subjectName}` : ''}.

Consistent attendance is critical for academic progress and comprehension. If these absences were due to illness, emergency, or an authorized circumstance, please submit an official excuse note or reply directly to this notification.

Student Details:
- Student Name: ${student.first_name} ${student.last_name}
- Roll Number: ${student.roll_number}
- Recorded Absences: ${absentCount}
- Overall Attendance Rate: ${100 - absenceRate}%

Thank you for your partnership in supporting ${student.first_name}'s academic journey.

Sincerely,
Academic Attendance Office
AlphabetAI Attendance Management`;

    return { subject, body };
  },
};
