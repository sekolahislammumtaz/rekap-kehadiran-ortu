import * as XLSX from "xlsx";

export interface ParsedRow {
  parentType: "Ayah" | "Bunda" | "Orang Tua";
  studentName: string;
  division: string;
  status: "Hadir" | "Belum Hadir";
  rawParticipantName: string;
}

export interface StudentKajianResult {
  studentName: string;
  division: string;
  ayahStatus: "Hadir" | "Belum Hadir" | null;
  bundaStatus: "Hadir" | "Belum Hadir" | null;
  points: number; // +1 or -1
}

export interface ParseResult {
  results: StudentKajianResult[];
  rawRowCount: number;
  unrecognizedRows: string[];
}

/**
 * Extracts parent type ("Ayah"/"Bunda") and student name from raw participant string.
 * Example: "Ayah Muhammad Ali" -> { parentType: "Ayah", studentName: "Muhammad Ali" }
 * Example: "Bunda Siti Aisyah" -> { parentType: "Bunda", studentName: "Siti Aisyah" }
 */
export function parseParticipantName(rawName: string): { parentType: "Ayah" | "Bunda" | "Orang Tua"; studentName: string } {
  const trimmed = rawName.trim();

  const ayahRegex = /^(ayah|bapak|papi|abi)\s+(.+)$/i;
  const bundaRegex = /^(bunda|ibu|mami|umi)\s+(.+)$/i;

  const ayahMatch = trimmed.match(ayahRegex);
  if (ayahMatch) {
    return {
      parentType: "Ayah",
      studentName: ayahMatch[2].trim(),
    };
  }

  const bundaMatch = trimmed.match(bundaRegex);
  if (bundaMatch) {
    return {
      parentType: "Bunda",
      studentName: bundaMatch[2].trim(),
    };
  }

  // Fallback if no Ayah/Bunda prefix
  return {
    parentType: "Orang Tua",
    studentName: trimmed,
  };
}

/**
 * Parses an Excel buffer into structured student attendance data for a single Kajian session.
 */
export function parseExcelAttendance(fileBuffer: Buffer): ParseResult {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

  const rawRows: ParsedRow[] = [];
  const unrecognizedRows: string[] = [];

  for (const row of jsonData) {
    // Find column keys flexibly
    const keys = Object.keys(row);

    const participantKey = keys.find(k => /nama\s*peserta|peserta|nama\s*orang\s*tua/i.test(k)) || keys.find(k => /nama/i.test(k));
    const divisionKey = keys.find(k => /divisi|sekolah|unit|kelas/i.test(k));
    const statusKey = keys.find(k => /status\s*kehadiran|status|kehadiran/i.test(k));

    if (!participantKey || !statusKey) {
      continue;
    }

    const rawParticipant = String(row[participantKey] || "").trim();
    const rawDivision = divisionKey ? String(row[divisionKey] || "").trim() : "Umum";
    const rawStatus = String(row[statusKey] || "").trim();

    if (!rawParticipant) continue;

    const { parentType, studentName } = parseParticipantName(rawParticipant);

    let statusClean: "Hadir" | "Belum Hadir" = "Belum Hadir";
    if (/hadir|h|present|1/i.test(rawStatus) && !/belum/i.test(rawStatus)) {
      statusClean = "Hadir";
    }

    if (!studentName) {
      unrecognizedRows.push(rawParticipant);
      continue;
    }

    rawRows.push({
      parentType,
      studentName,
      division: rawDivision || "Umum",
      status: statusClean,
      rawParticipantName: rawParticipant,
    });
  }

  // Group by studentName + division
  const studentMap = new Map<string, {
    studentName: string;
    division: string;
    ayahStatus: "Hadir" | "Belum Hadir" | null;
    bundaStatus: "Hadir" | "Belum Hadir" | null;
    genericStatus: "Hadir" | "Belum Hadir" | null;
  }>();

  for (const item of rawRows) {
    const key = `${item.studentName.toLowerCase()}_${item.division.toLowerCase()}`;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentName: item.studentName,
        division: item.division,
        ayahStatus: null,
        bundaStatus: null,
        genericStatus: null,
      });
    }

    const entry = studentMap.get(key)!;

    if (item.parentType === "Ayah") {
      // If Ayah appears multiple times, "Hadir" overrides "Belum Hadir"
      if (entry.ayahStatus !== "Hadir") {
        entry.ayahStatus = item.status;
      }
    } else if (item.parentType === "Bunda") {
      if (entry.bundaStatus !== "Hadir") {
        entry.bundaStatus = item.status;
      }
    } else {
      if (entry.genericStatus !== "Hadir") {
        entry.genericStatus = item.status;
      }
    }
  }

  // Calculate points according to rule:
  // - If Ayah OR Bunda OR generic is "Hadir" -> +1
  // - If NO ONE is "Hadir" (all registered are "Belum Hadir") -> -1
  const results: StudentKajianResult[] = [];

  for (const [, entry] of studentMap) {
    const hasHadir =
      entry.ayahStatus === "Hadir" ||
      entry.bundaStatus === "Hadir" ||
      entry.genericStatus === "Hadir";

    const points = hasHadir ? 1 : -1;

    results.push({
      studentName: entry.studentName,
      division: entry.division,
      ayahStatus: entry.ayahStatus,
      bundaStatus: entry.bundaStatus,
      points,
    });
  }

  return {
    results,
    rawRowCount: jsonData.length,
    unrecognizedRows,
  };
}
