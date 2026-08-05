"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, ShieldCheck, UserCheck, Users } from "lucide-react";

interface NavbarProps {
  username?: string;
  role?: string;
  onOpenUserModal?: () => void;
}

export default function Navbar({ username = "Admin", role = "ADMIN", onOpenUserModal }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Rekap Kehadiran Kajian
            </h1>
            <p className="text-xs text-emerald-400 font-medium">
              Sistem Poin Kehadiran Orang Tua Siswa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Admin: {username}</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span className="text-teal-300 font-bold">Viewer: {username}</span>
              </>
            )}
          </div>

          {/* Admin User Management Button */}
          {isAdmin && onOpenUserModal && (
            <button
              onClick={onOpenUserModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-bold transition-all shadow-sm"
              title="Kelola User & Hak Akses Sekolah"
            >
              <Users className="w-4 h-4" />
              <span>Kelola User</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-800/50 border border-slate-700 text-slate-300 text-sm font-medium transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
