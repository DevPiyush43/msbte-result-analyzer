import ExcelJS from "exceljs";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";

const HEADER_STYLE = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF44546A' } },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
};

const CELL_STYLE = {
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
};

const applyStyles = (row, startCol, endCol, isHeader = false) => {
  for (let i = startCol; i <= endCol; i++) {
    const cell = row.getCell(i);
    Object.assign(cell, isHeader ? HEADER_STYLE : CELL_STYLE);
  }
};

/**
 * Generate 4 separate Excel reports for a batch
 */
export const generateReports = async (batch) => {
  const reports = {};

  // 1. PASS STUDENTS
  const passWb = new ExcelJS.Workbook();
  const passSheet = passWb.addWorksheet("Pass Students");
  passSheet.addRow(["Seat Number", "Student Name", "Percentage", "Result", "KT Count"]);
  applyStyles(passSheet.getRow(1), 1, 5, true);

  const passStudents = batch.results.filter(r => (r.resultStatus || "").toLowerCase() === "pass");
  passStudents.forEach(r => {
    // Drop rule is handled during parsing/saving, but we filter here too if needed
    const row = passSheet.addRow([
      r.seatNumber || r.enrollmentNumber,
      r.name || "N/A",
      r.percentage || 0,
      r.resultStatus,
      calculateKTCount(r)
    ]);
    applyStyles(row, 1, 5);
  });
  reports.pass_students = await passWb.xlsx.writeBuffer();

  // 2. FAIL STUDENTS
  const failWb = new ExcelJS.Workbook();
  const failSheet = failWb.addWorksheet("Fail Students");
  failSheet.addRow(["Seat Number", "Student Name", "Failed Subjects", "KT Count", "Status"]);
  applyStyles(failSheet.getRow(1), 1, 5, true);

  const failStudents = batch.results.filter(r => 
    (r.resultStatus || "").toLowerCase() === "fail" || 
    (calculateKTCount(r) >= 4)
  );
  failStudents.forEach(r => {
    const ktCount = calculateKTCount(r);
    const row = failSheet.addRow([
      r.seatNumber || r.enrollmentNumber,
      r.name || "N/A",
      getFailedSubjects(r).join(", "),
      ktCount,
      ktCount >= 4 ? "DROPPED" : "FAIL"
    ]);
    applyStyles(row, 1, 5);
  });
  reports.fail_students = await failWb.xlsx.writeBuffer();

  // 3. RESULT SUMMARY
  const summaryWb = new ExcelJS.Workbook();
  const summarySheet = summaryWb.addWorksheet("Result Summary");
  summarySheet.addRow(["Total Students", "Total Pass", "Total Fail", "Dropped", "Pass %", "Fail %"]);
  applyStyles(summarySheet.getRow(1), 1, 6, true);

  const total = batch.results.length;
  const passCount = passStudents.length;
  const failCount = batch.results.filter(r => (r.resultStatus || "").toLowerCase() === "fail").length;
  const droppedCount = batch.results.filter(r => calculateKTCount(r) >= 4).length;

  const summaryRow = summarySheet.addRow([
    total,
    passCount,
    failCount,
    droppedCount,
    total > 0 ? ((passCount / total) * 100).toFixed(2) + "%" : "0%",
    total > 0 ? ((failCount / total) * 100).toFixed(2) + "%" : "0%"
  ]);
  applyStyles(summaryRow, 1, 6);
  reports.result_summary = await summaryWb.xlsx.writeBuffer();

  // 4. KT ANALYSIS
  const ktWb = new ExcelJS.Workbook();
  const ktSheet = ktWb.addWorksheet("KT Analysis");
  ktSheet.addRow(["Seat Number", "Student Name", "Number of KTs", "Subjects with KT"]);
  applyStyles(ktSheet.getRow(1), 1, 4, true);

  batch.results.forEach(r => {
    const kts = getFailedSubjects(r);
    if (kts.length > 0) {
      const row = ktSheet.addRow([
        r.seatNumber || r.enrollmentNumber,
        r.name || "N/A",
        kts.length,
        kts.join(", ")
      ]);
      applyStyles(row, 1, 4);
    }
  });
  reports.kt_analysis = await ktWb.xlsx.writeBuffer();

  return reports;
};

const calculateKTCount = (student) => {
  if (!student.subjectMarks) return 0;
  let count = 0;
  for (const marks of Object.values(student.subjectMarks)) {
      // Logic for KT: typically a '*' in totalObt or specifically failing marks
      if (typeof marks.totalObt === 'string' && marks.totalObt.includes('*')) {
          count++;
      }
  }
  return count;
};

const getFailedSubjects = (student) => {
  if (!student.subjectMarks) return [];
  const failed = [];
  for (const [subject, marks] of Object.entries(student.subjectMarks)) {
      if (typeof marks.totalObt === 'string' && marks.totalObt.includes('*')) {
          failed.push(subject);
      }
  }
  return failed;
};
