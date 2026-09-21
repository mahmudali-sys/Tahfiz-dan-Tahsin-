import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  Edit3, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Users, 
  Award,
  Sparkles,
  FileSpreadsheet,
  ChevronRight
} from 'lucide-react';
import { Student, Teacher, StudentReportData, SchoolSettings } from '../types';
import { getPredicate, getPredicateColor } from '../data/quranData';
import { generateRapotPDF } from '../utils/pdfGenerator';
import { GradeInputModal } from './GradeInputModal';
import { RapotPreviewModal } from './RapotPreviewModal';
import { QuranSimakanModal } from './QuranSimakanModal';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { TahfizSurahRecord } from '../types';

interface TeacherDashboardProps {
  currentTeacher: Teacher;
  students: Student[];
  reports: Record<string, StudentReportData>;
  settings: SchoolSettings;
  onUpdateReport: (studentId: string, updatedReport: StudentReportData) => void;
  onImportStudents?: (students: Student[], mode: 'append' | 'replace') => void;
  onOpenProcessingMenu?: (className?: string) => void;
  teachers?: Teacher[];
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTeacher,
  students,
  reports,
  settings,
  onUpdateReport,
  onImportStudents,
  onOpenProcessingMenu,
  teachers = [],
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<StudentReportData | null>(null);
  const [selectedStudentForPreview, setSelectedStudentForPreview] = useState<StudentReportData | null>(null);
  const [simakanStudent, setSimakanStudent] = useState<Student | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

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

