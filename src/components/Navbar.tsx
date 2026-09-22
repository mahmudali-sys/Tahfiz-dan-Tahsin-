import React from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  Check, 
  ChevronDown,
  Layers,
  School,
  LayoutDashboard,
  FileSpreadsheet,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { UserRole, Teacher, Student } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  teachers: Teacher[];
  students: Student[];
  currentTeacherId: string;
  onChangeTeacherId: (id: string) => void;
  currentStudentId: string;
  onChangeStudentId: (id: string) => void;
  academicYear: string;
  semester: string;
  activeView?: 'dashboard' | 'pengolahan_nilai';
  onChangeView?: (view: 'dashboard' | 'pengolahan_nilai') => void;
  isSyncing?: boolean;
  lastSyncTime?: Date | null;
  onOpenSyncModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  teachers,
  students,
  currentTeacherId,
  onChangeTeacherId,
  currentStudentId,
  onChangeStudentId,
  academicYear,
  semester,
  activeView = 'dashboard',
  onChangeView,
  isSyncing = false,
  lastSyncTime,
  onOpenSyncModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* School Brand / Identity */}
          <div 
            onClick={() => onChangeView && onChangeView('dashboard')}
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            title="Kembali ke Dashboard Utama"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center shadow-md shadow-emerald-900/10 border border-emerald-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-emerald-800 uppercase">
                  SMP ISLAM AL AZHAR 9 BEKASI
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                  SMPIA 9
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                SIA Tahsin & Tahfiz Al-Qur'an
              </h1>
            </div>
          </div>

          {/* Center: Main View Navigation (Dashboard vs Pengolahan Nilai) for Guru & Admin */}
          {currentRole !== 'murid' && onChangeView && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90">
              <button
                type="button"
                onClick={() => onChangeView('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('pengolahan_nilai')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'pengolahan_nilai'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Pengolahan Nilai (Excel)</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                  activeView === 'pengolahan_nilai' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Baru
                </span>
              </button>
            </div>
          )}

          {/* Center / Right: Role Switcher Buttons & Cloud Sync */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Cloud Sync Indicator & Multi-Device Modal Opener */}
            {onOpenSyncModal && (
              <button
                type="button"
                onClick={onOpenSyncModal}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                  isSyncing
                    ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/90'
                }`}
                title="Status Sinkronisasi Cloud: Laptop, iPad & HP terhubung ke 1 basis data terpusat"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span className="hidden sm:inline">
                  {isSyncing ? 'Sinkronisasi...' : 'Sinkron Cloud'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSyncing ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
              </button>
            )}

            {/* Multi-Role Segmented Control */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              {/* 1. Admin */}
              <button
                type="button"
                onClick={() => onChangeRole('admin')}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Admin: dapat mengelola semuanya"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              {/* 2. Guru */}
              <button
                type="button"
                onClick={() => onChangeRole('guru')}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'guru'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Guru: bisa menambah dan mengubah nilai setoran anak"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Guru</span>
              </button>

              {/* 3. Murid */}
              <button
                type="button"
                onClick={() => onChangeRole('murid')}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'murid'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Murid: hanya dapat melihat capaian dari hafalan yang sudah dihafalkan"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Murid</span>
              </button>
            </div>

            {/* Active User Switcher based on current role */}
            {currentRole === 'guru' && (
              <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Ustadz:</span>
                <select
                  value={currentTeacherId}
                  onChange={(e) => onChangeTeacherId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 cursor-pointer max-w-[200px] truncate"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Kls {t.assignedClasses.join(',')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentRole === 'murid' && (
              <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Santri:</span>
                <select
                  value={currentStudentId}
                  onChange={(e) => onChangeStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 cursor-pointer max-w-[210px] truncate"
                >
                  {Array.from(new Set(students.map((s) => s.className))).sort().map((cls) => (
                    <optgroup key={cls} label={`Kelas ${cls} (${students.filter((s) => s.className === cls).length} santri)`}>
                      {students.filter((s) => s.className === cls).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.className})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Academic badge */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <School className="w-3.5 h-3.5 text-emerald-800" />
              <span>{semester} {academicYear}</span>
            </div>

          </div>

        </div>

        {/* Mobile secondary bar for Teacher/Student selector */}
        <div className="md:hidden py-2 border-t border-slate-100 flex items-center justify-between text-xs">
          {currentRole === 'guru' && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Pilih Guru:</span>
              <select
                value={currentTeacherId}
                onChange={(e) => onChangeTeacherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-medium"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Kelas {t.assignedClasses.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentRole === 'murid' && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Pilih Santri:</span>
              <select
                value={currentStudentId}
                onChange={(e) => onChangeStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-medium"
              >
                {Array.from(new Set(students.map((s) => s.className))).sort().map((cls) => (
                  <optgroup key={cls} label={`Kelas ${cls} (${students.filter((s) => s.className === cls).length} santri)`}>
                    {students.filter((s) => s.className === cls).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Kelas {s.className})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {currentRole === 'admin' && (
            <div className="text-[11px] text-emerald-800 font-semibold w-full text-center">
              Mode Administrator: Hak Akses Penuh Kelola Sekolah & Rapot
            </div>
          )}
        </div>

        {/* Mobile View Selector for Guru & Admin */}
        {currentRole !== 'murid' && onChangeView && (
          <div className="lg:hidden pb-2.5 pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChangeView('dashboard')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeView === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeView('pengolahan_nilai')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeView === 'pengolahan_nilai'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pengolahan Nilai (Excel)</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
