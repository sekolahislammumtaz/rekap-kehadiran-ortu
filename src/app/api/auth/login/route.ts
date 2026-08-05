import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
    }

    const session = await authenticateUser(username || "admin", password);
    if (!session) {
      return NextResponse.json({ error: "Username atau Password salah!" }, { status: 401 });
    }

    await createSession(session);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        username: session.username,
        role: session.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
