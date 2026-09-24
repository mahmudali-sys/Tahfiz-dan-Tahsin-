import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Student, StudentReportData, Teacher, TahfizSurahRecord } from '../types';
import { QURAN_SURAHS, getPredicate, getPredicateColor } from '../data/quranData';
import {
  IndonesianDatePicker,
  formatToIndonesianDate,
  getTodayIso,
  getYesterdayIso,
  parseDateString,
  toIsoDate
} from './IndonesianDatePicker';

interface AttendanceAndHafalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  reports: Record<string, StudentReportData>;
  currentTeacher?: Teacher;
  teachers?: Teacher[];
  teacherName?: string;
  selectedClass?: string;
  initialStudentId?: string;
  initialAttendanceDate?: string;
  onSaveAttendanceAndSetoran: (params: {
    studentId: string;
    attendanceDate: string;
    attendanceStatus: 'H' | 'S' | 'I' | 'A';
    attendanceNote: string;
    hafalanRecord?: TahfizSurahRecord;
  }) => void;
}

export function formatIndonesianDate(dateStr: string, includeDayName = true): string {
  return formatToIndonesianDate(dateStr, includeDayName);
}

export const AttendanceAndHafalanModal: React.FC<AttendanceAndHafalanModalProps> = ({
  isOpen,
  onClose,
  students,
  reports,
  currentTeacher,
  teachers,
  selectedClass = '7B',
  initialStudentId,
  initialAttendanceDate,
  onSaveAttendanceAndSetoran,
}) => {
  if (!isOpen) return null;

  // Filter students based on class selection
  const [classFilter, setClassFilter] = useState<string>(selectedClass);
  const classStudents = useMemo(() => {
    if (classFilter === 'all') return students;
    return students.filter((s) => s.className === classFilter);
  }, [students, classFilter]);

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialStudentId && students.some((s) => s.id === initialStudentId)) {
      return initialStudentId;
    }
    return classStudents[0]?.id || students[0]?.id || '';
  });

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const currentReport = selectedStudent ? reports[selectedStudent.id] : null;

  // Form State: 1. Tanggal Kehadiran & Status Presensi
  const todayIso = useMemo(() => getTodayIso(), []);
  const [attendanceDate, setAttendanceDate] = useState<string>(() => toIsoDate(initialAttendanceDate || getTodayIso()));
  const [attendanceStatus, setAttendanceStatus] = useState<'H' | 'S' | 'I' | 'A'>('H');
  const [attendanceNote, setAttendanceNote] = useState<string>('');

  // Form State: 2. Tanggal Menghafal / Setoran Hafalan
  const [isRecordHafalan, setIsRecordHafalan] = useState<boolean>(true);
  const [setoranDate, setSetoranDate] = useState<string>(() => toIsoDate(initialAttendanceDate || getTodayIso()));
  const [setoranType, setSetoranType] = useState<'Ziyadah' | 'Murojaah' | 'Tasmi' | 'Ujian'>('Ziyadah');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(78);
  const [ayatFrom, setAyatFrom] = useState<number>(1);
  const [ayatTo, setAyatTo] = useState<number>(40);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [isMutqin, setIsMutqin] = useState<boolean>(true);
  const [examinerName, setExaminerName] = useState<string>(() => {
    return currentTeacher?.name || teachers[0]?.name || 'Ustadz Pembimbing';
  });
  const [hafalanNotes, setHafalanNotes] = useState<string>('Lancar, makhraj dan tajwid baik.');

  // When selected student changes, update defaults
  useEffect(() => {
    if (selectedStudent && currentReport) {
      setAttendanceNote(currentReport.adab?.generalNotes || '');
    }
  }, [selectedStudentId]);

  // Sync when initialStudentId or students list changes
  useEffect(() => {
    if (initialStudentId && students.some((s) => s.id === initialStudentId)) {
      setSelectedStudentId(initialStudentId);
      const s = students.find((std) => std.id === initialStudentId);
      if (s) setClassFilter(s.className);
    }
  }, [initialStudentId, students]);

  // Sync when initialAttendanceDate changes or modal opens
  useEffect(() => {
    if (initialAttendanceDate) {
      const validIso = toIsoDate(initialAttendanceDate);
      setAttendanceDate(validIso);
      setSetoranDate(validIso);
    } else {
      const today = getTodayIso();
      setAttendanceDate(today);
      setSetoranDate(today);
    }
  }, [initialAttendanceDate, isOpen]);

  // When surah changes, adjust verses
  const handleSurahChange = (surahNum: number) => {
    setSelectedSurahNumber(surahNum);
    const surah = QURAN_SURAHS.find((s) => s.number === surahNum);
    if (surah) {
      setAyatFrom(1);
      setAyatTo(surah.totalAyat);
    }
  };

  const selectedSurah = useMemo(() => {
    return QURAN_SURAHS.find((s) => s.number === selectedSurahNumber) || QURAN_SURAHS[0];
  }, [selectedSurahNumber]);

  // Quick preset dates
  const handleSetQuickDate = (type: 'today' | 'yesterday' | 'same_as_attendance') => {
    if (type === 'today') {
      const now = getTodayIso();
      setAttendanceDate(now);
      setSetoranDate(now);
    } else if (type === 'yesterday') {
      const yStr = getYesterdayIso();
      setAttendanceDate(yStr);
      setSetoranDate(yStr);
    } else if (type === 'same_as_attendance') {
      setSetoranDate(attendanceDate);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    let newTahfizRecord: TahfizSurahRecord | undefined;

    if (isRecordHafalan && attendanceStatus === 'H') {
      const predicate = getPredicate(gradeScore);
      const typePrefix = setoranType === 'Murojaah' ? '[Muroja\'ah] ' : setoranType === 'Tasmi' ? '[Tasmi\'] ' : '';
      newTahfizRecord = {
        id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        surahNumber: selectedSurah.number,
        surahName: selectedSurah.name,
        juzNumber: selectedSurah.juz,
        ayatFrom: Number(ayatFrom),
        ayatTo: Number(ayatTo),
        gradeScore: Number(gradeScore),
        predicate,
        isMutqin,
        date: setoranDate, // Tanggal ketika murid menghafal / setoran hafalan
        examinerTeacherName: examinerName,
        notes: `${typePrefix}${hafalanNotes.trim()}`,
      };
    }

    onSaveAttendanceAndSetoran({
      studentId: selectedStudent.id,
      attendanceDate, // Tanggal Kehadiran Santri
      attendanceStatus,
      attendanceNote,
      hafalanRecord: newTahfizRecord,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl border border-emerald-700">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-300">
                  Formulir Presensi & Setoran Halaqah
                </span>
                <span className="bg-emerald-800/80 text-emerald-200 px-2 py-0.2 rounded text-[10px] font-semibold border border-emerald-700">
                  SMPIA 9
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Input Tanggal Kehadiran & Tanggal Setoran Hafalan Santri
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* BAR FILTER & PILIH SANTRI */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Filter Kelas */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilih Kelas / Rombel:</span>
              </label>
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  const matched = students.filter((s) => e.target.value === 'all' || s.className === e.target.value);
                  if (matched.length > 0) {
                    setSelectedStudentId(matched[0].id);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">Semua Kelas ({students.length} Santri)</option>
                {Array.from(new Set(students.map((s) => s.className)))
                  .sort()
                  .map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls} ({students.filter((s) => s.className === cls).length} santri)
                    </option>
                  ))}
              </select>
            </div>

            {/* Dropdown Santri */}
            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilih Nama Santri:</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {classStudents.map((std, idx) => (
                  <option key={std.id} value={std.id}>
                    {idx + 1}. {std.name} — Kelas {std.className} (NISN: {std.nisn}) [Target: {std.targetJuz}]
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Badge Santri Terpilih */}
            {selectedStudent && (
              <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{selectedStudent.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    Kelas {selectedStudent.className}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px]">
                    Kelompok {selectedStudent.kelompok || '6'}
                  </span>
                  <span className="text-slate-500 text-[11px]">NIS: {selectedStudent.nis}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Target Kurikulum: <strong className="text-emerald-700">{selectedStudent.targetJuz}</strong>
                </div>
              </div>
            )}
          </div>

          {/* BAGIAN 1: FORM TANGGAL KEHADIRAN (PRESENSI) */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Form Tanggal Kehadiran Santri (Presensi)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Catat tanggal pelaksanaan halaqah dan status presensi kehadiran
                  </p>
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Pilihan Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSetQuickDate('today')}
                  className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDate('yesterday')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors shadow-2xs"
                >
                  Kemarin
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Tanggal Kehadiran Picker with Interactive Indonesian Calendar */}
              <div className="md:col-span-6">
                <IndonesianDatePicker
                  label="Tanggal Kehadiran / Halaqah Santri"
                  value={attendanceDate}
                  onChange={(newDate) => {
                    setAttendanceDate(newDate);
                    if (setoranDate === attendanceDate) {
                      setSetoranDate(newDate);
                    }
                  }}
                  colorTheme="emerald"
                  required
                />
              </div>

              {/* Status Presensi (H/S/I/A) Radio Cards */}
              <div className="md:col-span-6 space-y-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>Status Kehadiran Santri:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { code: 'H', label: 'Hadir', bg: 'bg-emerald-600', ring: 'ring-emerald-500', text: 'text-emerald-700' },
                      { code: 'S', label: 'Sakit', bg: 'bg-amber-500', ring: 'ring-amber-400', text: 'text-amber-700' },
                      { code: 'I', label: 'Izin', bg: 'bg-blue-500', ring: 'ring-blue-400', text: 'text-blue-700' },
                      { code: 'A', label: 'Alpa', bg: 'bg-rose-600', ring: 'ring-rose-400', text: 'text-rose-700' },
                    ] as const
                  ).map((st) => {
                    const isSelected = attendanceStatus === st.code;
                    return (
                      <button
                        key={st.code}
                        type="button"
                        onClick={() => {
                          setAttendanceStatus(st.code);
                          if (st.code !== 'H') {
                            setIsRecordHafalan(false);
                          } else {
                            setIsRecordHafalan(true);
                          }
                        }}
                        className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                          isSelected
                            ? `${st.bg} text-white font-extrabold shadow-sm ring-2 ${st.ring} border-transparent`
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-sm font-black">{st.code}</div>
                        <div className="text-[10px] mt-0.5 leading-tight">{st.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Presensi / Adab */}
              <div className="md:col-span-12">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Kehadiran & Ketertiban Santri:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Datang tepat waktu, membawa mushaf tilawah dan kartu tahfiz..."
                  value={attendanceNote}
                  onChange={(e) => setAttendanceNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: FORM TANGGAL MENGHAFAL / SETORAN HAFALAN AL-QUR'AN */}
          <div className="border border-blue-200 bg-blue-50/30 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Form Tanggal Menghafal & Setoran Hafalan Al-Qur'an
                  </h3>
                  <p className="text-xs text-slate-500">
                    Catat tanggal ketika murid menghafal / menyetorkan ayat kepada pembimbing
                  </p>
                </div>
              </div>

              {/* Checkbox Aktivasi Setoran */}
              <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecordHafalan}
                  onChange={(e) => setIsRecordHafalan(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Catat Setoran Hafalan Sekarang
                </span>
              </label>
            </div>

            {isRecordHafalan ? (
              <div className="space-y-4">
                {/* Bar Tanggal Setoran Hafalan */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                  {/* Tanggal Menghafal / Setoran with Indonesian Day & Calendar */}
                  <div className="md:col-span-6">
                    <IndonesianDatePicker
                      label="Tanggal Menghafal / Setoran Hafalan Santri"
                      value={setoranDate}
                      onChange={(newDate) => setSetoranDate(newDate)}
                      colorTheme="blue"
                      required={isRecordHafalan}
                      quickAction={
                        setoranDate !== attendanceDate
                          ? {
                              label: 'Samakan dgn Tgl Kehadiran',
                              onClick: () => setSetoranDate(attendanceDate),
                            }
                          : undefined
                      }
                    />
                  </div>

                  {/* Kategori Jenis Setoran */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>Jenis / Kategori Setoran:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'Ziyadah', label: 'Ziyadah (Baru)' },
                          { id: 'Murojaah', label: 'Muroja\'ah' },
                          { id: 'Tasmi', label: 'Tasmi\' / Ujian' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSetoranType(item.id)}
                          className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                            setoranType === item.id
                              ? 'bg-blue-700 text-white shadow-2xs border-blue-700'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Surat, Rentang Ayat, dan Nilai */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Pilihan Surat Al-Qur'an */}
                  <div className="md:col-span-5 space-y-1">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Pilih Surat Al-Qur'an:</span>
                    </label>
                    <select
                      value={selectedSurahNumber}
                      onChange={(e) => handleSurahChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                    >
                      <optgroup label="Target Utama Kelas 7 (Juz 30)">
                        {QURAN_SURAHS.filter((s) => s.juz === 30).map((s) => (
                          <option key={s.number} value={s.number}>
                            {s.number}. Surat {s.name} ({s.arabic}) - {s.totalAyat} Ayat (Juz 30)
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Target Kelas 8 (Juz 29)">
                        {QURAN_SURAHS.filter((s) => s.juz === 29).map((s) => (
                          <option key={s.number} value={s.number}>
                            {s.number}. Surat {s.name} ({s.arabic}) - {s.totalAyat} Ayat (Juz 29)
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Target Kelas 9 (Juz 28)">
                        {QURAN_SURAHS.filter((s) => s.juz === 28).map((s) => (
                          <option key={s.number} value={s.number}>
                            {s.number}. Surat {s.name} ({s.arabic}) - {s.totalAyat} Ayat (Juz 28)
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Surat Pilihan Lainnya (Juz 1 - 27)">
                        {QURAN_SURAHS.filter((s) => s.juz < 28).map((s) => (
                          <option key={s.number} value={s.number}>
                            {s.number}. Surat {s.name} ({s.arabic}) - Juz {s.juz}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Rentang Ayat */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Rentang Ayat yang Disetor:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={ayatTo}
                        value={ayatFrom}
                        onChange={(e) => setAyatFrom(Math.max(1, Math.min(Number(e.target.value), ayatTo)))}
                        className="w-16 bg-white border border-slate-300 rounded-xl px-2 py-2 text-center text-xs font-bold text-slate-900"
                      />
                      <span className="text-xs text-slate-500 font-bold">s.d.</span>
                      <input
                        type="number"
                        min={ayatFrom}
                        max={selectedSurah.totalAyat}
                        value={ayatTo}
                        onChange={(e) =>
                          setAyatTo(Math.max(ayatFrom, Math.min(Number(e.target.value), selectedSurah.totalAyat)))
                        }
                        className="w-16 bg-white border border-slate-300 rounded-xl px-2 py-2 text-center text-xs font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAyatFrom(1);
                          setAyatTo(selectedSurah.totalAyat);
                        }}
                        className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Semua ({selectedSurah.totalAyat})
                      </button>
                    </div>
                  </div>

                  {/* Nilai Setoran & Predikat */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Nilai Setoran (0-100):</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${getPredicateColor(
                          getPredicate(gradeScore)
                        )}`}
                      >
                        {getPredicate(gradeScore)}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={gradeScore}
                        onChange={(e) => setGradeScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-20 bg-white border border-slate-300 rounded-xl px-2 py-2 text-center text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-600"
                      />
                      {/* Quick Score Chips */}
                      <div className="flex items-center gap-1">
                        {[100, 95, 90, 85].map((sc) => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => setGradeScore(sc)}
                            className="px-1.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            {sc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Mutqin, Guru Penguji, dan Catatan */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Status Mutqin */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Status Kelulusan Setoran:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMutqin(true)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          isMutqin
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Lulus Mutqin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMutqin(false)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          !isMutqin
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Perlu Muroja'ah</span>
                      </button>
                    </div>
                  </div>

                  {/* Guru Penguji */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Guru Penguji / Pembimbing:
                    </label>
                    <input
                      type="text"
                      value={examinerName}
                      onChange={(e) => setExaminerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    />
                  </div>

                  {/* Catatan Evaluasi Setoran */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Catatan Evaluasi / Tajwid:
                    </label>
                    <input
                      type="text"
                      placeholder="Lancar, perhatikan waqaf..."
                      value={hafalanNotes}
                      onChange={(e) => setHafalanNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-white/70 rounded-xl border border-dashed border-blue-200 text-slate-500 text-xs">
                Santri tidak menyetor hafalan pada tanggal kehadiran ini. Beri tanda centang di atas jika santri menyetor.
              </div>
            )}
          </div>

          {/* RIWAYAT SETORAN TERAKHIR SANTRI (Untuk Referensi Guru) */}
          {currentReport && currentReport.tahfizRecords.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="font-bold text-slate-700 flex items-center justify-between mb-2">
                <span>Riwayat Setoran Terakhir ({selectedStudent.name}):</span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Total {currentReport.tahfizRecords.length} Surat Disetor
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentReport.tahfizRecords.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {rec.surahName} ({rec.ayatFrom}-{rec.ayatTo})
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="font-semibold text-blue-800">📅 {formatIndonesianDate(rec.date, true)}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">Nilai: {rec.gradeScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Kehadiran & Setoran Santri</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
