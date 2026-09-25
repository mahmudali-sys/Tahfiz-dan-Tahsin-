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
  ChevronRight,
  ClipboardList,
  UserCheck,
  Printer,
  Calendar,
  X,
  Edit3,
  Award,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Student, StudentReportData, SchoolSettings, Teacher, TahfizSurahRecord } from '../types';
import { 
  IQRA_SECTIONS, 
  TAHFIZ_SPREADSHEET_SURAHS, 
  StudentIqraMatrixRow,
  TahfizSpreadsheetSurah
} from '../data/spreadsheetCurriculum';
import { RapotPreviewModal } from './RapotPreviewModal';
import { GradeInputModal } from './GradeInputModal';
import { QuranSimakanModal } from './QuranSimakanModal';
import { AttendanceAndHafalanModal, formatIndonesianDate } from './AttendanceAndHafalanModal';
import { getTodayIso, getYesterdayIso } from './IndonesianDatePicker';
import { getPredicate, getPredicateColor } from '../data/quranData';

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
  onUpdateSettings?: (newSettings: SchoolSettings) => void;
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
  onUpdateSettings,
}) => {
  // Active Sheet Tab: 'absen' | 'iqra' | 'tahfiz' | 'rapot'
  const [activeSheet, setActiveSheet] = useState<'absen' | 'iqra' | 'tahfiz' | 'rapot'>('absen');
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tahfizJuzFilter, setTahfizJuzFilter] = useState<'all' | '30' | '29' | '28' | '27_26'>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Selected student for quick modals
  const [previewStudentReport, setPreviewStudentReport] = useState<StudentReportData | null>(null);
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<StudentReportData | null>(null);
  const [simakanStudent, setSimakanStudent] = useState<Student | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Tanggal Presensi & Modal Setoran Halaqah
  const [attendanceDate, setAttendanceDate] = useState<string>(() => getTodayIso());
  const [isAttendanceHafalanModalOpen, setIsAttendanceHafalanModalOpen] = useState<boolean>(false);
  const [modalInitialStudentId, setModalInitialStudentId] = useState<string | undefined>(undefined);

  // Daily attendance state: studentId -> 'H' | 'S' | 'I' | 'A'
  const [attendanceData, setAttendanceData] = useState<Record<string, 'H' | 'S' | 'I' | 'A'>>(() => {
    const saved = localStorage.getItem(`SMPIA9_ATTENDANCE_${selectedClass}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const initial: Record<string, 'H' | 'S' | 'I' | 'A'> = {};
    students.forEach((s) => {
      initial[s.id] = 'H';
    });
    return initial;
  });

  // Daily attendance notes
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    students.forEach((s) => {
      initial[s.id] = reports[s.id]?.adab?.generalNotes || '';
    });
    return initial;
  });

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

  // Determine assigned teacher for currently selected class
  const assignedTeacher = useMemo(() => {
    const found = teachers.find((t) => t.assignedClasses.includes(selectedClass));
    return found || currentTeacher || teachers[0];
  }, [teachers, selectedClass, currentTeacher]);

  // Save attendance state to localStorage whenever changed
  const handleAttendanceChange = (studentId: string, status: 'H' | 'S' | 'I' | 'A') => {
    setAttendanceData((prev) => {
      const updated = { ...prev, [studentId]: status };
      localStorage.setItem(`SMPIA9_ATTENDANCE_${selectedClass}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'H' | 'S' | 'I' | 'A'> = { ...attendanceData };
    filteredStudents.forEach((s) => {
      updated[s.id] = 'H';
    });
    setAttendanceData(updated);
    localStorage.setItem(`SMPIA9_ATTENDANCE_${selectedClass}`, JSON.stringify(updated));
    setSaveSuccessMsg(`Seluruh ${filteredStudents.length} santri ditandai Hadir (H).`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAttendanceNoteChange = (studentId: string, note: string) => {
    setAttendanceNotes((prev) => ({
      ...prev,
      [studentId]: note,
    }));
  };

  const handleSaveAttendanceAndSetoran = (params: {
    studentId: string;
    attendanceDate: string;
    attendanceStatus: 'H' | 'S' | 'I' | 'A';
    attendanceNote: string;
    hafalanRecord?: TahfizSurahRecord;
  }) => {
    // 1. Update attendance
    handleAttendanceChange(params.studentId, params.attendanceStatus);
    if (params.attendanceNote) {
      handleAttendanceNoteChange(params.studentId, params.attendanceNote);
    }
    setAttendanceDate(params.attendanceDate);

    // 2. Update hafalan setoran if provided
    if (params.hafalanRecord) {
      const student = students.find((s) => s.id === params.studentId);
      const curReport = reports[params.studentId];
      if (student && curReport) {
        const filtered = curReport.tahfizRecords.filter((r) => r.surahNumber !== params.hafalanRecord!.surahNumber);
        const updatedRecords = [params.hafalanRecord, ...filtered];
        const totalAyat = updatedRecords.reduce((acc, r) => acc + (r.ayatTo - r.ayatFrom + 1), 0);
        const uniqueSurahs = Array.from(new Set(updatedRecords.map((r) => r.surahNumber)));
        const targetCount = student.targetSurahCount || 37;
        const completionPct = Math.min(100, Math.round((uniqueSurahs.length / targetCount) * 100));

        const updatedReport: StudentReportData = {
          ...curReport,
          tahfizRecords: updatedRecords,
          summaryHafalan: {
            ...curReport.summaryHafalan,
            totalSurahLulus: uniqueSurahs.length,
            totalAyatHafal: totalAyat,
            completionPercentage: completionPct,
          },
        };
        onUpdateReport(params.studentId, updatedReport);
      }
    }

    setSaveSuccessMsg(`Data kehadiran (${formatIndonesianDate(params.attendanceDate)}) dan setoran santri berhasil dicatat!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Live Al-Qur'an Simakan Save Handler
  const handleSaveSimakanResult = (newRecord: TahfizSurahRecord) => {
    if (!simakanStudent) return;
    const currentReport = reports[simakanStudent.id];
    if (!currentReport) return;

    const filtered = currentReport.tahfizRecords.filter((r) => r.surahNumber !== newRecord.surahNumber);
    const updatedRecords = [newRecord, ...filtered];
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
    setTahfizMatrixData((prev) => ({
      ...prev,
      [simakanStudent.id]: {
        ...(prev[simakanStudent.id] || {}),
        [newRecord.surahNumber]: String(newRecord.gradeScore),
      },
    }));
    setSimakanStudent(null);
    setSaveSuccessMsg(`Hasil simakan Al-Qur'an ${simakanStudent.name} (${newRecord.surahName} Nilai: ${newRecord.gradeScore}) berhasil dicatat!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

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
    if (activeSheet === 'absen') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      const headers = [
        'No. Absen',
        'NISN',
        'NIS',
        'Nama Lengkap Santri',
        'L/P',
        'Kelas',
        'Status Presensi',
        'Target Kurikulum',
        'Capaian Tahsin',
        'Rata-rata Tahsin',
        'Predikat Tahsin',
        'Surat Tahfiz Terakhir',
        'Nilai Tahfiz',
        'Predikat Tahfiz',
        'Catatan Guru'
      ];
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';

      filteredStudents.forEach((std, idx) => {
        const rep = reports[std.id];
        const pres = attendanceData[std.id] || 'H';
        const lastTahfiz = rep?.tahfizRecords?.[0];
        const row = [
          String(idx + 1),
          std.nisn,
          std.nis,
          std.name,
          std.gender,
          std.className,
          pres === 'H' ? 'Hadir' : pres === 'S' ? 'Sakit' : pres === 'I' ? 'Izin' : 'Alpa',
          std.targetJuz,
          rep?.tahsin?.levelBook || `Iqro' Jilid ${rep?.tahsin?.jilid || 6}`,
          String(rep?.tahsin?.averageScore || 85),
          rep?.tahsin?.overallPredicate || 'Mumtaz',
          lastTahfiz ? `${lastTahfiz.surahName} (Ayat ${lastTahfiz.ayatFrom}-${lastTahfiz.ayatTo})` : 'Belum Ada',
          lastTahfiz ? String(lastTahfiz.gradeScore) : '-',
          lastTahfiz ? lastTahfiz.predicate : '-',
          attendanceNotes[std.id] || rep?.adab?.generalNotes || '-'
        ];
        csvContent += row.map((r) => `"${r}"`).join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Absen_Penilaian_${selectedClass}_SMPIA9.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

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
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
                Lembar Absen & Pengolahan Nilai
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tahun Ajaran {settings.academicYear} • Semester {settings.semester}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <span>Buku Absensi & Lembar Penilaian Santri</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Kelas {selectedClass}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-emerald-300"
            title="Cetak lembar absen dan penilaian resmi format A4"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cetak Absen & Penilaian</span>
          </button>

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
              <option value="9C">Kelas 9C</option>
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
          {/* Sheet 0: Absen & Penilaian */}
          <button
            type="button"
            onClick={() => setActiveSheet('absen')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t border-x ${
              activeSheet === 'absen'
                ? 'bg-white text-emerald-800 border-slate-300 shadow-xs border-b-white z-10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-50 border-transparent hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Absen & Penilaian</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              Presensi & Harian
            </span>
          </button>

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
        {/* TAB 0: LEMBAR ABSEN & PENILAIAN */}
        {activeSheet === 'absen' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Header Status & Attendance Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Santri</div>
                <div className="text-xl font-black text-slate-800 mt-0.5">{filteredStudents.length} Santri</div>
                <div className="text-[10px] text-slate-400">Kelas {selectedClass}</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase">Hadir (H)</div>
                <div className="text-xl font-black text-emerald-800 mt-0.5">
                  {filteredStudents.filter((s) => (attendanceData[s.id] || 'H') === 'H').length}
                </div>
                <div className="text-[10px] text-emerald-600">Presensi Aktif</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-[11px] font-semibold text-amber-700 uppercase">Sakit (S)</div>
                <div className="text-xl font-black text-amber-800 mt-0.5">
                  {filteredStudents.filter((s) => attendanceData[s.id] === 'S').length}
                </div>
                <div className="text-[10px] text-amber-600">Izin Sakit</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-[11px] font-semibold text-blue-700 uppercase">Izin (I)</div>
                <div className="text-xl font-black text-blue-800 mt-0.5">
                  {filteredStudents.filter((s) => attendanceData[s.id] === 'I').length}
                </div>
                <div className="text-[10px] text-blue-600">Izin Keperluan</div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="text-[11px] font-semibold text-rose-700 uppercase">Alpa (A)</div>
                <div className="text-xl font-black text-rose-800 mt-0.5">
                  {filteredStudents.filter((s) => attendanceData[s.id] === 'A').length}
                </div>
                <div className="text-[10px] text-rose-600">Tanpa Keterangan</div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="text-[11px] font-semibold text-indigo-700 uppercase">% Kehadiran</div>
                <div className="text-xl font-black text-indigo-800 mt-0.5">
                  {filteredStudents.length > 0
                    ? Math.round(
                        (filteredStudents.filter((s) => (attendanceData[s.id] || 'H') === 'H').length /
                          filteredStudents.length) *
                          100
                      )
                    : 100}
                  %
                </div>
                <div className="text-[10px] text-indigo-600">Halaqah Pekan Ini</div>
              </div>
            </div>

            {/* Header Pengaturan Tanggal Presensi & Setoran Halaqah */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-800/80 rounded-xl border border-emerald-700 text-emerald-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                    Presensi Halaqah & Setoran Al-Qur'an
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white flex flex-wrap items-center gap-2">
                    <span>Tanggal Pertemuan:</span>
                    <span className="bg-emerald-700/90 border border-emerald-500/70 px-2.5 py-0.5 rounded-lg text-emerald-100 font-extrabold text-sm sm:text-base">
                      {formatIndonesianDate(attendanceDate, true)}
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Kelas {selectedClass} • Guru Pengampu: {assignedTeacher.name}
                  </p>
                </div>
              </div>

              {/* Date Input and Open Form Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-emerald-950/70 p-1.5 rounded-xl border border-emerald-700/60 text-xs">
                  <span className="text-emerald-200 font-bold text-[11px] pl-1.5">Pilih Tanggal:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-white text-slate-900 font-bold px-2 py-1 rounded-lg text-xs cursor-pointer shadow-2xs focus:ring-2 focus:ring-emerald-400"
                    title="Klik untuk memilih tanggal dan hari"
                  />
                  <button
                    type="button"
                    onClick={() => setAttendanceDate(getTodayIso())}
                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceDate(getYesterdayIso())}
                    className="px-2 py-1 bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    Kemarin
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalInitialStudentId(undefined);
                    setIsAttendanceHafalanModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  title="Buka form input tanggal kehadiran dan tanggal murid menghafal / setoran hafalan"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Form Tanggal Kehadiran & Setoran</span>
                </button>
              </div>
            </div>

            {/* Quick Presensi Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">Aksi Presensi:</span>
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-colors"
                >
                  ✓ Set Semua Hadir (H)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  Cetak Lembar Absen & Penilaian
                </button>
              </div>

              <div className="text-slate-500 font-medium">
                Guru Pengampu: <strong className="text-slate-800">{assignedTeacher.name}</strong> • Target: <span className="text-emerald-700 font-bold">{selectedClass.startsWith('9') ? 'Juz 28, 29, 30' : selectedClass.startsWith('8') ? 'Juz 29 & 30' : 'Juz 30'}</span>
              </div>
            </div>

            {/* Attendance & Grading Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12 bg-slate-200/80">No. Absen</th>
                    <th className="py-2.5 px-3 w-36">NISN / NIS</th>
                    <th className="py-2.5 px-4 min-w-[200px]">Nama Santri</th>
                    <th className="py-2.5 px-2 text-center w-16">L/P</th>
                    <th className="py-2.5 px-3 text-center min-w-[170px]">
                      Presensi ({formatIndonesianDate(attendanceDate, true)})
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[140px]">Tahsin / Iqra</th>
                    <th className="py-2.5 px-3 text-center min-w-[200px]">
                      <div>Setoran Tahfiz & Tanggal</div>
                      <div className="text-[9px] font-normal text-slate-500 normal-case tracking-normal">
                        (Klik kolom untuk buka form)
                      </div>
                    </th>
                    <th className="py-2.5 px-3 min-w-[180px]">Catatan Perkembangan</th>
                    <th className="py-2.5 px-3 text-center min-w-[180px]">Aksi Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredStudents.map((student, idx) => {
                    const rep = reports[student.id];
                    const currentPresensi = attendanceData[student.id] || 'H';
                    const lastTahfiz = rep?.tahfizRecords?.[0];
                    const tahsinAvg = rep?.tahsin?.averageScore || 85;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* No. Absen */}
                        <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            {idx + 1}
                          </span>
                        </td>

                        {/* NISN & NIS */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900 text-xs">{student.nisn}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NIS: {student.nis}</div>
                        </td>

                        {/* Nama Santri */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-emerald-700">Kelas {student.className}</span>
                            <span>•</span>
                            <span>Kelompok {student.kelompok || '6'}</span>
                          </div>
                        </td>

                        {/* L/P */}
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold ${
                              student.gender === 'L'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            {student.gender}
                          </span>
                        </td>

                        {/* Presensi Segmented Buttons */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                            {(['H', 'S', 'I', 'A'] as const).map((status) => {
                              const isActive = currentPresensi === status;
                              const activeColor =
                                status === 'H'
                                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                  : status === 'S'
                                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                                  : status === 'I'
                                  ? 'bg-blue-500 text-white shadow-xs font-bold'
                                  : 'bg-rose-600 text-white shadow-xs font-bold';

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleAttendanceChange(student.id, status)}
                                  className={`px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                                    isActive
                                      ? activeColor
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
                                  }`}
                                  title={
                                    status === 'H'
                                      ? 'Hadir'
                                      : status === 'S'
                                      ? 'Sakit'
                                      : status === 'I'
                                      ? 'Izin'
                                      : 'Alpa'
                                  }
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Tahsin / Iqra */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {rep?.tahsin?.levelBook || `Iqro' Jilid ${rep?.tahsin?.jilid || 6}`}
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="font-mono font-bold text-xs text-slate-900">{tahsinAvg}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getPredicateColor(
                                rep?.tahsin?.overallPredicate || getPredicate(tahsinAvg)
                              )}`}
                            >
                              {rep?.tahsin?.overallPredicate || getPredicate(tahsinAvg)}
                            </span>
                          </div>
                        </td>

                        {/* Setoran Tahfiz Terakhir & Tanggal (Klik Kolom untuk Form) */}
                        <td
                          onClick={() => {
                            setModalInitialStudentId(student.id);
                            setIsAttendanceHafalanModalOpen(true);
                          }}
                          className="py-3 px-3 text-center hover:bg-blue-50/80 transition-colors cursor-pointer group"
                          title={`Klik untuk membuka form tanggal & setoran: ${student.name}`}
                        >
                          {lastTahfiz ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 text-xs group-hover:text-blue-900">
                                {lastTahfiz.surahName}{' '}
                                <span className="text-[10px] font-normal text-slate-500">
                                  ({lastTahfiz.ayatFrom}–{lastTahfiz.ayatTo})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Nilai: <strong className="text-emerald-700">{lastTahfiz.gradeScore}</strong> • Predikat: <span className="font-bold text-slate-700">{lastTahfiz.predicate || 'Mumtaz'}</span>
                              </div>
                              {/* Prominent Tanggal dan Hari Badge */}
                              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded shadow-2xs group-hover:bg-blue-200 transition-colors">
                                <Calendar className="w-3 h-3 text-blue-700" />
                                <span>{formatIndonesianDate(lastTahfiz.date, true)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-[11px] text-blue-700 group-hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold group-hover:bg-blue-100 transition-colors">
                              <Plus className="w-3 h-3" />
                              <span>+ Form Tanggal & Setoran</span>
                            </div>
                          )}
                        </td>

                        {/* Catatan Perkembangan */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="Catatan perkembangan halaqah..."
                            value={attendanceNotes[student.id] || ''}
                            onChange={(e) => handleAttendanceNoteChange(student.id, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                          />
                        </td>

                        {/* Aksi Guru */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setModalInitialStudentId(student.id);
                                setIsAttendanceHafalanModalOpen(true);
                              }}
                              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                              title="Buka Form Tanggal Kehadiran & Setoran Santri Ini"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Form</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSimakanStudent(student)}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                              title="Buka Layar Simakan Al-Qur'an Live"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Simak</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (rep) setSelectedStudentForGrading(rep);
                              }}
                              className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200"
                              title="Input Nilai Lengkap"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (rep) setPreviewStudentReport(rep);
                              }}
                              className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors border border-emerald-200"
                              title="Lihat Rapot A4"
                            >
                              <Eye className="w-3.5 h-3.5" />
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

        {/* TAB 1: NILAI IQRA (Matching IMG_1309.png exactly) */}
        {activeSheet === 'iqra' && (
          <div className="overflow-x-auto max-h-[75vh]">
            <table className="w-full border-collapse text-[11px] text-slate-800 select-none">
              <thead className="sticky top-0 bg-slate-100 z-20 shadow-xs border-b border-black">
                {/* Header Row 1: Jilid Group Banners */}
                <tr className="bg-slate-200/90 text-center font-bold text-slate-900">
                  <th colSpan={5} className="border border-slate-300 py-1.5 px-2 bg-slate-300/80">
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
                  <th className="border border-slate-300 py-2 px-1 w-12 text-center bg-slate-200">L/P</th>
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

                      {/* L/P */}
                      <td className="border border-slate-300 py-1.5 px-1 text-center font-bold">
                        <span className={`px-1 py-0.2 rounded text-[10px] ${student.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                          {student.gender}
                        </span>
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
                  <th colSpan={4} className="border border-slate-300 py-1.5 px-2 bg-slate-300/80">
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
                  <th className="border border-slate-300 py-2 px-1 w-12 text-center bg-slate-200">L/P</th>

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

                      {/* L/P */}
                      <td className="border border-slate-300 py-1.5 px-1 text-center font-bold">
                        <span className={`px-1 py-0.2 rounded text-[10px] ${student.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                          {student.gender}
                        </span>
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
          onUpdateSettings={onUpdateSettings}
          onUpdateReport={(studentId, updatedReport) => {
            onUpdateReport(studentId, updatedReport);
            setPreviewStudentReport(updatedReport);
          }}
        />
      )}

      {/* Grade Input Modal (when edit button clicked) */}
      {selectedStudentForGrading && (
        <GradeInputModal
          isOpen={!!selectedStudentForGrading}
          onClose={() => setSelectedStudentForGrading(null)}
          reportData={selectedStudentForGrading}
          teacherName={currentTeacher?.name || assignedTeacher.name}
          onSave={(updatedReport) => {
            onUpdateReport(updatedReport.student.id, updatedReport);
            setSelectedStudentForGrading(null);
            setSaveSuccessMsg(`Data nilai santri ${updatedReport.student.name} berhasil diperbarui!`);
            setTimeout(() => setSaveSuccessMsg(null), 3000);
          }}
        />
      )}

      {/* Live Al-Qur'an Simakan Modal */}
      {simakanStudent && (
        <QuranSimakanModal
          isOpen={!!simakanStudent}
          onClose={() => setSimakanStudent(null)}
          student={simakanStudent}
          teacherName={currentTeacher?.name || assignedTeacher.name}
          onSaveTahfizResult={handleSaveSimakanResult}
        />
      )}

      {/* Form Tanggal Kehadiran & Setoran Santri Modal */}
      {isAttendanceHafalanModalOpen && (
        <AttendanceAndHafalanModal
          isOpen={isAttendanceHafalanModalOpen}
          onClose={() => {
            setIsAttendanceHafalanModalOpen(false);
            setModalInitialStudentId(undefined);
          }}
          students={students}
          reports={reports}
          teacherName={currentTeacher?.name || assignedTeacher.name}
          teachers={teachers}
          selectedClass={selectedClass}
          initialStudentId={modalInitialStudentId}
          initialAttendanceDate={attendanceDate}
          onSaveAttendanceAndSetoran={handleSaveAttendanceAndSetoran}
        />
      )}

      {/* Official Printable Lembar Absen & Penilaian Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 bg-emerald-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-300" />
                <span className="font-bold text-sm">
                  Cetak Lembar Absensi & Penilaian Santri Kelas {selectedClass}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex justify-center">
              <div className="bg-white p-6 sm:p-8 w-full max-w-4xl shadow-md border border-slate-300 text-slate-900 print:shadow-none print:border-none print:p-0">
                {/* Official Letterhead (KOP) */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                  <div className="text-[12px] font-bold tracking-wider uppercase text-emerald-800">
                    {settings.foundationName}
                  </div>
                  <div className="text-lg font-black tracking-wide uppercase text-slate-900">
                    {settings.schoolName}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {settings.address}, {settings.city} • Telp: {settings.phone} • Email: {settings.email}
                  </div>
                  <div className="mt-2 text-sm font-extrabold uppercase tracking-wide text-slate-900 bg-slate-100 py-1 rounded">
                    DAFTAR ABSENSI DAN LEMBAR PENILAIAN TAHSIN & TAHFIZ AL-QUR'AN
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    Tahun Ajaran {settings.academicYear} • Semester {settings.semester}
                  </div>
                </div>

                {/* Class & Teacher Details */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-4 pb-2 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-28 font-semibold text-slate-600">Rombel:</span>
                      <span className="font-bold text-slate-900">Kelas {selectedClass}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-semibold text-slate-600">Target Kurikulum:</span>
                      <span className="font-bold text-emerald-800">
                        {selectedClass.startsWith('9') ? 'Juz 28, 29, 30 (59 Surat Mutqin)' : selectedClass.startsWith('8') ? 'Juz 29 & 30 (48 Surat Mutqin)' : 'Juz 30 (37 Surat Mutqin)'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-28 font-semibold text-slate-600">Guru Pengampu:</span>
                      <span className="font-bold text-slate-900">{assignedTeacher.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-semibold text-slate-600">Total Santri:</span>
                      <span className="font-bold text-slate-900">{filteredStudents.length} Santri</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-semibold text-slate-600">Tgl Kehadiran:</span>
                      <span className="font-bold text-emerald-900">{formatIndonesianDate(attendanceDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Ledger Table */}
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-200 text-center font-bold text-slate-900">
                      <th className="border border-slate-400 p-1 w-8">No</th>
                      <th className="border border-slate-400 p-1 w-24">NISN / NIS</th>
                      <th className="border border-slate-400 p-1 text-left min-w-[150px]">Nama Santri</th>
                      <th className="border border-slate-400 p-1 w-8">L/P</th>
                      <th className="border border-slate-400 p-1 w-12">Absen</th>
                      <th className="border border-slate-400 p-1 min-w-[110px]">Tahsin (Iqra/Hal)</th>
                      <th className="border border-slate-400 p-1 w-10">Nilai</th>
                      <th className="border border-slate-400 p-1 min-w-[130px]">Setoran Tahfiz & Tanggal</th>
                      <th className="border border-slate-400 p-1 w-10">Nilai</th>
                      <th className="border border-slate-400 p-1 min-w-[100px]">Catatan / Paraf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => {
                      const rep = reports[student.id];
                      const pres = attendanceData[student.id] || 'H';
                      const lastTahfiz = rep?.tahfizRecords?.[0];
                      const tahsinAvg = rep?.tahsin?.averageScore || 85;

                      return (
                        <tr key={`print-${student.id}`} className="text-slate-800">
                          <td className="border border-slate-400 p-1 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-400 p-1 font-mono text-[9px] text-center">
                            {student.nisn}<br /><span className="text-slate-500">{student.nis}</span>
                          </td>
                          <td className="border border-slate-400 p-1 font-semibold">{student.name}</td>
                          <td className="border border-slate-400 p-1 text-center font-bold">{student.gender}</td>
                          <td className="border border-slate-400 p-1 text-center font-bold">
                            <span className={pres === 'H' ? 'text-emerald-700' : pres === 'S' ? 'text-amber-700' : pres === 'I' ? 'text-blue-700' : 'text-rose-700'}>
                              {pres}
                            </span>
                          </td>
                          <td className="border border-slate-400 p-1 text-center">
                            {rep?.tahsin?.levelBook || `Iqro' Jilid ${rep?.tahsin?.jilid || 6}`}
                          </td>
                          <td className="border border-slate-400 p-1 text-center font-bold">{tahsinAvg}</td>
                          <td className="border border-slate-400 p-1 text-center">
                            {lastTahfiz ? (
                              <div>
                                <span className="font-semibold">{lastTahfiz.surahName} ({lastTahfiz.ayatFrom}-{lastTahfiz.ayatTo})</span>
                                {lastTahfiz.date && (
                                  <div className="text-[8px] text-slate-500">Tgl: {lastTahfiz.date}</div>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="border border-slate-400 p-1 text-center font-bold">
                            {lastTahfiz ? lastTahfiz.gradeScore : '-'}
                          </td>
                          <td className="border border-slate-400 p-1 text-left text-[9px]">
                            {attendanceNotes[student.id] || rep?.adab?.generalNotes || ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 grid grid-cols-2 text-center text-xs">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-semibold text-slate-700">Koordinator Tahfiz & Al-Qur'an</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline text-slate-900">
                      {settings.coordinatorName || 'Mahmud Ali Yafi, S.S, M.Pd.I.'}
                    </div>
                    <div className="text-[10px] text-slate-600">NIP: 19820415 200801 1 008</div>
                  </div>

                  <div>
                    <div>Bekasi, {settings.reportDate || '19 Desember 2025'}</div>
                    <div className="font-semibold text-slate-700">Guru Pengampu Halaqah</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline text-slate-900">{assignedTeacher.name}</div>
                    <div className="text-[10px] text-slate-600">NIP: {assignedTeacher.nip || '19870512 201201 1 003'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
