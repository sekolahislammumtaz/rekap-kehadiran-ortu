import * as XLSX from "xlsx";
import { parseExcelAttendance } from "../src/lib/excel-parser";

function testParserLogic() {
  const sampleRows = [
    // Case 1: Ayah Hadir, Bunda absent -> +1
    { "Nama Peserta": "Ayah Siswa Alpha", "Divisi": "SD", "Status Kehadiran": "Hadir" },
    
    // Case 2: Ayah absent, Bunda Hadir -> +1
    { "Nama Peserta": "Bunda Siswa Beta", "Divisi": "SD", "Status Kehadiran": "Hadir" },
    { "Nama Peserta": "Ayah Siswa Beta", "Divisi": "SD", "Status Kehadiran": "Belum Hadir" },

    // Case 3: Ayah Hadir, Bunda Hadir -> +1
    { "Nama Peserta": "Ayah Siswa Gamma", "Divisi": "TK", "Status Kehadiran": "Hadir" },
    { "Nama Peserta": "Bunda Siswa Gamma", "Divisi": "TK", "Status Kehadiran": "Hadir" },

    // Case 4: Ayah Belum Hadir, Bunda Belum Hadir -> -1
    { "Nama Peserta": "Ayah Siswa Delta", "Divisi": "SMP", "Status Kehadiran": "Belum Hadir" },
    { "Nama Peserta": "Bunda Siswa Delta", "Divisi": "SMP", "Status Kehadiran": "Belum Hadir" },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  const result = parseExcelAttendance(buffer);

  console.log("=== PARSER TEST RESULTS ===");
  result.results.forEach((res) => {
    console.log(`Siswa: ${res.studentName} (${res.division}) | Ayah: ${res.ayahStatus || "-"}, Bunda: ${res.bundaStatus || "-"} => Points: ${res.points}`);
  });

  const alpha = result.results.find(r => r.studentName === "Siswa Alpha");
  const beta = result.results.find(r => r.studentName === "Siswa Beta");
  const gamma = result.results.find(r => r.studentName === "Siswa Gamma");
  const delta = result.results.find(r => r.studentName === "Siswa Delta");

  if (alpha?.points === 1 && beta?.points === 1 && gamma?.points === 1 && delta?.points === -1) {
    console.log("SUCCESS: All point calculation rules passed perfectly!");
  } else {
    console.error("FAILED: Point rules discrepancy found.");
    process.exit(1);
  }
}

testParserLogic();
