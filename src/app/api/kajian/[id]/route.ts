import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await verifySession();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.kajian.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Data Kajian berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data kajian" },
      { status: 500 }
    );
  }
}
