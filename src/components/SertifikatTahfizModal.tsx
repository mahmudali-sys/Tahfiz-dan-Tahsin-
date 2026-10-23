import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Award, 
  CheckCircle2, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { Student, SchoolSettings, StudentReportData, TahfizSurahRecord } from '../types';
import { 
  generateCertificatePDF, 
  getJuzMetadata, 
  JuzCertificateData, 
  JUZ_METADATA 
} from '../utils/certificatePdfGenerator';
import { formatToIndonesianDate } from './IndonesianDatePicker';
import { getPredicate } from '../data/quranData';

interface SertifikatTahfizModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  report?: StudentReportData;
  settings: SchoolSettings;
  teacherName?: string;
  defaultJuz?: number;
}

export const SertifikatTahfizModal: React.FC<SertifikatTahfizModalProps> = ({
  isOpen,
  onClose,
  student,
  report,
  settings,
  teacherName,
  defaultJuz,
}) => {
  if (!isOpen) return null;

  // Tentukan daftar Juz yang diselesaikan atau tersedia untuk santri ini
  const completedJuzList = useMemo(() => {
    const list: number[] = [];
    if (report?.summaryHafalan?.juzCompleted && report.summaryHafalan.juzCompleted.length > 0) {
      list.push(...report.summaryHafalan.juzCompleted);
    }

    // Cek juga dari rekaman tahfiz
    if (report?.tahfizRecords) {
      const recordsByJuz = new Map<number, TahfizSurahRecord[]>();
      report.tahfizRecords.forEach((r) => {
        const j = r.juzNumber;
        if (!recordsByJuz.has(j)) recordsByJuz.set(j, []);
        recordsByJuz.get(j)!.push(r);
      });

      // Juz 30 (37 surah)
      const juz30Recs = recordsByJuz.get(30) || [];
      if (juz30Recs.length >= 10 || list.includes(30)) {
        if (!list.includes(30)) list.push(30);
      }
      // Juz 29
      const juz29Recs = recordsByJuz.get(29) || [];
      if (juz29Recs.length >= 5 || list.includes(29)) {
        if (!list.includes(29)) list.push(29);
      }
      // Juz 28
      const juz28Recs = recordsByJuz.get(28) || [];
      if (juz28Recs.length >= 4 || list.includes(28)) {
        if (!list.includes(28)) list.push(28);
      }
    }

    // Default selalu ada Juz 30 sebagai standar utama kelas 7
    if (!list.includes(30)) {
      list.push(30);
    }
    // Jika kelas 8, tambahkan Juz 29
    if (student.className.startsWith('8') && !list.includes(29)) {
      list.push(29);
    }
    // Jika kelas 9, tambahkan Juz 28
    if (student.className.startsWith('9') && !list.includes(28)) {
      list.push(28);
    }

    return Array.from(new Set(list)).sort((a, b) => b - a);
  }, [report, student.className]);

  const [selectedJuz, setSelectedJuz] = useState<number>(() => {
    if (defaultJuz && completedJuzList.includes(defaultJuz)) return defaultJuz;
    return completedJuzList[0] || 30;
  });

  const [customJuzText, setCustomJuzText] = useState<string>(() => `Juz ${defaultJuz || completedJuzList[0] || 30}`);
  const testedJuzLabel = customJuzText.trim() ? customJuzText : `Juz ${selectedJuz}`;

  const handleJuzChange = (jNum: number) => {
    setSelectedJuz(jNum);
    setCustomJuzText(`Juz ${jNum}`);
  };

  // Pasang class di body agar print CSS A4 Landscape aktif
  React.useEffect(() => {
    document.body.classList.add('certificate-modal-open');
    return () => {
      document.body.classList.remove('certificate-modal-open');
    };
  }, []);

  // Hitung rata-rata nilai dan tanggal tasmi' untuk Juz yang dipilih
  const certData: JuzCertificateData = useMemo(() => {
    const meta = getJuzMetadata(selectedJuz);
    const recordsInJuz = (report?.tahfizRecords || []).filter((r) => r.juzNumber === selectedJuz);
    
    let avgScore = 92;
    let latestDate = new Date().toISOString().split('T')[0];

    if (recordsInJuz.length > 0) {
      const sum = recordsInJuz.reduce((acc, r) => acc + (r.gradeScore || 85), 0);
      avgScore = Math.round((sum / recordsInJuz.length) * 10) / 10;
      latestDate = recordsInJuz[0].date || latestDate;
    }

    const predicate = getPredicate(avgScore);
    const certNumber = `09/TAHFIZ/SMPIA-9/J.${selectedJuz}/${new Date().getFullYear()}`;

    return {
      juzNumber: selectedJuz,
      juzName: meta.name,
      surahRange: meta.range,
      totalSurah: meta.totalSurah,
      totalAyat: meta.totalAyat,
      score: avgScore,
      predicate,
      date: latestDate,
      certificateNumber: certNumber,
    };
  }, [selectedJuz, report]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateCertificatePDF(student, certData, settings, teacherName, testedJuzLabel);
    } catch (err) {
      console.error('Gagal generate PDF sertifikat:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const principalName = settings.principalName || 'Andi Krisdianto, S.Pd.I';
  const principalNip = settings.principalNip || '19760812 200212 1 003';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Scoped Print Style to strictly lock A4 Landscape (297mm x 210mm) */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 0mm !important;
          }
          html, body {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #FEFCF6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          #official-certificate-sheet {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            min-height: 210mm !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 auto !important;
            border: none !important;
            background-color: transparent !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Top Action Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex flex-wrap items-center gap-2">
                <span>Sertifikat Kelulusan Tahfiz Per Juz</span>
                <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Resmi Al-Azhar 9
                </span>
                <span className="bg-amber-900/60 text-amber-200 border border-amber-600/50 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  📄 Kertas A4 Landscape (297 × 210 mm)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Santri: <strong className="text-white">{student.name}</strong> ({student.className} • NISN {student.nisn})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Juz Selector (Dropdown Lengkap Juz 1-30 & Quick Tabs) */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Pilih Juz:</span>
              <select
                value={selectedJuz}
                onChange={(e) => handleJuzChange(Number(e.target.value))}
                className="bg-slate-900 text-amber-300 font-bold px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
              >
                {Array.from({ length: 30 }, (_, idx) => 30 - idx).map((jNum) => {
                  const meta = getJuzMetadata(jNum);
                  const isCompleted = completedJuzList.includes(jNum);
                  return (
                    <option key={jNum} value={jNum}>
                      Juz {jNum}: {meta.name} {isCompleted ? '★ (Selesai)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Editable Juz yang Diujikan */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Juz Diujikan:</span>
              <input
                type="text"
                value={customJuzText}
                onChange={(e) => setCustomJuzText(e.target.value)}
                placeholder={`Juz ${selectedJuz}`}
                className="w-24 sm:w-28 bg-slate-900 text-amber-300 font-bold px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-amber-400 text-xs"
                title="Keterangan Juz yang diujikan (otomatis terisi dari pilihan Juz, dapat disesuaikan)"
              />
            </div>

            {/* Quick Juz Tabs */}
            <div className="hidden lg:inline-flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              {completedJuzList.slice(0, 4).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => handleJuzChange(j)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedJuz === j
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Juz {j}
                </button>
              ))}
            </div>

            {/* Tombol Unduh PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                isGeneratingPdf ? 'opacity-70 cursor-wait' : ''
              }`}
              title="Unduh sertifikat kelulusan tahfiz format PDF ukuran kertas A4 Landscape"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF (A4)'}</span>
            </button>

            {/* Tombol Cetak Langsung */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
              title="Cetak langsung lembar sertifikat"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Preview Body Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80 flex justify-center">
          
          {/* THE OFFICIAL CERTIFICATE SHEET (A4 LANDSCAPE: 297mm x 210mm - SESUAI TEMPLATE RESMI) */}
          <div
            id="official-certificate-sheet"
            className="w-full max-w-[960px] shadow-2xl relative print:shadow-none box-border overflow-hidden select-none rounded-sm bg-white"
            style={{
              aspectRatio: '1550 / 1106',
            }}
          >
            {/* Background Template Resmi dengan Bingkai Emas & Biru, Logo Al-Azhar & YPIA, Watermark Qur'an, Badge Cambridge, dan Kepala Sekolah Andi Krisdianto, S.Pd.I */}
            <img
              id="certificate-official-bg"
              src="/assets/cert_tahfiz_official.png"
              alt="Sertifikat Tahfiz SMP Islam Al Azhar 9"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            {/* Lapisan Konten Dinamis (Nama Santri & Keterangan Juz) */}
            <div className="absolute inset-0 pointer-events-none select-none">
              {/* Nama Santri dalam Kaligrafi Kursif Emas Mewah Sesuai Dokumen Resmi */}
              <div 
                className="absolute left-0 right-0 px-6 text-center flex items-center justify-center -translate-y-1/2"
                style={{ top: '49.2%' }}
              >
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] print:text-[42pt] text-[#C59B27] font-normal tracking-wide leading-none"
                  style={{
                    fontFamily: "'Great Vibes', 'Alex Brush', cursive",
                    textShadow: '0 1px 1px rgba(0,0,0,0.06)',
                  }}
                >
                  {student.name}
                </h2>
              </div>

              {/* Keterangan Pelaksanaan Tes Hafalan Al-Qur'an */}
              <div 
                className="absolute left-0 right-0 px-8 text-center flex flex-col items-center justify-center -translate-y-1/2 space-y-1 sm:space-y-1.5 print:space-y-1"
                style={{ top: '62.8%' }}
              >
                <p className="text-slate-800 font-sans text-xs sm:text-sm md:text-[15px] lg:text-[16px] print:text-[13pt] font-bold leading-tight max-w-2xl mx-auto">
                  Selamat telah melaksanakan Tes Hafalan Al-Qur'an <span className="font-extrabold text-slate-900">{testedJuzLabel}</span>
                </p>
                <p className="text-slate-600 font-sans text-[10px] sm:text-xs md:text-[12.5px] lg:text-[13.5px] print:text-[10pt] font-medium leading-tight max-w-2xl mx-auto">
                  Semoga penghargaan ini menjadi motivasi untuk menambah dan memelihara hafalan dengan baik.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
