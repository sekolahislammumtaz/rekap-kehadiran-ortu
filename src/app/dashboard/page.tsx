"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import StatsCards from "@/components/StatsCards";
import ExcelImporter from "@/components/ExcelImporter";
import RecapTable, { RekapItem, KajianSession } from "@/components/RecapTable";
import UserManagementModal from "@/components/UserManagementModal";

export default function DashboardPage() {
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("Semua Divisi");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [totalKajianCount, setTotalKajianCount] = useState<number>(0);
  const [kajianList, setKajianList] = useState<KajianSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // User session state
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: string;
    allowedDivisions: string[];
  }>({
    username: "Admin",
    role: "ADMIN",
    allowedDivisions: [],
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Check current user session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error("Session check error:", err));
  }, []);

  const fetchRekap = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedDivision !== "Semua Divisi") {
        queryParams.set("division", selectedDivision);
      }
      if (searchQuery) {
        queryParams.set("search", searchQuery);
      }

      const res = await fetch(`/api/rekap?${queryParams.toString()}`);
      const result = await res.json();

      if (res.ok && result.success) {
        setRekapData(result.data);
        setDivisions(result.divisions);
        setTotalStudentsCount(result.totalStudents);
        setTotalKajianCount(result.totalKajian);
        setKajianList(result.kajianList || []);
      }
    } catch (err) {
      console.error("Gagal memuat rekap:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDivision, searchQuery]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const totalPointsSum = rekapData.reduce((acc, curr) => acc + curr.poinKehadiran, 0);
  const isAdmin = currentUser.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar
        username={currentUser.username}
        role={currentUser.role}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Summary */}
        <StatsCards
          totalStudents={totalStudentsCount}
          totalKajian={totalKajianCount}
          divisionsCount={divisions.length}
        />

        {/* Excel Import Form (Admin Only) */}
        {isAdmin ? (
          <ExcelImporter onImportSuccess={fetchRekap} />
        ) : (
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between bg-slate-900/60">
            <span className="font-semibold text-teal-400">
              🔒 Anda login sebagai Viewer ({currentUser.username}). Hak akses: Read-Only untuk divisi yang diizinkan ({currentUser.allowedDivisions.join(", ") || "Semua"}).
            </span>
          </div>
        )}

        {/* Recap Data Table */}
        <RecapTable
          data={rekapData}
          divisions={divisions}
          selectedDivision={selectedDivision}
          onDivisionChange={(div) => setSelectedDivision(div)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          kajianList={kajianList}
          onKajianDeleted={fetchRekap}
        />
      </main>

      {/* Admin User Management Modal */}
      {isAdmin && (
        <UserManagementModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          availableDivisions={divisions}
        />
      )}

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Aplikasi Rekap Kehadiran Kajian Orang Tua Siswa &bull; Siap Deploy Vercel & Aiven PostgreSQL
      </footer>
    </div>
  );
}
