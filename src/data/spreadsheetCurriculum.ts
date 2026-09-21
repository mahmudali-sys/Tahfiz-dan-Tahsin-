export interface IqraAspectCol {
  id: string;
  name: string;
  shortName: string;
  jilid: 3 | 4 | 5 | 6;
}

export interface IqraJilidSection {
  jilid: 3 | 4 | 5 | 6;
  label: string;
  aspects: IqraAspectCol[];
  defaultPassStatus: string;
  defaultFailStatus: string;
}

export const IQRA_SECTIONS: IqraJilidSection[] = [
  {
    jilid: 3,
    label: 'Iqro 3',
    defaultPassStatus: 'NAIK JILID 4',
    defaultFailStatus: 'TETAP DI JILID 3',
    aspects: [
      { id: 'j3_1', name: 'Harokat Kasroh, Dhommah', shortName: 'Kasrah/Dhommah', jilid: 3 },
      { id: 'j3_2', name: 'Mad Asli Alif, Wawu & Ya sukun', shortName: 'Mad Asli', jilid: 3 },
      { id: 'j3_3', name: 'Mad Silah Qoshiroh', shortName: 'Mad Silah', jilid: 3 },
    ],
  },
  {
    jilid: 4,
    label: 'Iqro 4',
    defaultPassStatus: 'NAIK JILID 5',
    defaultFailStatus: 'TETAP DI JILID 4',
    aspects: [
      { id: 'j4_1', name: 'Tanwin Fathah, Kasroh & Dhommah', shortName: 'Tanwin', jilid: 4 },
      { id: 'j4_2', name: 'Lin Huruf Ya & Wawu Sukun', shortName: 'Huruf Lin', jilid: 4 },
      { id: 'j4_3', name: 'Qolqolah', shortName: 'Qolqolah', jilid: 4 },
      { id: 'j4_4', name: 'Huruf-huruf Sukun/Mati', shortName: 'Sukun/Mati', jilid: 4 },
    ],
  },
  {
    jilid: 5,
    label: 'Iqro 5',
    defaultPassStatus: 'NAIK JILID 6',
    defaultFailStatus: 'TETAP DI JILID 5',
    aspects: [
      { id: 'j5_1', name: 'Alif Lam Syamsiyyah & Qomariyyah', shortName: 'Alif Lam', jilid: 5 },
      { id: 'j5_2', name: "Mad 'Aridh Lissukun dan Mad 'Iwad", shortName: "'Aridh/Iwad", jilid: 5 },
      { id: 'j5_3', name: 'Waqaf pada Ta Marbutoh', shortName: 'Ta Marbutoh', jilid: 5 },
      { id: 'j5_4', name: 'Gunnah Nun dan Mim Bertasydid', shortName: 'Gunnah Tasydid', jilid: 5 },
      { id: 'j5_5', name: 'Mad Wajib & Mad Jaiz', shortName: 'Wajib & Jaiz', jilid: 5 },
      { id: 'j5_6', name: 'Huruf-huruf bertasydid', shortName: 'Tasydid', jilid: 5 },
      { id: 'j5_7', name: 'Mad Lazim Mutsaqqol Kilmi', shortName: 'Lazim Kilmi', jilid: 5 },
      { id: 'j5_8', name: 'Lafdzul Jalalah Tafkhim Tarqiq', shortName: 'Lafdzul Jalalah', jilid: 5 },
      { id: 'j5_9', name: 'Idgham Nun, Mim, Lam & Ro', shortName: 'Idgham Bighunnah/Bilaghunnah', jilid: 5 },
    ],
  },
  {
    jilid: 6,
    label: 'Iqro 6',
    defaultPassStatus: "NAIK AL QUR'AN/TAHFIZ",
    defaultFailStatus: 'TETAP DI JILID 6',
    aspects: [
      { id: 'j6_1', name: 'Idgham Ya & Wawu', shortName: 'Idgham Ya/Wawu', jilid: 6 },
      { id: 'j6_2', name: 'Iqlab dan Ikhfa Haqiqi', shortName: 'Iqlab/Ikhfa', jilid: 6 },
      { id: 'j6_3', name: 'Tanda-tanda Waqaf', shortName: 'Tanda Waqaf', jilid: 6 },
      { id: 'j6_4', name: 'Waqaf yang didahului sukun', shortName: 'Waqaf Sukun', jilid: 6 },
      { id: 'j6_5', name: 'Waqaf pada huruf Bertasydid', shortName: 'Waqaf Tasydid', jilid: 6 },
      { id: 'j6_6', name: 'Huruf Muqotho\'ah', shortName: 'Muqotho\'ah', jilid: 6 },
    ],
  },
];

export interface TahfizSpreadsheetSurah {
  surahNumber: number;
  name: string;
  juz: number;
  groupColor: string; // Tailwind color class for header
  groupBg: string;
}

