import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Save, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  ArrowLeft, 
  Sparkles,
  Layers,
  BookOpen,
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Student, StudentReportData, SchoolSettings, Teacher } from '../types';
import { 
  IQRA_SECTIONS, 
  TAHFIZ_SPREADSHEET_SURAHS, 
  StudentIqraMatrixRow,
  TahfizSpreadsheetSurah
} from '../data/spreadsheetCurriculum';
import { RapotPreviewModal } from './RapotPreviewModal';
import { getPredicate } from '../data/quranData';

interface PengolahanNilaiViewProps {
  students: Student[];
  reports: Record<string, StudentReportData>;
  settings: SchoolSettings;
  teachers: Teacher[];
  currentTeacher?: Teacher;
  onUpdateReport: (studentId: string, updatedReport: StudentReportData) => void;
  onBatchUpdateReports?: (updatedReports: Record<string, StudentReportData>) => void;
  onBackToDashboard?: () => void;
  initialClass?: string;
}

export const PengolahanNilaiView: React.FC<PengolahanNilaiViewProps> = ({
  students,
  reports,
  settings,
  teachers,
  currentTeacher,
  onUpdateReport,
  onBatchUpdateReports,
  onBackToDashboard,
  initialClass = '7B',
}) => {
  // Active Sheet Tab: 'iqra' | 'tahfiz' | 'rapot'
  const [activeSheet, setActiveSheet] = useState<'iqra' | 'tahfiz' | 'rapot'>('iqra');
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tahfizJuzFilter, setTahfizJuzFilter] = useState<'all' | '30' | '29' | '28' | '27_26'>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Selected student for quick rapot modal preview
  const [previewStudentReport, setPreviewStudentReport] = useState<StudentReportData | null>(null);

  // Filter students based on selected class and search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'all' || s.className === selectedClass;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery) ||
        s.nisn.includes(searchQuery);
      return matchClass && matchSearch;
    });
  }, [students, selectedClass, searchQuery]);

  // Local editable state for Nilai Iqra Matrix: studentId -> aspectId -> score
  // Also statusOverride: studentId -> jilid -> status
  const [iqraMatrixData, setIqraMatrixData] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    students.forEach((s) => {
      initial[s.id] = {};
      const rep = reports[s.id];
      if (rep && rep.tahsin.aspects) {
        rep.tahsin.aspects.forEach((asp) => {
          initial[s.id][asp.key] = asp.score ? String(asp.score) : '-';
        });
      }
    });
    return initial;
  });

  const [iqraStatusData, setIqraStatusData] = useState<Record<string, Record<number, string>>>(() => {
    const initial: Record<string, Record<number, string>> = {};
    students.forEach((s) => {
      initial[s.id] = {};
      const rep = reports[s.id];
      if (rep && rep.tahsin.jilidHistory) {
        Object.entries(rep.tahsin.jilidHistory).forEach(([j, rec]: [string, any]) => {
          initial[s.id][Number(j)] = rec?.status === 'Lulus (Naik Jilid)' ? `NAIK JILID ${Number(j) + 1}` : `TETAP DI JILID ${j}`;
        });
      }
    });
    return initial;
  });

  // Local editable state for Tahfiz Matrix: studentId -> surahNumber -> score (string)
  const [tahfizMatrixData, setTahfizMatrixData] = useState<Record<string, Record<number, string>>>(() => {
    const initial: Record<string, Record<number, string>> = {};
    students.forEach((s) => {
      initial[s.id] = {};
      const rep = reports[s.id];
      if (rep && rep.tahfizRecords) {
        rep.tahfizRecords.forEach((rec) => {
          initial[s.id][rec.surahNumber] = rec.gradeScore ? String(rec.gradeScore) : '-';
        });
      }
    });
    return initial;
  });

  // Keep local matrix updated when reports prop updates externally
  useEffect(() => {
    setIqraMatrixData((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.id]) next[s.id] = {};
        const rep = reports[s.id];
        if (rep && rep.tahsin.aspects) {
          rep.tahsin.aspects.forEach((asp) => {
            if (next[s.id][asp.key] === undefined) {
              next[s.id][asp.key] = asp.score ? String(asp.score) : '-';
            }
          });
        }
      });
      return next;
    });

    setTahfizMatrixData((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.id]) next[s.id] = {};
        const rep = reports[s.id];
        if (rep && rep.tahfizRecords) {
          rep.tahfizRecords.forEach((rec) => {
            if (next[s.id][rec.surahNumber] === undefined) {
              next[s.id][rec.surahNumber] = rec.gradeScore ? String(rec.gradeScore) : '-';
            }
          });
        }
      });
      return next;
    });
  }, [reports, students]);

  // Handlers for Nilai Iqra Matrix editing
  const handleIqraCellChange = (studentId: string, aspectId: string, value: string) => {
    setIqraMatrixData((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [aspectId]: value,
      },
    }));
  };

  const handleIqraStatusChange = (studentId: string, jilid: number, value: string) => {
    setIqraStatusData((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [jilid]: value,
      },
    }));
  };

  // Handlers for Tahfiz Matrix editing
  const handleTahfizCellChange = (studentId: string, surahNumber: number, value: string) => {
    setTahfizMatrixData((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [surahNumber]: value,
      },
    }));
  };

  // Helper calculations for an Iqra Jilid Section
  const getSectionStats = (studentId: string, section: typeof IQRA_SECTIONS[0]) => {
    const sData = iqraMatrixData[studentId] || {};
    let sum = 0;
    let count = 0;
    let hasAnyValue = false;

    section.aspects.forEach((asp) => {
      const raw = sData[asp.id];
      if (raw !== undefined && raw !== '' && raw !== '-') {
        const num = parseFloat(raw);
        if (!isNaN(num)) {
          sum += num;
          count += 1;
          hasAnyValue = true;
        }
      }
    });

    if (!hasAnyValue) {
      return {
        jumlah: '-',
        rerata: '-',
        recommendedStatus: '-',
      };
    }

    const rerataNum = count > 0 ? sum / count : 0;
    const rerata = rerataNum > 0 ? rerataNum.toFixed(1) : '-';
    const recommendedStatus = rerataNum >= 80 ? section.defaultPassStatus : section.defaultFailStatus;

    return {
      jumlah: sum > 0 ? String(Math.round(sum)) : '-',
      rerata,
      recommendedStatus,
    };
  };

  // Calculate Overall Rata-Rata for Nilai Iqra
  const getOverallIqraAverage = (studentId: string) => {
    let totalScore = 0;
    let totalAspects = 0;
    const sData = iqraMatrixData[studentId] || {};

    IQRA_SECTIONS.forEach((sec) => {
      sec.aspects.forEach((asp) => {
        const raw = sData[asp.id];
        if (raw !== undefined && raw !== '' && raw !== '-') {
          const num = parseFloat(raw);
          if (!isNaN(num)) {
            totalScore += num;
            totalAspects += 1;
          }
        }
      });
    });

    if (totalAspects === 0) return '-';
    // Weighted formula as in Excel sample
    return (totalScore / totalAspects).toFixed(2);
  };

  // Save changes to Global Reports & local state
  const handleSaveAllToReports = () => {
    const updatedBatch: Record<string, StudentReportData> = {};
    filteredStudents.forEach((student) => {
      const currentReport = reports[student.id];
      if (!currentReport) return;

      // 1. Sync Tahsin aspects
      const sIqraData = iqraMatrixData[student.id] || {};
      const updatedAspects = (currentReport.tahsin.aspects || []).map((asp) => {
        const editedVal = sIqraData[asp.key];
        if (editedVal !== undefined && editedVal !== '' && editedVal !== '-') {
          const num = Math.min(100, Math.max(0, parseInt(editedVal, 10) || 80));
          return {
            ...asp,
            score: num,
            predicate: getPredicate(num),
          };
        }
        return asp;
      });

      // Calculate new average for Tahsin
      const validScores = updatedAspects.map((a) => a.score).filter((s) => s > 0);
      const newTahsinAvg =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : currentReport.tahsin.averageScore || 85;

      // 2. Sync Tahfiz records
      const sTahfizData = tahfizMatrixData[student.id] || {};
      const updatedTahfizRecords = [...currentReport.tahfizRecords];

      Object.entries(sTahfizData).forEach(([surahNumStr, scoreStr]) => {
        const sNum = parseInt(surahNumStr, 10);
        const meta = TAHFIZ_SPREADSHEET_SURAHS.find((s) => s.surahNumber === sNum);
        if (!meta) return;

        const existingIdx = updatedTahfizRecords.findIndex((r) => r.surahNumber === sNum);
        const scoreVal = String(scoreStr || '').trim();
        if (scoreVal && scoreVal !== '-') {
          const numScore = Math.min(100, Math.max(0, parseInt(scoreVal, 10) || 80));
          const newRecord = {
            id: existingIdx >= 0 ? updatedTahfizRecords[existingIdx].id : `rec-${student.id}-${sNum}`,
            surahNumber: sNum,
            surahName: meta.name,
            juzNumber: meta.juz,
            ayatFrom: 1,
            ayatTo: 10, // standard default
            gradeScore: numScore,
            predicate: getPredicate(numScore),
            isMutqin: numScore >= 75,
            date: new Date().toISOString().split('T')[0],
            examinerTeacherName: currentTeacher?.name || 'Ustadz Pembimbing',
          };

          if (existingIdx >= 0) {
            updatedTahfizRecords[existingIdx] = newRecord;
          } else {
            updatedTahfizRecords.push(newRecord);
          }
        } else if (scoreStr === '-' || scoreStr === '') {
          // If explicitly set to '-' or empty, keep or remove
          if (existingIdx >= 0 && scoreStr === '') {
            updatedTahfizRecords.splice(existingIdx, 1);
          }
        }
      });

      const uniqueLulus = Array.from(
        new Set(updatedTahfizRecords.filter((r) => r.isMutqin).map((r) => r.surahNumber))
      );
      const totalAyat = updatedTahfizRecords.reduce((acc, r) => acc + (r.ayatTo - r.ayatFrom + 1), 0);
      const targetCount = student.targetSurahCount || 37;
      const completionPct = Math.min(100, Math.round((uniqueLulus.length / targetCount) * 100));

      const updatedReport: StudentReportData = {
        ...currentReport,
        tahsin: {
          ...currentReport.tahsin,
          aspects: updatedAspects,
          averageScore: newTahsinAvg,
          overallPredicate: getPredicate(newTahsinAvg),
          lastUpdated: new Date().toISOString().split('T')[0],
        },
        tahfizRecords: updatedTahfizRecords,
        summaryHafalan: {
          ...currentReport.summaryHafalan,
          totalSurahLulus: uniqueLulus.length,
          totalAyatHafal: totalAyat,
          completionPercentage: completionPct,
        },
      };

      updatedBatch[student.id] = updatedReport;
      onUpdateReport(student.id, updatedReport);
    });

    if (onBatchUpdateReports && Object.keys(updatedBatch).length > 0) {
      onBatchUpdateReports(updatedBatch);
    }

    setSaveSuccessMsg(`Berhasil menyimpan data pengolahan nilai untuk ${filteredStudents.length} santri ke Rapot resmi & Server Cloud.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Quick batch fill standard values for empty cells
  const handleAutoFillPassingGrades = () => {
    if (!confirm('Apakah Anda ingin mengisi nilai standar (90) untuk materi santri yang belum terisi?')) return;
    setIqraMatrixData((prev) => {
      const next = { ...prev };
      filteredStudents.forEach((student) => {
        if (!next[student.id]) next[student.id] = {};
        IQRA_SECTIONS.forEach((sec) => {
          sec.aspects.forEach((asp) => {
            if (!next[student.id][asp.id] || next[student.id][asp.id] === '-') {
              // only fill if student belongs to that level or higher
              next[student.id][asp.id] = '90';
            }
          });
        });
      });
      return next;
    });
  };

  // Export current active view to CSV
  const handleExportCSV = () => {
    if (activeSheet === 'iqra') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      // Headers
      const headers = ['NO', 'NIS', 'NAMA', 'KELOMPOK'];
      IQRA_SECTIONS.forEach((sec) => {
        sec.aspects.forEach((asp) => headers.push(`${sec.label} - ${asp.name}`));
        headers.push(`${sec.label} - Jumlah`);
        headers.push(`${sec.label} - Rerata`);
        headers.push(`${sec.label} - Status`);
      });
      headers.push('Rata-Rata Total');
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';

      // Rows
      filteredStudents.forEach((std, idx) => {
        const row = [String(idx + 1), std.nis, std.name, std.kelompok || '6'];
        IQRA_SECTIONS.forEach((sec) => {
          sec.aspects.forEach((asp) => {
            row.push(iqraMatrixData[std.id]?.[asp.id] || '-');
          });
          const stats = getSectionStats(std.id, sec);
          row.push(stats.jumlah);
          row.push(stats.rerata);
          row.push(iqraStatusData[std.id]?.[sec.jilid] || stats.recommendedStatus);
        });
        row.push(getOverallIqraAverage(std.id));
        csvContent += row.map((r) => `"${r}"`).join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Nilai_Iqra_${selectedClass}_SMPIA9.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Tahfiz CSV
      let csvContent = 'data:text/csv;charset=utf-8,';
      const visibleSurahs = displayedTahfizSurahs;
      const headers = ['NO', 'No Induk', 'NAMA'];
      visibleSurahs.forEach((s) => headers.push(`Juz ${s.juz} - ${s.name}`));
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';

      filteredStudents.forEach((std, idx) => {
        const row = [String(idx + 1), std.nis, std.name];
        visibleSurahs.forEach((s) => {
          row.push(tahfizMatrixData[std.id]?.[s.surahNumber] || '-');
        });
        csvContent += row.map((r) => `"${r}"`).join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rekap_Tahfiz_${selectedClass}_SMPIA9.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filtered Tahfiz surahs for display
  const displayedTahfizSurahs = useMemo(() => {
    if (tahfizJuzFilter === 'all') return TAHFIZ_SPREADSHEET_SURAHS;
    if (tahfizJuzFilter === '30') return TAHFIZ_SPREADSHEET_SURAHS.filter((s) => s.juz === 30);
    if (tahfizJuzFilter === '29') return TAHFIZ_SPREADSHEET_SURAHS.filter((s) => s.juz === 29);
    if (tahfizJuzFilter === '28') return TAHFIZ_SPREADSHEET_SURAHS.filter((s) => s.juz === 28);
    return TAHFIZ_SPREADSHEET_SURAHS.filter((s) => s.juz === 27 || s.juz === 26);
  }, [tahfizJuzFilter]);

  return (
    <div className="space-y-4">
      {/* Top Application Bar with Back Button & Breadcrumbs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Kembali ke Dashboard Guru"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Menu Pengolahan Nilai (Matriks Excel)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tahun Ajaran {settings.academicYear} • Semester {settings.semester}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <span>Rencana Rapot Iqra' dan Tahfiz</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                .xlsx Editor
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleAutoFillPassingGrades}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            title="Isi nilai standar 90 pada sel kosong"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Isi Cepat</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            title="Ekspor tabel aktif ke file CSV Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleSaveAllToReports}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            title="Simpan semua sel penilaian ke Rapot resmi murid"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua ke Rapot</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Pilih Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">Semua Kelas ({students.length} Santri)</option>
            <optgroup label="Kelas 7 (Target Juz 30)">
              <option value="7A">Kelas 7A</option>
              <option value="7B">Kelas 7B (Sesuai File Excel)</option>
              <option value="7C">Kelas 7C</option>
            </optgroup>
            <optgroup label="Kelas 8 (Target Juz 29 & 30)">
              <option value="8A">Kelas 8A</option>
              <option value="8B">Kelas 8B</option>
              <option value="8C">Kelas 8C</option>
            </optgroup>
            <optgroup label="Kelas 9 (Target Juz 28, 29, 30)">
              <option value="9A">Kelas 9A</option>
              <option value="9B">Kelas 9B</option>
            </optgroup>
          </select>
          <span className="text-xs font-medium text-slate-500 ml-1">
            {filteredStudents.length} santri ditampilkan
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri berdasarkan Nama atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
      </div>

      {/* SPREADSHEET TABS: Like Google Sheets / Excel Tabs */}
      <div className="flex items-center justify-between border-b border-slate-300 bg-slate-200/80 px-2 pt-2 rounded-t-xl overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* Sheet 1: Nilai Iqra */}
          <button
            type="button"
            onClick={() => setActiveSheet('iqra')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t border-x ${
              activeSheet === 'iqra'
                ? 'bg-white text-emerald-800 border-slate-300 shadow-xs border-b-white z-10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-50 border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nilai Iqra</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              Iqro 3 s/d 6
            </span>
          </button>

          {/* Sheet 2: tAHFIZ */}
          <button
            type="button"
            onClick={() => setActiveSheet('tahfiz')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t border-x ${
              activeSheet === 'tahfiz'
                ? 'bg-white text-emerald-800 border-slate-300 shadow-xs border-b-white z-10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-50 border-transparent hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>tAHFIZ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              Juz 30–26
            </span>
          </button>

          {/* Sheet 3: Rapot (Quick Preview) */}
          <button
            type="button"
            onClick={() => {
              if (filteredStudents.length > 0) {
                const rep = reports[filteredStudents[0].id];
                if (rep) setPreviewStudentReport(rep);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer border-t border-x border-transparent"
            title="Pratinjau Rapot Resmi Santri"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Rapot (Preview A4)</span>
          </button>
        </div>

        {/* Sub-toolbar for tAHFIZ sheet */}
        {activeSheet === 'tahfiz' && (
          <div className="flex items-center gap-1 pb-1.5 text-xs">
            <span className="text-slate-600 font-semibold text-[11px] mr-1">Tampilkan Juz:</span>
            <button
              onClick={() => setTahfizJuzFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                tahfizJuzFilter === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua (30-26)
            </button>
            <button
              onClick={() => setTahfizJuzFilter('30')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                tahfizJuzFilter === '30' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Juz 30
            </button>
            <button
              onClick={() => setTahfizJuzFilter('29')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                tahfizJuzFilter === '29' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Juz 29
            </button>
            <button
              onClick={() => setTahfizJuzFilter('28')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                tahfizJuzFilter === '28' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Juz 28
            </button>
            <button
              onClick={() => setTahfizJuzFilter('27_26')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                tahfizJuzFilter === '27_26' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Juz 27 & 26
            </button>
          </div>
        )}
      </div>

      {/* SPREADSHEET BODY */}
      <div className="bg-white rounded-b-2xl border border-slate-300 shadow-sm overflow-hidden">
        {/* TAB 1: NILAI IQRA (Matching IMG_1309.png exactly) */}
        {activeSheet === 'iqra' && (
          <div className="overflow-x-auto max-h-[75vh]">
            <table className="w-full border-collapse text-[11px] text-slate-800 select-none">
              <thead className="sticky top-0 bg-slate-100 z-20 shadow-xs border-b border-black">
                {/* Header Row 1: Jilid Group Banners */}
                <tr className="bg-slate-200/90 text-center font-bold text-slate-900">
                  <th colSpan={4} className="border border-slate-300 py-1.5 px-2 bg-slate-300/80">
                    IDENTITAS SANTRI
                  </th>
                  {IQRA_SECTIONS.map((sec) => (
                    <th
                      key={sec.jilid}
                      colSpan={sec.aspects.length + 3}
                      className="border border-slate-400 py-1.5 px-2 bg-emerald-800 text-white tracking-wide"
                    >
                      {sec.label}
                    </th>
                  ))}
                  <th rowSpan={2} className="border border-slate-400 py-2 px-3 bg-emerald-900 text-white font-bold text-center">
                    Rata-Rata
                  </th>
                </tr>

                {/* Header Row 2: Sub-aspects, Jumlah, Rerata, NAIK/TETAP JILID */}
                <tr className="bg-slate-100 text-center font-semibold text-slate-800 text-[10px] leading-tight">
                  <th className="border border-slate-300 py-2 px-1.5 w-10 text-center bg-slate-200">NO</th>
                  <th className="border border-slate-300 py-2 px-2 w-28 text-left bg-slate-200">NIS</th>
                  <th className="border border-slate-300 py-2 px-3 min-w-[190px] text-left bg-slate-200">NAMA</th>
                  <th className="border border-slate-300 py-2 px-1.5 w-14 text-center bg-slate-200">Kelompok</th>

                  {/* Aspects per Jilid */}
                  {IQRA_SECTIONS.map((sec) => (
                    <React.Fragment key={`sub-${sec.jilid}`}>
                      {sec.aspects.map((asp) => (
                        <th
                          key={asp.id}
                          className="border border-slate-300 py-2 px-1.5 min-w-[70px] max-w-[85px] bg-slate-50 font-normal hover:bg-slate-200 cursor-help"
                          title={asp.name}
                        >
                          <div className="line-clamp-2">{asp.name}</div>
                        </th>
                      ))}
                      <th className="border border-slate-300 py-2 px-1.5 w-14 bg-amber-50 text-amber-900 font-bold">
                        Jumlah
                      </th>
                      <th className="border border-slate-300 py-2 px-1.5 w-14 bg-amber-50 text-amber-900 font-bold">
                        Rerata
                      </th>
                      <th className="border border-slate-300 py-2 px-2 min-w-[120px] bg-emerald-50 text-emerald-950 font-bold">
                        NAIK/TETAP JILID
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {filteredStudents.map((student, rowIdx) => {
                  const sData = iqraMatrixData[student.id] || {};
                  const overallAvg = getOverallIqraAverage(student.id);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-amber-50/50 transition-colors group"
                    >
                      {/* NO */}
                      <td className="border border-slate-300 py-1.5 px-1.5 text-center font-bold text-slate-500 bg-slate-50/60">
                        {rowIdx + 1}
                      </td>

                      {/* NIS */}
                      <td className="border border-slate-300 py-1.5 px-2 text-slate-700 font-medium">
                        {student.nis}
                      </td>

                      {/* NAMA with Quick Preview Click */}
                      <td className="border border-slate-300 py-1.5 px-3 font-sans font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{student.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const rep = reports[student.id];
                              if (rep) setPreviewStudentReport(rep);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:bg-emerald-50 rounded transition-opacity cursor-pointer"
                            title="Lihat Rapot Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Kelompok */}
                      <td className="border border-slate-300 py-1.5 px-1.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {student.kelompok || '6'}
                        </span>
                      </td>

                      {/* Jilid Sections */}
                      {IQRA_SECTIONS.map((sec) => {
                        const stats = getSectionStats(student.id, sec);
                        const currentStatus =
                          iqraStatusData[student.id]?.[sec.jilid] || stats.recommendedStatus;

                        return (
                          <React.Fragment key={`cells-${student.id}-${sec.jilid}`}>
                            {sec.aspects.map((asp) => {
                              const val = sData[asp.id] || '-';
                              const isFilled = val !== '-' && val !== '';

                              return (
                                <td
                                  key={`c-${asp.id}`}
                                  className={`border border-slate-300 p-0 text-center ${
                                    isFilled ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                                  }`}
                                >
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleIqraCellChange(student.id, asp.id, e.target.value)}
                                    className="w-full h-8 text-center bg-transparent border-0 focus:ring-2 focus:ring-emerald-500 font-mono text-[11px] text-slate-900 focus:bg-white"
                                  />
                                </td>
                              );
                            })}

                            {/* Jumlah */}
                            <td className="border border-slate-300 py-1.5 px-1 text-center font-bold bg-amber-50/40 text-slate-800">
                              {stats.jumlah}
                            </td>

                            {/* Rerata */}
                            <td className="border border-slate-300 py-1.5 px-1 text-center font-bold bg-amber-50/40 text-slate-900">
                              {stats.rerata}
                            </td>

                            {/* NAIK/TETAP JILID */}
                            <td className="border border-slate-300 p-0 bg-emerald-50/30 text-center font-sans text-[10px]">
                              <input
                                type="text"
                                value={currentStatus}
                                onChange={(e) => handleIqraStatusChange(student.id, sec.jilid, e.target.value)}
                                className={`w-full h-8 px-1 text-center font-semibold border-0 focus:ring-2 focus:ring-emerald-500 ${
                                  currentStatus.includes('NAIK')
                                    ? 'text-emerald-800 font-bold'
                                    : currentStatus.includes('TETAP')
                                    ? 'text-amber-800'
                                    : 'text-slate-400'
                                }`}
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* Rata-Rata Total */}
                      <td className="border border-slate-300 py-1.5 px-2 text-center font-bold font-mono text-emerald-950 bg-emerald-50/60">
                        {overallAvg}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: tAHFIZ (Matching IMG_1310.png exactly) */}
        {activeSheet === 'tahfiz' && (
          <div className="overflow-x-auto max-h-[75vh]">
            <table className="w-full border-collapse text-[11px] text-slate-800 select-none">
              <thead className="sticky top-0 bg-slate-100 z-20 shadow-xs border-b border-black">
                {/* Header Row 1: REKAP NILAI RAPORT PESERTA DIDIK - HAFALAN */}
                <tr className="bg-slate-200 text-center font-bold text-slate-900">
                  <th colSpan={3} className="border border-slate-300 py-1.5 px-2 bg-slate-300/80">
                    IDENTITAS
                  </th>
                  <th
                    colSpan={displayedTahfizSurahs.length}
                    className="border border-slate-400 py-1.5 px-2 bg-emerald-800 text-white tracking-widest uppercase"
                  >
                    Hafalan Al-Qur'an (Surat & Nilai Mutqin)
                  </th>
                </tr>

                {/* Header Row 2: Surah Names with Color bands from IMG_1310 */}
                <tr className="text-center font-bold text-[10px]">
                  <th className="border border-slate-300 py-2 px-1.5 w-10 text-center bg-slate-200">No</th>
                  <th className="border border-slate-300 py-2 px-2 w-28 text-left bg-slate-200">No Induk</th>
                  <th className="border border-slate-300 py-2 px-3 min-w-[190px] text-left bg-slate-200">Nama</th>

                  {displayedTahfizSurahs.map((surah) => (
                    <th
                      key={surah.surahNumber}
                      className={`border border-slate-300 py-2 px-1 min-w-[45px] max-w-[55px] font-semibold text-center ${surah.groupBg} ${surah.groupColor}`}
                      title={`No ${surah.surahNumber}. ${surah.name} (Juz ${surah.juz})`}
                    >
                      <div className="text-[9px] truncate max-w-[50px] mx-auto">
                        {surah.name}
                      </div>
                      <div className="text-[8px] opacity-80">J.{surah.juz}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {filteredStudents.map((student, rowIdx) => {
                  const sTahfiz = tahfizMatrixData[student.id] || {};

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-amber-50/50 transition-colors group"
                    >
                      {/* No */}
                      <td className="border border-slate-300 py-1.5 px-1.5 text-center font-bold text-slate-500 bg-slate-50/60">
                        {rowIdx + 1}
                      </td>

                      {/* No Induk */}
                      <td className="border border-slate-300 py-1.5 px-2 text-slate-700 font-medium">
                        {student.nis}
                      </td>

                      {/* Nama */}
                      <td className="border border-slate-300 py-1.5 px-3 font-sans font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{student.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const rep = reports[student.id];
                              if (rep) setPreviewStudentReport(rep);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:bg-emerald-50 rounded transition-opacity cursor-pointer"
                            title="Lihat Rapot Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Surah Score Cells */}
                      {displayedTahfizSurahs.map((surah) => {
                        const val = sTahfiz[surah.surahNumber] || '-';
                        const isFilled = val !== '-' && val !== '';

                        return (
                          <td
                            key={`tahfiz-${student.id}-${surah.surahNumber}`}
                            className={`border border-slate-300 p-0 text-center ${
                              isFilled ? 'bg-emerald-50/40 text-emerald-950 font-bold' : 'bg-slate-50/30 text-slate-400'
                            }`}
                          >
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                handleTahfizCellChange(student.id, surah.surahNumber, e.target.value)
                              }
                              className="w-full h-8 text-center bg-transparent border-0 focus:ring-2 focus:ring-emerald-500 font-mono text-[11px] text-slate-900 focus:bg-white"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>
              Ketik angka penilaian (misal: <strong>90</strong>, <strong>85</strong>, atau <strong>-</strong>) langsung pada sel matriks, lalu klik <strong>"Simpan Semua ke Rapot"</strong> untuk sinkronisasi otomatis.
            </span>
          </div>
          <div className="font-semibold text-slate-700">
            {filteredStudents.length} Santri • {settings.schoolName}
          </div>
        </div>
      </div>

      {/* Official Rapot Preview Modal (when clicked from any student row) */}
      {previewStudentReport && (
        <RapotPreviewModal
          isOpen={!!previewStudentReport}
          onClose={() => setPreviewStudentReport(null)}
          reportData={previewStudentReport}
          settings={settings}
          teacherName={currentTeacher?.name || teachers[0]?.name || 'Ustadz Pembimbing'}
        />
      )}
    </div>
  );
};
