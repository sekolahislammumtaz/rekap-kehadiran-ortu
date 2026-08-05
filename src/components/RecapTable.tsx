"use client";

import { useState } from "react";
import {
  Download,
  Search,
  Filter,
  Info,
  Calendar,
  X,
  Trash2,
  ListOrdered,
  Award,
} from "lucide-react";

export interface StudentHistory {
  kajianId: string;
  kajianTitle: string;
  kajianDate: string;
  ayahStatus: string | null;
  bundaStatus: string | null;
  points: number;
}

export interface RekapItem {
  id: string;
  namaSiswa: string;
  divisi: string;
  poinKehadiran: number;
  daftarKajian: string;
  daftarNamaKajianOnly: string;
  history: StudentHistory[];
  totalEvents: number;
}

export interface KajianSession {
  id: string;
  title: string;
  date: string;
  _count: { attendances: number };
}

interface RecapTableProps {
  data: RekapItem[];
  divisions: string[];
  selectedDivision: string;
  onDivisionChange: (division: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  kajianList: KajianSession[];
  onKajianDeleted: () => void;
}

export default function RecapTable({
  data,
  divisions,
  selectedDivision,
  onDivisionChange,
  searchQuery,
  onSearchChange,
  kajianList,
  onKajianDeleted,
}: RecapTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<RekapItem | null>(null);
  const [showKajianManager, setShowKajianManager] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleExport = () => {
    const url = `/api/export?division=${encodeURIComponent(selectedDivision)}`;
    window.location.href = url;
  };

  const handleDeleteKajian = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data kajian "${title}"? Seluruh poin dari kajian ini akan terhapus.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/kajian/${id}`, { method: "DELETE" });
      if (res.ok) {
        onKajianDeleted();
      } else {
        alert("Gagal menghapus kajian");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllKajian = async () => {
    if (!confirm("PERINGATAN! Anda yakin ingin MENGHAPUS SELURUH data sesi kajian dan reset total poin semua siswa?")) {
      return;
    }

    setDeletingId("all");
    try {
      const res = await fetch("/api/kajian/all", { method: "DELETE" });
      if (res.ok) {
        onKajianDeleted();
        setShowKajianManager(false);
      } else {
        alert("Gagal menghapus seluruh sesi kajian");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Export Header */}
      <div className="glass-card p-5 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Division Dropdown & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Division Selector */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedDivision}
              onChange={(e) => onDivisionChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl glass-input text-sm text-white font-semibold cursor-pointer appearance-none bg-slate-900/90"
            >
              <option value="Semua Divisi">Semua Divisi ({divisions.length})</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  Divisi: {div}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              ▼
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKajianManager(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            title="Kelola & Hapus Sesi Kajian"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Kelola & Hapus Sesi ({kajianList.length})</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel ({selectedDivision})</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tabel Rekap Poin Kehadiran Orang Tua
            </h3>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Menampilkan <span className="text-emerald-400 font-bold">{data.length}</span> Siswa
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Divisi</th>
                <th className="py-3.5 px-4 text-center">Poin Kehadiran</th>
                <th className="py-3.5 px-4">Daftar Nama Kajian</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Belum ada data rekap. Silakan impor file Excel di atas.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 text-center text-xs font-medium text-slate-500">
                      {index + 1}
                    </td>

                    <td className="py-4 px-4 font-bold text-white">
                      {item.namaSiswa}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-teal-300 border border-slate-700">
                        {item.divisi}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                          item.poinKehadiran > 0
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-700/60"
                            : item.poinKehadiran < 0
                            ? "bg-rose-950 text-rose-400 border border-rose-700/60"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {item.poinKehadiran > 0 ? `+${item.poinKehadiran}` : item.poinKehadiran} Poin
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-300 max-w-md leading-relaxed">
                      {item.daftarKajian || "-"}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedStudent(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedStudent.namaSiswa}
                </h3>
                <p className="text-xs text-teal-400 font-medium">
                  Divisi: {selectedStudent.divisi}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-medium text-slate-300">Poin Kehadiran</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {selectedStudent.poinKehadiran > 0 ? `+${selectedStudent.poinKehadiran}` : selectedStudent.poinKehadiran} Poin
                </span>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
                Riwayat Kehadiran per Kajian:
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedStudent.history.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{h.kajianTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tgl: {h.kajianDate} | Ayah: <span className={h.ayahStatus === "Hadir" ? "text-emerald-400" : "text-rose-400"}>{h.ayahStatus || "-"}</span>, Bunda: <span className={h.bundaStatus === "Hadir" ? "text-emerald-400" : "text-rose-400"}>{h.bundaStatus || "-"}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-md font-bold ${
                        h.points > 0 ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"
                      }`}
                    >
                      {h.points > 0 ? "+1" : "-1"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kajian Manager Modal */}
      {showKajianManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Kelola & Hapus Sesi Kajian
              </h3>
              <button
                onClick={() => setShowKajianManager(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Menghapus sesi kajian akan secara otomatis menghapus seluruh poin kehadiran yang terkait dengan sesi tersebut.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {kajianList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Belum ada sesi kajian yang terimpor.</p>
              ) : (
                kajianList.map((k) => (
                  <div
                    key={k.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{k.title}</div>
                      <div className="text-slate-400 mt-0.5">
                        Tanggal: <span className="text-slate-300 font-medium">{k.date}</span> &bull; Total Tercatat: <span className="text-emerald-400 font-bold">{k._count.attendances} Siswa</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKajian(k.id, k.title)}
                      disabled={deletingId === k.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                      title="Hapus Sesi Kajian Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === k.id ? "Hapus..." : "Hapus Sesi"}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {kajianList.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteAllKajian}
                  disabled={deletingId === "all"}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus SELURUH Sesi & Reset Data</span>
                </button>
                <button
                  onClick={() => setShowKajianManager(false)}
                  className="w-full sm:flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Tutup
                </button>
              </div>
            )}

            {kajianList.length === 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowKajianManager(false)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
