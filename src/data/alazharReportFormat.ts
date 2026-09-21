export interface TahsinAspectItem {
  id: string;
  name: string;
  defaultScore: number;
}

export interface TahsinJilidGroup {
  jilid: number;
  jilidLabel: string;
  aspects: TahsinAspectItem[];
  keterangan: string;
}

export const ALAZHAR_TAHSIN_CURRICULUM: TahsinJilidGroup[] = [
  {
    jilid: 1,
    jilidLabel: '1',
    keterangan: 'NAIK JILID 2',
    aspects: [
      { id: 'j1_1', name: 'Huruf Hijaiyyah Tunggal Berharakat Fathah', defaultScore: 92 },
      { id: 'j1_2', name: 'Disiplin Suara Pendek (1 Ketukan)', defaultScore: 94 },
      { id: 'j1_3', name: 'Makharijul Huruf Serupa / Berdekatan', defaultScore: 93 },
    ],
  },
  {
    jilid: 2,
    jilidLabel: '2',
    keterangan: 'NAIK JILID 3',
    aspects: [
      { id: 'j2_1', name: 'Rangkaian Huruf Bersambung', defaultScore: 93 },
      { id: 'j2_2', name: 'Mad Asli Fathah (Panjang 2 Harakat)', defaultScore: 94 },
      { id: 'j2_3', name: 'Disiplin Membedakan Panjang & Pendek', defaultScore: 93 },
    ],
  },
  {
    jilid: 3,
    jilidLabel: '3',
    keterangan: 'NAIK JILID 4',
    aspects: [
      { id: 'j3_1', name: 'Harakat Kasrah, Dhammah', defaultScore: 92 },
      { id: 'j3_2', name: 'Mad Asli Alif, Wawu & Ya sukun', defaultScore: 94 },
      { id: 'j3_3', name: 'Mad Silah Qashirah', defaultScore: 93 },
    ],
  },
  {
    jilid: 4,
    jilidLabel: '4',
    keterangan: 'NAIK JILID 5',
    aspects: [
      { id: 'j4_1', name: 'Tanwin Fathah, Kasrah & Dhammah', defaultScore: 93 },
      { id: 'j4_2', name: 'Lin Huruf Ya & Wawu Sukun', defaultScore: 94 },
      { id: 'j4_3', name: 'Qalqalah', defaultScore: 94 },
      { id: 'j4_4', name: 'Huruf-huruf Sukun/Mati', defaultScore: 93 },
    ],
  },
  {
    jilid: 5,
    jilidLabel: '5',
    keterangan: 'NAIK JILID 6',
    aspects: [
      { id: 'j5_1', name: 'Alif Lam Syamsiyyah & Qamariyyah', defaultScore: 90 },
      { id: 'j5_2', name: "Mad 'Aridh Lissukun dan Mad 'Iwad", defaultScore: 90 },
      { id: 'j5_3', name: 'Waqaf pada Ta Marbuthah', defaultScore: 91 },
      { id: 'j5_4', name: 'Gunnah Nun dan Mim Bertasydid', defaultScore: 90 },
      { id: 'j5_5', name: 'Mad Wajib & Mad Jaiz', defaultScore: 90 },
      { id: 'j5_6', name: 'Huruf-huruf bertasydid', defaultScore: 89 },
      { id: 'j5_7', name: 'Mad Lazim Mutsaqal Kilmi', defaultScore: 90 },
      { id: 'j5_8', name: 'Lafdzul Jalalah Tafkhim Tarqiq', defaultScore: 90 },
    ],
  },
  {
    jilid: 6,
    jilidLabel: '6',
    keterangan: "NAIK AL QUR'AN/TAHFIZ JUZ 30",
    aspects: [
      { id: 'j6_1', name: 'Idgham Nun, Mim, Lam & Ra', defaultScore: 94 },
      { id: 'j6_2', name: 'Idgham Ya & Wawu', defaultScore: 92 },
      { id: 'j6_3', name: 'Iqlab dan Ikhfa Haqiqi', defaultScore: 91 },
      { id: 'j6_4', name: 'Tanda-tanda Waqaf', defaultScore: 92 },
      { id: 'j6_5', name: 'Waqaf yang didahului sukun', defaultScore: 94 },
      { id: 'j6_6', name: 'Waqaf pada huruf Bertasydid', defaultScore: 95 },
      { id: 'j6_7', name: "Huruf Muqatha'ah", defaultScore: 91 },
    ],
  },
];

