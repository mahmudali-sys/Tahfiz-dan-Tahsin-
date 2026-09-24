import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Calendar, 
  Bookmark,
  TrendingUp,
  Heart
} from 'lucide-react';
import { StudentReportData, SchoolSettings, Teacher } from '../types';
import { QURAN_SURAHS, getPredicate, getPredicateColor } from '../data/quranData';
import { IQRO_AMM_JILID_DATA, IqroJilid } from '../data/iqroData';
import { generateRapotPDF } from '../utils/pdfGenerator';
import { RapotPreviewModal } from './RapotPreviewModal';

interface StudentDashboardProps {
  reportData: StudentReportData;
  settings: SchoolSettings;
  teachers: Teacher[];
  onUpdateSettings?: (newSettings: SchoolSettings) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  reportData,
  settings,
  teachers,
  onUpdateSettings,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedJuzTab, setSelectedJuzTab] = useState<number>(30);

  const { student, tahsin, tahfizRecords, adab, summaryHafalan } = reportData;
  const teacher = teachers.find((t) => t.id === student.teacherId);
  const teacherName = teacher?.name || 'Ust. Muhammad Ridwan, S.Pd.I';

  const hasIqroAspects = Boolean(tahsin.aspects && tahsin.aspects.length > 0);
  const avgTahsin = tahsin.averageScore ?? (
    hasIqroAspects
      ? Math.round(tahsin.aspects!.reduce((acc, a) => acc + a.score, 0) / tahsin.aspects!.length)
      : Math.round(
          ((tahsin.makharijulHuruf || 80) +
            (tahsin.ahkamutTajwid || 80) +
            (tahsin.ahkamulWaqf || 80) +
            (tahsin.fashahahTartil || 80)) /
            4
        )
  );

  const handleDownloadPDF = () => {
    generateRapotPDF(reportData, settings, teacherName);
  };

  // Surahs for selected Juz tab
  const surahsInTab = QURAN_SURAHS.filter((s) => s.juz === selectedJuzTab);

  // Map of completed surahs from tahfiz records
  const completedSurahMap = new Map<number, typeof tahfizRecords[0]>();
  tahfizRecords.forEach((rec) => {
    completedSurahMap.set(rec.surahNumber, rec);
  });

  return (
    <div className="space-y-6">
      {/* Student Banner Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Islamic Pattern Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <BookOpen className="w-96 h-96 -mr-16 text-emerald-100" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-700/80 border-2 border-emerald-400/40 flex items-center justify-center shadow-inner shrink-0">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-100">
                {student.name.charAt(0)}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/60 border border-emerald-400/30 text-xs font-semibold tracking-wide text-emerald-200">
                  Portal Murid • SMP Islam Al Azhar 9 Bekasi
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-xs text-emerald-100 border border-emerald-400/30">
                  Kelas {student.className}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>NISN: <strong>{student.nisn}</strong></span>
                <span>NIS: <strong>{student.nis}</strong></span>
                <span>Pembimbing: <strong>{teacherName}</strong></span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-700/50">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              Pratinjau Rapot
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh Rapot PDF
            </button>
          </div>
        </div>

        {/* Quick Achievement Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-700/60 relative z-10">
          <div className="bg-emerald-950/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-600/30">
            <div className="text-emerald-300 text-xs font-medium">Surat Dihafal</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {summaryHafalan.totalSurahLulus}{' '}
              <span className="text-xs text-emerald-300 font-normal">/ {student.targetSurahCount} Surat</span>
            </div>
            <div className="text-[10px] text-emerald-300 mt-1">
              Target: {student.targetJuz}
            </div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-600/30">
            <div className="text-emerald-300 text-xs font-medium">Total Ayat Mutqin</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {summaryHafalan.totalAyatHafal}{' '}
              <span className="text-xs text-emerald-300 font-normal">Ayat</span>
            </div>
            <div className="text-[10px] text-emerald-300 mt-1">
              {summaryHafalan.juzCompleted.length > 0 ? `Tuntas Juz ${summaryHafalan.juzCompleted.join(', ')}` : `Sedang di Juz ${summaryHafalan.currentJuzInProgress}`}
            </div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-600/30">
            <div className="text-emerald-300 text-xs font-medium">Rata-rata Tahsin</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {avgTahsin}{' '}
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded">
                {getPredicate(avgTahsin)}
              </span>
            </div>
            <div className="text-[10px] text-emerald-300 mt-1 truncate">
              {tahsin.levelBook}
            </div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-600/30">
            <div className="text-emerald-300 text-xs font-medium">Capaian Target</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {summaryHafalan.completionPercentage}%
            </div>
            {/* Progress bar */}
            <div className="w-full bg-emerald-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${summaryHafalan.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Visual Quran Tracker */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Juz Tracker Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-700" />
                  Peta Capaian Hafalan Al-Qur'an (Per Surat)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik atau lihat status surat yang sudah diujikan oleh ustadz pembimbing.
                </p>
              </div>

              {/* Juz Switcher Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setSelectedJuzTab(30)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedJuzTab === 30
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Juz 30 ('Amma)
                </button>
                <button
                  onClick={() => setSelectedJuzTab(29)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedJuzTab === 29
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Juz 29 (Tabarak)
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs py-3 text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Tuntas Mutqin</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span>Perlu Muroja'ah</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block"></span>
                <span>Belum Diujikan</span>
              </span>
            </div>

            {/* Grid of Surahs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
              {surahsInTab.map((surah) => {
                const record = completedSurahMap.get(surah.number);
                const isCompleted = !!record;
                const isMutqin = record?.isMutqin;

                let cardStyle = "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300";
                if (isCompleted && isMutqin) {
                  cardStyle = "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs hover:border-emerald-400";
                } else if (isCompleted && !isMutqin) {
                  cardStyle = "bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs hover:border-amber-400";
                }

                return (
                  <div
                    key={surah.number}
                    className={`p-3 rounded-xl border transition-all relative ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        #{surah.number}
                      </span>
                      {isCompleted && isMutqin && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      )}
                      {isCompleted && !isMutqin && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">
                          M
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <div className="font-bold text-xs truncate" title={surah.name}>
                        {surah.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between items-center mt-0.5">
                        <span>{surah.totalAyat} ayat</span>
                        <span className="font-serif text-slate-700 text-xs">{surah.arabic}</span>
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-800">
                          Nilai: {record.gradeScore}
                        </span>
                        <span className="text-slate-500">{record.predicate}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Riwayat Setoran Terkini */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-emerald-700" />
              Riwayat Penilaian Setoran Hafalan
            </h3>

            {tahfizRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada setoran hafalan yang tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Surat & Juz</th>
                      <th className="py-2.5 px-3">Cakupan Ayat</th>
                      <th className="py-2.5 px-3 text-center">Nilai</th>
                      <th className="py-2.5 px-3 text-center">Predikat</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Catatan Ustadz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tahfizRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Surat {rec.surahName}
                          <span className="text-slate-400 font-normal ml-1">Juz {rec.juzNumber}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          Ayat {rec.ayatFrom} - {rec.ayatTo}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {rec.gradeScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPredicateColor(rec.predicate)}`}>
                            {rec.predicate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {rec.isMutqin ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">
                              Mutqin
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-semibold">
                              Muroja'ah
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] italic">
                          {rec.notes || 'Lancar dan baik'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Tahsin Breakdown & Adab */}
        <div className="space-y-6">
          {/* Tahsin Detailed Card - Metode Iqro AMM */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  Standar Bacaan (Tahsin)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Buku: <strong className="text-slate-800">{tahsin.levelBook || "Iqro' AMM Yogyakarta"}</strong>
                </p>
              </div>
              {tahsin.jilidStatus && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  tahsin.jilidStatus.includes('Lulus')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : tahsin.jilidStatus.includes('Ulang')
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}>
                  {tahsin.jilidStatus}
                </span>
              )}
            </div>

            {/* Jilid 1 to 6 Visual Stepper */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                <span>Perjalanan Iqro' AMM Yogyakarta (Jilid 1 - 6)</span>
                <span className="text-emerald-700 font-semibold">Taraf Aktif: Jilid {tahsin.jilid || 6}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {([1, 2, 3, 4, 5, 6] as IqroJilid[]).map((jNum) => {
                  const isCurrent = jNum === (tahsin.jilid || 6);
                  const isPassed = jNum < (tahsin.jilid || 6);
                  const jMeta = IQRO_AMM_JILID_DATA[jNum];
                  return (
                    <div
                      key={jNum}
                      title={`${jMeta.title}: ${jMeta.subtitle}`}
                      className={`p-1.5 rounded-lg text-center border transition-all ${
                        isCurrent
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold">Jilid {jNum}</div>
                      <div className="text-[9px] mt-0.5 truncate font-medium">
                        {isPassed ? 'Lulus' : isCurrent ? 'Aktif' : 'Belum'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {tahsin.jilid && (
              <div className="mb-4 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-950">Materi Pokok: Iqro' Jilid {tahsin.jilid}</span>
                <span className="text-slate-600">Halaman Aktif: <strong className="text-emerald-900">{tahsin.halaman || '-'}</strong></span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {hasIqroAspects ? (
                tahsin.aspects!.map((asp) => {
                  const pred = asp.predicate || getPredicate(asp.score);
                  return (
                    <div key={asp.key} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700 truncate pr-2">{asp.name}</span>
                        <span className="text-emerald-800 font-bold shrink-0">
                          {asp.score} ({pred})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, asp.score)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{asp.criteria}</p>
                    </div>
                  );
                })
              ) : (
                <>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-700">Makharijul Huruf</span>
                      <span className="text-emerald-800 font-bold">{tahsin.makharijulHuruf} ({getPredicate(tahsin.makharijulHuruf)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${tahsin.makharijulHuruf}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-700">Ahkamut Tajwid</span>
                      <span className="text-emerald-800 font-bold">{tahsin.ahkamutTajwid} ({getPredicate(tahsin.ahkamutTajwid)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${tahsin.ahkamutTajwid}%` }}></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-slate-700">
              <span className="font-bold text-emerald-900 block mb-1">Catatan Tilawah & Ustadz:</span>
              <p className="italic">"{tahsin.notes || 'Pertahankan bacaan tartil dan perbanyak tilawah harian.'}"</p>
            </div>
          </div>

          {/* Adab & Karakter Qur'ani Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-rose-600" />
              Adab & Karakter Qur'ani
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Kedisiplinan</span>
                <span className="text-base font-bold text-emerald-800">Nilai {adab.kedisiplinan}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Adab Mushaf</span>
                <span className="text-base font-bold text-emerald-800">Nilai {adab.adabMushaf}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Muroja'ah Rumah</span>
                <span className="text-base font-bold text-emerald-800">Nilai {adab.kerajinanMurojaah}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Semangat Halaqah</span>
                <span className="text-base font-bold text-emerald-800">Nilai {adab.semangatHalaqah}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">Nasihat Ustadz:</span>
              <p className="italic">"{adab.generalNotes || 'Semoga Allah senantiasa memberkahi hafalan ananda.'}"</p>
            </div>
          </div>

          {/* Download Rapot Quick Card */}
          <div className="bg-emerald-900 text-white rounded-2xl p-5 text-center space-y-3 shadow-md">
            <h4 className="font-bold text-sm">Laporan Rapot Resmi</h4>
            <p className="text-xs text-emerald-200">
              Format rapot resmi SMP Islam 9 Bekasi telah siap dicetak dan diunduh dalam format PDF.
            </p>
            <button
              onClick={handleDownloadPDF}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh Rapot PDF Sekarang
            </button>
          </div>
        </div>

      </div>

      {/* Rapot Preview Modal */}
      <RapotPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportData={reportData}
        settings={settings}
        teacherName={teacherName}
        onUpdateSettings={onUpdateSettings}
      />
    </div>
  );
};
