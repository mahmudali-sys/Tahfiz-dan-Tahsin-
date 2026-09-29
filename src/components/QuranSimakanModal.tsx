import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Save, 
  Tag, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Calendar,
  Award,
  Check,
  RotateCcw,
  AlertCircle,
  Info,
  ChevronDown,
  MousePointerClick,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { Student, TahfizSurahRecord } from '../types';
import { formatToIndonesianDate } from './IndonesianDatePicker';
import { QURAN_SURAHS, getPredicate, getPredicateColor } from '../data/quranData';
import { getSurahDetail, SurahDetail, AyahData } from '../utils/quranService';
import { analyzeArabicWord, DetectedWordMistake } from '../utils/tajwidAnalyzer';

export type MistakeCategory = 
  | 'makhorijul_huruf' 
  | 'hukum_tajwid' 
  | 'bacaan_mad' 
  | 'tawaqquf' 
  | 'lahn_jali';

export interface AyahMistakeTag {
  id: string;
  ayahNumber: number;
  wordIndex?: number;
  wordText?: string;
  category: MistakeCategory;
  label: string;
  detail?: string;
}

export const MISTAKE_PRESETS: Record<
  MistakeCategory,
  {
    name: string;
    shortName: string;
    badgeBg: string;
    chipBg: string;
    textColor: string;
    borderColor: string;
    btnBg: string;
    subtypes: string[];
  }
> = {
  makhorijul_huruf: {
    name: 'Makhorijul Huruf',
    shortName: 'Makhraj',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    chipBg: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    btnBg: 'bg-blue-700 hover:bg-blue-600 text-white',
    subtypes: [
      "Huruf 'Ain (ع) & Hamzah (أ)",
      "Huruf Ha (ح) & Ha' (هـ)",
      "Huruf Kha (خ) & Ghain (غ)",
      "Huruf Shad (ص) & Sin (س)",
      "Huruf Dhad (ض) & Dal (د) / Zha (ظ)",
      "Huruf Tha (ط) & Ta (ت)",
      "Huruf Tsa (ث) & Sin (س)",
      "Huruf Dzal (ذ) & Zay (ز)",
      "Huruf Qaf (ق) & Kaf (ك)",
      "Tafkhim Huruf Tebal (Isti'la')",
      "Sifat Huruf (Hams, Shafir, Qalqalah)",
    ],
  },
  hukum_tajwid: {
    name: 'Hukum Tajwid',
    shortName: 'Tajwid',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    chipBg: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    btnBg: 'bg-emerald-700 hover:bg-emerald-600 text-white',
    subtypes: [
      "Ghunnah (Nun/Mim Bertasydid 2 Harakat)",
      "Ikhfa Hakiki (Kurang Samar / Dengung)",
      "Idgham Bighunnah (Kurang Melebur)",
      "Idgham Bilaghunnah (Terbaca Dengung)",
      "Iqlab (Kurang Dengung / Bibir Terlalu Rapat)",
      "Idzhar Halqi / Syafawi (Terbaca Dengung)",
      "Qalqalah Sughra / Kubra (Kurang Mantul)",
      "Hukum Ra' / Lam (Tafkhim / Tarqiq)",
      "Waqaf & Ibtida' (Salah Tempat Berhenti)",
    ],
  },
  bacaan_mad: {
    name: 'Bacaan Mad',
    shortName: 'Mad',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    chipBg: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    btnBg: 'bg-purple-700 hover:bg-purple-600 text-white',
    subtypes: [
      "Mad Thobi'i Kurang 2 Harakat (Terbaca Pendek)",
      "Mad Thobi'i Terlalu Panjang (> 2 Harakat)",
      "Harakat Pendek Dipanjangkan / Terseret",
      "Mad Wajib Muttashil Kurang 4-5 Harakat",
      "Mad Jaiz Munfashil Tidak Konsisten",
      "Mad Lazim Kurang 6 Harakat",
      "Mad 'Aridh Lissukun Tidak Tertib",
    ],
  },
  tawaqquf: {
    name: 'Lupa / Tersendat',
    shortName: 'Lupa',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    chipBg: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    btnBg: 'bg-amber-700 hover:bg-amber-600 text-white',
    subtypes: [
      "Lupa Sambungan Ayat (Perlu Talqin)",
      "Tersendat > 3 Detik",
      "Ragu-ragu / Terbata-bata",
    ],
  },
  lahn_jali: {
    name: 'Salah Harakat / Kata',
    shortName: 'Harakat',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    chipBg: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-300',
    btnBg: 'bg-rose-700 hover:bg-rose-600 text-white',
    subtypes: [
      "Fathah / Kasrah / Dhammah Tertukar",
      "Sukun Terbaca Hidup",
      "Kata Tertukar / Terlewat",
    ],
  },
};

/**
 * Generator Catatan Evaluasi Kesalahan Otomatis
 */
