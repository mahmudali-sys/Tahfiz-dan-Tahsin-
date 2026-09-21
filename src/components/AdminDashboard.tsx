import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Settings, 
  Printer, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  School, 
  Save, 
  RotateCcw,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Student, Teacher, StudentReportData, SchoolSettings } from '../types';
import { getPredicate, getPredicateColor } from '../data/quranData';
import { generateRapotPDF } from '../utils/pdfGenerator';
import { StudentFormModal } from './StudentFormModal';
import { GradeInputModal } from './GradeInputModal';
import { RapotPreviewModal } from './RapotPreviewModal';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { QuranSimakanModal } from './QuranSimakanModal';
import { TahfizSurahRecord } from '../types';

interface AdminDashboardProps {
  students: Student[];
  teachers: Teacher[];
  reports: Record<string, StudentReportData>;
  settings: SchoolSettings;
  onSaveStudent: (student: Student) => void;
  onImportStudents: (students: Student[], mode: 'append' | 'replace') => void;
  onDeleteStudent: (id: string) => void;
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onUpdateReport: (studentId: string, updatedReport: StudentReportData) => void;
  onResetData: () => void;
  onOpenProcessingMenu?: (className?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  teachers,
  reports,
  settings,
  onSaveStudent,
  onImportStudents,
  onDeleteStudent,
  onSaveTeacher,
  onDeleteTeacher,
  onUpdateSettings,
  onUpdateReport,
  onResetData,
  onOpenProcessingMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'murid' | 'guru' | 'sekolah' | 'rekap'>('murid');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [gradingReport, setGradingReport] = useState<StudentReportData | null>(null);
  const [previewReport, setPreviewReport] = useState<StudentReportData | null>(null);
  const [simakanStudent, setSimakanStudent] = useState<Student | null>(null);

  const handleSaveSimakanResult = (newRecord: TahfizSurahRecord) => {
    if (!simakanStudent) return;
    const currentReport = reports[simakanStudent.id];
    if (!currentReport) return;

    const updatedRecords = [newRecord, ...currentReport.tahfizRecords];
    const totalAyat = updatedRecords.reduce((acc, r) => acc + (r.ayatTo - r.ayatFrom + 1), 0);
    const uniqueSurahs = Array.from(new Set(updatedRecords.map((r) => r.surahNumber)));
    const targetCount = simakanStudent.targetSurahCount || 37;
    const completionPct = Math.min(100, Math.round((uniqueSurahs.length / targetCount) * 100));

    const updatedReport: StudentReportData = {
      ...currentReport,
      tahfizRecords: updatedRecords,
      summaryHafalan: {
        ...currentReport.summaryHafalan,
        totalSurahLulus: uniqueSurahs.length,
        totalAyatHafal: totalAyat,
        completionPercentage: completionPct,
      },
    };

    onUpdateReport(simakanStudent.id, updatedReport);
    setSimakanStudent(null);
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SchoolSettings>(settings);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClassFilter === 'all') return true;
    if (selectedClassFilter === 'grade-7') return s.className.startsWith('7');
    if (selectedClassFilter === 'grade-8') return s.className.startsWith('8');
    if (selectedClassFilter === 'grade-9') return s.className.startsWith('9');
    return s.className === selectedClassFilter;
  });

  // Extract unique classes dynamically
  const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).sort();

  // Mass Print / Download
  const handleDownloadAllClassPDF = () => {
    filteredStudents.forEach((std, idx) => {
      const rep = reports[std.id];
      if (rep) {
        setTimeout(() => {
          const tch = teachers.find((t) => t.id === std.teacherId)?.name;
          generateRapotPDF(rep, settings, tch);
        }, idx * 500); // slight stagger
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Murid</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {students.length} <span className="text-xs text-slate-400 font-normal">Santri</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Kelas 7, 8, dan 9 SMP
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Guru Pembimbing</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {teachers.length} <span className="text-xs text-slate-400 font-normal">Ustadz/ah</span>
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">
            Tahsin & Tahfiz
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tuntas Juz 30</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {(Object.values(reports) as StudentReportData[]).filter((r) => r.summaryHafalan?.juzCompleted?.includes(30)).length}{' '}
            <span className="text-xs text-slate-400 font-normal">Santri</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Status Mutqin
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tahun Ajaran</span>
            <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <School className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-2">
            {settings.academicYear}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Semester {settings.semester}
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('murid')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'murid'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            Kelola Data Murid ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'rekap'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Rekapitulasi & Cetak Rapot Massal
          </button>
          <button
            onClick={() => setActiveTab('guru')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'guru'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            Kelola Data Guru ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('sekolah')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sekolah'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            Pengaturan Sekolah & Kop Rapot
          </button>
        </div>

        {/* TAB 1: KELOLA MURID */}
        {activeTab === 'murid' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Filter Rombel:</label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-semibold"
                >
                  <option value="all">Semua Kelas ({students.length} Santri)</option>
                  <optgroup label="Filter per Tingkat">
                    <option value="grade-7">Semua Kelas 7 (Juz 30)</option>
                    <option value="grade-8">Semua Kelas 8 (Juz 29 & 30)</option>
                    <option value="grade-9">Semua Kelas 9 (Juz 28, 29, 30)</option>
                  </optgroup>
                  <optgroup label="Spesifik Rombel">
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls} ({students.filter((s) => s.className === cls).length} santri)
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                  Menampilkan <strong>{filteredStudents.length}</strong> santri
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsBulkImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Impor murid massal dari file Excel atau salin-tempel teks (Kelas 7, 8, 9)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Impor Massal (Excel / Teks)</span>
                </button>

                <button
                  onClick={() => {
                    setStudentToEdit(null);
                    setIsStudentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah 1 Murid</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Murid</th>
                    <th className="py-3 px-4 text-center">NIS / NISN</th>
                    <th className="py-3 px-4 text-center">Kelas</th>
                    <th className="py-3 px-4">Pembimbing</th>
                    <th className="py-3 px-4">Target Kurikulum</th>
                    <th className="py-3 px-4 text-center">Kelola & Penilaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => {
                    const tch = teachers.find((t) => t.id === std.teacherId);
                    const rep = reports[std.id];
                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {std.name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {std.gender === 'L' ? 'Ikhwan' : 'Akhwat'} • Wali: {std.parentPhone || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {std.nis} / {std.nisn}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800">
                            {std.className}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {tch ? tch.name : 'Belum Ditentukan'}
                        </td>
                        <td className="py-3 px-4 text-emerald-800 font-semibold">
                          {std.targetJuz}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Layar Simakan Al-Qur'an Live */}
                            <button
                              onClick={() => setSimakanStudent(std)}
                              className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                              title="Buka Layar Simakan Al-Qur'an untuk Santri Ini"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>

                            {/* Input Nilai (Admin can also edit grades) */}
                            {rep && (
                              <button
                                onClick={() => setGradingReport(rep)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[11px] font-bold transition-colors cursor-pointer"
                                title="Input/Ubah Nilai Setoran"
                              >
                                Nilai ({rep.tahfizRecords.length})
                              </button>
                            )}
                            {/* Cetak Rapot */}
                            {rep && (
                              <button
                                onClick={() => setPreviewReport(rep)}
                                className="p-1 text-slate-500 hover:text-emerald-800 rounded cursor-pointer"
                                title="Pratinjau Rapot"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                            {/* Edit Student */}
                            <button
                              onClick={() => {
                                setStudentToEdit(std);
                                setIsStudentModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
                              title="Ubah Data Murid"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {/* Delete Student */}
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus data santri ${std.name}?`)) {
                                  onDeleteStudent(std.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Hapus Murid"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REKAPITULASI & CETAK RAPOT MASSAL */}
        {activeTab === 'rekap' && (
          <div className="p-5 space-y-4">
            <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Cetak Rapot Massal ({filteredStudents.length} Santri)
                </h4>
                <p className="text-xs text-emerald-800">
                  Unduh seluruh laporan rapot tahsin & tahfiz dalam format PDF resmi untuk dibagikan saat pembagian rapot semester.
                </p>
              </div>
              <button
                onClick={handleDownloadAllClassPDF}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Cetak Semua Rapot PDF
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Murid</th>
                    <th className="py-3 px-4 text-center">Kelas</th>
                    <th className="py-3 px-4 text-center">Rata-rata Tahsin</th>
                    <th className="py-3 px-4 text-center">Predikat</th>
                    <th className="py-3 px-4 text-center">Hafalan Tuntas</th>
                    <th className="py-3 px-4 text-center">Capaian %</th>
                    <th className="py-3 px-4 text-center">Unduh Rapot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => {
                    const rep = reports[std.id];
                    if (!rep) return null;
                    const avg = Math.round(
                      (rep.tahsin.makharijulHuruf +
                        rep.tahsin.ahkamutTajwid +
                        rep.tahsin.ahkamulWaqf +
                        rep.tahsin.fashahahTartil) /
                        4
                    );

                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{std.name}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-600">{std.className}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">{avg}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPredicateColor(getPredicate(avg))}`}>
                            {getPredicate(avg)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-800">
                          {rep.summaryHafalan.totalSurahLulus} Surat ({rep.summaryHafalan.totalAyatHafal} Ayat)
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-slate-800">{rep.summaryHafalan.completionPercentage}%</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              const tch = teachers.find((t) => t.id === std.teacherId)?.name;
                              generateRapotPDF(rep, settings, tch);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-bold border border-emerald-200 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA GURU */}
        {activeTab === 'guru' && (
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Daftar Guru Pengampu Tahsin & Tahfiz</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teachers.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                      {t.name.charAt(4) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">NIP: {t.nip}</p>
                    </div>
                  </div>
                  <div className="text-xs pt-2 border-t border-slate-200 flex justify-between text-slate-600">
                    <span>Kelas Bimbingan:</span>
                    <strong className="text-emerald-800">{t.assignedClasses.join(', ')}</strong>
                  </div>
                  <div className="text-xs flex justify-between text-slate-600">
                    <span>Bidang:</span>
                    <strong className="text-slate-800">{t.specialty}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PENGATURAN SEKOLAH */}
        {activeTab === 'sekolah' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onUpdateSettings(settingsForm);
              alert('Pengaturan sekolah dan kop surat rapot berhasil disimpan!');
            }}
            className="p-5 space-y-4 text-xs"
          >
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-800" />
                Data Lembaga & Kop Surat Rapot PDF
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Yayasan / Lembaga</label>
                  <input
                    type="text"
                    value={settingsForm.foundationName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, foundationName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    value={settingsForm.schoolName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                  <input
                    type="text"
                    value={settingsForm.npsn}
                    onChange={(e) => setSettingsForm({ ...settingsForm, npsn: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Sekolah</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon & Email</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran & Semester</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settingsForm.academicYear}
                      onChange={(e) => setSettingsForm({ ...settingsForm, academicYear: e.target.value })}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                    />
                    <select
                      value={settingsForm.semester}
                      onChange={(e) => setSettingsForm({ ...settingsForm, semester: e.target.value as 'Ganjil' | 'Genap' })}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Tanda Tangan Kepala Sekolah</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={settingsForm.principalName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, principalName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={settingsForm.principalNip}
                    onChange={(e) => setSettingsForm({ ...settingsForm, principalNip: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Titimangsa Rapot</label>
                  <input
                    type="text"
                    value={settingsForm.reportDate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, reportDate: e.target.value })}
                    placeholder="20 Juni 2026"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kembalikan seluruh data ke contoh awal SMP Islam 9 Bekasi?')) {
                    onResetData();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Data ke Default
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan Pengaturan
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        studentToEdit={studentToEdit}
        teachers={teachers}
        onSave={onSaveStudent}
      />

      {/* Bulk Student Import Modal */}
      <BulkStudentImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        teachers={teachers}
        existingStudents={students}
        onImportStudents={onImportStudents}
      />

      {/* Grade Input Modal for Admin */}
      {gradingReport && (
        <GradeInputModal
          isOpen={!!gradingReport}
          onClose={() => setGradingReport(null)}
          reportData={gradingReport}
          teacherName="Admin / Kepala Halaqah"
          onSave={(updated) => {
            onUpdateReport(updated.student.id, updated);
            setGradingReport(null);
          }}
          onSaveAndOpenProcessing={(updated) => {
            onUpdateReport(updated.student.id, updated);
            setGradingReport(null);
            if (onOpenProcessingMenu) {
              onOpenProcessingMenu(updated.student.className);
            }
          }}
        />
      )}

      {/* Rapot Preview Modal */}
      {previewReport && (
        <RapotPreviewModal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          reportData={previewReport}
          settings={settings}
          teacherName={teachers.find((t) => t.id === previewReport.student.teacherId)?.name}
        />
      )}

      {/* Quran Simakan Modal for Admin */}
      {simakanStudent && (
        <QuranSimakanModal
          isOpen={!!simakanStudent}
          onClose={() => setSimakanStudent(null)}
          student={simakanStudent}
          teacherName="Admin / Kepala Halaqah"
          onSaveTahfizResult={handleSaveSimakanResult}
        />
      )}
    </div>
  );
};
