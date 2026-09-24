export type UserRole = 'admin' | 'guru' | 'murid';

export interface SchoolSettings {
  schoolName: string;
  foundationName: string;
  npsn: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  academicYear: string;
  semester: string; // e.g. "I (Satu)", "II (Dua)", "Ganjil", "Genap"
  principalName: string;
  principalNip: string;
  reportDate: string;
  coordinatorName?: string;
  coordinatorTitle?: string;
  pageNumber?: string;
  schoolLogo?: string; // Data URL (Base64) or Image URL for Left Logo (Sekolah)
  foundationLogo?: string; // Data URL (Base64) or Image URL for Right Logo (Yayasan)
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  className: string; // e.g. "7A", "7B", "8A", "8B", "9A", "9B"
  teacherId: string;
  targetJuz: string; // e.g. "Juz 30 & 29"
  targetSurahCount: number; // e.g. 37
  kelompok?: string; // e.g. "6", "3", "5", "ALQ", "4"
  avatar?: string;
  parentPhone?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'L' | 'P';
  assignedClasses: string[];
  specialty: 'Tahsin' | 'Tahfiz' | 'Tahsin & Tahfiz';
  phone?: string;
}

export type IqroJilid = 1 | 2 | 3 | 4 | 5 | 6;

export type IqroStatus = 'Lulus (Naik Jilid)' | 'Sedang Ditempuh' | 'Perlu Pengulangan';

export type TahsinPredicate = 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul';

export interface IqroMaterialAspect {
  key: string;
  name: string;
  score: number; // 0-100
  predicate: TahsinPredicate;
  criteria: string;
}

export interface IqroJilidRecord {
  jilid: IqroJilid;
  status: IqroStatus;
  score: number;
  predicate: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul';
  completedHalaman?: number;
  date?: string;
  notes?: string;
}

export interface TahsinGrade {
  jilid: IqroJilid; // 1 s.d 6
  halaman: number; // 1 s.d 32
  jilidStatus: IqroStatus;
  aspects: IqroMaterialAspect[];
  averageScore: number;
  overallPredicate: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul';
  levelBook: string; // e.g. "Iqro' AMM Jilid 4 (Hal. 18)"
  notes: string;
  lastUpdated: string;
  jilidHistory?: Record<IqroJilid, IqroJilidRecord>; // Rekap Capaian Jilid 1 - 6
  // Compatibility fields:
  makharijulHuruf: number; // 0-100
  ahkamutTajwid: number; // 0-100
  ahkamulWaqf: number; // 0-100
  fashahahTartil: number; // 0-100
}

export interface TahfizSurahRecord {
  id: string;
  surahNumber: number;
  surahName: string;
  juzNumber: number;
  ayatFrom: number;
  ayatTo: number;
  gradeScore: number; // 0-100
  predicate: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul';
  isMutqin: boolean;
  date: string;
  examinerTeacherName: string;
  notes?: string;
}

export interface AdabAttitudeGrade {
  kedisiplinan: 'A' | 'B' | 'C'; // Sangat Baik, Baik, Cukup
  adabMushaf: 'A' | 'B' | 'C';
  kerajinanMurojaah: 'A' | 'B' | 'C';
  semangatHalaqah: 'A' | 'B' | 'C';
  generalNotes: string;
}

export interface StudentReportData {
  student: Student;
  tahsin: TahsinGrade;
  tahfizRecords: TahfizSurahRecord[];
  adab: AdabAttitudeGrade;
  summaryHafalan: {
    totalSurahLulus: number;
    totalAyatHafal: number;
    juzCompleted: number[];
    currentJuzInProgress: number;
    completionPercentage: number;
  };
}

export interface SurahMeta {
  number: number;
  name: string;
  arabic: string;
  totalAyat: number;
  juz: number;
}
