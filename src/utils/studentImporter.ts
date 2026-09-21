import * as XLSX from 'xlsx';
import { Student, Teacher } from '../types';

export interface ParsedStudentRow {
  name: string;
  nisn: string;
  className: string;
  nis?: string;
  gender?: 'L' | 'P';
  parentPhone?: string;
  targetJuz?: string;
  isValid: boolean;
  validationError?: string;
}

// Auto detect default teacher based on class level (7, 8, 9)
export function assignTeacherForClass(className: string, teachers: Teacher[]): string {
  const normalized = className.trim().toUpperCase();
  const directMatch = teachers.find((t) => t.assignedClasses.includes(normalized));
  if (directMatch) return directMatch.id;

  if (normalized.startsWith('7')) {
    const t7 = teachers.find((t) => t.assignedClasses.some((c) => c.startsWith('7')));
    if (t7) return t7.id;
  }
  if (normalized.startsWith('8')) {
    const t8 = teachers.find((t) => t.assignedClasses.some((c) => c.startsWith('8')));
    if (t8) return t8.id;
  }
  if (normalized.startsWith('9')) {
    const t9 = teachers.find((t) => t.assignedClasses.some((c) => c.startsWith('9')));
    if (t9) return t9.id;
  }

  return teachers[0]?.id || 'tch-1';
}

// Determine default curriculum target based on class level in SMP Islam Al Azhar 9
export function getDefaultTargetForClass(className: string): { targetJuz: string; targetSurahCount: number } {
  const normalized = className.trim().toUpperCase();
  if (normalized.startsWith('7')) {
    return { targetJuz: 'Juz 30 (Tuntas Mutqin)', targetSurahCount: 37 };
  } else if (normalized.startsWith('8')) {
    return { targetJuz: 'Juz 29 & 30', targetSurahCount: 48 };
  } else if (normalized.startsWith('9')) {
    return { targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59 };
  }
  return { targetJuz: 'Juz 30 (Tuntas Mutqin)', targetSurahCount: 37 };
}

// Generate an NIS if none is provided
export function generateAutoNis(className: string, index: number): string {
  const norm = className.trim().toUpperCase();
  const yearPrefix = norm.startsWith('7') ? '242507' : norm.startsWith('8') ? '232408' : '222309';
  const padIndex = (index + 1).toString().padStart(3, '0');
  return `${yearPrefix}${padIndex}`;
}

