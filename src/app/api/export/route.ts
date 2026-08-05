import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { generateRecapExcelBuffer } from "@/lib/excel-exporter";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const divisionFilter = searchParams.get("division") || "Semua Divisi";

    let students = await prisma.student.findMany({
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

    // Enforce VIEWER permissions
    if (session.role === "VIEWER") {
      const allowedLower = session.allowedDivisions.map((d) => d.toLowerCase());
      students = students.filter((s) => allowedLower.includes(s.division.toLowerCase()));
    }

    if (divisionFilter !== "Semua Divisi") {
      students = students.filter(
        (s) => s.division.toLowerCase() === divisionFilter.toLowerCase()
      );
    }

    const exportItems = students.map((s, index) => {
      const totalPoints = s.attendances.reduce((acc, curr) => acc + curr.points, 0);

      const kajianListWithPoints = s.attendances.map((att) => {
        const sign = att.points > 0 ? `+${att.points}` : `${att.points}`;
        return `${att.kajian.title} (${sign})`;
      });

      const detailHistory = s.attendances
        .map((att) => `${att.kajian.title} [Ayah: ${att.ayahStatus || "-"}, Bunda: ${att.bundaStatus || "-"}] = ${att.points > 0 ? "+1" : "-1"}`)
        .join(" | ");

      return {
        no: index + 1,
        namaSiswa: s.name,
        divisi: s.division,
        poinKehadiran: totalPoints,
        daftarKajian: kajianListWithPoints.join(", "),
        detailKehadiran: detailHistory,
      };
    });

    const excelBuffer = generateRecapExcelBuffer(exportItems, divisionFilter);

    const filename = `Rekap_Kehadiran_Kajian_${divisionFilter.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(excelBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export Excel error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengekspor file Excel" },
      { status: 500 }
    );
  }
}
