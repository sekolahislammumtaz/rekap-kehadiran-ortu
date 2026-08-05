"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, BookOpen, User, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || "admin",
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal. Cek kembali Username dan Password Anda.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/20 mb-2">
            <BookOpen className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Rekap Kehadiran Kajian
          </h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            Portal Rekap & Perhitungan Poin Kehadiran
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold uppercase tracking-wider mb-6 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Login Pengguna</span>
            </div>
            <span className="text-[10px] text-slate-400 lowercase">Admin / Viewer</span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="admin atau username anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
              >
                <span>{loading ? "Memverifikasi..." : "Masuk Sistem"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500">
          Aplikasi Rekap Kehadiran Kajian Orang Tua Siswa &copy; 2026
        </p>
      </div>
    </div>
  );
}