export interface TahfizSurahItem {
  no: number;
  surahNumber: number;
  name: string;
  juz: number;
}

// Column 1: Juz 30 (Surahs 1 - 18)
export const TAHFIZ_JUZ30_COL1: TahfizSurahItem[] = [
  { no: 1, surahNumber: 114, name: 'An-Nas', juz: 30 },
  { no: 2, surahNumber: 113, name: 'Al-Falaq', juz: 30 },
  { no: 3, surahNumber: 112, name: 'Al-Ikhlas', juz: 30 },
  { no: 4, surahNumber: 111, name: 'Al-Lahab', juz: 30 },
  { no: 5, surahNumber: 110, name: 'An-Nashr', juz: 30 },
  { no: 6, surahNumber: 109, name: 'Al-Kafirun', juz: 30 },
  { no: 7, surahNumber: 108, name: 'Al-Kautsar', juz: 30 },
  { no: 8, surahNumber: 107, name: "Al-Ma'un", juz: 30 },
  { no: 9, surahNumber: 106, name: 'Quraisy', juz: 30 },
  { no: 10, surahNumber: 105, name: 'Al-Fil', juz: 30 },
  { no: 11, surahNumber: 104, name: 'Al-Humazah', juz: 30 },
  { no: 12, surahNumber: 103, name: "Al-'Ashr", juz: 30 },
  { no: 13, surahNumber: 102, name: 'At-Takatsur', juz: 30 },
  { no: 14, surahNumber: 101, name: "Al-Qari'ah", juz: 30 },
  { no: 15, surahNumber: 100, name: "Al-'Adiyat", juz: 30 },
  { no: 16, surahNumber: 99, name: 'Al-Zalzalah', juz: 30 },
  { no: 17, surahNumber: 98, name: 'Al-Bayyinah', juz: 30 },
  { no: 18, surahNumber: 97, name: 'Al-Qadr', juz: 30 },
];

// Column 2: Juz 30 (Surahs 19 - 37)
export const TAHFIZ_JUZ30_COL2: TahfizSurahItem[] = [
  { no: 19, surahNumber: 96, name: "Al-'Alaq", juz: 30 },
  { no: 20, surahNumber: 95, name: 'At-Tin', juz: 30 },
  { no: 21, surahNumber: 94, name: 'Al-Insyirah', juz: 30 },
  { no: 22, surahNumber: 93, name: 'Adh-Dhuha', juz: 30 },
  { no: 23, surahNumber: 92, name: 'Al-Lail', juz: 30 },
  { no: 24, surahNumber: 91, name: 'Asy-Syams', juz: 30 },
  { no: 25, surahNumber: 90, name: 'Al-Balad', juz: 30 },
  { no: 26, surahNumber: 89, name: 'Al-Fajr', juz: 30 },
  { no: 27, surahNumber: 88, name: 'Al-Ghasyiyah', juz: 30 },
  { no: 28, surahNumber: 87, name: "Al-A'la", juz: 30 },
  { no: 29, surahNumber: 86, name: 'Ath-Thariq', juz: 30 },
  { no: 30, surahNumber: 85, name: 'Al-Buruuj', juz: 30 },
  { no: 31, surahNumber: 84, name: 'Al-Insyiqaq', juz: 30 },
  { no: 32, surahNumber: 83, name: 'Al-Muthaffifin', juz: 30 },
  { no: 33, surahNumber: 82, name: 'Al-Infithar', juz: 30 },
  { no: 34, surahNumber: 81, name: 'At-Takwir', juz: 30 },
  { no: 35, surahNumber: 80, name: 'Abasa', juz: 30 },
  { no: 36, surahNumber: 79, name: "An-Nazi'at", juz: 30 },
  { no: 37, surahNumber: 78, name: "An-Naba'", juz: 30 },
];

// Column 3 - Top: Juz 29 (11 surahs)
export const TAHFIZ_JUZ29: TahfizSurahItem[] = [
  { no: 1, surahNumber: 77, name: 'Al-Mursalat', juz: 29 },
  { no: 2, surahNumber: 76, name: 'Al-Insan', juz: 29 },
  { no: 3, surahNumber: 75, name: 'Al-Qiyamah', juz: 29 },
  { no: 4, surahNumber: 74, name: 'Al-Muddatstsir', juz: 29 },
  { no: 5, surahNumber: 73, name: 'Al-Muzzammil', juz: 29 },
  { no: 6, surahNumber: 72, name: 'Al-Jinn', juz: 29 },
  { no: 7, surahNumber: 71, name: 'Nuh', juz: 29 },
  { no: 8, surahNumber: 70, name: "Al-Ma'arij", juz: 29 },
  { no: 9, surahNumber: 69, name: 'Al-Haqqah', juz: 29 },
  { no: 10, surahNumber: 68, name: 'Al-Qalam', juz: 29 },
  { no: 11, surahNumber: 67, name: 'Al-Mulk', juz: 29 },
];

