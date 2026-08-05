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
      return NextResponse.json({ error: "Akses ditolak. Fitur ini khusus Admin." }, { status: 403 });
    }

    const { id } = params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus user" }, { status: 500 });
  }
}
