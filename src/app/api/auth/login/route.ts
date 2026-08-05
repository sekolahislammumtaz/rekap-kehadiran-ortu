import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
    }

    const isValid = checkAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    await createSession();

    return NextResponse.json({ success: true, message: "Login berhasil" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