export function generateTasmiEvaluationNotes(
  surahName: string,
  ayatFrom: number,
  ayatTo: number,
  score: number,
  predicate: string,
  isMutqin: boolean,
  tags: AyahMistakeTag[]
): string {
  if (tags.length === 0) {
    return `Evaluasi Tasmi' ${surahName} (Ayat ${ayatFrom}-${ayatTo}): Alhamdulillah bacaan sangat mutqin (Nilai: ${score}, Predikat: ${predicate}). Makharijul huruf fasih, kaidah hukum tajwid tepat, dan panjang pendek mad terjaga sangat tertib.`;
  }

  const makhraj = tags.filter((t) => t.category === 'makhorijul_huruf');
  const tajwid = tags.filter((t) => t.category === 'hukum_tajwid');
  const mad = tags.filter((t) => t.category === 'bacaan_mad');
  const tawaqquf = tags.filter((t) => t.category === 'tawaqquf');
  const lahnJali = tags.filter((t) => t.category === 'lahn_jali');

  const statsParts: string[] = [];
  if (makhraj.length > 0) statsParts.push(`${makhraj.length}x Makhorijul Huruf`);
  if (tajwid.length > 0) statsParts.push(`${tajwid.length}x Hukum Tajwid`);
  if (mad.length > 0) statsParts.push(`${mad.length}x Bacaan Mad`);
  if (tawaqquf.length > 0) statsParts.push(`${tawaqquf.length}x Lupa/Tersendat`);
  if (lahnJali.length > 0) statsParts.push(`${lahnJali.length}x Salah Harakat`);

  const verseDetails = tags.map((t) => {
    const wordPrefix = t.wordText ? ` pada kata "${t.wordText}"` : '';
    const detailText = t.detail ? ` (${t.detail})` : '';
    return `Ayat ${t.ayahNumber}${wordPrefix}: ${MISTAKE_PRESETS[t.category].name}${detailText}`;
  }).join('; ');

  const recommendations: string[] = [];
  if (makhraj.length > 0) {
    recommendations.push("Pertajam ketelitian bunyi makhraj huruf (khususnya huruf halaq dan lisan pada ayat yang dikoreksi)");
  }
  if (tajwid.length > 0) {
    recommendations.push("Jaga kesempurnaan dengung ghunnah 2 harakat dan kejelasan hukum nun/mim sukun");
  }
  if (mad.length > 0) {
    recommendations.push("Disiplin panjang mad thobi'i tepat 2 harakat dan hindari menyeret harakat pendek 1 ketukan");
  }
  if (tawaqquf.length > 0) {
    recommendations.push("Perbanyak simakan muroja'ah berpasangan untuk menguatkan kelancaran sambung ayat");
  }

  const adviceText = recommendations.length > 0 ? ` Saran: ${recommendations.join('. ')}.` : '';
  const statusText = isMutqin ? 'Lulus / Mutqin' : 'Perlu Pengulangan Muroja\'ah';

  return `Evaluasi Tasmi' ${surahName} (Ayat ${ayatFrom}-${ayatTo}) [${statusText} - Nilai: ${score} (${predicate})]. Rekap Koreksi: ${statsParts.join(', ')}. Rincian Koreksi: ${verseDetails}.${adviceText}`;
}

