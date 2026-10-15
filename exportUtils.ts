import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Student, AttendanceRecord, AttendanceSession, ClassItem, SectionItem, SubjectItem } from '../types';

export const ExportUtils = {
  /**
   * Export attendance session report as CSV
   */
  exportSessionCSV(
    session: AttendanceSession,
    students: Student[],
    records: AttendanceRecord[],
    cls?: ClassItem,
    sec?: SectionItem,
    sub?: SubjectItem
  ): void {
    const recordsMap = new Map(records.map((r) => [r.student_id, r]));

    const headers = [
      'Roll Number',
      'First Name',
      'Last Name',
      'Email',
      'Status',
      'Method',
      'Marked At',
      'Remarks',
    ];

    const rows = students.map((s) => {
      const rec = recordsMap.get(s.id);
      return [
        `"${s.roll_number}"`,
        `"${s.first_name}"`,
        `"${s.last_name}"`,
        `"${s.email}"`,
        `"${(rec?.status || 'unmarked').toUpperCase()}"`,
        `"${rec?.method || 'manual'}"`,
        `"${rec?.marked_at ? new Date(rec.marked_at).toLocaleTimeString() : ''}"`,
        `"${rec?.remarks || ''}"`,
      ];
    });

    const csvContent =
      `# AlphabetAI Attendance Export\n` +
      `# Date: ${session.date}\n` +
      `# Class: ${cls?.name || 'N/A'} - ${sec?.name || 'N/A'}\n` +
      `# Subject: ${sub?.name || 'N/A'}\n\n` +
      headers.join(',') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `AlphabetAI_Attendance_${session.date}_${cls?.code || 'Class'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export attendance session report as high-quality PDF
   */
  exportSessionPDF(
    session: AttendanceSession,
    students: Student[],
    records: AttendanceRecord[],
    cls?: ClassItem,
    sec?: SectionItem,
    sub?: SubjectItem
  ): void {
    const doc = new jsPDF();
    const recordsMap = new Map(records.map((r) => [r.student_id, r]));

    // Header styling
    doc.setFillColor(79, 70, 229); // Indigo #4F46E5
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AlphabetAI Attendance', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Attendance Roster & Audit Record', 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 26);

    // Meta details block
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const startY = 46;
    doc.text(`Date:`, 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${session.date}`, 32, startY);

    doc.setFont('helvetica', 'bold');
    doc.text(`Class:`, 75, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cls?.name || 'N/A'} (${sec?.name || 'N/A'})`, 92, startY);

    doc.setFont('helvetica', 'bold');
    doc.text(`Subject:`, 150, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sub?.name || 'N/A'}`, 168, startY);

    // Summary Counts
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    records.forEach((r) => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'late') lateCount++;
      else if (r.status === 'excused') excusedCount++;
    });

    const totalStudents = students.length;
    const rate =
      totalStudents > 0
        ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
        : 0;

    // Stat box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 52, 182, 16, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Total: ${totalStudents}   |   Present: ${presentCount}   |   Absent: ${absentCount}   |   Late: ${lateCount}   |   Excused: ${excusedCount}   |   Rate: ${rate}%`,
      20,
      62
    );

    // Table Data
    const tableData = students.map((s, idx) => {
      const rec = recordsMap.get(s.id);
      const statusText = rec ? rec.status.toUpperCase() : 'UNMARKED';
      return [
        (idx + 1).toString(),
        s.roll_number,
        `${s.first_name} ${s.last_name}`,
        s.email,
        statusText,
        rec?.remarks || '-',
      ];
    });

    autoTable(doc, {
      startY: 74,
      head: [['#', 'Roll No', 'Student Name', 'Email', 'Status', 'Remarks']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const status = data.cell.raw as string;
          if (status === 'PRESENT') {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'ABSENT') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'LATE') {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'EXCUSED') {
            data.cell.styles.textColor = [37, 99, 235];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    // Save PDF
    doc.save(`AlphabetAI_Attendance_${session.date}_${cls?.code || 'Class'}.pdf`);
  },

  /**
   * Generates and downloads a sample CSV file for importing students
   */
  downloadSampleImportCSV(): void {
    const csvContent =
      `roll_number,first_name,last_name,email,gender,guardian_name,guardian_email,guardian_phone,biometric_consent\n` +
      `R-201,Alexander,Hamilton,a.hamilton@student.alphabetai.edu,Male,James Hamilton,james.h@gmail.com,+1 (555) 987-6543,yes\n` +
      `R-202,Chloe,Bennet,chloe.b@student.alphabetai.edu,Female,Mary Bennet,mary.b@gmail.com,+1 (555) 876-5432,yes\n` +
      `R-203,Daniel,Craig,d.craig@student.alphabetai.edu,Male,Olivia Craig,olivia.c@gmail.com,+1 (555) 765-4321,no\n` +
      `R-204,Elena,Rostova,e.rostova@student.alphabetai.edu,Female,Ilya Rostov,ilya.r@gmail.com,+1 (555) 654-3210,yes\n` +
      `R-205,Felix,Vance,felix.vance@student.alphabetai.edu,Male,Grace Vance,grace.v@gmail.com,+1 (555) 543-2109,yes\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AlphabetAI_Sample_Student_Import.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Generates and downloads a sample Excel (.xlsx) file for importing students
   */
  downloadSampleImportExcel(): void {
    const data = [
      {
        roll_number: 'R-201',
        first_name: 'Alexander',
        last_name: 'Hamilton',
        email: 'a.hamilton@student.alphabetai.edu',
        gender: 'Male',
        guardian_name: 'James Hamilton',
        guardian_email: 'james.h@gmail.com',
        guardian_phone: '+1 (555) 987-6543',
        biometric_consent: 'yes',
      },
      {
        roll_number: 'R-202',
        first_name: 'Chloe',
        last_name: 'Bennet',
        email: 'chloe.b@student.alphabetai.edu',
        gender: 'Female',
        guardian_name: 'Mary Bennet',
        guardian_email: 'mary.b@gmail.com',
        guardian_phone: '+1 (555) 876-5432',
        biometric_consent: 'yes',
      },
      {
        roll_number: 'R-203',
        first_name: 'Daniel',
        last_name: 'Craig',
        email: 'd.craig@student.alphabetai.edu',
        gender: 'Male',
        guardian_name: 'Olivia Craig',
        guardian_email: 'olivia.c@gmail.com',
        guardian_phone: '+1 (555) 765-4321',
        biometric_consent: 'no',
      },
      {
        roll_number: 'R-204',
        first_name: 'Elena',
        last_name: 'Rostova',
        email: 'e.rostova@student.alphabetai.edu',
        gender: 'Female',
        guardian_name: 'Ilya Rostov',
        guardian_email: 'ilya.r@gmail.com',
        guardian_phone: '+1 (555) 654-3210',
        biometric_consent: 'yes',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'AlphabetAI_Sample_Student_Import.xlsx');
  },
};
