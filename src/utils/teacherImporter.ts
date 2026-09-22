import * as XLSX from 'xlsx';
import { Teacher } from '../types';

export interface ParsedTeacherRow {
  name: string;
  nip: string;
  gender: 'L' | 'P';
  assignedClasses: string[];
  specialty: 'Tahsin' | 'Tahfiz' | 'Tahsin & Tahfiz';
  phone?: string;
  isValid: boolean;
  validationError?: string;
}

// Preset roster of Asatidz / Guru Tahsin & Tahfiz SMP Islam Al Azhar 9 Bekasi (8 Rombel Resmi: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B)
export const SMPIA9_TEACHER_ROSTER: Omit<Teacher, 'id'>[] = [
  {
    name: 'Ustadz Ahmad Fauzi, S.Pd.I, Al-Hafizh',
    nip: '198507122010011005',
    gender: 'L',
    assignedClasses: ['7A', '7B'],
    specialty: 'Tahsin & Tahfiz',
    phone: '0812-8877-6655',
  },
  {
    name: 'Ustadz Muhammad Ridwan, Lc., M.Ag.',
    nip: '198903152014021008',
    gender: 'L',
    assignedClasses: ['7C', '8A'],
    specialty: 'Tahsin & Tahfiz',
    phone: '0813-1122-3344',
  },
  {
    name: 'Ustadzah Siti Fatimah, S.Ag., Al-Hafizhah',
    nip: '199104202016042003',
    gender: 'P',
    assignedClasses: ['8B', '8C'],
    specialty: 'Tahsin & Tahfiz',
    phone: '0857-9988-1122',
  },
  {
    name: 'Ustadz Hanif Al-Banjari, S.Q., M.Pd.',
    nip: '198711052012011004',
    gender: 'L',
    assignedClasses: ['9A', '9B'],
    specialty: 'Tahsin & Tahfiz',
    phone: '0878-3344-5566',
  },
  {
    name: 'Ustadzah Nurul Hidayah, S.Pd.I',
    nip: '199308142018032006',
    gender: 'P',
    assignedClasses: ['7A', '8A', '9A'],
    specialty: 'Tahsin & Tahfiz',
    phone: '0821-4455-6677',
  },
  {
    name: 'Ustadz Zulkifli Rahman, S.Th.I',
    nip: '199002182015021007',
    gender: 'L',
    assignedClasses: ['7B', '8B', '9B'],
    specialty: 'Tahfiz',
    phone: '0819-7788-9900',
  },
];