interface QuranSimakanModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  teacherName: string;
  onSaveTahfizResult: (newRecord: TahfizSurahRecord) => void;
  initialSurahNumber?: number;
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

  const defaultSurahNum = initialSurahNumber || (student.className.startsWith('9') ? 58 : student.className.startsWith('8') ? 67 : 78);

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(defaultSurahNum);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [ayatFrom, setAyatFrom] = useState<number>(1);
  const [ayatTo, setAyatTo] = useState<number>(1);

  // 5 Counter Kesalahan Tasmi'
  const [makhorijulHurufCount, setMakhorijulHurufCount] = useState<number>(0);
  const [hukumTajwidCount, setHukumTajwidCount] = useState<number>(0);
  const [bacaanMadCount, setBacaanMadCount] = useState<number>(0);
  const [tawaqqufCount, setTawaqqufCount] = useState<number>(0);
  const [lahnJaliCount, setLahnJaliCount] = useState<number>(0);

  // Rincian ayat yang dikoreksi (termasuk wordIndex & wordText)
  const [taggedAyahs, setTaggedAyahs] = useState<AyahMistakeTag[]>([]);

  // Popover Kata Interaktif Cerdas
  const [activeWordPopup, setActiveWordPopup] = useState<{
    ayahNumber: number;
    wordIndex: number;
    wordText: string;
    detectedMistakes: DetectedWordMistake[];
    existingTag?: AyahMistakeTag;
  } | null>(null);

  // Subtype Picker Modal untuk tombol level ayat
  const [pickerModalState, setPickerModalState] = useState<{
    ayahNumber: number;
    category: MistakeCategory;
  } | null>(null);

  // Live Toast Notification saat sebuah kata dikoreksi
  const [liveCorrectionAlert, setLiveCorrectionAlert] = useState<{
    word: string;
    ayahNumber: number;
    ruleName: string;
    deduction: number;
    newScore: number;
    predicate: string;
  } | null>(null);

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

  // Audio tilawah helper
  const [playingAudioAyah, setPlayingAudioAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Kalkulasi Skor Otomatis Berdasarkan Koreksi
  const calculatedScore = useMemo(() => {
    const raw = 100 -
      (tawaqqufCount * 2.0) -
      (lahnJaliCount * 1.5) -
      (makhorijulHurufCount * 1.0) -
      (hukumTajwidCount * 0.75) -
      (bacaanMadCount * 0.75);
    return Math.max(50, Math.round(raw * 10) / 10);
  }, [tawaqqufCount, lahnJaliCount, makhorijulHurufCount, hukumTajwidCount, bacaanMadCount]);

  const activeScore = manualScore !== null ? manualScore : calculatedScore;
  const currentPredicate = getPredicate(activeScore);

  // Sinkronkan status kelulusan Mutqin
  useEffect(() => {
    if (activeScore < 80 || tawaqqufCount >= 4) {
      setIsMutqin(false);
    } else {
      setIsMutqin(true);
    }
  }, [activeScore, tawaqqufCount]);

  // Handler Klik Kata Arab: Menganalisis kata secara cerdas seketika
  const handleWordClick = (ayahNumber: number, wordIndex: number, wordText: string) => {
    const existingTag = taggedAyahs.find(
      (t) => t.ayahNumber === ayahNumber && t.wordIndex === wordIndex
    );
    const detected = analyzeArabicWord(wordText);
    setActiveWordPopup({
      ayahNumber,
      wordIndex,
      wordText,
      detectedMistakes: detected,
      existingTag,
    });
  };

  // Terapkan Koreksi Kata Terpilih Langsung Menghitung Nilai
  const handleApplyWordMistake = (
    ayahNumber: number,
    wordIndex: number,
    wordText: string,
    category: MistakeCategory,
    detail: string,
    deduction: number,
    ruleName: string
  ) => {
    // Jika kata ini sebelumnya sudah punya tag, kurangi counter lama
    const existing = taggedAyahs.find(
      (t) => t.ayahNumber === ayahNumber && t.wordIndex === wordIndex
    );
    if (existing) {
      if (existing.category === 'makhorijul_huruf') setMakhorijulHurufCount((v) => Math.max(0, v - 1));
      if (existing.category === 'hukum_tajwid') setHukumTajwidCount((v) => Math.max(0, v - 1));
      if (existing.category === 'bacaan_mad') setBacaanMadCount((v) => Math.max(0, v - 1));
      if (existing.category === 'tawaqquf') setTawaqqufCount((v) => Math.max(0, v - 1));
      if (existing.category === 'lahn_jali') setLahnJaliCount((v) => Math.max(0, v - 1));
    }

    const preset = MISTAKE_PRESETS[category];
    const newTag: AyahMistakeTag = {
      id: `tag-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ayahNumber,
      wordIndex,
      wordText,
      category,
      label: preset.name,
      detail,
    };

    const remainingTags = taggedAyahs.filter(
      (t) => !(t.ayahNumber === ayahNumber && t.wordIndex === wordIndex)
    );
    const updatedTags = [...remainingTags, newTag];
    setTaggedAyahs(updatedTags);

    // Tambah counter baru
    if (category === 'makhorijul_huruf') setMakhorijulHurufCount((v) => v + 1);
    if (category === 'hukum_tajwid') setHukumTajwidCount((v) => v + 1);
    if (category === 'bacaan_mad') setBacaanMadCount((v) => v + 1);
    if (category === 'tawaqquf') setTawaqqufCount((v) => v + 1);
    if (category === 'lahn_jali') setLahnJaliCount((v) => v + 1);

    // Hitung skor instan untuk notifikasi live
    const newScoreCalc = Math.max(
      50,
      Math.round(
        (activeScore - (existing ? 0 : deduction)) * 10
      ) / 10
    );
    const newPred = getPredicate(newScoreCalc);

    // Tampilkan Toast Notifikasi Live Nilai dan Koreksian
    setLiveCorrectionAlert({
      word: wordText,
      ayahNumber,
      ruleName,
      deduction,
      newScore: newScoreCalc,
      predicate: newPred,
    });
    setTimeout(() => {
      setLiveCorrectionAlert(null);
    }, 4500);

    // Perbarui catatan evaluasi otomatis secara langsung
    if (surahDetail) {
      const generated = generateTasmiEvaluationNotes(
        surahDetail.name,
        ayatFrom,
        ayatTo,
        newScoreCalc,
        newPred,
        newScoreCalc >= 80,
        updatedTags
      );
      setNotes(generated);
    }

    setActiveWordPopup(null);
  };

  // Tambahkan koreksi kesalahan umum per ayat
  const handleAddAyahLevelMistake = (ayahNumber: number, category: MistakeCategory, specificDetail?: string) => {
    const preset = MISTAKE_PRESETS[category];
    const newTag: AyahMistakeTag = {
      id: `tag-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ayahNumber,
      category,
      label: preset.name,
      detail: specificDetail,
    };

    const updatedTags = [...taggedAyahs, newTag];
    setTaggedAyahs(updatedTags);

    if (category === 'makhorijul_huruf') setMakhorijulHurufCount((v) => v + 1);
    if (category === 'hukum_tajwid') setHukumTajwidCount((v) => v + 1);
    if (category === 'bacaan_mad') setBacaanMadCount((v) => v + 1);
    if (category === 'tawaqquf') setTawaqqufCount((v) => v + 1);
    if (category === 'lahn_jali') setLahnJaliCount((v) => v + 1);

    if (surahDetail) {
      const generated = generateTasmiEvaluationNotes(
        surahDetail.name,
        ayatFrom,
        ayatTo,
        activeScore,
        currentPredicate,
        isMutqin,
        updatedTags
      );
      setNotes(generated);
    }

    setPickerModalState(null);
  };

  // Hapus koreksi
  const handleRemoveTag = (tagId: string) => {
    const item = taggedAyahs.find((t) => t.id === tagId);
    if (!item) return;

    if (item.category === 'makhorijul_huruf') setMakhorijulHurufCount((v) => Math.max(0, v - 1));
    if (item.category === 'hukum_tajwid') setHukumTajwidCount((v) => Math.max(0, v - 1));
    if (item.category === 'bacaan_mad') setBacaanMadCount((v) => Math.max(0, v - 1));
    if (item.category === 'tawaqquf') setTawaqqufCount((v) => Math.max(0, v - 1));
    if (item.category === 'lahn_jali') setLahnJaliCount((v) => Math.max(0, v - 1));

    const updatedTags = taggedAyahs.filter((t) => t.id !== tagId);
    setTaggedAyahs(updatedTags);

    if (surahDetail) {
      const generated = generateTasmiEvaluationNotes(
        surahDetail.name,
        ayatFrom,
        ayatTo,
        activeScore,
        currentPredicate,
        isMutqin,
        updatedTags
      );
      setNotes(generated);
    }

    if (activeWordPopup && activeWordPopup.existingTag?.id === tagId) {
      setActiveWordPopup(null);
    }
  };

  // Reset semua koreksi
  const handleResetCounters = () => {
    setMakhorijulHurufCount(0);
    setHukumTajwidCount(0);
    setBacaanMadCount(0);
    setTawaqqufCount(0);
    setLahnJaliCount(0);
    setTaggedAyahs([]);
    setManualScore(null);
    setIsMutqin(true);
    setActiveWordPopup(null);
    setLiveCorrectionAlert(null);
    if (surahDetail) {
      const generated = generateTasmiEvaluationNotes(
        surahDetail.name,
        ayatFrom,
        ayatTo,
        100,
        'Mumtaz',
        true,
        []
      );
      setNotes(generated);
    }
  };

  // Re-generate Catatan Evaluasi
  const handleGenerateSmartNotes = () => {
    if (!surahDetail) return;
    const generated = generateTasmiEvaluationNotes(
      surahDetail.name,
      ayatFrom,
      ayatTo,
      activeScore,
      currentPredicate,
      isMutqin,
      taggedAyahs
    );
    setNotes(generated);
  };

  // Tambahkan rekomendasi cepat ke catatan
  const appendRecommendation = (recText: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return recText;
      if (trimmed.includes(recText)) return trimmed;
      return `${trimmed} Tambahan: ${recText}`;
    });
  };

  // Audio helper
  const handlePlayAyah = (ayahNum: number) => {
    if (playingAudioAyah === ayahNum) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioAyah(null);
      return;
    }

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

  // Simpan record tasmi'
  const handleSaveResult = () => {
    if (!surahDetail) return;

    const finalNotes = notes.trim() || generateTasmiEvaluationNotes(
      surahDetail.name,
      ayatFrom,
      ayatTo,
      activeScore,
      currentPredicate,
      isMutqin,
      taggedAyahs
    );

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

  const visibleAyahs = (surahDetail?.ayahs || []).filter(
    (a) => a.numberInSurah >= ayatFrom && a.numberInSurah <= ayatTo
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto transition-all ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[96vh]'}`}>
        
        {/* Top Header Bar */}
        <div className="bg-emerald-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl border border-emerald-700 shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Koreksi Pintar Tasmi' Al-Qur'an (Klik Kata Otomatis)</span>
                </span>
                <span className="bg-emerald-800 text-emerald-200 px-2 py-0.2 rounded text-[10px] font-semibold border border-emerald-700">
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
              title={isFullscreen ? "Kecilkan Layar" : "Layar Penuh (Fokus Tasmi')"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-rose-700/80 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Notification Bar saat Kata Dikoreksi */}
        {liveCorrectionAlert && (
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200 shadow-sm border-b border-emerald-700">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-400 text-slate-950 rounded-full font-bold">
                <Check className="w-3 h-3" />
              </span>
              <span>
                Koreksi Kata <strong>"{liveCorrectionAlert.word}"</strong> (Ayat {liveCorrectionAlert.ayahNumber}):{' '}
                <strong className="text-amber-200">{liveCorrectionAlert.ruleName}</strong> (-{liveCorrectionAlert.deduction})
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span>Nilai Sekarang:</span>
              <span className="bg-white text-emerald-950 px-2 py-0.5 rounded-full text-xs font-extrabold font-mono shadow-2xs">
                {liveCorrectionAlert.newScore} ({liveCorrectionAlert.predicate})
              </span>
            </div>
          </div>
        )}

        {/* Secondary Bar: Selection of Surah, Range, Date & Display */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Surah Selector */}
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-slate-800">Surah:</label>
              <select
                value={selectedSurahNumber}
                onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-700 cursor-pointer shadow-2xs max-w-[210px] sm:max-w-xs"
              >
                <optgroup label="Target Kelas 7 (Juz 30)">
                  {QURAN_SURAHS.filter((s) => s.juz === 30).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} Ayat
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Target Kelas 8 (Juz 29)">
                  {QURAN_SURAHS.filter((s) => s.juz === 29).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} Ayat
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Target Kelas 9 (Juz 28)">
                  {QURAN_SURAHS.filter((s) => s.juz === 28).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabic}) - {s.totalAyat} Ayat
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Surat Lainnya (Juz 1 - 27)">
                  {QURAN_SURAHS.filter((s) => s.juz < 28).map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} (Juz {s.juz})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Range of Verses */}
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-slate-800">Ayat:</label>
              <input
                type="number"
                min={1}
                max={ayatTo}
                value={ayatFrom}
                onChange={(e) => setAyatFrom(Math.max(1, Math.min(ayatTo, Number(e.target.value) || 1)))}
                className="w-13 bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-center font-bold text-xs"
              />
              <span className="text-slate-500 font-bold">s/d</span>
              <input
                type="number"
                min={ayatFrom}
                max={surahDetail?.numberOfAyahs || 1}
                value={ayatTo}
                onChange={(e) => setAyatTo(Math.max(ayatFrom, Math.min(surahDetail?.numberOfAyahs || 1, Number(e.target.value) || 1)))}
                className="w-13 bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-center font-bold text-xs"
              />
            </div>

            {/* Setoran Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <input
                type="date"
                value={setoranDate}
                onChange={(e) => setSetoranDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              />
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
              <span className="text-slate-400 mr-0.5">Teks:</span>
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
              {showTranslation ? 'Terjemah: ON' : 'Terjemah: OFF'}
            </button>
          </div>
        </div>

        {/* 5 KATEGORI KOREKSI (STICKY BAR DENGAN NILAI & PREDIKAT LIVE) */}
        <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-emerald-950 flex items-center gap-1 mr-1">
              <MousePointerClick className="w-4 h-4 text-emerald-700" />
              <span>Koreksi Aktif:</span>
            </span>

            {/* 1. Makhorijul Huruf (-1.0) */}
            <div className="flex items-center gap-1 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="text-blue-900 font-bold text-[11px]">Makhraj (-1):</span>
              <button
                type="button"
                onClick={() => setMakhorijulHurufCount((v) => Math.max(0, v - 1))}
                className="w-4.5 h-4.5 rounded bg-white text-blue-900 font-bold flex items-center justify-center border border-blue-200 hover:bg-blue-100 cursor-pointer text-xs"
              >
                -
              </button>
              <span className="font-mono font-extrabold text-blue-950 w-5 text-center">{makhorijulHurufCount}</span>
              <button
                type="button"
                onClick={() => setMakhorijulHurufCount((v) => v + 1)}
                className="w-4.5 h-4.5 rounded bg-blue-700 text-white font-bold flex items-center justify-center hover:bg-blue-800 cursor-pointer text-xs"
              >
                +
              </button>
            </div>

            {/* 2. Hukum Tajwid (-0.75) */}
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="text-emerald-900 font-bold text-[11px]">Tajwid (-0.75):</span>
              <button
                type="button"
                onClick={() => setHukumTajwidCount((v) => Math.max(0, v - 1))}
                className="w-4.5 h-4.5 rounded bg-white text-emerald-900 font-bold flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 cursor-pointer text-xs"
              >
                -
              </button>
              <span className="font-mono font-extrabold text-emerald-950 w-5 text-center">{hukumTajwidCount}</span>
              <button
                type="button"
                onClick={() => setHukumTajwidCount((v) => v + 1)}
                className="w-4.5 h-4.5 rounded bg-emerald-700 text-white font-bold flex items-center justify-center hover:bg-emerald-800 cursor-pointer text-xs"
              >
                +
              </button>
            </div>

            {/* 3. Bacaan Mad (-0.75) */}
            <div className="flex items-center gap-1 bg-purple-50 border border-purple-300 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="text-purple-900 font-bold text-[11px]">Mad (-0.75):</span>
              <button
                type="button"
                onClick={() => setBacaanMadCount((v) => Math.max(0, v - 1))}
                className="w-4.5 h-4.5 rounded bg-white text-purple-900 font-bold flex items-center justify-center border border-purple-200 hover:bg-purple-100 cursor-pointer text-xs"
              >
                -
              </button>
              <span className="font-mono font-extrabold text-purple-950 w-5 text-center">{bacaanMadCount}</span>
              <button
                type="button"
                onClick={() => setBacaanMadCount((v) => v + 1)}
                className="w-4.5 h-4.5 rounded bg-purple-700 text-white font-bold flex items-center justify-center hover:bg-purple-800 cursor-pointer text-xs"
              >
                +
              </button>
            </div>

            {/* 4. Lupa / Tersendat (-2.0) */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="text-amber-900 font-bold text-[11px]">Lupa (-2):</span>
              <button
                type="button"
                onClick={() => setTawaqqufCount((v) => Math.max(0, v - 1))}
                className="w-4.5 h-4.5 rounded bg-white text-amber-900 font-bold flex items-center justify-center border border-amber-200 hover:bg-amber-100 cursor-pointer text-xs"
              >
                -
              </button>
              <span className="font-mono font-extrabold text-amber-950 w-5 text-center">{tawaqqufCount}</span>
              <button
                type="button"
                onClick={() => setTawaqqufCount((v) => v + 1)}
                className="w-4.5 h-4.5 rounded bg-amber-700 text-white font-bold flex items-center justify-center hover:bg-amber-800 cursor-pointer text-xs"
              >
                +
              </button>
            </div>

            {/* 5. Salah Harakat (-1.5) */}
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="text-rose-900 font-bold text-[11px]">Harakat (-1.5):</span>
              <button
                type="button"
                onClick={() => setLahnJaliCount((v) => Math.max(0, v - 1))}
                className="w-4.5 h-4.5 rounded bg-white text-rose-900 font-bold flex items-center justify-center border border-rose-200 hover:bg-rose-100 cursor-pointer text-xs"
              >
                -
              </button>
              <span className="font-mono font-extrabold text-rose-950 w-5 text-center">{lahnJaliCount}</span>
              <button
                type="button"
                onClick={() => setLahnJaliCount((v) => v + 1)}
                className="w-4.5 h-4.5 rounded bg-rose-700 text-white font-bold flex items-center justify-center hover:bg-rose-800 cursor-pointer text-xs"
              >
                +
              </button>
            </div>

            {/* Reset */}
            {(makhorijulHurufCount > 0 || hukumTajwidCount > 0 || bacaanMadCount > 0 || tawaqqufCount > 0 || lahnJaliCount > 0) && (
              <button
                type="button"
                onClick={handleResetCounters}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Nilai Setoran & Predikat Live */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-700 font-bold">Nilai:</span>
              <input
                type="number"
                min={0}
                max={100}
                value={activeScore}
                onChange={(e) => setManualScore(Number(e.target.value))}
                className="w-16 bg-white border-2 border-emerald-700 rounded-lg px-1.5 py-0.5 text-center font-bold text-sm text-emerald-950 shadow-xs"
              />
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getPredicateColor(currentPredicate)}`}>
                {currentPredicate}
              </span>
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

        {/* Tip Petunjuk Interaktif */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-4 sm:px-6 py-1.5 text-[11px] text-amber-900 flex items-center justify-between shrink-0 font-medium">
          <div className="flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-700" />
            <span>
              <strong>Fitur Pintar:</strong> Klik langsung pada kata bahasa Arab yang salah dibaca santri. Sistem otomatis mendeteksi hukum tajwid, makhraj huruf, atau mad pada kata tersebut dan langsung menghitung nilai serta koreksiannya.
            </span>
          </div>
        </div>

        {/* MAIN BODY: MUSHAF / VERSES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-800">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-700" />
              <p className="text-sm font-semibold">Sedang membuka lembaran Mushaf Al-Qur'an...</p>
            </div>
          ) : surahDetail ? (
            <div className="max-w-4xl mx-auto space-y-5">

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

                {surahDetail.bismillahPre && (
                  <div className="mt-3 pt-3 border-t border-emerald-700/60 font-serif text-xl sm:text-2xl text-amber-200">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>

              {/* Tagged Mistakes Summary (Daftar Ayat yang telah dikoreksi) */}
              {taggedAyahs.length > 0 && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Rincian Koreksi Kata & Ayat ({taggedAyahs.length} catatan aktif):</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Klik tombol (x) untuk membatalkan koreksi</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {taggedAyahs.map((tag) => {
                      const preset = MISTAKE_PRESETS[tag.category];
                      return (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${preset.badgeBg}`}
                        >
                          <span>
                            <strong>Ayat {tag.ayahNumber}{tag.wordText ? ` ("${tag.wordText}")` : ''}:</strong> {preset.shortName}
                            {tag.detail ? ` (${tag.detail})` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="hover:opacity-75 cursor-pointer text-slate-500 hover:text-slate-900 ml-0.5"
                            title="Hapus koreksi ini"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW MODE 1: PER AYAT DENGAN KATA-KATA KLIK INTERAKTIF */}
              {displayMode === 'perAyat' && (
                <div className="space-y-3">
                  {visibleAyahs.map((ayah) => {
                    const ayahMistakes = taggedAyahs.filter((t) => t.ayahNumber === ayah.numberInSurah);
                    const isPlaying = playingAudioAyah === ayah.numberInSurah;
                    const words = ayah.text.trim().split(/\s+/);

                    return (
                      <div
                        key={ayah.numberInSurah}
                        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                          ayahMistakes.length > 0
                            ? 'border-rose-300 bg-rose-50/15'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {/* Header bar ayat + audio */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center border border-emerald-300 font-mono">
                              {ayah.numberInSurah}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Ayat {ayah.numberInSurah}
                            </span>

                            {/* Audio tilawah */}
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

                          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium">
                            <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Klik langsung kata yang salah di bawah:</span>
                          </div>
                        </div>

                        {/* ARABIC TEXT: KATA-KATA DAPAT DIKLIK SECARA INDIVIDUAL */}
                        <div
                          dir="rtl"
                          className={`font-serif text-right text-slate-900 leading-[2.6] tracking-wide py-2 ${
                            fontSize === 'medium'
                              ? 'text-xl'
                              : fontSize === 'large'
                              ? 'text-2xl sm:text-3xl'
                              : 'text-3xl sm:text-4xl'
                          }`}
                        >
                          {words.map((word, wIdx) => {
                            const wordMistake = taggedAyahs.find(
                              (t) => t.ayahNumber === ayah.numberInSurah && t.wordIndex === wIdx
                            );
                            return (
                              <span
                                key={wIdx}
                                onClick={() => handleWordClick(ayah.numberInSurah, wIdx, word)}
                                className={`inline-block mx-1 px-2 py-0.5 rounded-xl cursor-pointer transition-all select-none ${
                                  wordMistake
                                    ? wordMistake.category === 'hukum_tajwid'
                                      ? 'bg-emerald-100 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-xs'
                                      : wordMistake.category === 'makhorijul_huruf'
                                      ? 'bg-blue-100 text-blue-950 font-bold ring-2 ring-blue-500 shadow-xs'
                                      : wordMistake.category === 'bacaan_mad'
                                      ? 'bg-purple-100 text-purple-950 font-bold ring-2 ring-purple-500 shadow-xs'
                                      : wordMistake.category === 'tawaqquf'
                                      ? 'bg-amber-100 text-amber-950 font-bold ring-2 ring-amber-500 shadow-xs'
                                      : 'bg-rose-100 text-rose-950 font-bold ring-2 ring-rose-500 shadow-xs'
                                    : 'hover:bg-amber-100/80 hover:text-amber-950 hover:scale-105 active:scale-95'
                                }`}
                                title={wordMistake ? `Telah dikoreksi: ${wordMistake.detail}` : `Klik kata "${word}" untuk koreksi otomatis tajwid/makhraj/mad`}
                              >
                                {word}
                                {wordMistake && (
                                  <span className="text-[9.5px] -top-1.5 relative mr-1 px-1.5 py-0.2 bg-white/95 rounded-full text-slate-900 font-sans font-extrabold border border-slate-300 shadow-2xs">
                                    {MISTAKE_PRESETS[wordMistake.category].shortName}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                          <span className="inline-block text-emerald-800 text-base sm:text-lg font-mono font-bold mr-2 text-center align-middle">
                            ۝{ayah.numberInSurah}
                          </span>
                        </div>

                        {/* Indonesian Translation */}
                        {showTranslation && ayah.translation && (
                          <p className="mt-2 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-sans">
                            {ayah.translation}
                          </p>
                        )}

                        {/* Badges koreksi spesifik pada ayat ini */}
                        {ayahMistakes.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 mr-1">Koreksi ayat ini:</span>
                            {ayahMistakes.map((m) => {
                              const preset = MISTAKE_PRESETS[m.category];
                              return (
                                <span
                                  key={m.id}
                                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${preset.badgeBg}`}
                                >
                                  <span>
                                    ● {m.wordText ? `"${m.wordText}" ` : ''}{preset.shortName}: {m.detail || preset.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(m.id)}
                                    className="hover:opacity-75 cursor-pointer ml-0.5"
                                    title="Hapus koreksi ini"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW MODE 2: CONTINUOUS MUSHAF TEXT DENGAN KATA-KATA KLIK */}
              {displayMode === 'mushaf' && (
                <div className="bg-amber-50/40 border-2 border-amber-900/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div
                    dir="rtl"
                    className={`font-serif text-justify text-slate-900 leading-[2.6] tracking-wide ${
                      fontSize === 'medium'
                        ? 'text-xl'
                        : fontSize === 'large'
                        ? 'text-2xl sm:text-3xl'
                        : 'text-3xl sm:text-4xl'
                    }`}
                  >
                    {visibleAyahs.map((ayah) => {
                      const words = ayah.text.trim().split(/\s+/);
                      return (
                        <React.Fragment key={ayah.numberInSurah}>
                          {words.map((word, wIdx) => {
                            const wordMistake = taggedAyahs.find(
                              (t) => t.ayahNumber === ayah.numberInSurah && t.wordIndex === wIdx
                            );
                            return (
                              <span
                                key={wIdx}
                                onClick={() => handleWordClick(ayah.numberInSurah, wIdx, word)}
                                className={`inline-block mx-1 px-1.5 py-0.5 rounded-xl cursor-pointer transition-all ${
                                  wordMistake
                                    ? wordMistake.category === 'hukum_tajwid'
                                      ? 'bg-emerald-200/90 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-xs'
                                      : wordMistake.category === 'makhorijul_huruf'
                                      ? 'bg-blue-200/90 text-blue-950 font-bold ring-2 ring-blue-500 shadow-xs'
                                      : wordMistake.category === 'bacaan_mad'
                                      ? 'bg-purple-200/90 text-purple-950 font-bold ring-2 ring-purple-500 shadow-xs'
                                      : wordMistake.category === 'tawaqquf'
                                      ? 'bg-amber-200/90 text-amber-950 font-bold ring-2 ring-amber-500 shadow-xs'
                                      : 'bg-rose-200/90 text-rose-950 font-bold ring-2 ring-rose-500 shadow-xs'
                                    : 'hover:bg-amber-200/60'
                                }`}
                                title={wordMistake ? `Telah dikoreksi: ${wordMistake.detail}` : `Klik kata "${word}" untuk koreksi otomatis`}
                              >
                                {word}
                                {wordMistake && (
                                  <span className="text-[9px] -top-1.5 relative mr-1 px-1 py-0.2 bg-white rounded-full text-slate-800 font-sans font-bold border border-slate-300">
                                    {MISTAKE_PRESETS[wordMistake.category].shortName}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                          <span className="inline-block text-emerald-800 text-base sm:text-lg font-mono font-bold mx-1 text-center align-middle">
                            ۝{ayah.numberInSurah}
                          </span>{' '}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-500 text-center font-sans">
                    Tip: Klik pada kata mana saja di atas untuk langsung mendeteksi kesalahan Makhorijul Huruf, Hukum Tajwid, atau Bacaan Mad secara otomatis.
                  </div>
                </div>
              )}

              {/* PANEL EVALUASI & CATATAN KESALAHAN TASMI' */}
              <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 border border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>Evaluasi & Catatan Kesalahan Tasmi'</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
                          {taggedAyahs.length} Koreksi Aktif
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Hasil analisis koreksi Makhorijul Huruf, Hukum Tajwid, Bacaan Mad per kata & ayat secara otomatis.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateSmartNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                    title="Perbarui catatan evaluasi otomatis berdasarkan ayat yang baru dikoreksi"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Generate Catatan Otomatis</span>
                  </button>
                </div>

                {/* Ringkasan 5 Statistik Kategori Koreksi */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {/* 1. Makhorijul Huruf */}
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-blue-800 font-extrabold block uppercase tracking-tight">Makhorijul Huruf</span>
                    <span className="text-xl font-extrabold text-blue-950 font-mono my-0.5 block">{makhorijulHurufCount}</span>
                    <span className="text-[9px] text-blue-600 block">(-1 per koreksi)</span>
                  </div>
                  {/* 2. Hukum Tajwid */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-emerald-800 font-extrabold block uppercase tracking-tight">Hukum Tajwid</span>
                    <span className="text-xl font-extrabold text-emerald-950 font-mono my-0.5 block">{hukumTajwidCount}</span>
                    <span className="text-[9px] text-emerald-600 block">(-0.75 per koreksi)</span>
                  </div>
                  {/* 3. Bacaan Mad */}
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-purple-800 font-extrabold block uppercase tracking-tight">Bacaan Mad</span>
                    <span className="text-xl font-extrabold text-purple-950 font-mono my-0.5 block">{bacaanMadCount}</span>
                    <span className="text-[9px] text-purple-600 block">(-0.75 per koreksi)</span>
                  </div>
                  {/* 4. Lupa / Tersendat */}
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-amber-800 font-extrabold block uppercase tracking-tight">Lupa / Tersendat</span>
                    <span className="text-xl font-extrabold text-amber-950 font-mono my-0.5 block">{tawaqqufCount}</span>
                    <span className="text-[9px] text-amber-600 block">(-2 per koreksi)</span>
                  </div>
                  {/* 5. Salah Harakat */}
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-rose-800 font-extrabold block uppercase tracking-tight">Salah Harakat</span>
                    <span className="text-xl font-extrabold text-rose-950 font-mono my-0.5 block">{lahnJaliCount}</span>
                    <span className="text-[9px] text-rose-600 block">(-1.5 per koreksi)</span>
                  </div>
                </div>

                {/* Textarea Catatan Evaluasi Pembimbing */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <label className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Catatan Evaluasi Pembimbing untuk Santri:</span>
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      Tersimpan ke Riwayat & Rapot Santri
                    </span>
                  </div>
                  
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan evaluasi bimbingan santri (otomatis terisi dari ayat & kata yang dikoreksi)..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none leading-relaxed shadow-2xs"
                  />

                  {/* Preset Rekomendasi Cepat */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Saran Cepat:</span>
                    <button
                      type="button"
                      onClick={() => appendRecommendation("Perbanyak latihan makhraj huruf halaq (tenggorokan) dan lisan (lidah).")}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                    >
                      + Latihan Makhraj
                    </button>
                    <button
                      type="button"
                      onClick={() => appendRecommendation("Fokus pada kesempurnaan dengung ghunnah 2 harakat dan kejelasan hukum ikhfa.")}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    >
                      + Latihan Tajwid
                    </button>
                    <button
                      type="button"
                      onClick={() => appendRecommendation("Disiplin mad thobi'i tepat 2 ketukan dan hindari menyeret harakat pendek.")}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                    >
                      + Disiplin Mad 2 Harakat
                    </button>
                    <button
                      type="button"
                      onClick={() => appendRecommendation("Simakan mandiri berpasangan sebelum maju setoran berikutnya.")}
                      className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                    >
                      + Muroja'ah Berpasangan
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : null}

        </div>

        {/* Bottom Submission Bar */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>Hasil Tasmi':</span>
            <strong className="text-emerald-950 font-bold text-sm">Nilai {activeScore} ({currentPredicate})</strong>
            <span>•</span>
            <span className={isMutqin ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
              {isMutqin ? "✓ Mutqin (Lulus)" : "⚠ Perlu Muroja'ah"}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveResult}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai & Selesaikan Tasmi' ({activeScore})</span>
            </button>
          </div>
        </div>

      </div>

      {/* POPOVER KOREKSI KATA OTOMATIS: KETIKA KATA DIKLIK, LANGSUNG TAHU KESALAHANNYA */}
      {activeWordPopup && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200">
            
            {/* Header Popover Kata */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                    <span>Koreksi Otomatis Kata (Ayat {activeWordPopup.ayahNumber})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sistem mendeteksi kaidah tajwid, makhraj, dan mad pada kata ini:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveWordPopup(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tampilan Kata Arab Besar & Jelas */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 text-center shadow-inner relative overflow-hidden">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">
                Kata yang Dikoreksi:
              </span>
              <div dir="rtl" className="font-serif text-3xl sm:text-4xl text-amber-200 py-1 font-bold">
                {activeWordPopup.wordText}
              </div>
              {activeWordPopup.existingTag && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] bg-rose-500/90 text-white px-2.5 py-0.5 rounded-full font-bold">
                  <span>Saat ini dikoreksi: {activeWordPopup.existingTag.detail || activeWordPopup.existingTag.label}</span>
                </div>
              )}
            </div>

            {/* 1. REKOMENDASI UTAMA: LANGSUNG DI-KLIK LANGSUNG TAHU KESALAHAN & NILAI MUNCUL */}
            {activeWordPopup.detectedMistakes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-tight flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rekomendasi Deteksi Cerdas (Klik 1 Kali untuk Terapkan):</span>
                </span>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {activeWordPopup.detectedMistakes.map((det, dIdx) => (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => handleApplyWordMistake(
                        activeWordPopup.ayahNumber,
                        activeWordPopup.wordIndex,
                        activeWordPopup.wordText,
                        det.category,
                        det.detail,
                        det.deduction,
                        det.ruleName
                      )}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 shadow-2xs group ${
                        det.isPrimary
                          ? 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            det.category === 'makhorijul_huruf' ? 'bg-blue-100 text-blue-900' :
                            det.category === 'hukum_tajwid' ? 'bg-emerald-100 text-emerald-900' :
                            det.category === 'bacaan_mad' ? 'bg-purple-100 text-purple-900' :
                            det.category === 'tawaqquf' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {det.label}
                          </span>
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-950">
                            {det.ruleName}
                          </span>
                          {det.isPrimary && (
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-300">
                              Paling Cocok
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {det.detail}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-block px-2 py-1 bg-white text-rose-700 font-mono font-extrabold rounded-lg text-xs border border-rose-200 shadow-2xs">
                          -{det.deduction}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                          Terapkan →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tombol Hapus Koreksi jika sudah ada */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {activeWordPopup.existingTag ? (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(activeWordPopup.existingTag!.id)}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200"
                >
                  Hapus Koreksi Kata Ini
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Nilai berkurang otomatis saat salah satu opsi ditekan
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveWordPopup(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PICKER SUB-KESALAHAN SPESIFIK TINGKAT AYAT */}
      {pickerModalState && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3.5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  pickerModalState.category === 'makhorijul_huruf' ? 'bg-blue-600' :
                  pickerModalState.category === 'hukum_tajwid' ? 'bg-emerald-600' : 'bg-purple-600'
                }`} />
                <h4 className="font-bold text-sm text-slate-900">
                  Pilih Rincian {MISTAKE_PRESETS[pickerModalState.category].name} (Ayat {pickerModalState.ayahNumber})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPickerModalState(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAddAyahLevelMistake(pickerModalState.ayahNumber, pickerModalState.category)}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>+ Tambah Koreksi Umum ({MISTAKE_PRESETS[pickerModalState.category].name})</span>
              <span className="text-[10px] text-slate-400">Default</span>
            </button>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-tight block px-1">
                Atau pilih rincian kesalahan spesifik:
              </span>
              {MISTAKE_PRESETS[pickerModalState.category].subtypes.map((sub, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleAddAyahLevelMistake(pickerModalState.ayahNumber, pickerModalState.category, sub)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center justify-between cursor-pointer ${MISTAKE_PRESETS[pickerModalState.category].chipBg}`}
                >
                  <span>{sub}</span>
                  <Check className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPickerModalState(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
