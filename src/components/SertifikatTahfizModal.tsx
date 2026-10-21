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

  const handleDownloadPDF = () => {
    generateCertificatePDF(student, certData, settings, teacherName);
  };

  const handlePrint = () => {
    window.print();
  };

  const coordinatorName = settings.coordinatorName || teacherName || 'Mahmud Ali Yafi, S.S, M.Pd.I.';
  const principalName = settings.principalName || 'Andi Krisdianto, S.Pd.I';
  const principalNip = settings.principalNip || '19760812 200212 1 003';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Top Action Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Sertifikat Kelulusan Tahfiz Per Juz — Kertas A4</span>
                <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Resmi Al-Azhar 9
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
                onChange={(e) => setSelectedJuz(Number(e.target.value))}
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

            {/* Quick Juz Tabs */}
            <div className="hidden lg:inline-flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              {completedJuzList.slice(0, 4).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setSelectedJuz(j)}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Unduh sertifikat kelulusan tahfiz format PDF ukuran kertas A4 Landscape"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF (A4)</span>
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
          
          {/* THE OFFICIAL CERTIFICATE SHEET (A4 LANDSCAPE: 297mm x 210mm) */}
          <div
            id="official-certificate-sheet"
            className="w-full max-w-[920px] bg-[#FEFCF6] p-6 sm:p-8 shadow-2xl text-slate-900 font-sans leading-tight relative border-4 border-[#B8860B] rounded-sm print:p-0 print:shadow-none print:max-w-none print:border-none"
            style={{
              aspectRatio: '297 / 210',
            }}
          >
            {/* Golden Ornamental Double Border */}
            <div className="absolute inset-2 border-2 border-[#DAA520] pointer-events-none rounded-xs"></div>
            <div className="absolute inset-3.5 border border-[#006699] pointer-events-none rounded-xs"></div>

            {/* Corner Stars */}
            <div className="absolute top-4 left-4 w-3.5 h-3.5 bg-[#B8860B] rounded-xs flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-4 right-4 w-3.5 h-3.5 bg-[#B8860B] rounded-xs flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-4 left-4 w-3.5 h-3.5 bg-[#B8860B] rounded-xs flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-3.5 h-3.5 bg-[#B8860B] rounded-xs flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            {/* KOP SURAT RESMI (SESUAI RAPOT AL-AZHAR 9) */}
            <div className="relative pb-2 mb-3">
              <div className="flex items-center justify-between px-6 sm:px-10 gap-3">
                {/* Logo Kiri: Al Azhar */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
                  {settings.schoolLogo ? (
                    <img
                      src={settings.schoolLogo}
                      alt="Logo Sekolah"
                      className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-full border border-slate-300 shadow-xs bg-white p-0.5"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#006699] flex items-center justify-center border-2 border-white shadow-xs p-1">
                      <div className="w-full h-full rounded-full border border-white flex flex-col items-center justify-center text-white">
                        <span className="text-[8.5px] font-bold uppercase tracking-tighter">AL-AZHAR</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-0.5"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Teks Kop Tengah */}
                <div className="text-center flex-1 px-1">
                  <h4 className="text-[10px] sm:text-[11px] font-bold tracking-tight text-slate-800 uppercase">
                    YAYASAN PESANTREN ISLAM AL-AZHAR
                  </h4>
                  <h5 className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase mt-0.5">
                    DIREKTORAT PENDIDIKAN DASAR DAN MENENGAH
                  </h5>
                  <h2 className="text-[15px] sm:text-[18px] font-black text-[#006699] uppercase tracking-tight mt-0.5 leading-snug">
                    {settings.schoolName || 'SMP ISLAM AL AZHAR 9 BEKASI'}
                  </h2>
                  <p className="text-[8.5px] sm:text-[9.5px] text-slate-700 font-bold mt-0.5">
                    STATUS TERAKREDITASI "A"
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-600 mt-0.5 truncate max-w-xl mx-auto">
                    {settings.address || 'Jl. Kemang Pratama Raya No. 1, Rawalumbu, Kota Bekasi 17116 Telp. (021) 82414144'}
                  </p>
                </div>

                {/* Logo Kanan: YPIA */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
                  {settings.foundationLogo ? (
                    <img
                      src={settings.foundationLogo}
                      alt="Logo Yayasan"
                      className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-full border border-slate-300 shadow-xs bg-white p-0.5"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#008040] flex items-center justify-center border-2 border-white shadow-xs p-1">
                      <div className="w-full h-full rounded-full border border-white flex flex-col items-center justify-center text-white">
                        <span className="text-[8.5px] font-bold uppercase tracking-tighter">YPIA</span>
                        <div className="w-3 h-2.5 rounded-t-full bg-white mt-0.5"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Garis Ganda Pembatas Kop Surat Sesuai Rapot Resmi (Tebal Atas, Tipis Bawah) */}
              <div className="mt-2 mx-6 sm:mx-10 border-b-2 border-black"></div>
              <div className="mt-0.5 mx-6 sm:mx-10 border-b border-black"></div>
            </div>

            {/* JUDUL SERTIFIKAT RESMI */}
            <div className="text-center space-y-1 mb-3">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-900 uppercase tracking-wide">
                SYAHADAH TAHFIZ AL-QUR'AN
              </h1>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#B8860B] uppercase tracking-wider">
                SERTIFIKAT KELULUSAN HAFALAN TAHFIZ PER JUZ
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono">
                Nomor: {certData.certificateNumber}
              </p>
            </div>

            {/* BADAN SERTIFIKAT */}
            <div className="text-center space-y-2 max-w-3xl mx-auto px-4">
              <p className="text-xs text-slate-700">
                Direktorat Pendidikan SMP Islam Al Azhar 9 Bekasi menerangkan dengan sesungguhnya bahwa:
              </p>

              {/* Nama Santri */}
              <div className="py-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-normal border-b-2 border-amber-400 inline-block px-4 pb-0.5">
                  {student.name}
                </h2>
                <div className="text-[11px] text-slate-600 font-semibold mt-1 space-x-2">
                  <span>NISN: {student.nisn || '-'}</span>
                  <span>•</span>
                  <span>NIS: {student.nis || '-'}</span>
                  <span>•</span>
                  <span>Kelas: {student.className}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700">
                Telah mengikuti Ujian Tasmi' Bil Ghaib dan dinyatakan memenuhi seluruh standar kompetensi tahfiz dengan predikat:
              </p>

              {/* KOTAK PENCAPAIAN JUZ */}
              <div className="bg-gradient-to-r from-amber-50/80 via-emerald-50/50 to-amber-50/80 border-2 border-amber-300/80 rounded-2xl p-3 shadow-xs max-w-2xl mx-auto space-y-1">
                <div className="text-base sm:text-lg font-black text-[#006699] uppercase tracking-tight flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>LULUS MUTQIN: JUZ {certData.juzNumber} ({certData.juzName})</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {certData.surahRange} ({certData.totalSurah} Surah • {certData.totalAyat} Ayat)
                </p>
                <div className="flex items-center justify-center gap-3 pt-0.5 text-xs font-bold text-amber-900">
                  <span>Nilai Tasmi': <strong className="text-emerald-900 font-mono text-sm">{certData.score}</strong></span>
                  <span>•</span>
                  <span>Predikat: <strong className="text-emerald-900 uppercase">{certData.predicate}</strong></span>
                  <span>•</span>
                  <span className="bg-emerald-700 text-white px-2 py-0.2 rounded-full text-[10px]">MUTQIN</span>
                </div>
              </div>

              {/* Doa / Harapan */}
              <p className="text-[10px] sm:text-[11px] text-slate-500 italic max-w-xl mx-auto pt-1">
                "Semoga hafalan Al-Qur'an yang telah diselesaikan senantiasa terjaga di dalam dada, menjadi syafa'at di yaumil akhir, serta berakhlak mulia dengan nilai-nilai Al-Qur'an."
              </p>
            </div>

            {/* TANDA TANGAN RESMI KEPSEK & KOORDINATOR TAHFIZ */}
            <div className="mt-5 px-8 sm:px-14 flex items-end justify-between text-xs text-slate-800">
              {/* Kiri: Koordinator Tahfiz */}
              <div className="text-center w-56 space-y-0.5">
                <p className="text-slate-500 text-[11px]">Mengetahui,</p>
                <p className="font-bold text-slate-800">Koordinator Tahfiz Al-Qur'an</p>
                
                {/* Space Tanda Tangan */}
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic">Tanda Tangan Digital</span>
                </div>

                <p className="font-bold text-slate-900 border-b border-slate-700 inline-block px-1">
                  {coordinatorName}
                </p>
                <p className="text-[10px] text-slate-500">
                  NIP. 19850612 201101 1 003
                </p>
              </div>

              {/* Tengah: Cap Stempel Resmi Al-Azhar */}
              <div className="w-24 h-24 rounded-full border-2 border-amber-500/80 flex items-center justify-center p-1 bg-white shadow-2xs">
                <div className="w-full h-full rounded-full border border-dashed border-amber-600 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[6.5px] font-bold text-amber-800 uppercase leading-none">SMP ISLAM AL AZHAR 9</span>
                  <span className="text-[9px] font-black text-emerald-800 my-0.5">★ MUTQIN ★</span>
                  <span className="text-[6.5px] font-bold text-amber-800 uppercase leading-none">TAHFIZ QUR'AN</span>
                </div>
              </div>

              {/* Kanan: Kepala Sekolah — Andi Krisdianto, S.Pd.I */}
              <div className="text-center w-56 space-y-0.5">
                <p className="text-slate-600 text-[11px]">
                  Bekasi, {formatToIndonesianDate(certData.date, true)}
                </p>
                <p className="font-bold text-slate-800">Kepala SMP Islam Al Azhar 9</p>
                
                {/* Space Tanda Tangan */}
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic">Tanda Tangan & Cap Sekolah</span>
                </div>

                <p className="font-bold text-slate-900 border-b border-slate-700 inline-block px-1">
                  {principalName}
                </p>
                <p className="text-[10px] text-slate-500">
                  NIP. {principalNip}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