// Column 3 - Bottom: Juz 28 (9 surahs)
export const TAHFIZ_JUZ28: TahfizSurahItem[] = [
  { no: 1, surahNumber: 66, name: 'At-Tahrim', juz: 28 },
  { no: 2, surahNumber: 65, name: 'Ath-Thalaq', juz: 28 },
  { no: 3, surahNumber: 64, name: 'At-Taghabun', juz: 28 },
  { no: 4, surahNumber: 63, name: 'Al-Munafiqun', juz: 28 },
  { no: 5, surahNumber: 62, name: "Al-Jum'ah", juz: 28 },
  { no: 6, surahNumber: 61, name: 'Ash-Shaff', juz: 28 },
  { no: 7, surahNumber: 60, name: 'Al-Mumtahanah', juz: 28 },
  { no: 8, surahNumber: 59, name: 'Al-Hasyr', juz: 28 },
  { no: 9, surahNumber: 58, name: 'Al-Mujadalah', juz: 28 },
];

// Juz 27 (7 surahs)
export const TAHFIZ_JUZ27: TahfizSurahItem[] = [
  { no: 1, surahNumber: 57, name: 'Al-Hadid', juz: 27 },
  { no: 2, surahNumber: 56, name: "Al-Waqi'ah", juz: 27 },
  { no: 3, surahNumber: 55, name: 'Ar-Rahman', juz: 27 },
  { no: 4, surahNumber: 54, name: 'Al-Qamar', juz: 27 },
  { no: 5, surahNumber: 53, name: 'An-Najm', juz: 27 },
  { no: 6, surahNumber: 52, name: 'Ath-Thur', juz: 27 },
  { no: 7, surahNumber: 51, name: 'Adz-Dzariyat', juz: 27 },
];

// Juz 26 (5 surahs)
export const TAHFIZ_JUZ26: TahfizSurahItem[] = [
  { no: 1, surahNumber: 50, name: 'Qaf', juz: 26 },
  { no: 2, surahNumber: 49, name: 'Al-Hujurat', juz: 26 },
  { no: 3, surahNumber: 48, name: 'Al-Fath', juz: 26 },
  { no: 4, surahNumber: 47, name: 'Muhammad', juz: 26 },
  { no: 5, surahNumber: 46, name: 'Al-Ahqaf', juz: 26 },
];

export type TahfizScopeMode = 'all' | 'juz30_28' | 'juz29_26';

export interface TahfizColumnCell {
  type: 'surah' | 'banner' | 'empty';
  item?: TahfizSurahItem;
  label?: string;
}

export interface TahfizTableConfig {
  headerTitles: [string, string, string];
  col1: TahfizColumnCell[];
  col2: TahfizColumnCell[];
  col3: TahfizColumnCell[];
  rowCount: number;
}