// Parse plain text (copy-pasted from Excel, TSV, CSV, or WhatsApp lines)
export function parseRawTextTeachers(text: string): ParsedTeacherRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedTeacherRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if header line
    if (
      (lowerLine.includes('nama') && lowerLine.includes('nip')) ||
      (lowerLine.includes('guru') && lowerLine.includes('kelas')) ||
      lowerLine.startsWith('no\t') ||
      lowerLine.startsWith('no,\t')
    ) {
      continue;
    }

    let tokens: string[] = [];
    if (line.includes('\t')) {
      tokens = line.split('\t').map((t) => t.trim());
    } else if (line.includes(';')) {
      tokens = line.split(';').map((t) => t.trim());
    } else if (line.includes(',')) {
      tokens = line.split(',').map((t) => t.trim());
    } else {
      tokens = line.split(/\s{2,}/).map((t) => t.trim());
    }

    // Skip numbered column if present (e.g. "1", "2.")
    if (tokens.length > 1 && /^\d+[\.\)]?$/.test(tokens[0])) {
      tokens.shift();
    }

    if (tokens.length === 0) continue;

    const rawName = tokens[0] || '';
    const rawNip = tokens[1] || '';
    const rawGender = tokens[2] || '';
    const rawClasses = tokens[3] || '';
    const rawSpecialty = tokens[4] || '';
    const rawPhone = tokens[5] || '';

    // Clean name
    const cleanedName = rawName.replace(/^\d+[\.\-\s]+/, '').trim();

    if (!cleanedName) {
      continue;
    }

    // Determine gender
    let gender: 'L' | 'P' = 'L';
    const lowerGender = rawGender.toLowerCase();
    const lowerName = cleanedName.toLowerCase();
    if (
      lowerGender === 'p' ||
      lowerGender === 'perempuan' ||
      lowerGender === 'akhwat' ||
      lowerGender === 'wanita' ||
      lowerName.includes('ustadzah') ||
      lowerName.includes('ustzh') ||
      lowerName.includes('ibu')
    ) {
      gender = 'P';
    }

    // Clean NIP
    let nip = rawNip.replace(/[^\d]/g, '');
    if (!nip) {
      nip = `1988${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    // Assigned classes
    let classes: string[] = [];
    if (rawClasses) {
      classes = rawClasses
        .split(/[,\s;/]+/)
        .map((c) => c.trim().toUpperCase())
        .filter((c) => /^[789][A-Za-z]$/.test(c) || c.length > 0);
    }
    if (classes.length === 0) {
      classes = ['7A', '7B'];
    }

    // Specialty
    let specialty: 'Tahsin' | 'Tahfiz' | 'Tahsin & Tahfiz' = 'Tahsin & Tahfiz';
    const lowerSpec = rawSpecialty.toLowerCase();
    if (lowerSpec.includes('tahsin') && !lowerSpec.includes('tahfiz')) {
      specialty = 'Tahsin';
    } else if (lowerSpec.includes('tahfiz') && !lowerSpec.includes('tahsin')) {
      specialty = 'Tahfiz';
    }

    const isValid = cleanedName.length >= 3;
    const validationError = isValid ? undefined : 'Nama terlalu pendek';

    results.push({
      name: cleanedName,
      nip,
      gender,
      assignedClasses: classes,
      specialty,
      phone: rawPhone || undefined,
      isValid,
      validationError,
    });
  }

  return results;
}

// Parse uploaded Excel (.xlsx/.xls) or CSV file for Teachers
export function parseExcelTeachers(buffer: ArrayBuffer): ParsedTeacherRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

  if (!jsonData || jsonData.length === 0) {
    return [];
  }

  // Detect header row
  let headerIndex = -1;
  let nameCol = 0;
  let nipCol = 1;
  let genderCol = -1;
  let classesCol = -1;
  let specialtyCol = -1;
  let phoneCol = -1;

  for (let r = 0; r < Math.min(jsonData.length, 10); r++) {
    const row = jsonData[r];
    if (!Array.isArray(row)) continue;

    const rowStr = row.map((cell) => String(cell || '').toLowerCase().trim());
    const nIdx = rowStr.findIndex((c) => c.includes('nama') || c.includes('guru') || c.includes('ustadz'));

    if (nIdx !== -1) {
      headerIndex = r;
      nameCol = nIdx;

      rowStr.forEach((c, idx) => {
        if (c.includes('nip') || c.includes('nuptk') || c.includes('nik')) nipCol = idx;
        if (c.includes('gender') || c.includes('jk') || c.includes('kelamin') || c.includes('panggilan')) genderCol = idx;
        if (c.includes('kelas') || c.includes('rombel') || c.includes('binaan') || c.includes('bimbingan')) classesCol = idx;
        if (c.includes('bidang') || c.includes('spesialis') || c.includes('materi')) specialtyCol = idx;
        if (c.includes('hp') || c.includes('wa') || c.includes('telepon') || c.includes('kontak')) phoneCol = idx;
      });
      break;
    }
  }

  const dataRows = headerIndex === -1 ? jsonData : jsonData.slice(headerIndex + 1);
  const results: ParsedTeacherRow[] = [];

  dataRows.forEach((row) => {
    if (!Array.isArray(row) || row.length === 0) return;

    const rawName = String(row[nameCol] || '').trim();
    if (!rawName || rawName.toLowerCase().includes('nama')) return;

    const rawNip = nipCol !== -1 ? String(row[nipCol] || '').trim() : '';
    const rawGender = genderCol !== -1 ? String(row[genderCol] || '').trim() : '';
    const rawClasses = classesCol !== -1 ? String(row[classesCol] || '').trim() : '';
    const rawSpecialty = specialtyCol !== -1 ? String(row[specialtyCol] || '').trim() : '';
    const rawPhone = phoneCol !== -1 ? String(row[phoneCol] || '').trim() : '';

    const cleanedName = rawName.replace(/^\d+[\.\-\s]+/, '').trim();
    if (cleanedName.length < 3) return;

    let gender: 'L' | 'P' = 'L';
    const lowerGender = rawGender.toLowerCase();
    const lowerName = cleanedName.toLowerCase();
    if (
      lowerGender === 'p' ||
      lowerGender === 'perempuan' ||
      lowerGender === 'akhwat' ||
      lowerName.includes('ustadzah') ||
      lowerName.includes('ustzh') ||
      lowerName.includes('ibu')
    ) {
      gender = 'P';
    }

    let nip = rawNip.replace(/[^\d]/g, '');
    if (!nip) {
      nip = `1988${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    let classes: string[] = [];
    if (rawClasses) {
      classes = rawClasses
        .split(/[,\s;/]+/)
        .map((c) => c.trim().toUpperCase())
        .filter((c) => c.length > 0);
    }
    if (classes.length === 0) {
      classes = ['7A', '7B'];
    }

    let specialty: 'Tahsin' | 'Tahfiz' | 'Tahsin & Tahfiz' = 'Tahsin & Tahfiz';
    const lowerSpec = rawSpecialty.toLowerCase();
    if (lowerSpec.includes('tahsin') && !lowerSpec.includes('tahfiz')) {
      specialty = 'Tahsin';
    } else if (lowerSpec.includes('tahfiz') && !lowerSpec.includes('tahsin')) {
      specialty = 'Tahfiz';
    }

    results.push({
      name: cleanedName,
      nip,
      gender,
      assignedClasses: classes,
      specialty,
      phone: rawPhone || undefined,
      isValid: true,
    });
  });

  return results;
}