// Parse plain text (copy-pasted from Excel, TSV, CSV, or WhatsApp lines)
export function parseRawTextStudents(text: string): ParsedStudentRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedStudentRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if header line
    const lowerLine = line.toLowerCase();
    if (
      (lowerLine.includes('nama') && lowerLine.includes('nisn')) ||
      (lowerLine.includes('nama') && lowerLine.includes('kelas')) ||
      lowerLine.startsWith('no\t') ||
      lowerLine.startsWith('no,\t')
    ) {
      continue; // skip header
    }

    // Determine delimiter: Tab, Semicolon, Comma, or multi-space
    let tokens: string[] = [];
    if (line.includes('\t')) {
      tokens = line.split('\t').map((t) => t.trim());
    } else if (line.includes(';')) {
      tokens = line.split(';').map((t) => t.trim());
    } else if (line.includes(',')) {
      tokens = line.split(',').map((t) => t.trim());
    } else if (line.includes('|')) {
      tokens = line.split('|').map((t) => t.trim());
    } else {
      tokens = line.split(/\s{2,}/).map((t) => t.trim());
    }

    // Filter out leading numbering like "1.", "1"
    if (tokens.length > 0 && /^\d+[\.\)]?$/.test(tokens[0])) {
      tokens.shift();
    }

    if (tokens.length < 2) continue;

    // Detect fields intelligently
    // Common formats:
    // Format A: [Nama, NISN, Kelas, (NIS), (JK), (NoHP)]
    // Format B: [NISN, Nama, Kelas]
    // Format C: [Nama, Kelas, NISN]
    let name = '';
    let nisn = '';
    let className = '';
    let nis = '';
    let gender: 'L' | 'P' = 'L';
    let parentPhone = '';

    // Check which token looks like NISN (approx 10 digits)
    const token0IsNum = /^\d{8,12}$/.test(tokens[0].replace(/\D/g, ''));
    const token1IsNum = tokens[1] && /^\d{8,12}$/.test(tokens[1].replace(/\D/g, ''));

    if (token0IsNum && !token1IsNum) {
      // Format B: [NISN, Nama, Kelas]
      nisn = tokens[0].replace(/\D/g, '');
      name = tokens[1] || '';
      className = tokens[2] || '';
      nis = tokens[3] || '';
    } else if (!token0IsNum && token1IsNum) {
      // Format A: [Nama, NISN, Kelas]
      name = tokens[0] || '';
      nisn = tokens[1].replace(/\D/g, '');
      className = tokens[2] || '';
      nis = tokens[3] || '';
    } else {
      // Fallback: guess by order
      name = tokens[0] || '';
      // Look through tokens for class name like 7A, 8B, 9C, VII-A
      for (let j = 1; j < tokens.length; j++) {
        const tok = tokens[j];
        if (/^[789][A-Za-z]/.test(tok) || /^(VII|VIII|IX)/i.test(tok) || /kelas\s*[789]/i.test(tok)) {
          className = tok;
        } else if (/^\d{8,12}$/.test(tok.replace(/\D/g, ''))) {
          nisn = tok.replace(/\D/g, '');
        } else if (/^(L|P|Ikhwan|Akhwat|Laki-laki|Perempuan)$/i.test(tok)) {
          gender = /^(P|Akhwat|Perempuan)$/i.test(tok) ? 'P' : 'L';
        }
      }
      if (!className && tokens[2]) className = tokens[2];
      if (!nisn && tokens[1]) nisn = tokens[1].replace(/\D/g, '');
    }

    // Normalize class name
    className = normalizeClassName(className);

    // Guess gender from name if not specified
    if (!gender) {
      gender = guessGenderFromName(name);
    }

    const isValid = name.trim().length > 1 && className.length > 0;
    const validationError = !name.trim()
      ? 'Nama tidak boleh kosong'
      : !className
      ? 'Kelas tidak valid (wajib 7A-9B)'
      : undefined;

    results.push({
      name: cleanName(name),
      nisn: nisn || generateFallbackNisn(i),
      className: className || '7A',
      nis: nis || '',
      gender,
      parentPhone,
      isValid,
      validationError,
    });
  }

  return results;
}

// Parse Excel file buffer
export function parseExcelStudents(buffer: ArrayBuffer): ParsedStudentRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length === 0) return [];

  // Find header row
  let headerIndex = -1;
  let nameCol = -1;
  let nisnCol = -1;
  let classCol = -1;
  let nisCol = -1;
  let genderCol = -1;
  let phoneCol = -1;

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').trim().toLowerCase();
      if (cell.includes('nama') || cell === 'name') nameCol = c;
      if (cell.includes('nisn')) nisnCol = c;
      if (cell.includes('kelas') || cell.includes('rombel') || cell === 'class') classCol = c;
      if (cell === 'nis' || cell.includes('induk')) nisCol = c;
      if (cell === 'jk' || cell.includes('kelamin') || cell === 'gender') genderCol = c;
      if (cell.includes('hp') || cell.includes('telepon') || cell.includes('telp') || cell.includes('wali')) phoneCol = c;
    }

    if (nameCol !== -1 && (nisnCol !== -1 || classCol !== -1)) {
      headerIndex = r;
      break;
    }
  }

  const results: ParsedStudentRow[] = [];
  const startRow = headerIndex >= 0 ? headerIndex + 1 : 0;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.every((val) => !val)) continue;

    const rawName = nameCol >= 0 ? String(row[nameCol] || '') : String(row[0] || '');
    const rawNisn = nisnCol >= 0 ? String(row[nisnCol] || '') : String(row[1] || '');
    const rawClass = classCol >= 0 ? String(row[classCol] || '') : String(row[2] || '');
    const rawNis = nisCol >= 0 ? String(row[nisCol] || '') : '';
    const rawGender = genderCol >= 0 ? String(row[genderCol] || '') : '';
    const rawPhone = phoneCol >= 0 ? String(row[phoneCol] || '') : '';

    if (!rawName.trim()) continue;

    let gender: 'L' | 'P' = 'L';
    if (/^(P|Akhwat|Perempuan|Wanita)$/i.test(rawGender.trim())) {
      gender = 'P';
    } else if (/^(L|Ikhwan|Laki-laki|Pria)$/i.test(rawGender.trim())) {
      gender = 'L';
    } else {
      gender = guessGenderFromName(rawName);
    }

    const cleanedNisn = rawNisn.replace(/\D/g, '');
    const normalizedClass = normalizeClassName(rawClass);

    results.push({
      name: cleanName(rawName),
      nisn: cleanedNisn || generateFallbackNisn(r),
      className: normalizedClass || '7A',
      nis: rawNis.trim(),
      gender,
      parentPhone: rawPhone.trim(),
      isValid: rawName.trim().length > 1,
    });
  }

  return results;
}

