import React, { useState, useEffect } from 'react';
import { Download, Printer, X, FileText, Image as ImageIcon, Upload, RotateCcw, Check, Sparkles, Edit3 } from 'lucide-react';
import { StudentReportData, SchoolSettings, ExamResult } from '../types';
import {
  ALAZHAR_TAHSIN_CURRICULUM,
  getTahsinCurriculum,
  getTahfizTableConfig,
  TahfizScopeMode,
  TahfizColumnCell,
  getLetterScore,
  RENTANG_NILAI_STANDARDS,
  getAutomatedTahsinJilidNote,
  getExamResultRows,
} from '../data/alazharReportFormat';
import { generateRapotPDF } from '../utils/pdfGenerator';

interface RapotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: StudentReportData | null;
  settings: SchoolSettings;
  teacherName?: string;
  onUpdateSettings?: (newSettings: SchoolSettings) => void;
  onUpdateReport?: (studentId: string, updatedReport: StudentReportData) => void;
}

export const RapotPreviewModal: React.FC<RapotPreviewModalProps> = ({
  isOpen,
  onClose,
  reportData,
  settings,
  teacherName,
  onUpdateSettings,
  onUpdateReport,
}) => {
  if (!isOpen || !reportData) return null;

  const { student, tahsin, tahfizRecords } = reportData;
  const [startJilid, setStartJilid] = useState<number>(1); // Mulai dari Jilid 1
  const [tahfizScope, setTahfizScope] = useState<TahfizScopeMode>('all'); // Default: Lengkap Juz 30, 29, 28, 27, 26

  // Modal Logo State
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [schoolLogoDraft, setSchoolLogoDraft] = useState<string>(settings.schoolLogo || '');
  const [foundationLogoDraft, setFoundationLogoDraft] = useState<string>(settings.foundationLogo || '');
  const [logoSaveSuccess, setLogoSaveSuccess] = useState(false);

  // Modal Edit Hasil Ujian & Catatan Evaluasi
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examSaveSuccess, setExamSaveSuccess] = useState(false);
  const examRows = getExamResultRows(reportData);
  const [examDrafts, setExamDrafts] = useState<Array<{ name: string; score: number; notes: string }>>(() => {
    return examRows.map((r) => ({ name: r.subject, score: r.score, notes: r.notes }));
  });

  useEffect(() => {
    if (reportData) {
      const rows = getExamResultRows(reportData);
      setExamDrafts(rows.map((r) => ({ name: r.subject, score: r.score, notes: r.notes })));
    }
  }, [reportData, isOpen]);

  const handleSaveExams = () => {
    if (!reportData) return;
    const updatedExamResults: ExamResult[] = examDrafts.map((d, idx) => ({
      id: `exam-${idx + 1}`,
      name: d.name,
      score: d.score,
      letterGrade: getLetterScore(d.score),
      predicate: d.score >= 91 ? 'Mumtaz' : d.score >= 81 ? 'Jayyid Jiddan' : d.score >= 71 ? 'Jayyid' : d.score >= 61 ? 'Maqbul' : 'Rasib',
      notes: d.notes,
      examinerName: teacherName || settings.coordinatorName || 'Ustadz Pembimbing',
    }));

    const updatedReport: StudentReportData = {
      ...reportData,
      examResults: updatedExamResults,
    };

    if (onUpdateReport) {
      onUpdateReport(reportData.student.id, updatedReport);
    }
    try {
      const saved = localStorage.getItem('smpia9_reports_v1');
      const allReps = saved ? JSON.parse(saved) : {};
      allReps[reportData.student.id] = updatedReport;
      localStorage.setItem('smpia9_reports_v1', JSON.stringify(allReps));
    } catch {}

    setExamSaveSuccess(true);
    setTimeout(() => {
      setExamSaveSuccess(false);
      setIsExamModalOpen(false);
    }, 700);
  };

  useEffect(() => {
    setSchoolLogoDraft(settings.schoolLogo || '');
    setFoundationLogoDraft(settings.foundationLogo || '');
  }, [settings.schoolLogo, settings.foundationLogo, isOpen]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'school' | 'foundation') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'school') {
        setSchoolLogoDraft(dataUrl);
      } else {
        setFoundationLogoDraft(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogos = () => {
    const updated: SchoolSettings = {
      ...settings,
      schoolLogo: schoolLogoDraft || undefined,
      foundationLogo: foundationLogoDraft || undefined,
    };
    if (onUpdateSettings) {
      onUpdateSettings(updated);
    }
    try {
      localStorage.setItem('SMPIA9_SCHOOL_SETTINGS', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    setLogoSaveSuccess(true);
    setTimeout(() => {
      setLogoSaveSuccess(false);
      setIsLogoModalOpen(false);
    }, 700);
  };

  const handleResetLogos = () => {
    setSchoolLogoDraft('');
    setFoundationLogoDraft('');
  };

  const displayedCurriculum = getTahsinCurriculum(startJilid);
  const totalTahsinAspects = displayedCurriculum.reduce((acc, g) => acc + g.aspects.length, 0);

  const tahfizConfig = getTahfizTableConfig(tahfizScope);

  const handleDownloadPDF = () => {
    generateRapotPDF(reportData, settings, teacherName, startJilid, tahfizScope);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper untuk mencari nilai surah
  const findSurahScore = (surahNumber: number, surahName: string) => {
    const normName = surahName.toLowerCase().replace(/[^a-z]/g, '');
    const rec = tahfizRecords.find(
      (r) => r.surahNumber === surahNumber || r.surahName.toLowerCase().replace(/[^a-z]/g, '') === normName
    );
    if (rec && rec.gradeScore > 0) {
      return {
        nilai: rec.gradeScore.toString(),
        ket: getLetterScore(rec.gradeScore),
      };
    }
    return { nilai: '-', ket: '-' };
  };

  const renderTahfizCell = (cell: TahfizColumnCell | undefined) => {
    if (!cell || cell.type === 'empty') {
      return (
        <React.Fragment>
          <td className="border border-black py-0.5 px-1 text-center font-mono"></td>
          <td className="border border-black py-0.5 px-1 text-left"></td>
          <td className="border border-black py-0.5 px-1 text-center"></td>
          <td className="border border-black py-0.5 px-1 text-center font-semibold"></td>
        </React.Fragment>
      );
    }
    if (cell.type === 'banner') {
      return (
        <td
          colSpan={4}
          className="border border-black py-0.5 px-1 text-center font-bold bg-slate-100 text-black tracking-wider"
        >
          {cell.label}
        </td>
      );
    }
    const s = cell.item!;
    const sc = findSurahScore(s.surahNumber, s.name);
    return (
      <React.Fragment>
        <td className="border border-black py-0.5 px-1 text-center font-mono">{s.no}</td>
        <td className="border border-black py-0.5 px-1 text-left truncate max-w-[95px]">{s.name}</td>
        <td className="border border-black py-0.5 px-1 text-center">{sc.nilai}</td>
        <td className="border border-black py-0.5 px-1 text-center font-semibold">{sc.ket}</td>
      </React.Fragment>
    );
  };

  const coordinatorName = settings.coordinatorName || teacherName || 'Mahmud Ali Yafi, S.S, M.Pd.I.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Action Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 no-print border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Format Rapot Resmi 1 Lembar — SMP Islam Al Azhar 9
            </h3>
            <span className="bg-emerald-800 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {student.className}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Opsi Jilid Awal: Default Jilid 1 */}
            <div className="inline-flex items-center bg-slate-800 p-0.5 rounded-lg text-xs border border-slate-700">
              <button
                type="button"
                onClick={() => setStartJilid(1)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  startJilid === 1
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Mulai kurikulum Tahsin dari Jilid 1 (Lengkap 1-6)"
              >
                Mulai Jilid 1
              </button>
              <button
                type="button"
                onClick={() => setStartJilid(3)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  startJilid === 3
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Mulai kurikulum Tahsin dari Jilid 3 (Lanjutan 3-6)"
              >
                Mulai Jilid 3
              </button>
            </div>

            {/* Opsi Cakupan Tahfiz: Default Juz 30 s.d 26 */}
            <div className="inline-flex items-center bg-slate-800 p-0.5 rounded-lg text-xs border border-slate-700">
              <button
                type="button"
                onClick={() => setTahfizScope('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tahfizScope === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilkan seluruh Juz 30, 29, 28, 27, 26"
              >
                Juz 30–26 (Lengkap)
              </button>
              <button
                type="button"
                onClick={() => setTahfizScope('juz30_28')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tahfizScope === 'juz30_28'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilkan Juz 30, 29, 28"
              >
                Juz 30–28
              </button>
              <button
                type="button"
                onClick={() => setTahfizScope('juz29_26')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tahfizScope === 'juz29_26'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilkan Juz 29, 28, 27, 26"
              >
                Juz 29–26
              </button>
            </div>

            {/* Tombol Ganti Logo Sekolah & Yayasan */}
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Ganti logo sekolah dan logo yayasan pada lembar rapot"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Ganti Logo Sekolah</span>
            </button>

            {/* Tombol Edit Nilai & Catatan Evaluasi Ujian */}
            <button
              type="button"
              onClick={() => setIsExamModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Ubah nilai dan catatan evaluasi hasil ujian rapot santri"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Hasil Ujian</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF (1 Lembar)</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheet Container: A4 1 Lembar Persis Contoh */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-slate-200/80 flex justify-center">
          <div
            id="official-rapot-sheet"
            className="w-full max-w-[760px] bg-white p-5 sm:p-6 shadow-xl text-black font-sans leading-tight print:p-0 print:shadow-none print:max-w-none"
          >
            {/* TOP HEADER: LOGOS + TITLE */}
            <div className="relative pb-1.5 mb-2.5">
              {/* Nomor Halaman di pojok kanan atas */}
              <div className="absolute top-0 right-0 text-[10px] font-bold text-black pointer-events-none">
                {settings.pageNumber || '11'}
              </div>

              {/* Baris Logo Kiri, Judul Tengah, dan Logo Kanan (Agak di tengah & Diperbesar) */}
              <div className="flex items-center justify-between px-6 sm:px-12 md:px-16 gap-3">
                {/* Logo Kiri: Sekolah (Dapat Diubah) */}
                <div
                  onClick={() => setIsLogoModalOpen(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 cursor-pointer group relative"
                  title="Klik untuk mengubah Logo Sekolah pada rapot"
                >
                  {settings.schoolLogo ? (
                    <img
                      src={settings.schoolLogo}
                      alt="Logo Sekolah"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full border border-slate-300 shadow-sm bg-white p-0.5 group-hover:ring-2 group-hover:ring-amber-500 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#006699] flex items-center justify-center border-2 border-white shadow-sm p-1.5 group-hover:ring-2 group-hover:ring-amber-500 transition-all">
                      <div className="w-full h-full rounded-full border border-white flex flex-col items-center justify-center text-white">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">AL-AZHAR</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Teks Judul Tengah */}
                <div className="text-center flex-1 px-1">
                  <h1 className="text-[12.5px] sm:text-[14px] font-bold tracking-tight text-black uppercase leading-snug">
                    LAPORAN HASIL BELAJAR TAHFIZ DAN TAHSIN
                  </h1>
                  <h2 className="text-[13.5px] sm:text-[15px] font-bold text-black uppercase tracking-tight mt-0.5 leading-snug">
                    {settings.schoolName || 'SMP ISLAM AL AZHAR 9 BEKASI'}
                  </h2>
                  <h3 className="text-[11.5px] sm:text-[12.5px] font-bold text-black uppercase mt-0.5 leading-snug">
                    TAHUN PELAJARAN {settings.academicYear || '2025/2026'}
                  </h3>
                </div>

                {/* Logo Kanan: Yayasan (Dapat Diubah) */}
                <div
                  onClick={() => setIsLogoModalOpen(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 cursor-pointer group relative"
                  title="Klik untuk mengubah Logo Yayasan pada rapot"
                >
                  {settings.foundationLogo ? (
                    <img
                      src={settings.foundationLogo}
                      alt="Logo Yayasan"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full border border-slate-300 shadow-sm bg-white p-0.5 group-hover:ring-2 group-hover:ring-amber-500 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#008040] flex items-center justify-center border-2 border-white shadow-sm p-1.5 group-hover:ring-2 group-hover:ring-amber-500 transition-all">
                      <div className="w-full h-full rounded-full border border-white flex flex-col items-center justify-center text-white">
                        <span className="text-[9px] sm:text-[9.5px] font-bold uppercase tracking-tighter">YPIA</span>
                        <div className="w-3 h-2.5 rounded-t-full bg-white mt-1"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* IDENTITAS SISWA: 2 KOLOM BERSIH */}
            <div className="grid grid-cols-2 gap-x-6 text-[10px] sm:text-[11px] mb-2.5 pb-1 border-b border-transparent">
              <div className="space-y-0.5">
                <div className="flex">
                  <span className="w-32 font-semibold">Nama Peserta Didik</span>
                  <span className="font-normal">: {student.name}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold">Nomor Induk Siswa</span>
                  <span className="font-normal">: {student.nis}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex">
                  <span className="w-20 font-semibold">Kelas</span>
                  <span className="font-normal">: {student.className}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-semibold">Semester</span>
                  <span className="font-normal">: {settings.semester || 'I (Satu)'}</span>
                </div>
              </div>
            </div>

            {/* A. MATERI PELAJARAN */}
            <div className="text-[10.5px] sm:text-[11.5px] font-bold text-black mb-0.5">
              A. Materi Pelajaran
            </div>

            {/* 1. TAHSIN */}
            <div className="text-[10.5px] sm:text-[11.5px] font-bold text-black mb-1 ml-1">
              1. Tahsin
            </div>

            {/* TABEL TAHSIN (MULAI DARI JILID 1 SESUAI PERMINTAAN) */}
            <div className="overflow-x-auto mb-2.5">
              <table className="w-full border-collapse border border-black text-[9px] sm:text-[9.5px]">
                <thead>
                  <tr className="bg-white">
                    <th rowSpan={2} className="border border-black py-0.5 px-0.5 text-center font-bold w-5">
                      No
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-1 text-center font-bold w-14">
                      Mata Pelajaran
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-0.5 text-center font-bold w-7">
                      Jilid
                    </th>
                    <th colSpan={3} className="border border-black py-0.5 px-1 text-center font-bold">
                      Aspek Penilaian
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-1 text-center font-bold w-26">
                      Keterangan Kenaikan Jilid
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-1.5 text-center font-bold">
                      Catatan Pembelajaran & Perkembangan Santri
                    </th>
                  </tr>
                  <tr className="bg-white">
                    <th className="border border-black py-0.5 px-1 text-center font-bold">Materi Iqra'</th>
                    <th className="border border-black py-0.5 px-0.5 text-center font-bold w-8">Angka</th>
                    <th className="border border-black py-0.5 px-0.5 text-center font-bold w-8">Huruf</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCurriculum.flatMap((group, gIdx) => {
                    const isFirstGroup = gIdx === 0;

                    // Hitung nilai rata-rata guru pada jilid ini untuk menghasilkan catatan otomatis
                    const jilidScores = group.aspects.map((aspect) => {
                      let sc = aspect.defaultScore;
                      if (tahsin.aspects && tahsin.aspects.length > 0) {
                        const found = tahsin.aspects.find(
                          (a) => a.key === aspect.id || a.name.toLowerCase().includes(aspect.name.toLowerCase().slice(0, 10))
                        );
                        if (found) sc = found.score;
                        else if (tahsin.jilidHistory && tahsin.jilidHistory[group.jilid as any]?.score) {
                          sc = tahsin.jilidHistory[group.jilid as any].score;
                        }
                      } else if (tahsin.jilidHistory && tahsin.jilidHistory[group.jilid as any]?.score) {
                        sc = tahsin.jilidHistory[group.jilid as any].score;
                      }
                      return sc;
                    });
                    const avgJilidScore = Math.round(jilidScores.reduce((a, b) => a + b, 0) / jilidScores.length);
                    const jilidAutoNote = getAutomatedTahsinJilidNote(
                      group.jilid,
                      avgJilidScore,
                      student.name,
                      tahsin.jilidHistory?.[group.jilid as any]?.notes
                    );

                    return group.aspects.map((aspect, aIdx) => {
                      const isFirstOfGroup = aIdx === 0;

                      // Lookup nilai
                      let scoreVal = aspect.defaultScore;
                      if (tahsin.aspects && tahsin.aspects.length > 0) {
                        const found = tahsin.aspects.find(
                          (a) => a.key === aspect.id || a.name.toLowerCase().includes(aspect.name.toLowerCase().slice(0, 10))
                        );
                        if (found) scoreVal = found.score;
                        else if (tahsin.jilidHistory && tahsin.jilidHistory[group.jilid as any]?.score) {
                          scoreVal = tahsin.jilidHistory[group.jilid as any].score;
                        }
                      } else if (tahsin.jilidHistory && tahsin.jilidHistory[group.jilid as any]?.score) {
                        scoreVal = tahsin.jilidHistory[group.jilid as any].score;
                      }

                      const letterVal = getLetterScore(scoreVal);

                      return (
                        <tr key={aspect.id} className="hover:bg-slate-50/50">
                          {isFirstGroup && isFirstOfGroup && (
                            <td
                              rowSpan={totalTahsinAspects}
                              className="border border-black text-center font-bold align-middle py-0.5 px-0.5"
                            >
                              1
                            </td>
                          )}
                          {isFirstGroup && isFirstOfGroup && (
                            <td
                              rowSpan={totalTahsinAspects}
                              className="border border-black text-center font-bold align-middle py-0.5 px-1"
                            >
                              Tahsin
                            </td>
                          )}
                          {isFirstOfGroup && (
                            <td
                              rowSpan={group.aspects.length}
                              className="border border-black text-center font-bold align-middle py-0.5 px-0.5"
                            >
                              {group.jilidLabel}
                            </td>
                          )}
                          <td className="border border-black py-0.5 px-1.5 text-left leading-tight">
                            {aspect.name}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-mono">
                            {scoreVal}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-bold">
                            {letterVal}
                          </td>
                          {isFirstOfGroup && (
                            <td
                              rowSpan={group.aspects.length}
                              className="border border-black text-center font-bold align-middle py-0.5 px-1 text-[8px] sm:text-[8.5px]"
                            >
                              {group.keterangan}
                            </td>
                          )}
                          {isFirstOfGroup && (
                            <td
                              rowSpan={group.aspects.length}
                              className="border border-black text-left align-middle py-0.5 px-1.5 text-[7.5px] sm:text-[8px] leading-snug italic text-slate-800"
                            >
                              {jilidAutoNote}
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. TAHFIZ */}
            <div className="text-[10.5px] sm:text-[11.5px] font-bold text-black mb-1 ml-1">
              2. Tahfiz
            </div>

            {/* TABEL TAHFIZ (3 KOLOM BERDAMPINGAN SECARA PARALEL) */}
            <div className="overflow-x-auto mb-2.5">
              <table className="w-full border-collapse border border-black text-[8px] sm:text-[8.5px]">
                <thead>
                  <tr className="bg-white">
                    <th colSpan={4} className="border border-black py-0.5 px-1 text-center font-bold">
                      {tahfizConfig.headerTitles[0]}
                    </th>
                    <th colSpan={4} className="border border-black py-0.5 px-1 text-center font-bold">
                      {tahfizConfig.headerTitles[1]}
                    </th>
                    <th colSpan={4} className="border border-black py-0.5 px-1 text-center font-bold">
                      {tahfizConfig.headerTitles[2]}
                    </th>
                  </tr>
                  <tr className="bg-white">
                    {/* Blok 1 */}
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-5">No</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold">Surat</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-8">Nilai</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-8">Ket</th>
                    {/* Blok 2 */}
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-5">No</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold">Surat</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-8">Nilai</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-8">Ket</th>
                    {/* Blok 3 */}
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-5">No</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold">Surat</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-8">Nilai</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-8">Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: tahfizConfig.rowCount }).map((_, r) => (
                    <tr key={r} className="hover:bg-slate-50/40">
                      {renderTahfizCell(tahfizConfig.col1[r])}
                      {renderTahfizCell(tahfizConfig.col2[r])}
                      {renderTahfizCell(tahfizConfig.col3[r])}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* B. HASIL UJIAN (Dengan Kolom Nilai & Catatan Evaluasi Sesuai Permintaan) */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-black mb-1">
              <span>B. Hasil Ujian</span>
              <button
                type="button"
                onClick={() => setIsExamModalOpen(true)}
                className="no-print text-[9px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="Klik untuk mengubah nilai ujian dan catatan evaluasi"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ubah Nilai & Evaluasi</span>
              </button>
            </div>

            {/* TABEL HASIL UJIAN */}
            <div className="overflow-x-auto mb-2.5">
              <table className="w-full border-collapse border border-black text-[8px] sm:text-[8.5px]">
                <thead>
                  <tr className="bg-white">
                    <th rowSpan={2} className="border border-black py-0.5 px-1 text-center font-bold w-5">
                      No
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-2 text-center font-bold w-52 sm:w-60">
                      Materi / Jenis Ujian
                    </th>
                    <th colSpan={3} className="border border-black py-0.5 px-1 text-center font-bold">
                      Nilai
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-2 text-center font-bold">
                      Catatan Evaluasi
                    </th>
                  </tr>
                  <tr className="bg-white">
                    <th className="border border-black py-0.5 px-0.5 text-center font-bold w-8">Angka</th>
                    <th className="border border-black py-0.5 px-0.5 text-center font-bold w-8">Huruf</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-16">Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {examRows.map((row) => (
                    <tr key={row.no} className="hover:bg-slate-50/50">
                      <td className="border border-black py-0.5 px-1 text-center font-bold font-mono">
                        {row.no}
                      </td>
                      <td className="border border-black py-0.5 px-2 text-left font-semibold">
                        {row.subject}
                      </td>
                      <td className="border border-black py-0.5 px-0.5 text-center font-mono font-bold">
                        {row.score}
                      </td>
                      <td className="border border-black py-0.5 px-0.5 text-center font-bold">
                        {row.letterGrade}
                      </td>
                      <td className="border border-black py-0.5 px-1 text-center text-[7.5px] sm:text-[8px] font-semibold">
                        {row.predicate}
                      </td>
                      <td className="border border-black py-0.5 px-2 text-left text-[7.5px] sm:text-[8px] italic text-slate-800 leading-snug">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER: RENTANG NILAI (KIRI) & TANDA TANGAN (KANAN) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Sisi Kiri: Rentang Nilai */}
              <div>
                <div className="text-[9.5px] font-bold uppercase mb-0.5">
                  RENTANG NILAI
                </div>
                <div className="space-y-0.5 text-[8.5px] sm:text-[9px]">
                  {RENTANG_NILAI_STANDARDS.map((r) => (
                    <div key={r.letter} className="flex">
                      <span className="w-18 font-bold">{r.letter} ({r.range})</span>
                      <span className="w-22">: {r.pred}</span>
                      <span className="text-slate-700">: {r.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-[9.5px] font-bold">
                  Orang Tua/Wali,
                </div>
                <div className="mt-8 text-[9.5px]">
                  (____________________________)
                </div>
              </div>

              {/* Sisi Kanan: Tanggal & Koordinator */}
              <div className="text-right flex flex-col justify-between items-end pr-3">
                <div>
                  <div className="text-[10px]">
                    {settings.city || 'Bekasi'}, {settings.reportDate || '22 Desember 2025'}
                  </div>
                  <div className="text-[10px] font-bold mt-0.5">
                    {settings.coordinatorTitle || 'Koordinator Tahfiz'}
                  </div>
                </div>

                <div className="mt-10 text-center min-w-[190px]">
                  <div className="text-[10px] font-bold underline">
                    {coordinatorName}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL KUSTOMISASI LOGO SEKOLAH & YAYASAN */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Kustomisasi Logo Rapot (Seluruh Murid)</h3>
                  <p className="text-xs text-slate-500">
                    Perubahan logo sekolah (kiri) dan logo yayasan (kanan) otomatis tersimpan dan diterapkan pada rapot semua murid (168 santri).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. LOGO SEKOLAH (KIRI) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">1. Logo Sekolah (Kiri)</span>
                  {schoolLogoDraft && (
                    <button
                      type="button"
                      onClick={() => setSchoolLogoDraft('')}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Kembalikan ke Default Al-Azhar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Preview Logo Sekolah */}
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center p-1 bg-white shrink-0 shadow-xs">
                    {schoolLogoDraft ? (
                      <img
                        src={schoolLogoDraft}
                        alt="Logo Sekolah Kustom"
                        className="w-full h-full object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#006699] flex flex-col items-center justify-center text-white text-[6px] font-bold">
                        <span>AL-AZHAR</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih File Logo (PNG / JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoFileUpload(e, 'school')}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Atau masukkan tautan URL Logo Sekolah..."
                      value={schoolLogoDraft}
                      onChange={(e) => setSchoolLogoDraft(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 2. LOGO YAYASAN (KANAN) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">2. Logo Yayasan / Lembaga (Kanan)</span>
                  {foundationLogoDraft && (
                    <button
                      type="button"
                      onClick={() => setFoundationLogoDraft('')}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Kembalikan ke Default YPIA
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Preview Logo Yayasan */}
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center p-1 bg-white shrink-0 shadow-xs">
                    {foundationLogoDraft ? (
                      <img
                        src={foundationLogoDraft}
                        alt="Logo Yayasan Kustom"
                        className="w-full h-full object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#008040] flex flex-col items-center justify-center text-white text-[6px] font-bold">
                        <span>YPIA</span>
                        <div className="w-2 h-1.5 rounded-t-full bg-white mt-0.5"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih File Logo (PNG / JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoFileUpload(e, 'foundation')}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Atau masukkan tautan URL Logo Yayasan..."
                      value={foundationLogoDraft}
                      onChange={(e) => setFoundationLogoDraft(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetLogos}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Standar Al-Azhar & YPIA</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveLogos}
                  disabled={logoSaveSuccess}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {logoSaveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Berhasil Disimpan untuk Semua Santri!</span>
                    </>
                  ) : (
                    <span>Simpan untuk Semua Rapot Murid</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KUSTOMISASI NILAI & CATATAN EVALUASI UJIAN */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Sesuaikan Hasil Ujian & Catatan Evaluasi ({student.name})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nilai angka, predikat huruf, dan catatan evaluasi akan langsung tercetak pada lembar Rapot resmi 1 lembar santri ini.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {examDrafts.map((draft, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{draft.name}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600 font-semibold">Nilai (0-100):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draft.score}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          setExamDrafts((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, score: val } : item))
                          );
                        }}
                        className="w-20 bg-white border border-slate-300 rounded-lg p-1.5 text-center font-bold text-slate-900 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                      <span className="text-xs font-bold px-2 py-1 rounded bg-teal-100 text-teal-800 border border-teal-200">
                        {getLetterScore(draft.score)} ({draft.score >= 91 ? 'Mumtaz' : draft.score >= 81 ? 'Jayyid Jiddan' : draft.score >= 71 ? 'Jayyid' : draft.score >= 61 ? 'Maqbul' : 'Rasib'})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 font-medium">Catatan Evaluasi Penguji / Rekomendasi:</label>
                    <textarea
                      rows={2}
                      value={draft.notes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamDrafts((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, notes: val } : item))
                        );
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none leading-relaxed"
                      placeholder="Masukkan catatan evaluasi untuk santri ini..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Simpan */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const rows = getExamResultRows({ ...reportData, examResults: undefined });
                  setExamDrafts(rows.map((r) => ({ name: r.subject, score: r.score, notes: r.notes })));
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Nilai & Evaluasi Otomatis</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveExams}
                  disabled={examSaveSuccess}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {examSaveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-teal-200" />
                      <span>Berhasil Disimpan ke Rapot!</span>
                    </>
                  ) : (
                    <span>Simpan Hasil Ujian & Evaluasi</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
