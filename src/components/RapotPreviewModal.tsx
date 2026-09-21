import React, { useState } from 'react';
import { Download, Printer, X, FileText } from 'lucide-react';
import { StudentReportData, SchoolSettings } from '../types';
import {
  ALAZHAR_TAHSIN_CURRICULUM,
  getTahsinCurriculum,
  getTahfizTableConfig,
  TahfizScopeMode,
  TahfizColumnCell,
  getLetterScore,
  RENTANG_NILAI_STANDARDS,
} from '../data/alazharReportFormat';
import { generateRapotPDF } from '../utils/pdfGenerator';

interface RapotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: StudentReportData | null;
  settings: SchoolSettings;
  teacherName?: string;
}

export const RapotPreviewModal: React.FC<RapotPreviewModalProps> = ({
  isOpen,
  onClose,
  reportData,
  settings,
  teacherName,
}) => {
  if (!isOpen || !reportData) return null;

  const { student, tahsin, tahfizRecords } = reportData;
  const [startJilid, setStartJilid] = useState<number>(1); // Mulai dari Jilid 1
  const [tahfizScope, setTahfizScope] = useState<TahfizScopeMode>('all'); // Default: Lengkap Juz 30, 29, 28, 27, 26

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
            <div className="relative flex items-center justify-between pb-1.5 mb-2.5">
              {/* Logo Kiri: Al-Azhar */}
              <div className="w-11 h-11 flex items-center justify-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#006699] flex items-center justify-center border border-white shadow-xs p-1">
                  <div className="w-full h-full rounded-full border border-white flex flex-col items-center justify-center text-white">
                    <span className="text-[6.5px] font-bold uppercase tracking-tighter">AL-AZHAR</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></div>
                  </div>
                </div>
              </div>

              {/* Teks Judul Tengah */}
              <div className="text-center flex-1 px-2">
                <h1 className="text-[12px] sm:text-[13px] font-bold tracking-tight text-black uppercase">
                  LAPORAN HASIL BELAJAR TAHFIZ DAN TAHSIN
                </h1>
                <h2 className="text-[13px] sm:text-[14px] font-bold text-black uppercase tracking-tight mt-0.5">
                  {settings.schoolName || 'SMP ISLAM AL AZHAR 9 BEKASI'}
                </h2>
                <h3 className="text-[11px] sm:text-[12px] font-bold text-black uppercase mt-0.5">
                  TAHUN PELAJARAN {settings.academicYear || '2025/2026'}
                </h3>
              </div>

              {/* Logo Kanan: YPIA & Nomor Halaman */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold text-black mb-0.5">
                  {settings.pageNumber || '11'}
                </span>
                <div className="w-10 h-10 rounded-full bg-[#008040] flex items-center justify-center border border-white shadow-xs p-1">
                  <div className="w-full h-full rounded-full border border-white flex flex-col items-center justify-center text-white">
                    <span className="text-[6px] font-bold uppercase tracking-tighter">YPIA</span>
                    <div className="w-2 h-1.5 rounded-t-full bg-white mt-0.5"></div>
                  </div>
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
                    <th rowSpan={2} className="border border-black py-0.5 px-1 text-center font-bold w-6">
                      No
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-1.5 text-center font-bold w-18">
                      Mata Pelajaran
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-1 text-center font-bold w-7">
                      Jilid
                    </th>
                    <th colSpan={3} className="border border-black py-0.5 px-1.5 text-center font-bold">
                      Aspek Penilaian
                    </th>
                    <th rowSpan={2} className="border border-black py-0.5 px-1.5 text-center font-bold w-44">
                      Keterangan Kenaikan Jilid
                    </th>
                  </tr>
                  <tr className="bg-white">
                    <th className="border border-black py-0.5 px-1.5 text-center font-bold">Materi Iqra'</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-10">Angka</th>
                    <th className="border border-black py-0.5 px-1 text-center font-bold w-10">Huruf</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCurriculum.flatMap((group, gIdx) => {
                    const isFirstGroup = gIdx === 0;
                    return group.aspects.map((aspect, aIdx) => {
                      const isFirstOfGroup = aIdx === 0;

                      // Lookup nilai
                      let scoreVal = aspect.defaultScore;
                      if (tahsin.aspects && tahsin.aspects.length > 0) {
                        const found = tahsin.aspects.find(
                          (a) => a.key === aspect.id || a.name.toLowerCase().includes(aspect.name.toLowerCase().slice(0, 10))
                        );
                        if (found) scoreVal = found.score;
                      }

                      const letterVal = getLetterScore(scoreVal);

                      return (
                        <tr key={aspect.id} className="hover:bg-slate-50/50">
                          {isFirstGroup && isFirstOfGroup && (
                            <td
                              rowSpan={totalTahsinAspects}
                              className="border border-black text-center font-bold align-middle py-0.5 px-1"
                            >
                              1
                            </td>
                          )}
                          {isFirstGroup && isFirstOfGroup && (
                            <td
                              rowSpan={totalTahsinAspects}
                              className="border border-black text-center font-bold align-middle py-0.5 px-1.5"
                            >
                              Tahsin
                            </td>
                          )}
                          {isFirstOfGroup && (
                            <td
                              rowSpan={group.aspects.length}
                              className="border border-black text-center font-bold align-middle py-0.5 px-1"
                            >
                              {group.jilidLabel}
                            </td>
                          )}
                          <td className="border border-black py-0.5 px-1.5 text-left leading-tight">
                            {aspect.name}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-center font-mono">
                            {scoreVal}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-center font-bold">
                            {letterVal}
                          </td>
                          {isFirstOfGroup && (
                            <td
                              rowSpan={group.aspects.length}
                              className="border border-black text-center font-bold align-middle py-0.5 px-1.5 text-[8.5px] sm:text-[9px]"
                            >
                              {group.keterangan}
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
    </div>
  );
};
