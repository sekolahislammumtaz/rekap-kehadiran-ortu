import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hapus kajian khusus Admin." }, { status: 403 });
    }

    const { id } = params;

    if (id === "all") {
      // Delete all attendance records, kajian sessions, and students
      await prisma.attendanceRecord.deleteMany({});
      await prisma.kajian.deleteMany({});
      await prisma.student.deleteMany({});

      return NextResponse.json({
        success: true,
        message: "Seluruh data sesi kajian dan rekap berhasil dihapus.",
      });
    }

    // Delete single Kajian session (Cascades to attendance records)
    const deletedKajian = await prisma.kajian.delete({
      where: { id },
    });

    // Clean up orphaned students (students with 0 attendance records left)
    await prisma.student.deleteMany({
      where: {
        attendances: {
          none: {},
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data kajian "${deletedKajian.title}" dan seluruh data keikutsertaannya berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Delete kajian error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data kajian" },
      { status: 500 }
    );
  }
}
