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
      return NextResponse.json(
        { error: "Akses ditolak. Menghapus data siswa hanya dapat dilakukan oleh Admin." },
        { status: 403 }
      );
    }

    const { id } = params;

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan!" }, { status: 404 });
    }

    // Delete student (Cascades and deletes attendance records)
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Data siswa "${student.name}" berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data siswa" },
      { status: 500 }
    );
  }
}
