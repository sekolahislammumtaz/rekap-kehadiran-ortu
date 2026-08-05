import { Users, Calendar, Layers, Award } from "lucide-react";

interface StatsProps {
  totalStudents: number;
  totalKajian: number;
  divisionsCount: number;
  totalPointsSum: number;
}

export default function StatsCards({
  totalStudents,
  totalKajian,
  divisionsCount,
  totalPointsSum,
}: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Siswa</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalStudents}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sesi Kajian</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalKajian}</h3>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Divisi Sekolah</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{divisionsCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Akumulasi Poin</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${totalPointsSum >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPointsSum > 0 ? `+${totalPointsSum}` : totalPointsSum}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
