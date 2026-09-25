import React, { useState, useEffect } from 'react';
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
  FileText,
  CheckSquare,
  Square,
  Sparkles,
  AlertTriangle,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Student, Teacher, StudentReportData, SchoolSettings } from '../types';
import { getPredicate, getPredicateColor } from '../data/quranData';
import { generateRapotPDF } from '../utils/pdfGenerator';
import { StudentFormModal } from './StudentFormModal';
import { TeacherFormModal } from './TeacherFormModal';
import { GradeInputModal } from './GradeInputModal';
import { RapotPreviewModal } from './RapotPreviewModal';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { BulkTeacherImportModal } from './BulkTeacherImportModal';
import { QuranSimakanModal } from './QuranSimakanModal';
import { TahfizSurahRecord } from '../types';
import { SMPIA9_VALID_CLASSES } from '../utils/studentImporter';
import { ALL_168_STUDENTS, STUDENTS_9C_20 } from '../data/smpia9Students168';

interface AdminDashboardProps {
  students: Student[];
  teachers: Teacher[];
  reports: Record<string, StudentReportData>;
  settings: SchoolSettings;
  onSaveStudent: (student: Student) => void;
  onImportStudents: (students: Student[], mode: 'append' | 'replace') => void;
  onDeleteStudent: (id: string) => void;
  onBatchDeleteStudents: (studentIds: string[]) => void;
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onImportTeachers: (teachers: Teacher[], mode: 'append' | 'replace') => void;
  onBatchDeleteTeachers: (teacherIds: string[]) => void;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onUpdateReport: (studentId: string, updatedReport: StudentReportData) => void;
  onResetData: () => void;
  onOpenProcessingMenu?: (className?: string) => void;
  onLoadOfficial168Roster?: () => void;
  onAppend9CStudents?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  teachers,
  reports,
  settings,
  onSaveStudent,
  onImportStudents,
  onDeleteStudent,
  onBatchDeleteStudents,
  onSaveTeacher,
  onDeleteTeacher,
  onImportTeachers,
  onBatchDeleteTeachers,
  onUpdateSettings,
  onUpdateReport,
  onResetData,
  onOpenProcessingMenu,
  onLoadOfficial168Roster,
  onAppend9CStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'murid' | 'guru' | 'sekolah' | 'rekap'>('murid');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isBulkTeacherImportModalOpen, setIsBulkTeacherImportModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [gradingReport, setGradingReport] = useState<StudentReportData | null>(null);
  const [previewReport, setPreviewReport] = useState<StudentReportData | null>(null);
  const [simakanStudent, setSimakanStudent] = useState<Student | null>(null);