// All Surahs for Tahfiz Spreadsheet (Juz 30, 29, 28, 27, 26)
export const TAHFIZ_SPREADSHEET_SURAHS: TahfizSpreadsheetSurah[] = [
  // JUZ 30 (37 Surah: 114 down to 78)
  { surahNumber: 114, name: 'An-Naas', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 113, name: 'Al-Falaq', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 112, name: 'Al-Ikhlas', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 111, name: 'Al-Lahab', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 110, name: 'An-Nasr', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 109, name: 'Al-Kafirun', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 108, name: 'Al-Kautsar', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 107, name: "Al-Ma'un", juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 106, name: 'Al-Quraisy', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 105, name: 'Al-Fiil', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 104, name: 'Al-Humazah', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 103, name: 'Al-Ashr', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 102, name: 'At-Takatsur', juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 101, name: "Al-Qari'ah", juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  { surahNumber: 100, name: "Al-'Adiyat", juz: 30, groupColor: 'text-white', groupBg: 'bg-red-600' },
  // Green section in IMG_1310
  { surahNumber: 99, name: 'Az-Zalzalah', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 98, name: 'Al-Bayyinah', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 97, name: 'Al-Qadr', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 96, name: "Al-'Alaq", juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 95, name: 'At-Tiin', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 94, name: 'Al-Insyiroh', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 93, name: 'Ad-Dhuha', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  // Yellow/Orange section in IMG_1310
  { surahNumber: 92, name: 'Al-Lail', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-amber-400' },
  { surahNumber: 91, name: 'Asy-Syams', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-amber-400' },
  { surahNumber: 90, name: 'Al-Balad', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-amber-400' },
  { surahNumber: 89, name: 'Al-Fajr', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-amber-400' },
  { surahNumber: 88, name: 'Al-Ghasyiyah', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-amber-400' },
  { surahNumber: 87, name: "Al-A'la", juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-yellow-300' },
  { surahNumber: 86, name: 'Ath-Thariq', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-yellow-300' },
  { surahNumber: 85, name: 'Al-Buruj', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-yellow-300' },
  { surahNumber: 84, name: 'Al-Insyiqaq', juz: 30, groupColor: 'text-slate-900', groupBg: 'bg-yellow-300' },
  // Green section in IMG_1310
  { surahNumber: 83, name: 'Al-Muthaffifin', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 82, name: 'Al-Infithar', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  { surahNumber: 81, name: 'At-Takwir', juz: 30, groupColor: 'text-white', groupBg: 'bg-emerald-600' },
  // Cyan section in IMG_1310
  { surahNumber: 80, name: "'Abasa", juz: 30, groupColor: 'text-white', groupBg: 'bg-cyan-600' },
  { surahNumber: 79, name: "An-Nazi'at", juz: 30, groupColor: 'text-white', groupBg: 'bg-cyan-600' },
  { surahNumber: 78, name: "An-Naba'", juz: 30, groupColor: 'text-white', groupBg: 'bg-cyan-600' },

  // JUZ 29 (11 Surah: 77 down to 67)
  { surahNumber: 77, name: 'Al-Mursalat', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 76, name: 'Al-Insaan', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 75, name: 'Al-Qiyamah', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 74, name: 'Al-Muddatstsir', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 73, name: 'Al-Muzzammil', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 72, name: 'Al-Jin', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 71, name: 'Nuh', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 70, name: "Al-Ma'arij", juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 69, name: 'Al-Haqqah', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 68, name: 'Al-Qalam', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },
  { surahNumber: 67, name: 'Al-Mulk', juz: 29, groupColor: 'text-slate-900', groupBg: 'bg-slate-200' },

  // JUZ 28 (9 Surah: 66 down to 58)
  { surahNumber: 66, name: 'At-Tahrim', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 65, name: 'Ath-Thalaq', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 64, name: 'At-Taghabun', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 63, name: 'Al-Munafiqun', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 62, name: "Al-Jumu'ah", juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 61, name: 'Ash-Shaff', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 60, name: 'Al-Mumtahanah', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 59, name: 'Al-Hasyr', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },
  { surahNumber: 58, name: 'Al-Mujadalah', juz: 28, groupColor: 'text-slate-900', groupBg: 'bg-sky-100' },

  // JUZ 27 (7 Surah: 57 down to 51)
  { surahNumber: 57, name: 'Al-Hadid', juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },
  { surahNumber: 56, name: "Al-Waqi'ah", juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },
  { surahNumber: 55, name: 'Ar-Rahman', juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },
  { surahNumber: 54, name: 'Al-Qamar', juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },
  { surahNumber: 53, name: 'An-Najm', juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },
  { surahNumber: 52, name: 'Ath-Thur', juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },
  { surahNumber: 51, name: 'Adz-Dzariyat', juz: 27, groupColor: 'text-slate-900', groupBg: 'bg-indigo-100' },

  // JUZ 26 (5 Surah: 50 down to 46)
  { surahNumber: 50, name: 'Qaf', juz: 26, groupColor: 'text-slate-900', groupBg: 'bg-purple-100' },
  { surahNumber: 49, name: 'Al-Hujurat', juz: 26, groupColor: 'text-slate-900', groupBg: 'bg-purple-100' },
  { surahNumber: 48, name: 'Al-Fath', juz: 26, groupColor: 'text-slate-900', groupBg: 'bg-purple-100' },
  { surahNumber: 47, name: 'Muhammad', juz: 26, groupColor: 'text-slate-900', groupBg: 'bg-purple-100' },
  { surahNumber: 46, name: 'Al-Ahqaf', juz: 26, groupColor: 'text-slate-900', groupBg: 'bg-purple-100' },
];

export interface StudentIqraMatrixRow {
  studentId: string;
  no: number;
  nis: string;
  name: string;
  className: string;
  kelompok: string;
  // Dynamic map of aspectId -> score (string number or '-' or '')
  aspects: Record<string, string>;
  // Overridden or calculated status
  statusOverride: Record<number, string>; // jilid -> 'NAIK JILID X' or 'TETAP DI JILID Y'
}

export interface StudentTahfizMatrixRow {
  studentId: string;
  no: number;
  nis: string;
  name: string;
  className: string;
  // surahNumber -> score (e.g. '88', '90', or '-')
  surahScores: Record<number, string>;
}
