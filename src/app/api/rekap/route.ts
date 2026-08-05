import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await verifySession();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const divisionFilter = searchParams.get("division");
    const searchQuery = searchParams.get("search");

    // Fetch all students with attendances and kajian info
    const students = await prisma.student.findMany({
      include: {
        attendances: {
          include: {
            kajian: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: [
        { division: "asc" },
        { name: "asc" },
      ],
    });

    // Fetch distinct divisions
    const divisionsList = Array.from(new Set(students.map((s) => s.division))).sort();

    // Map student records to display format
    let rekapData = students.map((s) => {
      const totalPoints = s.attendances.reduce((acc, curr) => acc + curr.points, 0);

      // List of kajian titles and points earned per kajian
      const kajianList = s.attendances.map((att) => {
        const sign = att.points > 0 ? `+${att.points}` : `${att.points}`;
        return `${att.kajian.title} (${sign})`;
      });

      const kajianTitlesOnly = s.attendances.map((att) => att.kajian.title);

      const historyDetail = s.attendances.map((att) => ({
        kajianId: att.kajianId,
        kajianTitle: att.kajian.title,
        kajianDate: att.kajian.date,
        ayahStatus: att.ayahStatus,
        bundaStatus: att.bundaStatus,
        points: att.points,
      }));

      return {
        id: s.id,
        namaSiswa: s.name,
        divisi: s.division,
        poinKehadiran: totalPoints,
        daftarKajian: kajianList.join(", "),
        daftarNamaKajianOnly: Array.from(new Set(kajianTitlesOnly)).join(", "),
        history: historyDetail,
        totalEvents: s.attendances.length,
      };
    });

    // Filter by division if specified
    if (divisionFilter && divisionFilter !== "Semua Divisi") {
      rekapData = rekapData.filter(
        (item) => item.divisi.toLowerCase() === divisionFilter.toLowerCase()
      );
    }

    // Filter by search query if specified
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rekapData = rekapData.filter(
        (item) =>
          item.namaSiswa.toLowerCase().includes(q) ||
          item.divisi.toLowerCase().includes(q)
      );
    }

    // Also get list of all Kajian sessions for admin management
    const allKajian = await prisma.kajian.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      divisions: divisionsList,
      data: rekapData,
      totalStudents: students.length,
      totalKajian: allKajian.length,
      kajianList: allKajian,
    });
  } catch (error: any) {
    console.error("Fetch rekap error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data rekap" },
      { status: 500 }
    );
  }
}