// Download Teacher Excel Template
export function downloadTeacherExcelTemplate(): void {
  const templateData = [
    {
      'No': 1,
      'Nama Lengkap & Gelar Guru': 'Ustadz Ahmad Fauzi, S.Pd.I, Al-Hafizh',
      'NIP': '198507122010011005',
      'Panggilan / Gender (L/P)': 'L',
      'Kelas Bimbingan': '7A, 7B',
      'Spesialisasi': 'Tahsin & Tahfiz',
      'No WhatsApp': '0812-8877-6655',
    },
    {
      'No': 2,
      'Nama Lengkap & Gelar Guru': 'Ustadzah Siti Fatimah, S.Ag., Al-Hafizhah',
      'NIP': '199104202016042003',
      'Panggilan / Gender (L/P)': 'P',
      'Kelas Bimbingan': '8A, 8B',
      'Spesialisasi': 'Tahsin & Tahfiz',
      'No WhatsApp': '0857-9988-1122',
    },
    {
      'No': 3,
      'Nama Lengkap & Gelar Guru': 'Ustadz Hanif Al-Banjari, S.Q., M.Pd.',
      'NIP': '198711052012011004',
      'Panggilan / Gender (L/P)': 'L',
      'Kelas Bimbingan': '9A, 9B',
      'Spesialisasi': 'Tahfiz',
      'No WhatsApp': '0878-3344-5566',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 42 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Guru Tahsin');
  XLSX.writeFile(wb, 'Template_Guru_Tahsin_Tahfiz_SMPIA9.xlsx');
}

// Download Teacher CSV Template
export function downloadTeacherCsvTemplate(): void {
  const csvContent = 
`No,Nama Lengkap & Gelar Guru,NIP,Gender (L/P),Kelas Bimbingan,Spesialisasi,No WhatsApp
1,Ustadz Ahmad Fauzi S.Pd.I Al-Hafizh,198507122010011005,L,"7A, 7B",Tahsin & Tahfiz,0812-8877-6655
2,Ustadzah Siti Fatimah S.Ag. Al-Hafizhah,199104202016042003,P,"8A, 8B",Tahsin & Tahfiz,0857-9988-1122
3,Ustadz Hanif Al-Banjari S.Q. M.Pd.,198711052012011004,L,"9A, 9B",Tahfiz,0878-3344-5566`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Guru_Tahsin_Tahfiz_SMPIA9.csv';
  a.click();
  URL.revokeObjectURL(url);
}