  // Filter students based on teacher assigned classes, selected filter, and search
  const filteredStudents = students.filter((std) => {
    const matchesClass = selectedClass === 'all' || std.className === selectedClass;
    const matchesSearch =
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.nisn.includes(searchQuery) ||
      std.nis.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  // Calculate quick stats
  const totalStudents = filteredStudents.length;
  const gradedStudents = filteredStudents.filter((s) => reports[s.id]?.tahfizRecords.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
            {currentTeacher.name.charAt(4) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Guru Pengampu: {currentTeacher.specialty}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                NIP: {currentTeacher.nip}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {currentTeacher.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Kelas Bimbingan: <strong className="text-emerald-800">{currentTeacher.assignedClasses.join(', ')}</strong> • SMP Islam Al Azhar 9 Bekasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-right">
            <div className="text-xs text-slate-500">Santri Dinilai</div>
            <div className="text-base sm:text-lg font-bold text-emerald-800">
              {gradedStudents} / {totalStudents} Santri
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Featured Banner: Menu Khusus Pengolahan Nilai (Matriks Excel) */}
      {onOpenProcessingMenu && (
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center text-emerald-200 shrink-0 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Menu Khusus Pengolahan Nilai
                </span>
                <span className="text-xs text-emerald-200/90 font-medium hidden sm:inline">
                  Matriks Rekap & Edit Manual Seluruh Santri
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Lembar Kerja Pengolahan Nilai (Iqra & Tahfiz)
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5 max-w-2xl leading-relaxed">
                Edit nilai manual langsung di kisi-kisi spreadsheet per kelas (misal: <strong>Kelas 7B</strong>), hitung rata-rata otomatis, lengkapi target hafalan, dan simpan massal ke seluruh rapot santri.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenProcessingMenu(selectedClass !== 'all' ? selectedClass : '7B')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950" />
            <span>Buka Lembar Pengolahan Nilai</span>
            <ChevronRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">Semua Kelas ({students.length} Santri)</option>
            <optgroup label="Bimbingan Saya">
              {currentTeacher.assignedClasses.map((cls) => (
                <option key={`my-${cls}`} value={cls}>
                  Kelas {cls} (Rombel Guru)
                </option>
              ))}
            </optgroup>
            <optgroup label="Semua Rombel SMPIA 9">
              {Array.from(new Set(students.map((s) => s.className)))
                .sort()
                .map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls} ({students.filter((s) => s.className === cls).length} santri)
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama santri atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenProcessingMenu && (
            <button
              onClick={() => onOpenProcessingMenu(selectedClass !== 'all' ? selectedClass : '7B')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              title="Buka menu pengolahan nilai matriks lembar kerja Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Menu Pengolahan Nilai</span>
            </button>
          )}

          {onImportStudents && (
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              title="Impor murid massal Kelas 7 sampai 9 dari Excel atau salin-tempel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Impor Murid Massal</span>
            </button>
          )}

          {filteredStudents.length > 0 && (
            <button
              onClick={() => setSimakanStudent(filteredStudents[0])}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              title="Buka Lembaran Mushaf Al-Qur'an untuk menyimak bacaan murid"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>Layar Simakan Al-Qur'an</span>
            </button>
          )}
        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              Daftar Santri & Rekap Setoran Bacaan / Hafalan
            </h2>
            <p className="text-xs text-slate-500">
              Pilih santri untuk menambah atau mengubah nilai setoran tahsin dan tahfiz.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {filteredStudents.length} Santri Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Murid / NISN</th>
                <th className="py-3 px-4 text-center">Kelas</th>
                <th className="py-3 px-4">Target Kurikulum</th>
                <th className="py-3 px-4 text-center">Rata-rata Tahsin</th>
                <th className="py-3 px-4 text-center">Setoran Tahfiz</th>
                <th className="py-3 px-4 text-center">Tuntas Mutqin</th>
                <th className="py-3 px-4 text-center">Aksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const report = reports[student.id] || {
                  student,
                  tahsin: {
                    makharijulHuruf: 80,
                    ahkamutTajwid: 80,
                    ahkamulWaqf: 80,
                    fashahahTartil: 80,
                    levelBook: "Al-Qur'an",
                    notes: '',
                    lastUpdated: '',
                  },
                  tahfizRecords: [],
                  adab: {
                    kedisiplinan: 'A',
                    adabMushaf: 'A',
                    kerajinanMurojaah: 'B',
                    semangatHalaqah: 'A',
                    generalNotes: '',
                  },
                  summaryHafalan: {
                    totalSurahLulus: 0,
                    totalAyatHafal: 0,
                    juzCompleted: [],
                    currentJuzInProgress: 30,
                    completionPercentage: 0,
                  },
                };

                const avgTahsin = Math.round(
                  (report.tahsin.makharijulHuruf +
                    report.tahsin.ahkamutTajwid +
                    report.tahsin.ahkamulWaqf +
                    report.tahsin.fashahahTartil) /
                    4
                );

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Murid Name & NISN */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>NISN: {student.nisn}</span>
                        <span>•</span>
                        <span>NIS: {student.nis}</span>
                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                        {student.className}
                      </span>
                    </td>

                    {/* Target Kurikulum */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-800">
                        {student.targetJuz}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        Target {student.targetSurahCount} Surat
                      </div>
                    </td>

                    {/* Rata-rata Tahsin */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-sm text-slate-900">
                        {avgTahsin}
                      </span>
                      <div className="mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPredicateColor(getPredicate(avgTahsin))}`}>
                          {getPredicate(avgTahsin)}
                        </span>
                      </div>
                    </td>

                    {/* Setoran Tahfiz */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-xs text-slate-800">
                        {report.tahfizRecords.length} Catatan
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {report.summaryHafalan.totalAyatHafal} Ayat
                      </div>
                    </td>

                    {/* Tuntas Mutqin */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{report.summaryHafalan.totalSurahLulus} Surat</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {report.summaryHafalan.completionPercentage}% Capaian
                      </div>
                    </td>

                    {/* Aksi Guru */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Simak Al-Qur'an Live Button */}
                        <button
                          onClick={() => setSimakanStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                          title="Buka layar Al-Qur'an untuk menyimak hafalan murid & catat kesalahan secara live"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Simak Qur'an</span>
                        </button>

                        {/* Input/Ubah Nilai Button */}
                        <button
                          onClick={() => setSelectedStudentForGrading(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                          title="Input dan ubah nilai setoran santri"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Input Nilai</span>
                        </button>

                        {/* Pratinjau Rapot Button */}
                        <button
                          onClick={() => setSelectedStudentForPreview(report)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Pratinjau Rapot Resmi"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Download PDF Button */}
                        <button
                          onClick={() => generateRapotPDF(report, settings, currentTeacher.name)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Unduh Rapot PDF"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Grade Input Modal */}
      {selectedStudentForGrading && (
        <GradeInputModal
          isOpen={!!selectedStudentForGrading}
          onClose={() => setSelectedStudentForGrading(null)}
          reportData={selectedStudentForGrading}
          teacherName={currentTeacher.name}
          onSave={(updated) => {
            onUpdateReport(updated.student.id, updated);
            setSelectedStudentForGrading(null);
          }}
          onSaveAndOpenProcessing={(updated) => {
            onUpdateReport(updated.student.id, updated);
            setSelectedStudentForGrading(null);
            if (onOpenProcessingMenu) {
              onOpenProcessingMenu(updated.student.className);
            }
          }}
        />
      )}

      {/* Rapot Preview Modal */}
      {selectedStudentForPreview && (
        <RapotPreviewModal
          isOpen={!!selectedStudentForPreview}
          onClose={() => setSelectedStudentForPreview(null)}
          reportData={selectedStudentForPreview}
          settings={settings}
          teacherName={currentTeacher.name}
        />
      )}

      {/* Quran Simakan Modal (Layar Al-Qur'an Live untuk Menyimak Santri) */}
      {simakanStudent && (
        <QuranSimakanModal
          isOpen={!!simakanStudent}
          onClose={() => setSimakanStudent(null)}
          student={simakanStudent}
          teacherName={currentTeacher.name}
          onSaveTahfizResult={handleSaveSimakanResult}
        />
      )}

      {/* Bulk Student Import Modal */}
      {isBulkImportOpen && onImportStudents && (
        <BulkStudentImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          teachers={teachers}
          existingStudents={students}
          onImportStudents={(imported, mode) => {
            onImportStudents(imported, mode);
            setIsBulkImportOpen(false);
          }}
        />
      )}
    </div>
  );
};