// Normalize various class inputs: "7-A", "Kelas 7A", "VII A", "7a" -> "7A"
export function normalizeClassName(input: string): string {
  if (!input) return '7A';
  let s = input.trim().toUpperCase().replace(/KELAS\s*/i, '').replace(/ROMBEL\s*/i, '').trim();

  // Roman numeral conversion
  s = s.replace(/^VII[\s\-_]*/i, '7');
  s = s.replace(/^VIII[\s\-_]*/i, '8');
  s = s.replace(/^IX[\s\-_]*/i, '9');

  // Strip hyphens or spaces like "7-A" -> "7A"
  s = s.replace(/[\s\-_]/g, '');

  if (/^[789][A-Z]$/.test(s)) {
    return s;
  }
  if (/^[789]$/.test(s)) {
    return `${s}A`;
  }
  return s || '7A';
}

function cleanName(name: string): string {
  return name
    .trim()
    .replace(/^[\d\.\-\)\s]+/, '') // remove leading numbers like "1. Ahmad"
    .trim();
}

function guessGenderFromName(name: string): 'L' | 'P' {
  const lower = name.toLowerCase();
  if (
    lower.includes('putri') ||
    lower.includes('aisyah') ||
    lower.includes('fatimah') ||
    lower.includes('khadijah') ||
    lower.includes('zahra') ||
    lower.includes('nabila') ||
    lower.includes('nur') ||
    lower.includes('siti') ||
    lower.includes('salma') ||
    lower.includes('maryam') ||
    lower.includes('shafiyyah') ||
    lower.includes('annisa') ||
    lower.includes('hafizhah') ||
    lower.includes('nayla') ||
    lower.includes('safira')
  ) {
    return 'P';
  }
  return 'L';
}

function generateFallbackNisn(index: number): string {
  return `011${Math.floor(2890000 + index * 137).toString().padStart(7, '0')}`;
}

