"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import StatsCards from "@/components/StatsCards";
import ExcelImporter from "@/components/ExcelImporter";
import RecapTable, { RekapItem, KajianSession } from "@/components/RecapTable";

export default function DashboardPage() {
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("Semua Divisi");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [totalKajianCount, setTotalKajianCount] = useState<number>(0);
  const [kajianList, setKajianList] = useState<KajianSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Summary */}
        <StatsCards
          totalStudents={totalStudentsCount}
          totalKajian={totalKajianCount}
          divisionsCount={divisions.length}
          totalPointsSum={totalPointsSum}
        />

        {/* Excel Import Form */}
        <ExcelImporter onImportSuccess={fetchRekap} />

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

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Aplikasi Rekap Kehadiran Kajian Orang Tua Siswa &bull; Siap Deploy Vercel & Aiven PostgreSQL
      </footer>
    </div>
  );
}
