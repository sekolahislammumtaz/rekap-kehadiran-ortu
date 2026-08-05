import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { parseExcelAttendance } from "@/lib/excel-parser";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await verifySession();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized. Silakan login admin." }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const file = formData.get("file") as File;

    if (!title || !date || !file) {
      return NextResponse.json(
        { error: "Nama Kajian, Tanggal Kajian, dan File Excel wajib diisi!" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = parseExcelAttendance(buffer);

    if (parseResult.results.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data kehadiran yang valid ditemukan dalam file Excel!" },
        { status: 400 }
      );
    }

    // 1. Create Kajian Record
    const kajian = await prisma.kajian.create({
      data: {
        title,
        date,
      },
    });

    let newStudentsCount = 0;
    let recordsCreated = 0;

    // 2. Upsert Students and Attendance Records
    for (const item of parseResult.results) {
      // Find or create student
      let student = await prisma.student.findFirst({
        where: {
          name: { equals: item.studentName, mode: "insensitive" },
          division: { equals: item.division, mode: "insensitive" },
        },
      });

      if (!student) {
        student = await prisma.student.create({
          data: {
            name: item.studentName,
            division: item.division,
          },
        });
        newStudentsCount++;
      }

      // Upsert Attendance Record for this Kajian
      await prisma.attendanceRecord.upsert({
        where: {
          studentId_kajianId: {
            studentId: student.id,
            kajianId: kajian.id,
          },
        },
        update: {
          ayahStatus: item.ayahStatus,
          bundaStatus: item.bundaStatus,
          points: item.points,
        },
        create: {
          studentId: student.id,
          kajianId: kajian.id,
          ayahStatus: item.ayahStatus,
          bundaStatus: item.bundaStatus,
          points: item.points,
        },
      });

      recordsCreated++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor data ${title}`,
      summary: {
        kajianTitle: title,
        kajianDate: date,
        totalSiswaTerproses: recordsCreated,
        siswaBaru: newStudentsCount,
        totalRowFile: parseResult.rawRowCount,
      },
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengimpor file Excel" },
      { status: 500 }
    );
  }
}
