import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Save, 
  UserCheck, 
  Tag, 
  FileText, 
  Layers,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Info,
  Calendar
} from 'lucide-react';
import { Student, TahfizSurahRecord } from '../types';
import { formatToIndonesianDate } from './IndonesianDatePicker';
import { QURAN_SURAHS, getPredicate, getPredicateColor } from '../data/quranData';
import { getSurahDetail, SurahDetail, AyahData } from '../utils/quranService';

interface QuranSimakanModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  teacherName: string;
  onSaveTahfizResult: (newRecord: TahfizSurahRecord) => void;
  initialSurahNumber?: number;
}

export interface AyahMistakeTag {
  ayahNumber: number;
  type: 'tawaqquf' | 'lahn_jali' | 'lahn_khafi';
  label: string;
}

export const QuranSimakanModal: React.FC<QuranSimakanModalProps> = ({
  isOpen,
  onClose,
  student,
  teacherName,
  onSaveTahfizResult,
  initialSurahNumber,
}) => {
  if (!isOpen) return null;

  // Determine initial surah from student target or prop
  const defaultSurahNum = initialSurahNumber || (student.className.startsWith('9') ? 58 : student.className.startsWith('8') ? 67 : 78);

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(defaultSurahNum);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Range of verses for this setoran session
  const [ayatFrom, setAyatFrom] = useState<number>(1);
  const [ayatTo, setAyatTo] = useState<number>(1);

  // Mistake counters (Al Azhar Tahfiz evaluation standard)
  const [tawaqqufCount, setTawaqqufCount] = useState<number>(0); // Lupa / Tersendat (-2)
  const [lahnJaliCount, setLahnJaliCount] = useState<number>(0); // Salah Harakat / Huruf (-1.5)
  const [lahnKhafiCount, setLahnKhafiCount] = useState<number>(0); // Salah Tajwid / Mad / Ghunnah (-0.5)

  // Per-Ayah error tags
  const [taggedAyahs, setTaggedAyahs] = useState<AyahMistakeTag[]>([]);

  // Score override & Mutqin & Tanggal Setoran Hafalan
  const [manualScore, setManualScore] = useState<number | null>(null);
  const [isMutqin, setIsMutqin] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [setoranDate, setSetoranDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  // UI Display Options
  const [displayMode, setDisplayMode] = useState<'perAyat' | 'mushaf'>('perAyat');
  const [fontSize, setFontSize] = useState<'medium' | 'large' | 'xlarge'>('large');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Audio tilawah helper (for teacher to verify tricky tajweed)
  const [playingAudioAyah, setPlayingAudioAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load surah detail when selectedSurahNumber changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getSurahDetail(selectedSurahNumber).then((data) => {
      if (isMounted) {
        setSurahDetail(data);
        setAyatFrom(1);
        setAyatTo(data.numberOfAyahs);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedSurahNumber]);

  // Calculate live score from mistake counters if not manually overridden
  const calculatedScore = Math.max(
    50,
    Math.round((100 - (tawaqqufCount * 2) - (lahnJaliCount * 1.5) - (lahnKhafiCount * 0.5)) * 10) / 10
  );
  const activeScore = manualScore !== null ? manualScore : calculatedScore;
  const currentPredicate = getPredicate(activeScore);

  // Add mistake tag to specific ayah
  const handleAddMistake = (ayahNumber: number, type: 'tawaqquf' | 'lahn_jali' | 'lahn_khafi') => {
    const label = 
      type === 'tawaqquf' ? 'Tersendat/Lupa' :
      type === 'lahn_jali' ? 'Salah Harakat/Huruf' : 'Tajwid/Ghunnah';

    setTaggedAyahs((prev) => [...prev, { ayahNumber, type, label }]);

    if (type === 'tawaqquf') setTawaqqufCount((v) => v + 1);
    if (type === 'lahn_jali') setLahnJaliCount((v) => v + 1);
    if (type === 'lahn_khafi') setLahnKhafiCount((v) => v + 1);

    // Auto update notes
    const newNoteFragment = `Ayat ${ayahNumber}: ${label}`;
    setNotes((prev) => (prev ? `${prev}; ${newNoteFragment}` : newNoteFragment));

    if (activeScore < 80) {
      setIsMutqin(false);
    }
  };

  // Remove tag
  const handleRemoveTag = (index: number) => {
    const item = taggedAyahs[index];
    if (!item) return;

    if (item.type === 'tawaqquf') setTawaqqufCount((v) => Math.max(0, v - 1));
    if (item.type === 'lahn_jali') setLahnJaliCount((v) => Math.max(0, v - 1));
    if (item.type === 'lahn_khafi') setLahnKhafiCount((v) => Math.max(0, v - 1));

    setTaggedAyahs((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset counters
  const handleResetCounters = () => {
    setTawaqqufCount(0);
    setLahnJaliCount(0);
    setLahnKhafiCount(0);
    setTaggedAyahs([]);
    setManualScore(null);
    setNotes('');
    setIsMutqin(true);
  };

  // Play audio of a specific verse (Mishary Rashid Alafasy)
  const handlePlayAyah = (ayahNum: number) => {
    if (playingAudioAyah === ayahNum) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioAyah(null);
      return;
    }

    // Format global verse number or surah:ayah
    // alquran.cloud audio endpoint format: https://cdn.islamic.network/quran/audio/128/ar.alafasy/{globalAyahNumber}.mp3
    // Or direct surah/ayah on everyayah: https://everyayah.com/data/Alafasy_128kbps/001001.mp3
    const sStr = String(selectedSurahNumber).padStart(3, '0');
    const aStr = String(ayahNum).padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play()
      .then(() => setPlayingAudioAyah(ayahNum))
      .catch((e) => {
        console.warn('Audio playback error', e);
        setPlayingAudioAyah(null);
      });

    audio.onended = () => {
      setPlayingAudioAyah(null);
    };
  };

  // Save tahfiz record directly
  const handleSaveResult = () => {
    if (!surahDetail) return;

    const finalNotes = notes.trim() || (activeScore >= 90 ? 'Lancar, tartil, dan fashih.' : 'Perlu murojaah pada ayat yang ditandai.');

    const newRecord: TahfizSurahRecord = {
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      surahNumber: surahDetail.number,
      surahName: surahDetail.name,
      juzNumber: surahDetail.juz,
      ayatFrom: Number(ayatFrom),
      ayatTo: Number(ayatTo),
      gradeScore: Number(activeScore),
      predicate: currentPredicate,
      isMutqin,
      date: setoranDate,
      examinerTeacherName: teacherName,
      notes: finalNotes,
    };

    onSaveTahfizResult(newRecord);
    onClose();
  };

  // Filter ayahs based on range
  const visibleAyahs = (surahDetail?.ayahs || []).filter(
    (a) => a.numberInSurah >= ayatFrom && a.numberInSurah <= ayatTo
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto transition-all ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[95vh]'}`}>
        
        {/* Top Header Bar */}
        <div className="bg-emerald-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl border border-emerald-700">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-300">
                  Layar Simakan Al-Qur'an (Mode Tasmi' Halaqah)
                </span>
                <span className="bg-emerald-800/80 text-emerald-200 px-2 py-0.2 rounded text-[10px] font-semibold border border-emerald-700">
                  SMP Islam Al Azhar 9
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>Santri: <strong className="text-emerald-100">{student.name}</strong></span>
                <span className="text-emerald-300 font-normal">({student.className} • NISN {student.nisn})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors"
              title={isFullscreen ? "Kecilkan Layar" : "Layar Penuh (Fokus Simakan)"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors"
              title="Tutup Layar Simakan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Bar: Surah Selection & Range */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Surah Dropdown */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-700">Pilih Surah:</label>
              <select
                value={selectedSurahNumber}
                onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold shadow-xs focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <optgroup label="Target Utama Kelas 7 (Juz 30)">
                  {QURAN_SURAHS.filter((s) => s.juz === 30).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Target Kelas 8 (Juz 29)">
                  {QURAN_SURAHS.filter((s) => s.juz === 29).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Target Kelas 9 (Juz 28)">
                  {QURAN_SURAHS.filter((s) => s.juz === 28).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} ayat
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Surah Lainnya / Juz 1 - 27">
                  {QURAN_SURAHS.filter((s) => s.juz < 28).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - Juz {s.juz}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Verse Range */}
            {surahDetail && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <span>Rentang Ayat:</span>
                <input
                  type="number"
                  min={1}
                  max={ayatTo}
                  value={ayatFrom}
                  onChange={(e) => setAyatFrom(Math.max(1, Math.min(Number(e.target.value), ayatTo)))}
                  className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900"
                />
                <span>s.d.</span>
                <input
                  type="number"
                  min={ayatFrom}
                  max={surahDetail.numberOfAyahs}
                  value={ayatTo}
                  onChange={(e) => setAyatTo(Math.max(ayatFrom, Math.min(Number(e.target.value), surahDetail.numberOfAyahs)))}
                  className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAyatFrom(1);
                    setAyatTo(surahDetail.numberOfAyahs);
                  }}
                  className="text-[11px] text-emerald-800 hover:text-emerald-950 underline font-semibold ml-1 cursor-pointer"
                >
                  Semua ({surahDetail.numberOfAyahs})
                </button>
              </div>
            )}

            {/* Tanggal Setoran Hafalan */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <label className="font-bold text-slate-800">Tgl Setoran:</label>
              <input
                type="date"
                value={setoranDate}
                onChange={(e) => setSetoranDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {formatToIndonesianDate(setoranDate, true)}
              </span>
            </div>
          </div>

          {/* Display & Text Size Controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setDisplayMode('perAyat')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  displayMode === 'perAyat' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per Ayat
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('mushaf')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  displayMode === 'mushaf' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teks Mushaf
              </button>
            </div>

            {/* Font Size toggles */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700">
              <span className="text-slate-400 mr-0.5">Ukuran:</span>
              <button
                type="button"
                onClick={() => setFontSize('medium')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${fontSize === 'medium' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-100'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${fontSize === 'large' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-100'}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${fontSize === 'xlarge' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-100'}`}
              >
                A++
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold cursor-pointer ${
                showTranslation ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              {showTranslation ? 'Terjemah: Aktif' : 'Terjemah: Nonaktif'}
            </button>
          </div>
        </div>

        {/* Evaluation Summary Sticky Bar */}
        <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Quick Counter Buttons */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-emerald-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pencatat Kesalahan (Simakan):</span>
            </span>

            {/* Lupa / Tersendat */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2 py-1 rounded-lg">
              <span className="text-amber-900 font-bold">Lupa/Tersendat (-2):</span>
              <button
                type="button"
                onClick={() => setTawaqqufCount((v) => Math.max(0, v - 1))}
                className="w-5 h-5 rounded bg-white text-amber-900 font-bold flex items-center justify-center border border-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-amber-950 w-5 text-center">{tawaqqufCount}</span>
              <button
                type="button"
                onClick={() => setTawaqqufCount((v) => v + 1)}
                className="w-5 h-5 rounded bg-amber-800 text-white font-bold flex items-center justify-center hover:bg-amber-900 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Salah Harakat / Huruf (Lahn Jali) */}
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg">
              <span className="text-rose-900 font-bold">Salah Harakat/Huruf (-1.5):</span>
              <button
                type="button"
                onClick={() => setLahnJaliCount((v) => Math.max(0, v - 1))}
                className="w-5 h-5 rounded bg-white text-rose-900 font-bold flex items-center justify-center border border-rose-200 hover:bg-rose-100 cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-rose-950 w-5 text-center">{lahnJaliCount}</span>
              <button
                type="button"
                onClick={() => setLahnJaliCount((v) => v + 1)}
                className="w-5 h-5 rounded bg-rose-800 text-white font-bold flex items-center justify-center hover:bg-rose-900 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Salah Tajwid (Lahn Khafi) */}
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-300 px-2 py-1 rounded-lg">
              <span className="text-purple-900 font-bold">Salah Tajwid/Mad (-0.5):</span>
              <button
                type="button"
                onClick={() => setLahnKhafiCount((v) => Math.max(0, v - 1))}
                className="w-5 h-5 rounded bg-white text-purple-900 font-bold flex items-center justify-center border border-purple-200 hover:bg-purple-100 cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-purple-950 w-5 text-center">{lahnKhafiCount}</span>
              <button
                type="button"
                onClick={() => setLahnKhafiCount((v) => v + 1)}
                className="w-5 h-5 rounded bg-purple-800 text-white font-bold flex items-center justify-center hover:bg-purple-900 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Reset Button */}
            {(tawaqqufCount > 0 || lahnJaliCount > 0 || lahnKhafiCount > 0) && (
              <button
                type="button"
                onClick={handleResetCounters}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Live Score & Predicate Result */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold">Nilai Setoran:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={activeScore}
                  onChange={(e) => setManualScore(Number(e.target.value))}
                  className="w-16 bg-white border-2 border-emerald-700 rounded-lg px-2 py-0.5 text-center font-bold text-sm text-emerald-950 shadow-xs"
                />
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getPredicateColor(currentPredicate)}`}>
                  {currentPredicate}
                </span>
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs">
              <input
                type="checkbox"
                checked={isMutqin}
                onChange={(e) => setIsMutqin(e.target.checked)}
                className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-700"
              />
              <span>Mutqin (Lulus)</span>
            </label>
          </div>
        </div>

        {/* MAIN BODY: MUSHAF / VERSES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-800">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-700" />
              <p className="text-sm font-semibold">Sedang membuka lembaran Mushaf Al-Qur'an...</p>
            </div>
          ) : surahDetail ? (
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Surah Header Card (Gaya Mushaf Madinah) */}
              <div className="relative border-2 border-emerald-800/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 sm:p-5 text-center shadow-md overflow-hidden">
                <div className="absolute top-2 left-4 text-[10px] font-semibold text-emerald-300">
                  Juz {surahDetail.juz} • {surahDetail.revelationType}
                </div>
                <div className="absolute top-2 right-4 text-[10px] font-semibold text-emerald-300">
                  {surahDetail.numberOfAyahs} Ayat
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-100 tracking-wide mt-1">
                  سُورَةُ {surahDetail.arabicName}
                </h3>
                <p className="text-xs text-emerald-200 mt-1 font-sans">
                  Surah ke-{surahDetail.number}: <strong>{surahDetail.name}</strong> • Disimak ayat {ayatFrom} s.d. {ayatTo}
                </p>

                {/* Bismillah Header (except At-Taubah & Al-Fatihah already verse 1) */}
                {surahDetail.bismillahPre && (
                  <div className="mt-3 pt-3 border-t border-emerald-700/60 font-serif text-xl sm:text-2xl text-amber-200">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>

              {/* Tagged Mistakes Summary (if any tagged to specific ayat) */}
              {taggedAyahs.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Rincian Ayat yang Mengalami Kesalahan ({taggedAyahs.length} catatan):</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Klik tanda silang (x) untuk membatalkan</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {taggedAyahs.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          tag.type === 'tawaqquf'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : tag.type === 'lahn_jali'
                            ? 'bg-rose-50 text-rose-900 border-rose-300'
                            : 'bg-purple-50 text-purple-900 border-purple-300'
                        }`}
                      >
                        <span>Ayat {tag.ayahNumber}: {tag.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:opacity-75 cursor-pointer text-slate-500 hover:text-slate-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW MODE 1: PER AYAT WITH QUICK TAGGING */}
              {displayMode === 'perAyat' && (
                <div className="space-y-3">
                  {visibleAyahs.map((ayah) => {
                    const ayahMistakes = taggedAyahs.filter((t) => t.ayahNumber === ayah.numberInSurah);
                    const isPlaying = playingAudioAyah === ayah.numberInSurah;

                    return (
                      <div
                        key={ayah.numberInSurah}
                        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                          ayahMistakes.length > 0
                            ? 'border-rose-300 bg-rose-50/20'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {/* Ayah Number Badge & Audio Action */}
                        <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center border border-emerald-300 font-mono">
                              {ayah.numberInSurah}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Ayat ke-{ayah.numberInSurah}
                            </span>

                            {/* Audio tilawah button */}
                            <button
                              type="button"
                              onClick={() => handlePlayAyah(ayah.numberInSurah)}
                              className={`p-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                                isPlaying
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-900'
                              }`}
                              title="Dengarkan pelafalan murattal Alafasy untuk ayat ini"
                            >
                              {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              <span className="text-[10px] hidden sm:inline">{isPlaying ? 'Stop' : 'Cek Audio'}</span>
                            </button>
                          </div>

                          {/* Quick Tagging Buttons for this verse */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline font-medium">Tandai Salah:</span>
                            <button
                              type="button"
                              onClick={() => handleAddMistake(ayah.numberInSurah, 'tawaqquf')}
                              className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200 cursor-pointer transition-colors"
                              title="Murid tersendat atau lupa di ayat ini"
                            >
                              + Lupa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddMistake(ayah.numberInSurah, 'lahn_jali')}
                              className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-900 text-[10px] font-bold border border-rose-200 cursor-pointer transition-colors"
                              title="Salah harakat atau tertukar huruf"
                            >
                              + Harakat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddMistake(ayah.numberInSurah, 'lahn_khafi')}
                              className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-200 cursor-pointer transition-colors"
                              title="Salah tajwid, mad, ghunnah, atau waqaf"
                            >
                              + Tajwid
                            </button>
                          </div>
                        </div>

                        {/* Arabic Text */}
                        <div
                          dir="rtl"
                          className={`font-serif text-right text-slate-900 leading-[2.2] tracking-wide py-2 ${
                            fontSize === 'medium'
                              ? 'text-xl'
                              : fontSize === 'large'
                              ? 'text-2xl sm:text-3xl'
                              : 'text-3xl sm:text-4xl'
                          }`}
                        >
                          {ayah.text}{' '}
                          <span className="inline-block text-emerald-800 text-base sm:text-lg font-mono font-bold mr-2 text-center align-middle">
                            ۝{ayah.numberInSurah}
                          </span>
                        </div>

                        {/* Indonesian Translation */}
                        {showTranslation && ayah.translation && (
                          <p className="mt-2.5 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-sans">
                            {ayah.translation}
                          </p>
                        )}

                        {/* Tags attached to this verse */}
                        {ayahMistakes.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-rose-200 flex flex-wrap gap-1">
                            {ayahMistakes.map((m, i) => (
                              <span
                                key={i}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  m.type === 'tawaqquf'
                                    ? 'bg-amber-100 text-amber-900'
                                    : m.type === 'lahn_jali'
                                    ? 'bg-rose-100 text-rose-900'
                                    : 'bg-purple-100 text-purple-900'
                                }`}
                              >
                                ● {m.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW MODE 2: CONTINUOUS MUSHAF TEXT */}
              {displayMode === 'mushaf' && (
                <div className="bg-amber-50/40 border-2 border-amber-900/20 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div
                    dir="rtl"
                    className={`font-serif text-justify text-slate-900 leading-[2.5] tracking-wide ${
                      fontSize === 'medium'
                        ? 'text-xl'
                        : fontSize === 'large'
                        ? 'text-2xl sm:text-3xl'
                        : 'text-3xl sm:text-4xl'
                    }`}
                  >
                    {visibleAyahs.map((ayah) => {
                      const hasMistake = taggedAyahs.some((t) => t.ayahNumber === ayah.numberInSurah);
                      return (
                        <span
                          key={ayah.numberInSurah}
                          onClick={() => handleAddMistake(ayah.numberInSurah, 'tawaqquf')}
                          className={`inline cursor-pointer px-1 rounded transition-colors ${
                            hasMistake ? 'bg-rose-200/70 text-rose-950 font-bold' : 'hover:bg-amber-200/50'
                          }`}
                          title={`Klik untuk menandai kesalahan pada Ayat ${ayah.numberInSurah}`}
                        >
                          {ayah.text}{' '}
                          <span className="inline-block text-emerald-800 text-base sm:text-lg font-mono font-bold mx-1 text-center align-middle">
                            ۝{ayah.numberInSurah}
                          </span>{' '}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-[11px] text-slate-500 text-center font-sans">
                    Tip: Klik pada ayat mana saja di atas untuk langsung menandai kesalahan.
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>

        {/* Bottom Submission Bar */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
          
          {/* Notes Input Field */}
          <div className="w-full md:w-1/2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Catatan bimbingan untuk santri (otomatis terisi dari ayat salah)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSaveResult}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai & Selesaikan Simakan ({activeScore})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