export function getTahfizTableConfig(mode: TahfizScopeMode = 'all'): TahfizTableConfig {
  if (mode === 'juz30_28') {
    const col1: TahfizColumnCell[] = TAHFIZ_JUZ30_COL1.map((item) => ({ type: 'surah', item }));
    const col2: TahfizColumnCell[] = TAHFIZ_JUZ30_COL2.map((item) => ({ type: 'surah', item }));
    const col3: TahfizColumnCell[] = [
      ...TAHFIZ_JUZ29.map((item) => ({ type: 'surah' as const, item })),
      { type: 'banner' as const, label: 'Juz 28' },
      ...TAHFIZ_JUZ28.map((item) => ({ type: 'surah' as const, item })),
    ];
    const rowCount = Math.max(col1.length, col2.length, col3.length);
    while (col1.length < rowCount) col1.push({ type: 'empty' });
    while (col2.length < rowCount) col2.push({ type: 'empty' });
    while (col3.length < rowCount) col3.push({ type: 'empty' });

    return {
      headerTitles: ['Juz 30', 'Juz 30', 'Juz 29 & 28'],
      col1,
      col2,
      col3,
      rowCount,
    };
  }

  if (mode === 'juz29_26') {
    const col1: TahfizColumnCell[] = [
      ...TAHFIZ_JUZ29.map((item) => ({ type: 'surah' as const, item })),
      { type: 'banner' as const, label: 'Juz 28' },
      ...TAHFIZ_JUZ28.map((item) => ({ type: 'surah' as const, item })),
    ];
    const col2: TahfizColumnCell[] = [
      { type: 'banner' as const, label: 'Juz 27' },
      ...TAHFIZ_JUZ27.map((item) => ({ type: 'surah' as const, item })),
    ];
    const col3: TahfizColumnCell[] = [
      { type: 'banner' as const, label: 'Juz 26' },
      ...TAHFIZ_JUZ26.map((item) => ({ type: 'surah' as const, item })),
    ];
    const rowCount = Math.max(col1.length, col2.length, col3.length);
    while (col1.length < rowCount) col1.push({ type: 'empty' });
    while (col2.length < rowCount) col2.push({ type: 'empty' });
    while (col3.length < rowCount) col3.push({ type: 'empty' });

    return {
      headerTitles: ['Juz 29 & 28', 'Juz 27', 'Juz 26'],
      col1,
      col2,
      col3,
      rowCount,
    };
  }

  // DEFAULT: 'all' -> Lengkap Juz 30, 29, 28, 27, 26
  // Col 1: Juz 30 (Surat 1 s.d. 24) -> 24 surah
  const col1: TahfizColumnCell[] = [
    ...TAHFIZ_JUZ30_COL1.map((item) => ({ type: 'surah' as const, item })),
    ...TAHFIZ_JUZ30_COL2.slice(0, 6).map((item) => ({ type: 'surah' as const, item })),
  ];

  // Col 2: Juz 30 (Surat 25 s.d. 37 = 13 surah) + Banner Juz 29 + Juz 29 (11 surah) = 25 baris
  const col2: TahfizColumnCell[] = [
    ...TAHFIZ_JUZ30_COL2.slice(6).map((item) => ({ type: 'surah' as const, item })),
    { type: 'banner' as const, label: 'Juz 29' },
    ...TAHFIZ_JUZ29.map((item) => ({ type: 'surah' as const, item })),
  ];

  // Col 3: Banner Juz 28 + Juz 28 (9) + Banner Juz 27 + Juz 27 (7) + Banner Juz 26 + Juz 26 (5) = 24 baris
  const col3: TahfizColumnCell[] = [
    { type: 'banner' as const, label: 'Juz 28' },
    ...TAHFIZ_JUZ28.map((item) => ({ type: 'surah' as const, item })),
    { type: 'banner' as const, label: 'Juz 27' },
    ...TAHFIZ_JUZ27.map((item) => ({ type: 'surah' as const, item })),
    { type: 'banner' as const, label: 'Juz 26' },
    ...TAHFIZ_JUZ26.map((item) => ({ type: 'surah' as const, item })),
  ];

  const rowCount = Math.max(col1.length, col2.length, col3.length); // 25
  while (col1.length < rowCount) col1.push({ type: 'empty' });
  while (col2.length < rowCount) col2.push({ type: 'empty' });
  while (col3.length < rowCount) col3.push({ type: 'empty' });

  return {
    headerTitles: ['Juz 30', 'Juz 30 & Juz 29', 'Juz 28, 27 & 26'],
    col1,
    col2,
    col3,
    rowCount,
  };
}

export function getLetterScore(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 91) return 'A';
  if (score >= 81) return 'B';
  if (score >= 71) return 'C';
  if (score >= 61) return 'D';
  return 'E';
}

export const RENTANG_NILAI_STANDARDS = [
  { letter: 'A', range: '91 - 100', pred: 'Mumtaz', desc: 'Kesalahan maksimal 5/Surat' },
  { letter: 'B', range: '81 - 90', pred: 'Jayyid Jiddan', desc: 'Kesalahan antara 6 -10/Surat' },
  { letter: 'C', range: '71 - 80', pred: 'Jayyid', desc: 'Kesalahan antara 11-15/Surat' },
  { letter: 'D', range: '61 - 70', pred: 'Maqbul', desc: 'Kesalahan antara 16 - 20/Surat' },
  { letter: 'E', range: '0 - 60', pred: 'Rasib', desc: 'Kesalahan lebih dari 21/Surat' },
];

export function getTahsinCurriculum(startJilid: number = 1): TahsinJilidGroup[] {
  return ALAZHAR_TAHSIN_CURRICULUM.filter((g) => g.jilid >= startJilid);
}
