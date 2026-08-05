"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Download, Calendar, BookOpen, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface ExcelImporterProps {
  onImportSuccess: () => void;
}

export default function ExcelImporter({ onImportSuccess }: ExcelImporterProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Harap masukkan Nama Kajian.");
      return;
    }
    if (!date) {
      setErrorMsg("Harap masukkan Tanggal Kajian.");
      return;
    }
    if (!file) {
      setErrorMsg("Harap pilih file Excel kehadiran.");
      return;
    }

    setIsUploading(true);
    setProgressPercent(10);
    setProgressStage("Membaca & Memvalidasi File Excel...");
    setErrorMsg(null);
    setSuccessMsg(null);

    // Simulated progress timer while network request processes
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 40) {
          setProgressStage("Mengekstrak Data Ayah & Bunda...");
          return prev + 15;
        } else if (prev < 70) {
          setProgressStage("Menghitung Poin Kehadiran (+1 / -1)...");
          return prev + 10;
        } else if (prev < 90) {
          setProgressStage("Menyimpan & Mengakumulasi Poin di Database...");
          return prev + 5;
        }
        return prev;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah file");
      }

      setProgressPercent(100);
      setProgressStage("Pemrosesan Selesai 100%!");

      setSuccessMsg(
        `Berhasil mengimpor "${title}"! Total ${data.summary.totalSiswaTerproses} siswa terproses (${data.summary.siswaBaru} siswa baru).`
      );
      setTitle("");
      setFile(null);

      // Reset input element
      const fileInput = document.getElementById("excel-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      onImportSuccess();
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgressPercent(0);
      setErrorMsg(err.message || "Terjadi kesalahan saat mengimpor data.");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 600);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-700/60 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            Impor Data Kehadiran Kajian
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Masukkan Nama Kajian, Tanggal, dan upload file Excel (.xlsx / .xls)
          </p>
        </div>

        <a
          href="/api/sample-excel"
          download
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Unduh Template Excel</span>
        </a>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Real-time Progress Bar */}
      {isUploading && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{progressStage}</span>
            </div>
            <span className="font-extrabold text-emerald-400 font-mono text-sm">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Track & Animated Fill */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out shadow-lg shadow-emerald-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Nama Kajian
            </label>
            <input
              type="text"
              placeholder="Contoh: Kajian Parenting Ramadan #1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Tanggal Kajian
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isUploading}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            File Excel Kehadiran (.xlsx / .xls)
          </label>

          <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-4 text-center transition-colors bg-slate-900/40">
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              <div className="text-sm font-medium text-slate-300">
                {file ? (
                  <span className="text-emerald-400 font-bold">{file.name}</span>
                ) : (
                  <span>Klik atau seret file Excel ke sini</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Format kolom wajib: <code className="text-emerald-300 font-mono">Nama Peserta</code>, <code className="text-emerald-300 font-mono">Divisi</code>, <code className="text-emerald-300 font-mono">Status Kehadiran</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Memproses ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Impor & Hitung Rekap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
