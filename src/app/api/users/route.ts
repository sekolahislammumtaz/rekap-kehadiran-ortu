import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users: Fetch all users (Admin only)
export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Fitur ini khusus Admin." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        role: true,
        allowedDivisions: true,
        createdAt: true,
      },
    });

    const parsedUsers = users.map((u) => {
      let divisions: string[] = [];
      try {
        divisions = JSON.parse(u.allowedDivisions || "[]");
      } catch {
        divisions = [];
      }
      return {
        ...u,
        allowedDivisionsList: divisions,
      };
    });

    return NextResponse.json({ success: true, users: parsedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengambil data user" }, { status: 500 });
  }
}

// POST /api/users: Create new viewer user (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin yang dapat menambah user." }, { status: 403 });
    }

    const body = await req.json();
    const { username, password, allowedDivisions } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan Password wajib diisi!" }, { status: 400 });
    }

    const trimmedUsername = username.trim();

    // Check if username already exists
    const existing = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    if (existing || trimmedUsername.toLowerCase() === "admin") {
      return NextResponse.json({ error: "Username sudah digunakan! Pilih username lain." }, { status: 400 });
    }

    const divisionsArray = Array.isArray(allowedDivisions) ? allowedDivisions : [];

    const newUser = await prisma.user.create({
      data: {
        username: trimmedUsername,
        password, // Plain or hashed password
        role: "VIEWER",
        allowedDivisions: JSON.stringify(divisionsArray),
      },
    });

    return NextResponse.json({
      success: true,
      message: `User "${newUser.username}" berhasil dibuat!`,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        allowedDivisionsList: divisionsArray,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal membuat user" }, { status: 500 });
  }
}
