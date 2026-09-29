/**
 * Utilitas Analisis Cerdas Tajwid, Makhorijul Huruf, dan Bacaan Mad
 * Menganalisis kata bahasa Arab dari ayat Al-Qur'an secara otomatis
 * untuk mendeteksi potensi kesalahan saat santri tasmi'.
 */

import { MistakeCategory } from '../components/QuranSimakanModal';

export interface DetectedWordMistake {
  category: MistakeCategory;
  label: string;
  detail: string;
  ruleName: string;
  deduction: number;
  highlightColor: string;
  isPrimary?: boolean;
}

/**
 * Menganalisis sebuah kata Arab untuk mendeteksi kaidah Tajwid, Makhraj, dan Mad
 */
export function analyzeArabicWord(word: string, nextWord?: string): DetectedWordMistake[] {
  const suggestions: DetectedWordMistake[] = [];
  const cleanWord = word.trim();

  // 1. CEK GHUNNAH (Nun / Mim Bertasydid) - Prioritas Tinggi
  if (cleanWord.includes('نّ') || cleanWord.includes('نَّ') || cleanWord.includes('نِّ') || cleanWord.includes('نُّ') ||
      cleanWord.includes('مّ') || cleanWord.includes('مَّ') || cleanWord.includes('مِّ') || cleanWord.includes('مُّ')) {
    const isMim = cleanWord.includes('مّ') || cleanWord.includes('مَّ') || cleanWord.includes('مِّ') || cleanWord.includes('مُّ');
    suggestions.push({
      category: 'hukum_tajwid',
      ruleName: isMim ? 'Ghunnah Mim Musyaddadah' : 'Ghunnah Nun Musyaddadah',
      label: 'Hukum Tajwid',
      detail: `Ghunnah ${isMim ? "Mim (مّ)" : "Nun (نّ)"} bertasydid kurang dengung 2 harakat`,
      deduction: 0.75,
      highlightColor: 'emerald',
      isPrimary: true,
    });
  }

  // 2. CEK MAD WAJIB MUTTASHIL / MAD JAIZ (Tanda Alif Mad Wavy ~ / ٓ)
  if (cleanWord.includes('ٓ') || cleanWord.includes('~') || cleanWord.includes('آ') || cleanWord.includes('اء') || cleanWord.includes('اؤ') || cleanWord.includes('ائ')) {
    suggestions.push({
      category: 'bacaan_mad',
      ruleName: 'Mad Wajib Muttashil / Jaiz',
      label: 'Bacaan Mad',
      detail: 'Mad Wajib / Jaiz kurang panjang (wajib 4-5 harakat)',
      deduction: 0.75,
      highlightColor: 'purple',
      isPrimary: suggestions.length === 0,
    });
  }

  // 3. CEK QALQALAH (Huruf ق, ط, ب, ج, د bertanda sukun atau di akhir kata)
  const qalqalahRegex = /[قطبجد][ْ]?/;
  if (qalqalahRegex.test(cleanWord) && (cleanWord.includes('ْ') || cleanWord.endsWith('ق') || cleanWord.endsWith('ط') || cleanWord.endsWith('ب') || cleanWord.endsWith('ج') || cleanWord.endsWith('د'))) {
    suggestions.push({
      category: 'hukum_tajwid',
      ruleName: 'Qalqalah Sughra / Kubra',
      label: 'Hukum Tajwid',
      detail: 'Pantulan Qalqalah kurang mantul atau berlebihan',
      deduction: 0.75,
      highlightColor: 'emerald',
      isPrimary: suggestions.length === 0,
    });
  }

  // 4. CEK MAKHORIJUL HURUF (Huruf yang sering tertukar atau sulit diucapkan)
  if (cleanWord.includes('ع')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf 'Ain (ع)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf 'Ain (ع) tertukar Hamzah (أ) atau kurang dari tengah tenggorokan",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ح')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Ha (ح)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Ha pedas (ح) tertukar Ha besar (هـ) atau Kha (خ)",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ص')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Shad (ص)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Shad (ص) tertukar Sin (س) atau kurang tebal (ithbaq)",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ض')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Dhad (ض)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Dhad (ض) tertukar Dal/Zha atau kurang sifat istithalah",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ط')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Tha (ط)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Tha (ط) tertukar Ta (ت) atau kurang tebal",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ظ')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Zha (ظ)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Zha (ظ) tertukar Dzal / Zay",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ق')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Qaf (ق)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Qaf (ق) tertukar Kaf (ك) / pangkal lidah kurang naik",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ث')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Tsa (ث)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Tsa (ث) tertukar Sin (س) / ujung lidah kurang keluar",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  if (cleanWord.includes('ذ')) {
    suggestions.push({
      category: 'makhorijul_huruf',
      ruleName: "Makhraj Huruf Dzal (ذ)",
      label: 'Makhorijul Huruf',
      detail: "Makhraj huruf Dzal (ذ) tertukar Zay (ز) / desis berlebih",
      deduction: 1.0,
      highlightColor: 'blue',
      isPrimary: suggestions.length === 0,
    });
  }

  // 5. CEK IKHFA / IDGHAM / IQLAB / IDZHAR (Nun Sukun atau Tanwin)
  if (cleanWord.includes('نْ') || cleanWord.includes('ً') || cleanWord.includes('ٍ') || cleanWord.includes('ٌ')) {
    suggestions.push({
      category: 'hukum_tajwid',
      ruleName: 'Hukum Nun Sukun / Tanwin',
      label: 'Hukum Tajwid',
      detail: 'Kaidah Ikhfa / Idgham / Iqlab / Idzhar kurang sempurna',
      deduction: 0.75,
      highlightColor: 'emerald',
      isPrimary: suggestions.length === 0,
    });
  }

  // 6. CEK BACAAN MAD THOBI'I (Alif, Waw, Ya sukun atau Alif Khinjariyah)
  if (cleanWord.includes('ٰ') || cleanWord.includes('َا') || cleanWord.includes('ِي') || cleanWord.includes('ُو')) {
    suggestions.push({
      category: 'bacaan_mad',
      ruleName: "Mad Thobi'i (2 Harakat)",
      label: 'Bacaan Mad',
      detail: "Mad Thobi'i kurang dari 2 harakat (terbaca pendek) atau kepanjangan",
      deduction: 0.75,
      highlightColor: 'purple',
      isPrimary: suggestions.length === 0,
    });
  }

  // 7. OPSI STANDAR SALAH HARAKAT (Lahn Jali) & LUPA (Tawaqquf)
  suggestions.push({
    category: 'lahn_jali',
    ruleName: 'Salah Harakat / Kata',
    label: 'Salah Harakat',
    detail: 'Salah membaca baris harakat (fathah/kasrah/dhammah) atau tertukar kata',
    deduction: 1.5,
    highlightColor: 'rose',
    isPrimary: false,
  });

  suggestions.push({
    category: 'tawaqquf',
    ruleName: 'Tersendat / Lupa',
    label: 'Lupa / Tersendat',
    detail: 'Murid tersendat atau lupa pada kata ini',
    deduction: 2.0,
    highlightColor: 'amber',
    isPrimary: false,
  });

  // Pastikan ada setidaknya 1 primary recommendation
  if (!suggestions.some((s) => s.isPrimary)) {
    suggestions[0].isPrimary = true;
  }

  return suggestions;
}
