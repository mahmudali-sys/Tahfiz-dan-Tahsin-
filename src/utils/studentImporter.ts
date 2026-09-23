import * as XLSX from 'xlsx';
import { Student, Teacher } from '../types';

// The official 9 classes at SMP Islam Al Azhar 9 Bekasi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C)
export const SMPIA9_VALID_CLASSES = [
  '7A', '7B', '7C',
  '8A', '8B', '8C',
  '9A', '9B', '9C'
] as const;

export type SMPIA9Class = typeof SMPIA9_VALID_CLASSES[number];

export function isSmpia9ClassValid(className: string): boolean {
  if (!className) return false;
  return (SMPIA9_VALID_CLASSES as readonly string[]).includes(className.trim().toUpperCase());
}

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

// Robust parse of Gender values from any cell/token
// Recognizes: L, P, LK, PR, Laki-laki, Perempuan, Putra, Putri, Ikhwan, Akhwat, Pria, Wanita, etc.
// STRICTLY prevents row index numbers from false-triggering gender!
export function parseGenderValue(val: any): 'L' | 'P' | null {
  if (val === undefined || val === null) return null;
  const raw = String(val).replace(/\u00A0/g, ' ').trim();
  if (!raw) return null;

  const clean = raw
    .toLowerCase()
    .replace(/[\.\-_,;:\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // 1. Explicit Female detection (Akhwat / Perempuan / Putri / Wanita / Female / P / Pr)
  if (
    clean === 'p' ||
    clean === 'pr' ||
    clean === 'perempuan' ||
    clean.startsWith('peremp') ||
    clean === 'wanita' ||
    clean === 'putri' ||
    clean.startsWith('putri') ||
    clean === 'akhwat' ||
    clean.startsWith('akh') ||
    clean === 'f' ||
    clean === 'female' ||
    clean === 'girl' ||
    clean.includes('perempuan') ||
    clean.includes('wanita') ||
    clean.includes('akhwat') ||
    clean.includes('putri') ||
    clean === 'p perempuan' ||
    clean === 'perempuan p'
  ) {
    return 'P';
  }

  // 2. Explicit Male detection (Ikhwan / Laki-laki / Putra / Pria / Lelaki / Male / L / Lk)
  if (
    clean === 'l' ||
    clean === 'lk' ||
    clean === 'laki' ||
    clean === 'laki laki' ||
    clean === 'lakilaki' ||
    clean.startsWith('laki') ||
    clean === 'pria' ||
    clean === 'lelaki' ||
    clean === 'putra' ||
    clean.startsWith('putra') ||
    clean === 'ikhwan' ||
    clean.startsWith('ikh') ||
    clean === 'm' ||
    clean === 'male' ||
    clean === 'boy' ||
    clean.includes('laki') ||
    clean.includes('pria') ||
    clean.includes('ikhwan') ||
    clean.includes('putra') ||
    clean === 'l laki laki' ||
    clean === 'laki laki l'
  ) {
    return 'L';
  }

  return null;
}

// Normalize various class inputs: "7-A", "Kelas 7A", "VII A", "7a", "IX A" -> "7A", "9A"
export function normalizeClassName(input: string): string {
  if (!input) return '';
  let s = input
    .trim()
    .toUpperCase()
    .replace(/KELAS\s*/i, '')
    .replace(/ROMBEL\s*/i, '')
    .replace(/TINGKAT\s*/i, '')
    .replace(/RUANG\s*/i, '')
    .replace(/\(SEMBILAN\)/i, '')
    .replace(/\(DELAPAN\)/i, '')
    .replace(/\(TUJUH\)/i, '')
    .trim();

  // Roman numeral conversion
  s = s.replace(/^VII[\s\-_]*/i, '7');
  s = s.replace(/^VIII[\s\-_]*/i, '8');
  s = s.replace(/^IX[\s\-_]*/i, '9');

  // Strip hyphens or spaces like "7-A" -> "7A", "7 A" -> "7A"
  s = s.replace(/[\s\-_]/g, '');

  if (/^[789][A-Z]$/.test(s)) {
    return s;
  }
  if (/^[789]$/.test(s)) {
    return `${s}A`;
  }
  return s;
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
    lower.includes('safira') ||
    lower.includes('farah') ||
    lower.includes('syifa') ||
    lower.includes('humaira') ||
    lower.includes('yasmin') ||
    lower.includes('aqila') ||
    lower.includes('lathifah') ||
    lower.includes('azzahra') ||
    lower.includes('salsabila') ||
    lower.includes('anindya') ||
    lower.includes('muthi') ||
    lower.includes('mutia') ||
    lower.includes('adinda') ||
    lower.includes('tiara') ||
    lower.includes('dewi') ||
    lower.includes('cantika')
  ) {
    return 'P';
  }
  return 'L';
}

function generateFallbackNisn(index: number): string {
  return `011${Math.floor(2890000 + index * 137).toString().padStart(7, '0')}`;
}

// Parse plain text (copy-pasted from Excel, TSV, CSV, or WhatsApp lines)
export function parseRawTextStudents(text: string): ParsedStudentRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedStudentRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if header line
    if (
      (lowerLine.includes('nama') && (lowerLine.includes('nisn') || lowerLine.includes('kelas') || lowerLine.includes('kelamin') || lowerLine.includes('jk'))) ||
      lowerLine.startsWith('no\t') ||
      lowerLine.startsWith('no,\t') ||
      lowerLine.startsWith('no;') ||
      lowerLine.startsWith('no|')
    ) {
      continue; // skip header
    }

    // Determine delimiter: Tab, Semicolon, Comma, Bar, or whitespace
    let tokens: string[] = [];
    if (line.includes('\t')) {
      tokens = line.split('\t').map((t) => t.trim());
    } else if (line.includes(';')) {
      tokens = line.split(';').map((t) => t.trim());
    } else if (line.includes('|')) {
      tokens = line.split('|').map((t) => t.trim());
    } else if (line.includes(',')) {
      tokens = line.split(',').map((t) => t.trim());
    } else if (/\s{2,}/.test(line)) {
      tokens = line.split(/\s{2,}/).map((t) => t.trim());
    } else {
      // Single space separated: split into tokens so gender, class, and NISN can be extracted
      tokens = line.split(/\s+/).map((t) => t.trim());
    }

    // Filter out leading numbering like "1.", "1)", "1"
    if (tokens.length > 1 && /^\d+[\.\)]?$/.test(tokens[0])) {
      tokens.shift();
    }

    if (tokens.length < 1) continue;

    let detectedGender: 'L' | 'P' | null = null;
    let detectedClass = '';
    let detectedNisn = '';
    let detectedNis = '';
    let detectedPhone = '';
    const remainingTokens: string[] = [];

    // Analyze each token intelligently
    for (let j = 0; j < tokens.length; j++) {
      const tok = tokens[j];
      if (!tok) continue;

      // 1. Gender check: directly matching L/P, LK/PR, Putra/Putri, etc.
      if (detectedGender === null) {
        const g = parseGenderValue(tok);
        if (g !== null) {
          detectedGender = g;
          continue;
        }
      }

      // 2. Class check (like 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C, VII-C, etc.)
      if (!detectedClass) {
        const normalized = normalizeClassName(tok);
        if (
          isSmpia9ClassValid(normalized) ||
          /^[789][A-C]$/i.test(normalized) ||
          /^(VII|VIII|IX)/i.test(tok) ||
          /kelas\s*[789]/i.test(tok) ||
          /rombel\s*[789]/i.test(tok)
        ) {
          detectedClass = normalized;
          continue;
        }
      }

      // 3. Phone check (08... or +62...)
      if (!detectedPhone && /^(08|\+?62)\d{8,12}$/.test(tok.replace(/[\s\-\(\)]/g, ''))) {
        detectedPhone = tok;
        continue;
      }

      // 4. NISN check (9-12 digits)
      const digitsOnly = tok.replace(/\D/g, '');
      if (!detectedNisn && digitsOnly.length >= 9 && digitsOnly.length <= 12) {
        detectedNisn = digitsOnly;
        continue;
      }

      // 5. NIS check (school code format like 242507001 or 4309-...)
      if (!detectedNis && (/^\d{4,8}$/.test(digitsOnly) || /^\d{4}[\-_]\d+/.test(tok))) {
        detectedNis = tok;
        continue;
      }

      remainingTokens.push(tok);
    }

    // Name is what remains
    let name = cleanName(remainingTokens.join(' ').trim());
    if (!name && tokens.length > 0) {
      name = cleanName(tokens[0]);
    }

    // Final gender: if user supplied gender, use it strictly. Fallback to name guess only if absent.
    const finalGender: 'L' | 'P' = detectedGender !== null ? detectedGender : guessGenderFromName(name);

    // Final class resolution & validation (Supports all 9 official classes: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C)
    const finalClass = detectedClass || '';
    const isClassAllowed = isSmpia9ClassValid(finalClass);

    let isValid = true;
    let validationError: string | undefined = undefined;

    if (!name || name.length < 2) {
      isValid = false;
      validationError = 'Nama santri tidak boleh kosong';
    } else if (!isClassAllowed) {
      isValid = false;
      validationError = finalClass
        ? `Kelas "${finalClass}" tidak valid. Pilihan kelas resmi SMP Islam Al Azhar 9: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C.`
        : 'Kelas wajib diisi (Pilih: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C)';
    }

    results.push({
      name,
      nisn: detectedNisn || generateFallbackNisn(i),
      className: finalClass || '7A',
      nis: detectedNis || '',
      gender: finalGender,
      parentPhone: detectedPhone,
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
      if (cell.includes('nama') || cell === 'name' || cell.includes('santri') || cell.includes('murid') || cell.includes('siswa')) nameCol = c;
      if (cell.includes('nisn')) nisnCol = c;
      if (cell.includes('kelas') || cell.includes('rombel') || cell === 'class' || cell.includes('tingkat') || cell.includes('ruang') || cell === 'kls') classCol = c;
      if (cell === 'nis' || cell.includes('induk') || cell.includes('no_induk') || cell.includes('no induk')) nisCol = c;
      // Robust gender header detection
      if (
        cell === 'jk' || 
        cell.startsWith('jk ') || 
        cell.startsWith('jk(') || 
        cell.startsWith('jk.') || 
        cell === 'j.k' || 
        cell === 'j.k.' ||
        cell === 'l/p' || 
        cell === 'lp' || 
        cell === 'l / p' || 
        cell.includes('l/p') ||
        cell.includes('kelamin') || 
        cell === 'gender' || 
        cell.includes('gender') || 
        cell.includes('sex') || 
        cell.includes('jns') ||
        cell.includes('seks')
      ) {
        genderCol = c;
      }
      if (cell.includes('hp') || cell.includes('telepon') || cell.includes('telp') || cell.includes('wa') || cell.includes('wali') || cell.includes('kontak') || cell.includes('phone')) phoneCol = c;
    }

    if (nameCol !== -1 && (nisnCol !== -1 || classCol !== -1 || genderCol !== -1)) {
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
    const rawPhone = phoneCol >= 0 ? String(row[phoneCol] || '') : '';

    if (!rawName.trim()) continue;

    // Determine Gender accurately
    let detectedGender: 'L' | 'P' | null = null;
    if (genderCol >= 0 && row[genderCol] !== undefined) {
      detectedGender = parseGenderValue(row[genderCol]);
    }
    // If not found from designated column, scan other text cells in row
    // (STRICTLY skip columns that are purely digits or numeric sequence numbers)
    if (detectedGender === null) {
      for (let c = 0; c < row.length; c++) {
        if (c === nameCol || c === nisnCol || c === nisCol || c === phoneCol || c === classCol) continue;
        const cellVal = String(row[c] || '').trim();
        // Do not parse pure numbers as gender
        if (/^\d+$/.test(cellVal)) continue;
        const g = parseGenderValue(row[c]);
        if (g !== null) {
          detectedGender = g;
          break;
        }
      }
    }
    const finalGender: 'L' | 'P' = detectedGender !== null ? detectedGender : guessGenderFromName(rawName);

    // Class extraction & normalization
    let normalizedClass = normalizeClassName(rawClass);
    if (!normalizedClass) {
      // scan row for a class pattern
      for (let c = 0; c < row.length; c++) {
        const testNorm = normalizeClassName(String(row[c] || ''));
        if (isSmpia9ClassValid(testNorm)) {
          normalizedClass = testNorm;
          break;
        }
      }
    }

    const cleanedNisn = rawNisn.replace(/\D/g, '');
    const isClassAllowed = isSmpia9ClassValid(normalizedClass);

    let isValid = true;
    let validationError: string | undefined = undefined;

    if (rawName.trim().length < 2) {
      isValid = false;
      validationError = 'Nama murid tidak boleh kosong';
    } else if (!isClassAllowed) {
      isValid = false;
      validationError = normalizedClass
        ? `Kelas "${normalizedClass}" tidak valid. Pilihan kelas resmi SMP Islam Al Azhar 9: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C.`
        : 'Kelas wajib diisi (Pilih: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C)';
    }

    results.push({
      name: cleanName(rawName),
      nisn: cleanedNisn || generateFallbackNisn(r),
      className: normalizedClass || '7A',
      nis: rawNis.trim(),
      gender: finalGender,
      parentPhone: rawPhone.trim(),
      isValid,
      validationError,
    });
  }

  return results;
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
      'Nama Santri (Wajib)': 'Rizky Ramadhan Saputra',
      'NISN (10 Digit)': '0112894011',
      'Kelas (7A-9B)': '7B',
      'Jenis Kelamin (L/P)': 'L',
      'NIS (Opsional)': '242507011',
      'No HP Orang Tua / Wali': '0858-9900-1122',
    },
    {
      'Nama Santri (Wajib)': 'Annisa Zahra Nuraini',
      'NISN (10 Digit)': '0112894021',
      'Kelas (7A-9B)': '7C',
      'Jenis Kelamin (L/P)': 'P',
      'NIS (Opsional)': '242507021',
      'No HP Orang Tua / Wali': '0812-4455-6677',
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
      'Nama Santri (Wajib)': 'Fajar Siddiq Pratama',
      'NISN (10 Digit)': '0103456021',
      'Kelas (7A-9B)': '8C',
      'Jenis Kelamin (L/P)': 'L',
      'NIS (Opsional)': '232408021',
      'No HP Orang Tua / Wali': '0877-5566-7788',
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
      'Kelas (7A-9C)': '9B',
      'Jenis Kelamin (L/P)': 'P',
      'NIS (Opsional)': '222309002',
      'No HP Orang Tua / Wali': '0812-9988-7766',
    },
    {
      'Nama Santri (Wajib)': 'Salman Al-Hakim Ramadhan',
      'NISN (10 Digit)': '0098765021',
      'Kelas (7A-9C)': '9C',
      'Jenis Kelamin (L/P)': 'L',
      'NIS (Opsional)': '222309021',
      'No HP Orang Tua / Wali': '0812-5566-7788',
    },
    {
      'Nama Santri (Wajib)': 'Naila Zahra Al-Munawwarah',
      'NISN (10 Digit)': '0098765022',
      'Kelas (7A-9C)': '9C',
      'Jenis Kelamin (L/P)': 'P',
      'NIS (Opsional)': '222309022',
      'No HP Orang Tua / Wali': '0878-3344-5566',
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
    'Rizky Ramadhan Saputra,0112894011,7B,L,242507011,0858-9900-1122\n' +
    'Annisa Zahra Nuraini,0112894021,7C,P,242507021,0812-4455-6677\n' +
    'Ibrahim Hanif Al-Farisi,0103456003,8A,L,232408003,0819-0987-6543\n' +
    'Khadijah Nabila Zahir,0103456004,8B,P,232408004,0821-3344-5566\n' +
    'Fajar Siddiq Pratama,0103456021,8C,L,232408021,0877-5566-7788\n' +
    'Zaid bin Haritsah Al-Anshari,0098765001,9A,L,222309001,0878-1122-3344\n' +
    'Maryam Sholihatul Jannah,0098765002,9B,P,222309002,0812-9988-7766\n' +
    'Salman Al-Hakim Ramadhan,0098765021,9C,L,222309021,0812-5566-7788\n' +
    'Naila Zahra Al-Munawwarah,0098765022,9C,P,222309022,0878-3344-5566\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Impor_Murid_SMPIA9_Bekasi.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Preset complete roster for SMP Islam Al Azhar 9 Bekasi (9 official classes: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C)
export const SMPIA9_FULL_ROSTER: Omit<Student, 'id' | 'teacherId'>[] = [
  // KELAS 7A (Target: Juz 30)
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

  // KELAS 7C (Target: Juz 30)
  {
    nis: '242507021',
    nisn: '0112894021',
    name: 'Muhammad Yusuf Al-Ayyubi',
    gender: 'L',
    className: '7C',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0812-3322-1100',
  },
  {
    nis: '242507022',
    nisn: '0112894022',
    name: 'Rayhan Ghazi Al-Mubarak',
    gender: 'L',
    className: '7C',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0813-5566-7788',
  },
  {
    nis: '242507023',
    nisn: '0112894023',
    name: 'Annisa Zahra Nuraini',
    gender: 'P',
    className: '7C',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0812-4455-6677',
  },
  {
    nis: '242507024',
    nisn: '0112894024',
    name: 'Muthia Tsabita Wardani',
    gender: 'P',
    className: '7C',
    targetJuz: 'Juz 30 (Tuntas Mutqin)',
    targetSurahCount: 37,
    parentPhone: '0878-9988-1122',
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

  // KELAS 8C (Target: Juz 29 & 30)
  {
    nis: '232408021',
    nisn: '0103456021',
    name: 'Fajar Siddiq Pratama',
    gender: 'L',
    className: '8C',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0877-5566-7788',
  },
  {
    nis: '232408022',
    nisn: '0103456022',
    name: 'Dzaky Naufal Hendrawan',
    gender: 'L',
    className: '8C',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0813-8899-0011',
  },
  {
    nis: '232408023',
    nisn: '0103456023',
    name: 'Tiara Dewi Maharani',
    gender: 'P',
    className: '8C',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0856-1122-3344',
  },
  {
    nis: '232408024',
    nisn: '0103456024',
    name: 'Adinda Salsabila Fitri',
    gender: 'P',
    className: '8C',
    targetJuz: 'Juz 29 & 30',
    targetSurahCount: 48,
    parentPhone: '0819-2233-4411',
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

  // KELAS 9C (Target: Juz 28, 29, 30) - 20 Santri Lengkap
  { nis: '4309-2223061', nisn: '3124819118', name: 'Ahmad Zuhal', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0811-2233-4455' },
  { nis: '4309-2223062', nisn: '0125970962', name: 'Darliena Aishaqira Dannial', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0812-4455-6688' },
  { nis: '4309-2223063', nisn: '0123303015', name: 'Ganendra Abinaya Tsakib Ariaputra', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0812-5566-7788' },
  { nis: '4309-2223064', nisn: '0116555903', name: 'Joel Mario Ramadhani', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0878-3344-5566' },
  { nis: '4309-2223065', nisn: '0115850078', name: 'Khalif Abdul Jabbar', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0813-2211-4433' },
  { nis: '4309-2223066', nisn: '0111005608', name: 'Lavina Althea Triawan', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0858-7788-9900' },
  { nis: '4309-2223067', nisn: '3128655972', name: 'Lovierra Kalyca Riyanto', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0812-9988-1122' },
  { nis: '4309-2223068', nisn: '0124365267', name: 'Muhammad Farras Rafliansyah', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0813-4455-2233' },
  { nis: '4309-2223069', nisn: '0113846201', name: 'Muhammad Rafi Fataya Kirani', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0856-2233-4455' },
  { nis: '4309-2223070', nisn: '0112791758', name: 'Muhammad Zaki', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0818-5566-7788' },
  { nis: '4309-2223071', nisn: '0123013705', name: 'Nadra Dzamira Sasti Affandi', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0877-3344-5566' },
  { nis: '4309-2223072', nisn: '3124920710', name: 'Naura Aquina Zhufairah', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0812-7788-9911' },
  { nis: '4309-2223073', nisn: '0125616155', name: 'Nur Rahman Abdallah', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0813-1122-3355' },
  { nis: '4309-2223074', nisn: '0118407266', name: 'Nurandriani Astari', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0852-4455-6677' },
  { nis: '4309-2223075', nisn: '0122843902', name: 'Putri Vania Aramita Ghani', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0816-7788-9900' },
  { nis: '4309-2223076', nisn: '0122628678', name: 'Raisa Ananda Shakila', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0817-2233-4466' },
  { nis: '4309-2223077', nisn: '0128831984', name: 'Shofiya Zakiya Jamil', gender: 'P', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0819-5566-7799' },
  { nis: '4309-2223078', nisn: '0126397010', name: 'Zavier Aydin Rashaad Siregar', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0812-8899-0022' },
  { nis: '4309-2223079', nisn: '0124270323', name: 'Nevan Faiz Qitarah', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0813-3344-5577' },
  { nis: '4309-2223080', nisn: '0122081045', name: 'Muhammad Yaqdhan Jalil', gender: 'L', className: '9C', targetJuz: 'Juz 28, 29, 30', targetSurahCount: 59, parentPhone: '0857-6677-8800' },
];