// Download Excel Template for SMP Islam Al Azhar 9 Bekasi
export function downloadExcelTemplate(): void {
  const templateData = [
    {
      'Nama Santri (Wajib)': 'Muhammad Fatih Al-Ayyubi',
      'NISN (10 Digit)': '0112894001',
      'Kelas (7A-9B)': '7A',
      'Jenis Kelamin (L/P)': 'L',
      'NIS (Opsional)': '242507001',
      'No HP Orang Tua / Wali': '0812-1002-3344',
    },
    {
      'Nama Santri (Wajib)': 'Aisyah Humaira Putri',
      'NISN (10 Digit)': '0112894002',
      'Kelas (7A-9B)': '7A',
      'Jenis Kelamin (L/P)': 'P',
      'NIS (Opsional)': '242507002',
      'No HP Orang Tua / Wali': '0813-8899-4411',
    },
    {
      'Nama Santri (Wajib)': 'Ibrahim Hanif Al-Farisi',
      'NISN (10 Digit)': '0103456003',
      'Kelas (7A-9B)': '8A',
      'Jenis Kelamin (L/P)': 'L',
      'NIS (Opsional)': '232408003',
      'No HP Orang Tua / Wali': '0819-0987-6543',
    },
    {
      'Nama Santri (Wajib)': 'Khadijah Nabila Zahir',
      'NISN (10 Digit)': '0103456004',
      'Kelas (7A-9B)': '8B',
      'Jenis Kelamin (L/P)': 'P',
      'NIS (Opsional)': '232408004',
      'No HP Orang Tua / Wali': '0821-3344-5566',
    },
    {
      'Nama Santri (Wajib)': 'Zaid bin Haritsah Al-Anshari',
      'NISN (10 Digit)': '0098765001',
      'Kelas (7A-9B)': '9A',
      'Jenis Kelamin (L/P)': 'L',
      'NIS (Opsional)': '222309001',
      'No HP Orang Tua / Wali': '0878-1122-3344',
    },
    {
      'Nama Santri (Wajib)': 'Maryam Sholihatul Jannah',
      'NISN (10 Digit)': '0098765002',
      'Kelas (7A-9B)': '9B',
      'Jenis Kelamin (L/P)': 'P',
      'NIS (Opsional)': '222309002',
      'No HP Orang Tua / Wali': '0812-9988-7766',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 32 }, // Nama
    { wch: 18 }, // NISN
    { wch: 15 }, // Kelas
    { wch: 20 }, // Gender
    { wch: 18 }, // NIS
    { wch: 24 }, // Phone
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Murid SMPIA 9');
  XLSX.writeFile(workbook, 'Template_Impor_Murid_SMPIA9_Bekasi.xlsx');
}

// Download CSV Template
export function downloadCsvTemplate(): void {
  const csvContent =
    'Nama Santri,NISN,Kelas,Jenis Kelamin,NIS,No HP Wali\n' +
    'Muhammad Fatih Al-Ayyubi,0112894001,7A,L,242507001,0812-1002-3344\n' +
    'Aisyah Humaira Putri,0112894002,7A,P,242507002,0813-8899-4411\n' +
    'Rizky Ramadhan Saputra,0112894015,7B,L,242507015,0857-1234-5678\n' +
    'Ibrahim Hanif Al-Farisi,0103456003,8A,L,232408003,0819-0987-6543\n' +
    'Khadijah Nabila Zahir,0103456004,8B,P,232408004,0821-3344-5566\n' +
    'Zaid bin Haritsah Al-Anshari,0098765001,9A,L,222309001,0878-1122-3344\n' +
    'Maryam Sholihatul Jannah,0098765002,9B,P,222309002,0812-9988-7766\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Impor_Murid_SMPIA9_Bekasi.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Preset complete roster for SMP Islam Al Azhar 9 Bekasi (Grade 7, 8, 9)
export const SMPIA9_FULL_ROSTER: Omit<Student, 'id' | 'teacherId'>[] = [
  // KELAS 7A (Ikhwan/Campur - Target: Juz 30)
  {
    nis: '242507001',
    nisn: '0112894001',
    name: 'Muhammad Fatih Al-Ayyubi',
    gender: 'L',
    className: '7A',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0812-1002-3344',
  },
  {
    nis: '242507002',
    nisn: '0112894002',
    name: 'Ahmad Zaki Al-Farizi',
    gender: 'L',
    className: '7A',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0813-8899-4411',
  },
  {
    nis: '242507003',
    nisn: '0112894003',
    name: 'Bilal Habasyi Ramadhan',
    gender: 'L',
    className: '7A',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0857-1234-5678',
  },
  {
    nis: '242507004',
    nisn: '0112894004',
    name: 'Daffa Raihan Pratama',
    gender: 'L',
    className: '7A',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0821-4455-6677',
  },
  {
    nis: '242507005',
    nisn: '0112894005',
    name: 'Aisyah Humaira Putri',
    gender: 'P',
    className: '7A',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0812-7788-9900',
  },

  // KELAS 7B (Target: Juz 30)
  {
    nis: '242507011',
    nisn: '0112894011',
    name: 'Rizky Ramadhan Saputra',
    gender: 'L',
    className: '7B',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0858-9900-1122',
  },
  {
    nis: '242507012',
    nisn: '0112894012',
    name: 'Sulaiman Al-Hakim',
    gender: 'L',
    className: '7B',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0813-3344-5566',
  },
  {
    nis: '242507013',
    nisn: '0112894013',
    name: 'Farah Salsabila Azzahra',
    gender: 'P',
    className: '7B',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0812-6677-8899',
  },
  {
    nis: '242507014',
    nisn: '0112894014',
    name: 'Hafizhah Khairunnisa',
    gender: 'P',
    className: '7B',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0877-1122-3344',
  },
  {
    nis: '242507015',
    nisn: '0112894015',
    name: 'Nayla Syifa Al-Kautsar',
    gender: 'P',
    className: '7B',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0819-2233-4455',
  },

  // KELAS 8A (Target: Juz 29 & 30)
  {
    nis: '232408001',
    nisn: '0103456001',
    name: 'Ibrahim Hanif Al-Farisi',
    gender: 'L',
    className: '8A',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0819-0987-6543',
  },
  {
    nis: '232408002',
    nisn: '0103456002',
    name: 'Hamzah Asadullah Al-Qudsi',
    gender: 'L',
    className: '8A',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0812-4433-2211',
  },
  {
    nis: '232408003',
    nisn: '0103456003',
    name: 'Khadijah Nabila Zahir',
    gender: 'P',
    className: '8A',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0821-3344-5566',
  },
  {
    nis: '232408004',
    nisn: '0103456004',
    name: 'Zahra Anindya Putri',
    gender: 'P',
    className: '8A',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0856-7788-9900',
  },
  {
    nis: '232408005',
    nisn: '0103456005',
    name: 'Tariq Ziyad Al-Ghazi',
    gender: 'L',
    className: '8A',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0815-6677-8811',
  },

  // KELAS 8B (Target: Juz 29 & 30)
  {
    nis: '232408011',
    nisn: '0103456011',
    name: 'Salman Al-Farisi Ramadhan',
    gender: 'L',
    className: '8B',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0813-2233-4411',
  },
  {
    nis: '232408012',
    nisn: '0103456012',
    name: 'Yusuf Mansur Al-Baqir',
    gender: 'L',
    className: '8B',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0878-3344-5522',
  },
  {
    nis: '232408013',
    nisn: '0103456013',
    name: 'Safira Aulia Rahman',
    gender: 'P',
    className: '8B',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0857-4455-6633',
  },
  {
    nis: '232408014',
    nisn: '0103456014',
    name: 'Yasmin Fauziah Mumtazah',
    gender: 'P',
    className: '8B',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0812-5566-7744',
  },

  // KELAS 9A (Target: Juz 28, 29, 30)
  {
    nis: '222309001',
    nisn: '0098765001',
    name: 'Zaid bin Haritsah Al-Anshari',
    gender: 'L',
    className: '9A',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0878-1122-3344',
  },
  {
    nis: '222309002',
    nisn: '0098765002',
    name: 'Umar Khalid Al-Khattab',
    gender: 'L',
    className: '9A',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0811-2233-4455',
  },
  {
    nis: '222309003',
    nisn: '0098765003',
    name: 'Fathur Rahman Robbani',
    gender: 'L',
    className: '9A',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0813-9988-7711',
  },
  {
    nis: '222309004',
    nisn: '0098765004',
    name: 'Maryam Sholihatul Jannah',
    gender: 'P',
    className: '9A',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0812-9988-7766',
  },

  // KELAS 9B (Target: Juz 28, 29, 30)
  {
    nis: '222309011',
    nisn: '0098765011',
    name: 'Abdullah Azzam Pratama',
    gender: 'L',
    className: '9B',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0857-1122-8899',
  },
  {
    nis: '222309012',
    nisn: '0098765012',
    name: 'Ali Zainal Abidin',
    gender: 'L',
    className: '9B',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0819-3344-9900',
  },
  {
    nis: '222309013',
    nisn: '0098765013',
    name: 'Salma Aqila Lathifah',
    gender: 'P',
    className: '9B',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0812-4455-8811',
  },
  {
    nis: '222309014',
    nisn: '0098765014',
    name: 'Shafiyyah Nurul Izzah',
    gender: 'P',
    className: '9B',
    targetJuz: 'Juz 28, 29, 30',
    targetSurahCount: 59,
    parentPhone: '0813-7788-9922',
  },
];
