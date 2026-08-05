import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "simumtaz_default_secret_key_rekap_kajian_2026"
);

const COOKIE_NAME = "admin_session";

export interface UserSession {
  id: string;
  username: string;
  role: "ADMIN" | "VIEWER";
  allowedDivisions: string[];
}

export async function createSession(sessionData: UserSession) {
  const token = await new SignJWT({ ...sessionData })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function verifySession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as unknown as UserSession;

    if (!payload.username || !payload.role) {
      return null;
    }

    return {
      id: payload.id || "admin",
      username: payload.username,
      role: payload.role,
      allowedDivisions: payload.allowedDivisions || [],
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function authenticateUser(usernameInput: string, passwordInput: string): Promise<UserSession | null> {
  const adminPassword = process.env.ADMIN_PASSWORD || "Simumtaz123";
  const trimmedUsername = usernameInput.trim();

  // 1. Check Default Admin Account
  if ((trimmedUsername.toLowerCase() === "admin" || trimmedUsername === "") && passwordInput === adminPassword) {
    return {
      id: "admin-id",
      username: "admin",
      role: "ADMIN",
      allowedDivisions: [], // Empty means ALL divisions allowed
    };
  }

  // Fallback: If user enters username "admin" with password
  if (trimmedUsername.toLowerCase() === "admin" && passwordInput === adminPassword) {
    return {
      id: "admin-id",
      username: "admin",
      role: "ADMIN",
      allowedDivisions: [],
    };
  }

  // 2. Check Database Users
  try {
    const dbUser = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    if (dbUser && dbUser.password === passwordInput) {
      let allowed: string[] = [];
      try {
        allowed = JSON.parse(dbUser.allowedDivisions || "[]");
      } catch {
        allowed = [];
      }

      return {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role as "ADMIN" | "VIEWER",
        allowedDivisions: allowed,
      };
    }
  } catch (error) {
    console.error("Auth DB Error:", error);
  }

  return null;
}
