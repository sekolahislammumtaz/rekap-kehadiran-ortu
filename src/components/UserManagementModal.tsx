"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, X, CheckSquare, Square, Key, User as UserIcon, ShieldAlert, CheckCircle2 } from "lucide-react";

export interface UserItem {
  id: string;
  username: string;
  role: string;
  allowedDivisionsList: string[];
  createdAt: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDivisions: string[];
}

export default function UserManagementModal({
  isOpen,
  onClose,
  availableDivisions,
}: UserManagementModalProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [customDivision, setCustomDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch {
      console.error("Gagal mengambil data user");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDivision = (divisionName: string) => {
    setSelectedDivisions((prev) =>
      prev.includes(divisionName)
        ? prev.filter((d) => d !== divisionName)
        : [...prev, divisionName]
    );
  };

  const handleAddCustomDivision = () => {
    if (customDivision.trim() && !selectedDivisions.includes(customDivision.trim())) {
      setSelectedDivisions((prev) => [...prev, customDivision.trim()]);
      setCustomDivision("");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg("Username dan Password wajib diisi!");
      return;
    }
    if (selectedDivisions.length === 0) {
      setErrorMsg("Pilih minimal 1 sekolah/divisi yang diizinkan untuk user ini!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          allowedDivisions: selectedDivisions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat user baru");
      }

      setSuccessMsg(`User Viewer "${data.user.username}" berhasil ditambahkan!`);
      setUsername("");
      setPassword("");
      setSelectedDivisions([]);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Hapus akun user "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Gagal menghapus user");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  };

  // Combine divisions list
  const allDivisionOptions = Array.from(
    new Set([...availableDivisions, ...selectedDivisions])
  ).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-slate-700 p-6 space-y-6 shadow-2xl bg-slate-900 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Kelola Akun User (Read-Only per Sekolah)
              </h3>
              <p className="text-xs text-slate-400">
                Buat user baru dan tentukan sekolah mana saja yang boleh dilihat oleh user tersebut
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          {/* Create User Form */}
          <form onSubmit={handleCreateUser} className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 bg-slate-950/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </h4>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Contoh: user_sd"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password user"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Division Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Checklist Sekolah / Divisi yang Diizinkan Dilihat oleh User Ini:
              </label>

              {allDivisionOptions.length === 0 ? (
                <p className="text-xs text-amber-400 italic bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
                  Belum ada data sekolah/divisi terdaftar. Silakan impor Excel terlebih dahulu atau tambah nama sekolah secara manual di bawah.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  {allDivisionOptions.map((div) => {
                    const isChecked = selectedDivisions.includes(div);
                    return (
                      <button
                        type="button"
                        key={div}
                        onClick={() => toggleDivision(div)}
                        className={`flex items-center space-x-2.5 p-2 rounded-lg text-xs font-medium text-left transition border ${
                          isChecked
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/80 font-bold"
                            : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{div}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Add Custom Division Name if needed */}
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Tambah nama sekolah manual..."
                  value={customDivision}
                  onChange={(e) => setCustomDivision(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDivision}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  Tambah
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? "Menyimpan User..." : "Simpan & Buat User Baru"}
            </button>
          </form>

          {/* Existing Users List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar User Viewer Terdaftar:
            </h4>

            {users.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada user viewer yang dibuat.</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{u.username}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-950 text-teal-300 border border-teal-800">
                          Viewer (Read-Only)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center pt-0.5">
                        <span className="text-[11px] text-slate-400">Akses Sekolah:</span>
                        {u.allowedDivisionsList.length === 0 ? (
                          <span className="text-slate-500 italic">Tidak ada</span>
                        ) : (
                          u.allowedDivisionsList.map((d) => (
                            <span key={d} className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 text-[11px] border border-slate-700">
                              {d}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      disabled={deletingId === u.id}
                      className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/50 transition disabled:opacity-50 shrink-0"
                      title="Hapus Akun User Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
