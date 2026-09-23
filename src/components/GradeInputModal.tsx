import React, { useState } from 'react';
import { X, Save, Plus, Trash2, CheckCircle2, BookOpen, Sparkles, Award, Bookmark, Info, Check, Clock, AlertCircle, FileSpreadsheet, Calendar } from 'lucide-react';
import { StudentReportData, TahfizSurahRecord, IqroJilid, IqroMaterialAspect, IqroStatus, TahsinGrade, IqroJilidRecord } from '../types';
import { QURAN_SURAHS, getPredicate, getPredicateColor } from '../data/quranData';
import { IQRO_AMM_JILID_DATA, getDefaultAspectsForJilid, calculateIqroAverage, generateDefaultJilidHistory } from '../data/iqroData';
import { QuranSimakanModal } from './QuranSimakanModal';
import { formatToIndonesianDate } from './IndonesianDatePicker';

interface GradeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: StudentReportData;
  teacherName: string;
  onSave: (updatedReport: StudentReportData) => void;
  onSaveAndOpenProcessing?: (updatedReport: StudentReportData) => void;
}

export const GradeInputModal: React.FC<GradeInputModalProps> = ({
  isOpen,
  onClose,
  reportData,
  teacherName,
  onSave,
  onSaveAndOpenProcessing,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'tahsin' | 'tahfiz' | 'adab'>('tahfiz');
  const [isSimakanOpen, setIsSimakanOpen] = useState<boolean>(false);

  // Tahsin State: Metode Iqro' AMM Yogyakarta Jilid 1 - 6
  const initialJilid: IqroJilid = (reportData.tahsin.jilid as IqroJilid) || 6;
  const [selectedJilid, setSelectedJilid] = useState<IqroJilid>(initialJilid);
  const [halaman, setHalaman] = useState<number>(reportData.tahsin.halaman || 15);
  const [jilidStatus, setJilidStatus] = useState<IqroStatus>(
    reportData.tahsin.jilidStatus || 'Sedang Ditempuh'
  );
  
  // Stored aspects per jilid
  const [aspectScores, setAspectScores] = useState<Record<IqroJilid, IqroMaterialAspect[]>>(() => {
    const map: Record<IqroJilid, IqroMaterialAspect[]> = {
      1: getDefaultAspectsForJilid(1, 85),
      2: getDefaultAspectsForJilid(2, 85),
      3: getDefaultAspectsForJilid(3, 85),
      4: getDefaultAspectsForJilid(4, 85),
      5: getDefaultAspectsForJilid(5, 85),
      6: getDefaultAspectsForJilid(6, 85),
    };
    if (reportData.tahsin.aspects && reportData.tahsin.aspects.length > 0 && reportData.tahsin.jilid) {
      map[reportData.tahsin.jilid] = reportData.tahsin.aspects;
    }
    return map;
  });

  // Stored Jilid 1 to 6 history
  const [jilidHistory, setJilidHistory] = useState<Record<IqroJilid, IqroJilidRecord>>(() => {
    if (reportData.tahsin.jilidHistory && Object.keys(reportData.tahsin.jilidHistory).length > 0) {
      return { ...reportData.tahsin.jilidHistory };
    }
    return generateDefaultJilidHistory(
      initialJilid,
      reportData.tahsin.jilidStatus || 'Sedang Ditempuh',
      reportData.tahsin.averageScore || 88,
      reportData.tahsin.halaman || 15
    );
  });

  const [tahsinNotes, setTahsinNotes] = useState(reportData.tahsin.notes || '');

  const handleUpdateAspectScore = (key: string, newScore: number) => {
    const clamped = Math.max(0, Math.min(100, newScore));
    setAspectScores((prev) => {
      const currentList = prev[selectedJilid] || getDefaultAspectsForJilid(selectedJilid);
      const updated = currentList.map((asp) => {
        if (asp.key === key) {
          return {
            ...asp,
            score: clamped,
            predicate: getPredicate(clamped),
          };
        }
        return asp;
      });
      return {
        ...prev,
        [selectedJilid]: updated,
      };
    });
  };

  const handleSelectJilid = (jNum: IqroJilid) => {
    setSelectedJilid(jNum);
    const jMeta = IQRO_AMM_JILID_DATA[jNum];
    const rec = jilidHistory[jNum];
    if (rec && rec.completedHalaman) {
      setHalaman(rec.completedHalaman);
      setJilidStatus(rec.status);
    } else {
      setHalaman(Math.min(halaman, jMeta.totalPages));
    }
  };

  const handleUpdateJilidHistoryField = (jNum: IqroJilid, field: keyof IqroJilidRecord, value: any) => {
    setJilidHistory((prev) => {
      const current = prev[jNum] || {
        jilid: jNum,
        status: 'Sedang Ditempuh',
        score: 85,
        predicate: 'Jayyid Jiddan',
        completedHalaman: 15,
        notes: '',
      };
      const updated = { ...current, [field]: value };
      if (field === 'score') {
        updated.predicate = getPredicate(Number(value) || 0);
      }
      return {
        ...prev,
        [jNum]: updated,
      };
    });
  };

  const currentJilidMeta = IQRO_AMM_JILID_DATA[selectedJilid];
  const currentAspects = aspectScores[selectedJilid] || getDefaultAspectsForJilid(selectedJilid);
  const { averageScore: currentTahsinAvg, overallPredicate: currentTahsinPred } = calculateIqroAverage(currentAspects);

  // Tahfiz Records State
  const [records, setRecords] = useState<TahfizSurahRecord[]>([...reportData.tahfizRecords]);

  // New Tahfiz Entry State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(78);
  const [ayatFrom, setAyatFrom] = useState<number>(1);
  const [ayatTo, setAyatTo] = useState<number>(40);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [isMutqin, setIsMutqin] = useState<boolean>(true);
  const [setoranNotes, setSetoranNotes] = useState<string>('Lancar dan tartil');
  const [setoranDate, setSetoranDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Adab State
  const [kedisiplinan, setKedisiplinan] = useState(reportData.adab.kedisiplinan);
  const [adabMushaf, setAdabMushaf] = useState(reportData.adab.adabMushaf);
  const [kerajinanMurojaah, setKerajinanMurojaah] = useState(reportData.adab.kerajinanMurojaah);
  const [semangatHalaqah, setSemangatHalaqah] = useState(reportData.adab.semangatHalaqah);
  const [adabGeneralNotes, setAdabGeneralNotes] = useState(reportData.adab.generalNotes);

  const handleSurahChange = (num: number) => {
    setSelectedSurahNumber(num);
    const surah = QURAN_SURAHS.find((s) => s.number === num);
    if (surah) {
      setAyatFrom(1);
      setAyatTo(surah.totalAyat);
    }
  };

  const handleAddTahfizRecord = () => {
    const surah = QURAN_SURAHS.find((s) => s.number === selectedSurahNumber);
    if (!surah) return;

    const newRecord: TahfizSurahRecord = {
      id: `rec-${Date.now()}`,
      surahNumber: surah.number,
      surahName: surah.name,
      juzNumber: surah.juz,
      ayatFrom: Number(ayatFrom),
      ayatTo: Number(ayatTo),
      gradeScore: Number(gradeScore),
      predicate: getPredicate(Number(gradeScore)),
      isMutqin,
      date: setoranDate,
      examinerTeacherName: teacherName,
      notes: setoranNotes,
    };

    setRecords([newRecord, ...records]);
    setSetoranNotes('');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const buildUpdatedReport = (): StudentReportData => {
    // Re-calculate summary
    const mutqinRecords = records.filter((r) => r.isMutqin);
    const uniqueSurahs = Array.from(new Set(mutqinRecords.map((r) => r.surahNumber)));
    const totalAyat = records.reduce((acc, r) => acc + (r.ayatTo - r.ayatFrom + 1), 0);
    
    // Determine if Juz 30 completed (all 37 surahs or >= 35 surahs)
    const juzCompleted: number[] = [];
    const juz30Surahs = QURAN_SURAHS.filter((s) => s.juz === 30).map((s) => s.number);
    const hasFinishedJuz30 = juz30Surahs.every((num) => uniqueSurahs.includes(num)) || uniqueSurahs.length >= 37;
    if (hasFinishedJuz30) {
      juzCompleted.push(30);
    }

    const finalAspects = aspectScores[selectedJilid] || getDefaultAspectsForJilid(selectedJilid);
    const { averageScore, overallPredicate } = calculateIqroAverage(finalAspects);
    const jilidMeta = IQRO_AMM_JILID_DATA[selectedJilid];
    const levelBookTitle = `${jilidMeta.title} (Hal. ${halaman}) - AMM Yogyakarta`;

    const updatedJilidHistory: Record<IqroJilid, IqroJilidRecord> = {
      ...jilidHistory,
      [selectedJilid]: {
        jilid: selectedJilid,
        status: jilidStatus,
        score: averageScore,
        predicate: overallPredicate,
        completedHalaman: Number(halaman),
        notes: tahsinNotes || `Materi pokok ${jilidMeta.title}.`,
      },
    };

    const updatedTahsin: TahsinGrade = {
      jilid: selectedJilid,
      halaman: Number(halaman),
      jilidStatus,
      aspects: finalAspects,
      averageScore,
      overallPredicate,
      levelBook: levelBookTitle,
      notes: tahsinNotes || `Santri menempuh ${jilidMeta.title} (${jilidMeta.subtitle}). Status: ${jilidStatus}.`,
      lastUpdated: new Date().toISOString().split('T')[0],
      jilidHistory: updatedJilidHistory,
      // Compatibility fields:
      makharijulHuruf: finalAspects[0]?.score || averageScore,
      ahkamutTajwid: finalAspects[1]?.score || averageScore,
      ahkamulWaqf: finalAspects[2]?.score || averageScore,
      fashahahTartil: finalAspects[3]?.score || finalAspects[0]?.score || averageScore,
    };

    return {
      ...reportData,
      tahsin: updatedTahsin,
      tahfizRecords: records,
      adab: {
        kedisiplinan,
        adabMushaf,
        kerajinanMurojaah,
        semangatHalaqah,
        generalNotes: adabGeneralNotes,
      },
      summaryHafalan: {
        totalSurahLulus: uniqueSurahs.length,
        totalAyatHafal: totalAyat,
        juzCompleted,
        currentJuzInProgress: juzCompleted.includes(30) ? 29 : 30,
        completionPercentage: Math.min(100, Math.round((uniqueSurahs.length / reportData.student.targetSurahCount) * 100)),
      },
    };
  };

  const handleSaveAll = () => {
    const updated = buildUpdatedReport();
    onSave(updated);
    onClose();
  };

  const handleSaveAndOpenProcessing = () => {
    const updated = buildUpdatedReport();
    onSave(updated);
    if (onSaveAndOpenProcessing) {
      onSaveAndOpenProcessing(updated);
    }
    onClose();
  };

  const selectedSurah = QURAN_SURAHS.find((s) => s.number === selectedSurahNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-300" />
              Input & Ubah Nilai Setoran Santri
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              {reportData.student.name} • Kelas {reportData.student.className} • NISN {reportData.student.nisn}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('tahfiz')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'tahfiz'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Setoran Hafalan (Tahfiz)
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {records.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tahsin')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'tahsin'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Nilai Bacaan (Tahsin)
          </button>
          <button
            onClick={() => setActiveTab('adab')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'adab'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Adab & Sikap Qur'ani
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TAHFIZ */}
          {activeTab === 'tahfiz' && (
            <div className="space-y-6">
              {/* Box Tambah Setoran Baru */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4.5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-700" />
                    Tambah Catatan Setoran Baru
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSimakanOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      title="Buka Mushaf Al-Qur'an untuk menyimak hafalan murid secara langsung"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Simak Al-Qur'an di Layar</span>
                    </button>
                    <span className="text-xs text-emerald-700 font-medium hidden sm:inline">Ustadz: {teacherName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Pilih Surat */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Surat Al-Qur'an</label>
                    <select
                      value={selectedSurahNumber}
                      onChange={(e) => handleSurahChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    >
                      <optgroup label="Juz 30 (Juz 'Amma)">
                        {QURAN_SURAHS.filter((s) => s.juz === 30).map((s) => (
                          <option key={s.number} value={s.number}>
                            No {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Juz 29 (Tabarak)">
                        {QURAN_SURAHS.filter((s) => s.juz === 29).map((s) => (
                          <option key={s.number} value={s.number}>
                            No {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Juz 28 (Qad Sami'a)">
                        {QURAN_SURAHS.filter((s) => s.juz === 28).map((s) => (
                          <option key={s.number} value={s.number}>
                            No {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Juz 27">
                        {QURAN_SURAHS.filter((s) => s.juz === 27).map((s) => (
                          <option key={s.number} value={s.number}>
                            No {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Juz 26">
                        {QURAN_SURAHS.filter((s) => s.juz === 26).map((s) => (
                          <option key={s.number} value={s.number}>
                            No {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Surat Pilihan Lain">
                        {QURAN_SURAHS.filter(
                          (s) => ![30, 29, 28, 27, 26].includes(s.juz)
                        ).map((s) => (
                          <option key={s.number} value={s.number}>
                            No {s.number}. {s.name} ({s.arabic}) - Juz {s.juz}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Juz Terdeteksi */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Juz</label>
                    <div className="bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-800 text-center">
                      Juz {selectedSurah?.juz || 30}
                    </div>
                  </div>

                  {/* Rentang Ayat */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dari Ayat</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedSurah?.totalAyat || 100}
                      value={ayatFrom}
                      onChange={(e) => setAyatFrom(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sampai Ayat</label>
                    <input
                      type="number"
                      min={ayatFrom}
                      max={selectedSurah?.totalAyat || 100}
                      value={ayatTo}
                      onChange={(e) => setAyatTo(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                    />
                  </div>

                  {/* Tanggal Menghafal / Setoran */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tanggal Menghafal / Setoran</span>
                    </label>
                    <input
                      type="date"
                      value={setoranDate}
                      onChange={(e) => setSetoranDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-bold cursor-pointer"
                    />
                    <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                      <span>📅 Terpilih:</span>
                      <span>{formatToIndonesianDate(setoranDate, true)}</span>
                    </div>
                  </div>

                  {/* Nilai Setoran */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nilai (0-100)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={gradeScore}
                        onChange={(e) => setGradeScore(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-center"
                      />
                      <span className="font-bold text-emerald-700 px-2 py-1 bg-white border border-emerald-200 rounded">
                        {getPredicate(gradeScore)}
                      </span>
                    </div>
                  </div>

                  {/* Status Mutqin */}
                  <div className="sm:col-span-1 flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMutqin}
                        onChange={(e) => setIsMutqin(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {isMutqin ? 'Lulus Mutqin' : 'Perlu Muroja\'ah'}
                      </span>
                    </label>
                  </div>

                  {/* Catatan Setoran */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi / Makhraj</label>
                    <input
                      type="text"
                      placeholder="Contoh: Lancar, tajwid rapi, perhatikan ghunnah"
                      value={setoranNotes}
                      onChange={(e) => setSetoranNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddTahfizRecord}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Simpan ke Riwayat Setoran
                  </button>
                </div>
              </div>

              {/* Daftar Riwayat Setoran Santri */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
                  Daftar Setoran Hafalan yang Sudah Dicatat ({records.length} Surat)
                </h4>
                {records.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                    Belum ada setoran hafalan. Silakan tambahkan setoran di atas.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Surat & Ayat</th>
                          <th className="py-2.5 px-3">Tanggal Setoran</th>
                          <th className="py-2.5 px-3 text-center">Juz</th>
                          <th className="py-2.5 px-3 text-center">Nilai</th>
                          <th className="py-2.5 px-3 text-center">Predikat</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3">Catatan</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Surat {rec.surahName}
                              <span className="text-slate-500 font-normal ml-1">
                                (Ayat {rec.ayatFrom}-{rec.ayatTo})
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-semibold text-[11px]">
                              {rec.date ? (
                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold text-[11px]">
                                  <Calendar className="w-3 h-3 text-emerald-700" />
                                  {formatToIndonesianDate(rec.date, true)}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                              Juz {rec.juzNumber}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                              {rec.gradeScore}
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-emerald-800">
                              {rec.predicate}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {rec.isMutqin ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Mutqin
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Muroja'ah
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {rec.notes || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title="Hapus Setoran"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TAHSIN - METODE IQRO' AMM YOGYAKARTA JILID 1 - 6 */}
          {activeTab === 'tahsin' && (
            <div className="space-y-5 text-xs">
              {/* Header Box: Metode Iqro' AMM Yogyakarta */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Kurikulum Tahsin Resmi AMM Kotagede Yogyakarta
                    </div>
                    <h3 className="text-base sm:text-lg font-bold">
                      Buku Metode Iqro' (Jilid 1 s.d. 6)
                    </h3>
                    <p className="text-emerald-200 text-[11px] mt-0.5">
                      Karya KH. As'ad Humam • Balai Litbang LPTQ Nasional / Team Tadarus AMM Yogyakarta
                    </p>
                  </div>

                  {/* Nilai Rata-rata Live Badge */}
                  <div className="bg-white/10 backdrop-blur-xs rounded-xl px-4 py-2 border border-white/20 text-center sm:text-right shrink-0">
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Rata-rata Tahsin</span>
                    <div className="text-2xl font-black text-white leading-tight">
                      {currentTahsinAvg}
                      <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-emerald-500/40 text-emerald-100 rounded-full border border-emerald-400/40">
                        {currentTahsinPred}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Segmented Jilid Selector (Jilid 1 to 6) */}
                <div className="mt-4 pt-3.5 border-t border-emerald-700/50">
                  <div className="text-[11px] font-bold text-emerald-100 mb-2 flex items-center justify-between">
                    <span>PILIH TINGKAT JILID SANTRI:</span>
                    <span className="text-emerald-300 font-normal">Klik untuk mengganti materi penilaian</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {([1, 2, 3, 4, 5, 6] as IqroJilid[]).map((jNum) => {
                      const isSelected = selectedJilid === jNum;
                      const jMeta = IQRO_AMM_JILID_DATA[jNum];
                      return (
                        <button
                          key={jNum}
                          type="button"
                          onClick={() => handleSelectJilid(jNum)}
                          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-white text-emerald-950 font-bold shadow-md border-white ring-2 ring-emerald-400'
                              : 'bg-emerald-950/40 hover:bg-emerald-800/60 text-emerald-100 border-emerald-700/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold">{jMeta.title}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                          </div>
                          <span className={`block text-[10px] mt-0.5 truncate ${isSelected ? 'text-emerald-800 font-medium' : 'text-emerald-300'}`}>
                            {jNum === 1 && 'Huruf Fathah'}
                            {jNum === 2 && 'Huruf Sambung & Mad'}
                            {jNum === 3 && 'Kasrah & Dhammah'}
                            {jNum === 4 && 'Tanwin & Sukun'}
                            {jNum === 5 && 'Tasydid & Ghunnah'}
                            {jNum === 6 && 'Tajwid & Al-Qur\'an'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress & Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Taraf / Jilid Aktif
                  </label>
                  <div className="p-2 bg-white rounded-lg border border-slate-300 font-bold text-emerald-900 text-xs truncate">
                    {currentJilidMeta.title}: {currentJilidMeta.subtitle}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Halaman Buku Iqro' (1 - {currentJilidMeta.totalPages})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={currentJilidMeta.totalPages}
                      value={halaman}
                      onChange={(e) => setHalaman(Math.max(1, Math.min(currentJilidMeta.totalPages, Number(e.target.value) || 1)))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs"
                    />
                    <span className="text-[11px] text-slate-500 font-medium shrink-0">
                      / {currentJilidMeta.totalPages} Hal.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Status Kenaikan Jilid
                  </label>
                  <select
                    value={jilidStatus}
                    onChange={(e) => setJilidStatus(e.target.value as IqroStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold text-xs"
                  >
                    <option value="Lulus (Naik Jilid)">Lulus (Naik ke Jilid Berikutnya)</option>
                    <option value="Sedang Ditempuh">Sedang Ditempuh (Berjalan)</option>
                    <option value="Perlu Pengulangan">Perlu Pengulangan / Muroja'ah</option>
                  </select>
                </div>
              </div>

              {/* Info Silabus AMM & Target EBTA */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-900">Pedoman Standar Kelulusan {currentJilidMeta.title}: </span>
                  {currentJilidMeta.ebtaTarget}
                </div>
              </div>

              {/* Core Material Cards for Selected Jilid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-emerald-700" />
                    Materi Pokok Penilaian {currentJilidMeta.title}
                  </h4>
                  <span className="text-[11px] text-slate-500">Skala Nilai 0 - 100</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentAspects.map((asp, idx) => {
                    const materialMeta = currentJilidMeta.coreMaterials.find((m) => m.key === asp.key);
                    const pred = getPredicate(asp.score);
                    const colorClass = getPredicateColor(pred);

                    return (
                      <div
                        key={asp.key}
                        className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {asp.name}
                              </span>
                              {materialMeta?.pageRange && (
                                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {materialMeta.pageRange}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${colorClass}`}>
                              {pred}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 mb-3 pl-8">
                          {asp.criteria}
                        </p>

                        <div className="flex items-center gap-3 pl-8">
                          <input
                            type="range"
                            min={50}
                            max={100}
                            value={asp.score}
                            onChange={(e) => handleUpdateAspectScore(asp.key, Number(e.target.value))}
                            className="flex-1 accent-emerald-700 cursor-pointer"
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={asp.score}
                            onChange={(e) => handleUpdateAspectScore(asp.key, Number(e.target.value))}
                            className="w-16 p-1.5 text-center font-bold text-slate-900 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Evaluasi Guru */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1.5">
                  Catatan Evaluasi Bacaan Tahsin Ustadz / Ustadzah
                </label>
                <textarea
                  rows={3}
                  value={tahsinNotes}
                  onChange={(e) => setTahsinNotes(e.target.value)}
                  placeholder={`Tuliskan catatan kemajuan membaca ${currentJilidMeta.title}, ketepatan tajwid, atau anjuran latihan di rumah...`}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Matriks Rekapitulasi Capaian Jilid 1 s.d. Jilid 6 (Dimasukkan ke Rapot) */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-700" />
                      Matriks Rekapitulasi Capaian Jilid 1 s.d. 6 (Masuk ke Rapot Resmi)
                    </h4>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Kelola dan tinjau status kelulusan serta nilai seluruh jenjang Iqro' AMM Yogyakarta santri.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-bold border border-emerald-300 shrink-0 self-start sm:self-auto">
                    Standar EBTA AMM Kotagede
                  </span>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-800 text-white uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-2.5 text-center w-12">Jilid</th>
                        <th className="py-2 px-3">Materi Pokok Silabus AMM</th>
                        <th className="py-2 px-3 text-center w-36">Status Capaian</th>
                        <th className="py-2 px-2 text-center w-20">Hal. Target</th>
                        <th className="py-2 px-2.5 text-center w-20">Nilai</th>
                        <th className="py-2 px-2 text-center w-24">Predikat</th>
                        <th className="py-2 px-3 text-center w-28">Aksi Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {([1, 2, 3, 4, 5, 6] as IqroJilid[]).map((jNum) => {
                        const jMeta = IQRO_AMM_JILID_DATA[jNum];
                        const historyRecord = jilidHistory[jNum];
                        const isCurrent = jNum === selectedJilid;

                        const curStatus = isCurrent
                          ? jilidStatus
                          : (historyRecord?.status || (jNum < selectedJilid ? 'Lulus (Naik Jilid)' : 'Belum Ditempuh'));

                        const curScore = isCurrent
                          ? currentTahsinAvg
                          : (historyRecord?.score ?? (jNum < selectedJilid ? 88 : 0));

                        const curPred = isCurrent
                          ? currentTahsinPred
                          : (historyRecord?.predicate || (curScore > 0 ? getPredicate(curScore) : '-'));

                        const curHal = isCurrent
                          ? halaman
                          : (historyRecord?.completedHalaman || (jNum < selectedJilid ? jMeta.totalPages : 1));

                        return (
                          <tr
                            key={jNum}
                            className={`${isCurrent ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50/70'}`}
                          >
                            <td className="py-2 px-2.5 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                                isCurrent
                                  ? 'bg-emerald-800 text-white shadow-xs'
                                  : curStatus.includes('Lulus')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {jNum}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-900">
                                {jMeta.title}: {jMeta.subtitle}
                              </div>
                              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {jMeta.summary}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isCurrent ? (
                                <select
                                  value={jilidStatus}
                                  onChange={(e) => setJilidStatus(e.target.value as IqroStatus)}
                                  className="w-full text-center text-[11px] font-bold py-1 px-1.5 rounded-lg border border-emerald-400 bg-white text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="Lulus (Naik Jilid)">Lulus (Naik Jilid)</option>
                                  <option value="Sedang Ditempuh">Sedang Ditempuh</option>
                                  <option value="Perlu Pengulangan">Perlu Pengulangan</option>
                                  <option value="Belum Ditempuh">Belum Ditempuh</option>
                                </select>
                              ) : (
                                <select
                                  value={curStatus}
                                  onChange={(e) => handleUpdateJilidHistoryField(jNum, 'status', e.target.value as IqroStatus)}
                                  className="w-full text-center text-[11px] py-1 px-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                                >
                                  <option value="Lulus (Naik Jilid)">Lulus (Naik Jilid)</option>
                                  <option value="Sedang Ditempuh">Sedang Ditempuh</option>
                                  <option value="Perlu Pengulangan">Perlu Pengulangan</option>
                                  <option value="Belum Ditempuh">Belum Ditempuh</option>
                                </select>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {isCurrent ? (
                                <div className="text-[11px] font-mono font-bold text-emerald-900">
                                  {halaman} / {jMeta.totalPages}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  min={1}
                                  max={jMeta.totalPages}
                                  value={curHal}
                                  onChange={(e) => handleUpdateJilidHistoryField(jNum, 'completedHalaman', Number(e.target.value))}
                                  className="w-14 text-center text-[11px] py-0.5 border border-slate-300 rounded font-mono"
                                />
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              {isCurrent ? (
                                <span className="font-extrabold text-emerald-900 text-xs">
                                  {currentTahsinAvg}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={curScore || ''}
                                  placeholder="0"
                                  onChange={(e) => handleUpdateJilidHistoryField(jNum, 'score', Number(e.target.value))}
                                  className="w-14 text-center font-bold text-[11px] py-0.5 border border-slate-300 rounded"
                                />
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {curScore > 0 ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPredicateColor(curPred as any)}`}>
                                  {curPred}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isCurrent ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded">
                                  <Check className="w-3 h-3" />
                                  Aktif
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSelectJilid(jNum)}
                                  className="text-[10px] text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                                >
                                  Nilai Aspek
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADAB */}
          {activeTab === 'adab' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Penilaian karakter, adab terhadap mushaf Al-Qur'an, dan kedisiplinan halaqah tahfiz.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                  <label className="block font-bold text-slate-800 mb-1">Kedisiplinan Waktu Halaqah</label>
                  <select
                    value={kedisiplinan}
                    onChange={(e) => setKedisiplinan(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  >
                    <option value="A">A - Sangat Baik (Tepat waktu & tertib)</option>
                    <option value="B">B - Baik (Hadir sesuai jadwal)</option>
                    <option value="C">C - Cukup (Perlu motivasi kehadiran)</option>
                  </select>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                  <label className="block font-bold text-slate-800 mb-1">Adab Terhadap Mushaf Al-Qur'an</label>
                  <select
                    value={adabMushaf}
                    onChange={(e) => setAdabMushaf(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  >
                    <option value="A">A - Sangat Baik (Suci, memuliakan mushaf)</option>
                    <option value="B">B - Baik (Menjaga mushaf)</option>
                    <option value="C">C - Cukup (Perlu pembiasaan adab)</option>
                  </select>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                  <label className="block font-bold text-slate-800 mb-1">Kerajinan Muroja'ah di Rumah</label>
                  <select
                    value={kerajinanMurojaah}
                    onChange={(e) => setKerajinanMurojaah(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  >
                    <option value="A">A - Sangat Baik (Rutin harian bersama orang tua)</option>
                    <option value="B">B - Baik (Muroja'ah mandiri)</option>
                    <option value="C">C - Cukup (Perlu pendampingan lebih)</option>
                  </select>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                  <label className="block font-bold text-slate-800 mb-1">Semangat di Halaqah</label>
                  <select
                    value={semangatHalaqah}
                    onChange={(e) => setSemangatHalaqah(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  >
                    <option value="A">A - Sangat Baik (Antusias dan fokus)</option>
                    <option value="B">B - Baik (Menyimak dengan baik)</option>
                    <option value="C">C - Cukup (Kadang kurang konsentrasi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Catatan Karakter / Pesan Guru untuk Rapot
                </label>
                <textarea
                  rows={3}
                  value={adabGeneralNotes}
                  onChange={(e) => setAdabGeneralNotes(e.target.value)}
                  placeholder="Catatan motivasi dan arahan untuk orang tua..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer text-center"
          >
            Batal
          </button>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
              title="Simpan nilai santri dan kembali ke halaman sebelumnya"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Simpan & Tutup</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndOpenProcessing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              title="Simpan nilai santri dan langsung buka menu pengolahan matriks Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Simpan & Masuk Pengolahan Nilai (Excel)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quran Simakan Modal (Layar Al-Qur'an Interaktif) */}
      {isSimakanOpen && (
        <QuranSimakanModal
          isOpen={isSimakanOpen}
          onClose={() => setIsSimakanOpen(false)}
          student={reportData.student}
          teacherName={teacherName}
          initialSurahNumber={selectedSurahNumber}
          onSaveTahfizResult={(newRec) => {
            setRecords((prev) => [newRec, ...prev]);
            setIsSimakanOpen(false);
          }}
        />
      )}
    </div>
  );
};