  // Multi-selection states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

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

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const handleLogoUploadInAdmin = (e: React.ChangeEvent<HTMLInputElement>, target: 'school' | 'foundation') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'school') {
        setSettingsForm((prev) => ({ ...prev, schoolLogo: dataUrl }));
      } else {
        setSettingsForm((prev) => ({ ...prev, foundationLogo: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClassFilter === 'all') return true;
    if (selectedClassFilter === 'grade-7') return s.className.startsWith('7');
    if (selectedClassFilter === 'grade-8') return s.className.startsWith('8');
    if (selectedClassFilter === 'grade-9') return s.className.startsWith('9');
    return s.className === selectedClassFilter;
  });

  // Student batch selection helpers
  const isAllFilteredStudentsSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id));

  const toggleSelectAllStudents = () => {
    if (isAllFilteredStudentsSelected) {
      const filteredIdSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const filteredIdSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredIdSet])));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBatchDeleteStudents = () => {
    if (selectedStudentIds.length === 0) return;
    if (
      confirm(
        `PERINGATAN ADMIN:\nYakin ingin menghapus ${selectedStudentIds.length} santri terpilih secara permanen?\nSeluruh data setoran dan rapot santri yang dihapus akan dibersihkan dari server.`
      )
    ) {
      onBatchDeleteStudents(selectedStudentIds);
      setSelectedStudentIds([]);
    }
  };

  // Teacher batch selection helpers
  const isAllTeachersSelected =
    teachers.length > 0 && teachers.every((t) => selectedTeacherIds.includes(t.id));

  const toggleSelectAllTeachers = () => {
    if (isAllTeachersSelected) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(teachers.map((t) => t.id));
    }
  };

  const toggleSelectTeacher = (id: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBatchDeleteTeachers = () => {
    if (selectedTeacherIds.length === 0) return;
    if (selectedTeacherIds.length >= teachers.length) {
      alert('Tidak dapat menghapus seluruh guru. Minimal harus ada 1 guru aktif di sistem.');
      return;
    }
    if (
      confirm(
        `PERINGATAN ADMIN:\nYakin ingin menghapus ${selectedTeacherIds.length} guru terpilih?\nSantri yang sebelumnya dibina oleh guru yang dihapus akan dialihkan ke guru aktif lainnya.`
      )
    ) {
      onBatchDeleteTeachers(selectedTeacherIds);
      setSelectedTeacherIds([]);
    }
  };

  // Extract unique classes dynamically, ensuring all 8 official classes are always present
  const uniqueClasses = Array.from(new Set([...SMPIA9_VALID_CLASSES, ...students.map((s) => s.className)])).sort();

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
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-1.5">
            <span>{students.length}</span>
            <span className="text-xs text-slate-500 font-normal">
              {students.length === 168 ? '/ 168 Santri' : 'Santri'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {students.length === 168 ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                Lengkap 9 Rombel (7A–9C)
              </span>
            ) : students.length === 148 ? (
              <span className="text-amber-700 font-semibold">
                8 Rombel (9C +20 santri belum masuk)
              </span>
            ) : (
              <span>Kelas 7, 8, dan 9 SMP</span>
            )}
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
            {/* Banner Sinkronisasi 168 Santri SMPIA 9 */}
            {students.length !== 168 ? (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                        Status Data Rombel: Terdata {students.length} Santri (Seharusnya 168 Santri)
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                        {students.length === 148 ? '8 Rombel (Kurang 9C)' : 'Perlu Sinkronisasi'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {students.length === 148
                        ? 'Jumlah santri saat ini 148 orang dari 8 kelas (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B). Rombel 9C sebanyak 20 santri belum masuk sehingga total belum mencapai 168 santri.'
                        : `Total santri resmi SMP Islam Al Azhar 9 adalah 168 santri pada 9 rombel resmi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C).`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
                  {onAppend9CStudents && (
                    <button
                      type="button"
                      onClick={onAppend9CStudents}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                      title="Tambahkan 20 santri kelas 9C agar total genap 168 santri"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>+ Masukkan 20 Santri 9C (Total Jadi 168)</span>
                    </button>
                  )}
                  {onLoadOfficial168Roster && (
                    <button
                      type="button"
                      onClick={onLoadOfficial168Roster}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                      title="Muat ulang seluruh 168 data santri resmi SMPIA 9"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Muat Lengkap 168 Santri (9 Rombel)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Roster Lengkap Terverifikasi:</strong> Total <strong>168 Santri</strong> pada 9 Rombel Resmi SMP Islam Al Azhar 9 Bekasi (7A–7C, 8A–8C, 9A–9C).
                  </span>
                </div>
                {onLoadOfficial168Roster && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Muat ulang seluruh 168 roster baku resmi SMPIA 9 Bekasi?')) {
                        onLoadOfficial168Roster();
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer self-end sm:self-auto"
                  >
                    Sinkron Ulang Master 168
                  </button>
                )}
              </div>
            )}

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

            {/* Batch Selection Banner for Students */}
            {selectedStudentIds.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 rounded-xl animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-800 text-white px-2.5 py-0.5 rounded-full font-bold text-xs">
                    {selectedStudentIds.length} Santri Dipilih
                  </span>
                  <span className="text-xs text-slate-600 hidden sm:inline">
                    Pilih aksi massal untuk santri yang ditandai:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Batal Pilihan
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBatchDeleteStudents}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus ({selectedStudentIds.length}) Santri Terpilih</span>
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={isAllFilteredStudentsSelected}
                        onChange={toggleSelectAllStudents}
                        className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800 cursor-pointer"
                        title="Pilih / Batalkan Semua Santri yang Ditampilkan"
                      />
                    </th>
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
                    const isSelected = selectedStudentIds.includes(std.id);
                    return (
                      <tr 
                        key={std.id} 
                        className={`transition-colors ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(std.id)}
                            className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800 cursor-pointer"
                          />
                        </td>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Guru Pengampu Tahsin & Tahfiz</h3>
                <p className="text-[11px] text-slate-500">
                  Kelola nama ustadz/ustadzah pembimbing, NIP, kelas binaan, serta tambah atau hapus data secara massal.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsBulkTeacherImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Impor banyak guru sekaligus dari file Excel atau salin-tempel teks"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Impor Massal Guru</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTeacherToEdit(null);
                    setIsTeacherModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Guru</span>
                </button>
              </div>
            </div>

            {/* Batch Selection Banner for Teachers */}
            {selectedTeacherIds.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 rounded-xl animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-800 text-white px-2.5 py-0.5 rounded-full font-bold text-xs">
                    {selectedTeacherIds.length} Guru Dipilih
                  </span>
                  <span className="text-xs text-slate-600 hidden sm:inline">
                    Pilih aksi untuk guru yang ditandai:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherIds([])}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Batal Pilihan
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBatchDeleteTeachers}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus ({selectedTeacherIds.length}) Guru Terpilih</span>
                  </button>
                </div>
              </div>
            )}

            {/* Select All Teachers Bar */}
            <div className="flex items-center justify-between px-1">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllTeachersSelected}
                  onChange={toggleSelectAllTeachers}
                  className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800 cursor-pointer"
                />
                <span>Pilih Semua Guru ({teachers.length})</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teachers.map((t) => {
                const isSelected = selectedTeacherIds.includes(t.id);
                const assignedStudentsCount = students.filter((s) => s.teacherId === t.id).length;
                return (
                  <div 
                    key={t.id} 
                    className={`p-4 rounded-xl border transition-colors space-y-3 relative group ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' 
                        : 'border-slate-200 bg-slate-50/50 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTeacher(t.id)}
                          className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {t.name.split(' ').find(w => !['Ustadz', 'Ustadzah', 'Ust.'].includes(w))?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">{t.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">NIP: {t.nip}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherToEdit(t);
                            setIsTeacherModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="Ubah Data Guru"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (teachers.length <= 1) {
                              alert('Tidak dapat menghapus. Minimal harus ada 1 guru terdaftar.');
                              return;
                            }
                            if (confirm(`Yakin ingin menghapus ${t.name}?`)) {
                              onDeleteTeacher(t.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Guru"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs pt-2 border-t border-slate-200 space-y-1.5 text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Kelas Bimbingan:</span>
                        <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px]">
                          {t.assignedClasses.join(', ')}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Spesialisasi:</span>
                        <strong className="text-slate-800">{t.specialty}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Jumlah Santri Dibina:</span>
                        <span className="font-bold text-emerald-800">{assignedStudentsCount} santri</span>
                      </div>
                      {t.phone && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span>WhatsApp:</span>
                          <span className="text-slate-700 font-medium">{t.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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

            {/* Kustomisasi Logo Sekolah & Yayasan pada Rapot */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-800" />
                Kustomisasi Logo Sekolah & Yayasan pada Rapot
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Ubah logo sekolah (sisi kiri) dan logo yayasan (sisi kanan) yang tampil pada cetakan rapot dan unduhan PDF resmi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Sekolah (Kiri) */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">Logo Sekolah (Kop Kiri)</span>
                    {settingsForm.schoolLogo && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, schoolLogo: undefined })}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Reset ke Al-Azhar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center p-1 shrink-0 bg-slate-50">
                      {settingsForm.schoolLogo ? (
                        <img
                          src={settingsForm.schoolLogo}
                          alt="Logo Sekolah"
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#006699] flex flex-col items-center justify-center text-white text-[6px] font-bold">
                          <span>AL-AZHAR</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Logo (PNG/JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUploadInAdmin(e, 'school')}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Atau masukkan link/URL gambar logo..."
                        value={settingsForm.schoolLogo || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, schoolLogo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Yayasan (Kanan) */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">Logo Yayasan (Kop Kanan)</span>
                    {settingsForm.foundationLogo && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, foundationLogo: undefined })}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Reset ke YPIA
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center p-1 shrink-0 bg-slate-50">
                      {settingsForm.foundationLogo ? (
                        <img
                          src={settingsForm.foundationLogo}
                          alt="Logo Yayasan"
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#008040] flex flex-col items-center justify-center text-white text-[6px] font-bold">
                          <span>YPIA</span>
                          <div className="w-2 h-1.5 rounded-t-full bg-white mt-0.5"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Logo (PNG/JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUploadInAdmin(e, 'foundation')}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Atau masukkan link/URL gambar logo..."
                        value={settingsForm.foundationLogo || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, foundationLogo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900"
                      />
                    </div>
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

      {/* Teacher Form Modal */}
      <TeacherFormModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        teacherToEdit={teacherToEdit}
        onSave={onSaveTeacher}
      />

      {/* Bulk Student Import Modal */}
      <BulkStudentImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        teachers={teachers}
        existingStudents={students}
        onImportStudents={onImportStudents}
      />

      {/* Bulk Teacher Import Modal */}
      <BulkTeacherImportModal
        isOpen={isBulkTeacherImportModalOpen}
        onClose={() => setIsBulkTeacherImportModalOpen(false)}
        existingTeachers={teachers}
        onImportTeachers={onImportTeachers}
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
          onUpdateSettings={onUpdateSettings}
          onUpdateReport={(studentId, updatedReport) => {
            onUpdateReport(studentId, updatedReport);
            setPreviewReport(updatedReport);
          }}
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
