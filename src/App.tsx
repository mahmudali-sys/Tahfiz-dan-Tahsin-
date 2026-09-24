import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { PengolahanNilaiView } from './components/PengolahanNilaiView';
import { SyncStatusModal } from './components/SyncStatusModal';
import { UserRole, Student, Teacher, StudentReportData, SchoolSettings } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_REPORTS, 
  INITIAL_SCHOOL_SETTINGS 
} from './data/mockData';
import { createDefaultTahsinGrade } from './data/iqroData';
import { 
  fetchServerData, 
  checkServerStatus, 
  pushFullSyncData, 
  pushSingleReport, 
  pushBatchReports, 
  pushResetDatabase, 
  detectDeviceName 
} from './services/syncService';
import { ShieldCheck, GraduationCap, UserCheck, BookOpen, Info, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react';

const STORAGE_KEYS = {
  STUDENTS: 'smpia9_students_v1',
  TEACHERS: 'smpia9_teachers_v1',
  REPORTS: 'smpia9_reports_v1',
  SETTINGS: 'smpia9_settings_v1',
  CURRENT_ROLE: 'smpia9_role_v1',
  CURRENT_TEACHER: 'smpia9_cur_teacher_v1',
  CURRENT_STUDENT: 'smpia9_cur_student_v1',
  SERVER_VERSION: 'smpia9_server_version_v1',
};

export default function App() {
  // State initialization with localStorage fallback
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as UserRole) || 'guru';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!saved) return INITIAL_STUDENTS;
    try {
      const parsed: Student[] = JSON.parse(saved);
      const count9C = parsed.filter((s) => s.className === '9C').length;
      const first9C = parsed.find((s) => s.className === '9C');
      const needs9CUpdate = !first9C || first9C.name !== 'Ahmad Zuhal' || count9C < 20 || parsed.length < 168;

      if (needs9CUpdate) {
        const non9C = parsed.filter((s) => s.className !== '9C');
        const existingMap = new Map(non9C.map((s) => [s.id, s]));
        const merged = [...non9C];
        INITIAL_STUDENTS.forEach((s) => {
          if (s.className === '9C' || !existingMap.has(s.id)) {
            merged.push(s);
          }
        });
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [reports, setReports] = useState<Record<string, StudentReportData>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    try {
      const existing = saved ? JSON.parse(saved) : {};
      const merged = { ...INITIAL_REPORTS, ...existing };
      INITIAL_STUDENTS.filter((s) => s.className === '9C').forEach((s) => {
        if (merged[s.id]) {
          merged[s.id] = {
            ...merged[s.id],
            student: s,
          };
        } else {
          merged[s.id] = INITIAL_REPORTS[s.id];
        }
      });
      return merged;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_SETTINGS;
  });

  const [currentTeacherId, setCurrentTeacherId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER) || INITIAL_TEACHERS[0].id;
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT) || INITIAL_STUDENTS[0].id;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'pengolahan_nilai'>('dashboard');
  const [processingClass, setProcessingClass] = useState<string>('7B');

  // Multi-Device Cloud Sync State (Laptop, iPad, HP)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => new Date());
  const [lastUpdatedByDevice, setLastUpdatedByDevice] = useState<string>('');
  const [serverVersion, setServerVersion] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVER_VERSION);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // 1. Initial Load: Fetch master database from server (shared between Laptop, iPad, HP)
  useEffect(() => {
    let isMounted = true;
    async function loadMasterData() {
      setIsSyncing(true);
      const serverData = await fetchServerData();
      if (isMounted && serverData) {
        if (serverData.students && serverData.students.length > 0) {
          setStudents(serverData.students);
        }
        if (serverData.teachers && serverData.teachers.length > 0) {
          setTeachers(serverData.teachers);
        }
        if (serverData.reports && Object.keys(serverData.reports).length > 0) {
          setReports(serverData.reports);
        }
        if (serverData.settings) {
          setSettings(serverData.settings);
        }
        setServerVersion(serverData.version);
        localStorage.setItem(STORAGE_KEYS.SERVER_VERSION, String(serverData.version));
        setLastSyncTime(new Date());
      }
      if (isMounted) {
        setIsSyncing(false);
      }
    }
    loadMasterData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Multi-device background sync polling (every 5 seconds & on window focus)
  useEffect(() => {
    let isChecking = false;

    async function pollServer() {
      if (isChecking) return;
      isChecking = true;
      try {
        const status = await checkServerStatus();
        if (status && status.version > serverVersion) {
          // Newer data exists on server (e.g. from Laptop, iPad, or HP)
          setIsSyncing(true);
          const fresh = await fetchServerData();
          if (fresh) {
            setStudents(fresh.students);
            setTeachers(fresh.teachers);
            setReports(fresh.reports);
            setSettings(fresh.settings);
            setServerVersion(fresh.version);
            localStorage.setItem(STORAGE_KEYS.SERVER_VERSION, String(fresh.version));
            setLastSyncTime(new Date());
            if (status.updatedByDevice) {
              setLastUpdatedByDevice(status.updatedByDevice);
              setSyncToast(`Data diperbarui otomatis dari ${status.updatedByDevice}`);
              setTimeout(() => setSyncToast(null), 3500);
            }
          }
          setIsSyncing(false);
        }
      } catch (err) {
        console.warn('Sync poll error:', err);
      } finally {
        isChecking = false;
      }
    }

    const interval = setInterval(pollServer, 5000);

    const onFocus = () => {
      pollServer();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [serverVersion]);

  // Handle role change with view check
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'murid') {
      setActiveView('dashboard');
    }
  };

  // Sync state to localStorage (offline backup cache)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, currentTeacherId);
  }, [currentTeacherId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, currentStudentId);
  }, [currentStudentId]);

  // Handlers with server synchronization
  const handleSaveStudent = async (student: Student) => {
    const exists = students.some((s) => s.id === student.id);
    let updatedList: Student[];
    if (exists) {
      updatedList = students.map((s) => (s.id === student.id ? student : s));
    } else {
      updatedList = [student, ...students];
    }
    setStudents(updatedList);

    let updatedReports = { ...reports };
    // If report does not exist, initialize one
    if (!reports[student.id]) {
      const defaultJilid = student.className.startsWith('7') ? 5 : 6;
      const newReport: StudentReportData = {
        student,
        tahsin: createDefaultTahsinGrade(defaultJilid as 1 | 2 | 3 | 4 | 5 | 6, 12, 'Sedang Ditempuh', 85, 'Santri aktif mengikuti halaqah tahsin metode Iqro AMM.'),
        tahfizRecords: [],
        adab: {
          kedisiplinan: 'A',
          adabMushaf: 'A',
          kerajinanMurojaah: 'B',
          semangatHalaqah: 'A',
          generalNotes: 'Menunjukkan kesungguhan dalam belajar Al-Qur\'an.',
        },
        summaryHafalan: {
          totalSurahLulus: 0,
          totalAyatHafal: 0,
          juzCompleted: [],
          currentJuzInProgress: 30,
          completionPercentage: 0,
        },
      };
      updatedReports[student.id] = newReport;
      setReports(updatedReports);
    } else {
      updatedReports[student.id] = {
        ...updatedReports[student.id],
        student,
      };
      setReports(updatedReports);
    }

    // Push to server
    setIsSyncing(true);
    const res = await pushFullSyncData({ students: updatedList, reports: updatedReports });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleImportStudents = async (newStudents: Student[], mode: 'append' | 'replace') => {
    let updatedStudentList: Student[];
    const updatedReports: Record<string, StudentReportData> = mode === 'replace' ? {} : { ...reports };

    if (mode === 'replace') {
      updatedStudentList = newStudents;
    } else {
      const existingMap = new Map<string, Student>();
      students.forEach((s) => existingMap.set(s.nisn || s.id, s));
      newStudents.forEach((newStd) => {
        existingMap.set(newStd.nisn || newStd.id, newStd);
      });
      updatedStudentList = Array.from(existingMap.values());
    }

    updatedStudentList.forEach((std) => {
      if (!updatedReports[std.id]) {
        const targetJuzNum = std.className.startsWith('7') ? 30 : std.className.startsWith('8') ? 29 : 28;
        const defaultJilid = std.className.startsWith('7') ? 5 : 6;
        updatedReports[std.id] = {
          student: std,
          tahsin: createDefaultTahsinGrade(defaultJilid as 1 | 2 | 3 | 4 | 5 | 6, 15, 'Sedang Ditempuh', 85, 'Santri aktif dalam pembelajaran tilawah Iqro AMM.'),
          tahfizRecords: [],
          adab: {
            kedisiplinan: 'A',
            adabMushaf: 'A',
            kerajinanMurojaah: 'B',
            semangatHalaqah: 'A',
            generalNotes: 'Menunjukkan kesungguhan dalam belajar Al-Qur\'an.',
          },
          summaryHafalan: {
            totalSurahLulus: 0,
            totalAyatHafal: 0,
            juzCompleted: [],
            currentJuzInProgress: targetJuzNum,
            completionPercentage: 0,
          },
        };
      } else {
        updatedReports[std.id] = {
          ...updatedReports[std.id],
          student: std,
        };
      }
    });

    setStudents(updatedStudentList);
    setReports(updatedReports);
    if (updatedStudentList.length > 0) {
      setCurrentStudentId(updatedStudentList[0].id);
    }

    // Push to server
    setIsSyncing(true);
    const res = await pushFullSyncData({ students: updatedStudentList, reports: updatedReports });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleDeleteStudent = async (id: string) => {
    const updatedStudents = students.filter((s) => s.id !== id);
    const updatedReports = { ...reports };
    delete updatedReports[id];

    setStudents(updatedStudents);
    setReports(updatedReports);

    if (currentStudentId === id && updatedStudents.length > 0) {
      setCurrentStudentId(updatedStudents[0].id);
    }

    setIsSyncing(true);
    const res = await pushFullSyncData({ students: updatedStudents, reports: updatedReports });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleBatchDeleteStudents = async (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const updatedStudents = students.filter((s) => !idSet.has(s.id));
    const updatedReports = { ...reports };
    ids.forEach((id) => delete updatedReports[id]);

    setStudents(updatedStudents);
    setReports(updatedReports);

    if (idSet.has(currentStudentId) && updatedStudents.length > 0) {
      setCurrentStudentId(updatedStudents[0].id);
    }

    setIsSyncing(true);
    const res = await pushFullSyncData({ students: updatedStudents, reports: updatedReports });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleImportTeachers = async (newTeachers: Teacher[], mode: 'append' | 'replace') => {
    let updatedTeachers: Teacher[];
    if (mode === 'replace') {
      updatedTeachers = newTeachers.length > 0 ? newTeachers : teachers;
    } else {
      const existingNips = new Set(teachers.map((t) => t.nip));
      const existingNames = new Set(teachers.map((t) => t.name.toLowerCase()));
      const filteredNew = newTeachers.filter(
        (t) => !existingNips.has(t.nip) && !existingNames.has(t.name.toLowerCase())
      );
      updatedTeachers = [...teachers, ...filteredNew];
    }

    setTeachers(updatedTeachers);
    if (updatedTeachers.length > 0 && !updatedTeachers.some((t) => t.id === currentTeacherId)) {
      setCurrentTeacherId(updatedTeachers[0].id);
    }

    setIsSyncing(true);
    const res = await pushFullSyncData({ teachers: updatedTeachers });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleBatchDeleteTeachers = async (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const remainingTeachers = teachers.filter((t) => !idSet.has(t.id));

    if (remainingTeachers.length === 0) {
      alert('Tidak dapat menghapus semua guru. Minimal harus ada 1 guru aktif di sistem.');
      return;
    }

    const fallbackTeacherId = remainingTeachers[0].id;
    // Reassign students whose teacher was deleted
    const updatedStudents = students.map((s) => {
      if (idSet.has(s.teacherId)) {
        return { ...s, teacherId: fallbackTeacherId };
      }
      return s;
    });

    setTeachers(remainingTeachers);
    setStudents(updatedStudents);
    if (idSet.has(currentTeacherId)) {
      setCurrentTeacherId(fallbackTeacherId);
    }

    setIsSyncing(true);
    const res = await pushFullSyncData({ teachers: remainingTeachers, students: updatedStudents });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleSaveTeacher = async (teacher: Teacher) => {
    const exists = teachers.some((t) => t.id === teacher.id);
    let updatedTeachers: Teacher[];
    if (exists) {
      updatedTeachers = teachers.map((t) => (t.id === teacher.id ? teacher : t));
    } else {
      updatedTeachers = [...teachers, teacher];
    }
    setTeachers(updatedTeachers);

    setIsSyncing(true);
    const res = await pushFullSyncData({ teachers: updatedTeachers });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (teachers.length <= 1) {
      alert('Minimal harus ada 1 guru terdaftar.');
      return;
    }
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    if (currentTeacherId === id) {
      setCurrentTeacherId(updated[0].id);
    }

    setIsSyncing(true);
    const res = await pushFullSyncData({ teachers: updated });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  // Update a single student's report (e.g. from GradeInputModal) and immediately push to cloud
  const handleUpdateReport = async (studentId: string, updatedReport: StudentReportData) => {
    setReports((prev) => ({
      ...prev,
      [studentId]: updatedReport,
    }));

    setIsSyncing(true);
    const res = await pushSingleReport(studentId, updatedReport);
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  // Batch update reports (e.g. from Pengolahan Nilai Excel matrix) and immediately push to cloud
  const handleBatchUpdateReports = async (updatedReportsBatch: Record<string, StudentReportData>) => {
    setReports((prev) => ({
      ...prev,
      ...updatedReportsBatch,
    }));

    setIsSyncing(true);
    const res = await pushBatchReports(updatedReportsBatch);
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleUpdateSettings = async (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    setIsSyncing(true);
    const res = await pushFullSyncData({ settings: newSettings });
    if (res.version) setServerVersion(res.version);
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleResetData = async () => {
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setReports(INITIAL_REPORTS);
    setSettings(INITIAL_SCHOOL_SETTINGS);
    setCurrentTeacherId(INITIAL_TEACHERS[0].id);
    setCurrentStudentId(INITIAL_STUDENTS[0].id);
    localStorage.clear();

    setIsSyncing(true);
    await pushResetDatabase();
    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  // Manual sync triggered from Sync Modal
  const handleManualSync = async () => {
    setIsSyncing(true);
    const fresh = await fetchServerData();
    if (fresh) {
      setStudents(fresh.students);
      setTeachers(fresh.teachers);
      setReports(fresh.reports);
      setSettings(fresh.settings);
      setServerVersion(fresh.version);
      localStorage.setItem(STORAGE_KEYS.SERVER_VERSION, String(fresh.version));
      setLastSyncTime(new Date());
      setSyncToast('Sinkronisasi selesai! Data terbaru dari cloud berhasil dimuat.');
      setTimeout(() => setSyncToast(null), 3000);
    }
    setIsSyncing(false);
  };

  const handleExportBackup = () => {
    const backupObj = {
      version: serverVersion,
      exportedAt: new Date().toISOString(),
      students,
      teachers,
      reports,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_smpia9_tahsin_tahfiz_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.students && parsed.reports) {
        setStudents(parsed.students);
        if (parsed.teachers) setTeachers(parsed.teachers);
        setReports(parsed.reports);
        if (parsed.settings) setSettings(parsed.settings);
        
        setIsSyncing(true);
        const res = await pushFullSyncData({
          students: parsed.students,
          teachers: parsed.teachers,
          reports: parsed.reports,
          settings: parsed.settings,
        });
        if (res.version) setServerVersion(res.version);
        setLastSyncTime(new Date());
        setIsSyncing(false);
      }
    } catch (err) {
      alert('Format file cadangan JSON tidak valid.');
    }
  };

  const activeTeacher = teachers.find((t) => t.id === currentTeacherId) || teachers[0];
  const activeStudent = students.find((s) => s.id === currentStudentId) || students[0];
  const activeReport = activeStudent ? reports[activeStudent.id] || INITIAL_REPORTS['std-1'] : INITIAL_REPORTS['std-1'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">
      {/* Top Navbar with active role, identity switcher, and Cloud Sync button */}
      <Navbar
        currentRole={role}
        onChangeRole={handleRoleChange}
        teachers={teachers}
        students={students}
        currentTeacherId={currentTeacherId}
        onChangeTeacherId={setCurrentTeacherId}
        currentStudentId={currentStudentId}
        onChangeStudentId={setCurrentStudentId}
        academicYear={settings.academicYear}
        semester={settings.semester}
        activeView={activeView}
        onChangeView={setActiveView}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Cloud Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Role Context Bar */}
      <div className="no-print bg-slate-200/70 border-b border-slate-300/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span className="font-semibold text-emerald-950">
                  Peran Saat Ini: <strong>Administrator</strong> (Dapat mengelola seluruh murid, guru, nilai, dan kop rapot)
                </span>
              </>
            )}
            {role === 'guru' && (
              <>
                <GraduationCap className="w-4 h-4 text-emerald-800" />
                <span className="font-semibold text-emerald-950">
                  Peran Saat Ini: <strong>Guru Tahsin & Tahfiz</strong> (Bisa menambah dan mengubah nilai setoran anak serta cetak rapot)
                </span>
              </>
            )}
            {role === 'murid' && (
              <>
                <UserCheck className="w-4 h-4 text-emerald-800" />
                <span className="font-semibold text-emerald-950">
                  Peran Saat Ini: <strong>Murid / Santri</strong> (Hanya dapat melihat capaian hafalan dan mengunduh rapot PDF)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-emerald-900 font-bold hover:underline cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sinkron HP, iPad & Laptop</span>
            </button>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 font-medium">
              <Info className="w-3.5 h-3.5" />
              <span>Klik tombol peran di atas untuk berpindah akses dengan instan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dedicated Manual Grade Processing Sheet View (Menu Khusus Pengolahan Nilai) */}
        {activeView === 'pengolahan_nilai' && role !== 'murid' ? (
          <PengolahanNilaiView
            students={students}
            reports={reports}
            settings={settings}
            teachers={teachers}
            currentTeacher={activeTeacher}
            onUpdateReport={handleUpdateReport}
            onBatchUpdateReports={handleBatchUpdateReports}
            onBackToDashboard={() => setActiveView('dashboard')}
            initialClass={processingClass}
            onUpdateSettings={handleUpdateSettings}
          />
        ) : (
          <>
            {role === 'admin' && (
              <AdminDashboard
                students={students}
                teachers={teachers}
                reports={reports}
                settings={settings}
                onSaveStudent={handleSaveStudent}
                onImportStudents={handleImportStudents}
                onDeleteStudent={handleDeleteStudent}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onImportTeachers={handleImportTeachers}
                onBatchDeleteStudents={handleBatchDeleteStudents}
                onBatchDeleteTeachers={handleBatchDeleteTeachers}
                onUpdateSettings={handleUpdateSettings}
                onUpdateReport={handleUpdateReport}
                onResetData={handleResetData}
                onOpenProcessingMenu={(cls) => {
                  if (cls) setProcessingClass(cls);
                  setActiveView('pengolahan_nilai');
                }}
              />
            )}

            {role === 'guru' && activeTeacher && (
              <TeacherDashboard
                currentTeacher={activeTeacher}
                students={students}
                reports={reports}
                settings={settings}
                onUpdateReport={handleUpdateReport}
                onImportStudents={handleImportStudents}
                teachers={teachers}
                onUpdateSettings={handleUpdateSettings}
                onOpenProcessingMenu={(cls) => {
                  if (cls) setProcessingClass(cls);
                  setActiveView('pengolahan_nilai');
                }}
              />
            )}

            {role === 'murid' && activeReport && (
              <StudentDashboard
                reportData={activeReport}
                settings={settings}
                teachers={teachers}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </>
        )}
      </main>

      {/* Multi-Device Cloud Sync Status Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        lastUpdatedByDevice={lastUpdatedByDevice}
        serverVersion={serverVersion}
        totalStudents={students.length}
        totalReports={Object.keys(reports).length}
        onManualSync={handleManualSync}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            {settings.schoolName} — Sistem Informasi Penilaian Tahsin & Tahfiz Al-Qur'an (SIPTT)
          </p>
          <p className="mt-1">
            {settings.address} • Telp: {settings.phone} • Email: {settings.email}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-2">
            <span>Dokumen Rapot Resmi terformat sesuai standar kurikulum Al-Qur'an SMP Islam 9 Bekasi.</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Sinkronisasi Cloud Aktif (Laptop, iPad, HP)
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}

