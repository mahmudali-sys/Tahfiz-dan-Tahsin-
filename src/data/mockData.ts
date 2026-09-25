import { SchoolSettings, Student, Teacher, StudentReportData } from '../types';
import { createDefaultTahsinGrade } from './iqroData';
import { STUDENTS_7B, create7BReports } from './class7BData';
import { ALL_168_STUDENTS, STUDENTS_9C_20 } from './smpia9Students168';

export { ALL_168_STUDENTS, STUDENTS_9C_20 };

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: "SMP ISLAM AL AZHAR 9 BEKASI",
  foundationName: "YAYASAN PESANTREN ISLAM AL-AZHAR",
  npsn: "20223019",
  address: "Jl. Kemang Pratama Raya No. 9, Rawalumbu, Kota Bekasi, Jawa Barat 17116",
  city: "Bekasi",
  phone: "(021) 82421999",
  email: "info@smpia9.sch.id",
  academicYear: "2025/2026",
  semester: "I (Satu)",
  principalName: "Drs. H. Ahmad Sudrajat, M.Pd.I",
  principalNip: "19720415 199803 1 004",
  reportDate: "22 Desember 2025",
  coordinatorName: "Mahmud Ali Yafi, S.S, M.Pd.I.",
  coordinatorTitle: "Koordinator Tahfiz",
  pageNumber: "",
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    nip: "19850612 201101 1 003",
    name: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
    gender: "L",
    assignedClasses: ["7A", "7B", "7C"],
    specialty: "Tahsin & Tahfiz",
    phone: "0812-8991-2341",
  },
  {
    id: "tch-2",
    nip: "19900824 201502 2 007",
    name: "Usth. Fatimah Az-Zahra, S.Ag, Al-Hafizah",
    gender: "P",
    assignedClasses: ["8A", "8B", "8C"],
    specialty: "Tahsin & Tahfiz",
    phone: "0813-7721-5509",
  },
  {
    id: "tch-3",
    nip: "19881103 201301 1 005",
    name: "Ust. Mahmud Ali Yafi, S.S, M.Pd.I.",
    gender: "L",
    assignedClasses: ["9A", "9B", "9C"],
    specialty: "Tahsin & Tahfiz",
    phone: "0815-4432-9012",
  },
];

export const INITIAL_STUDENTS: Student[] = ALL_168_STUDENTS;

export const INITIAL_REPORTS: Record<string, StudentReportData> = {
  ...create7BReports(),
  "std-emiral": {
    student: INITIAL_STUDENTS[0],
    tahsin: {
      jilid: 6,
      halaman: 32,
      jilidStatus: 'Lulus (Naik Jilid)',
      averageScore: 92,
      overallPredicate: 'Mumtaz',
      levelBook: "Iqro' Jilid 6 (Hal. 32) - AMM Yogyakarta",
      notes: "Siswa telah menuntaskan seluruh materi Iqro' Jilid 3 s.d. 6 dan siap melanjutkan ke Al-Qur'an dan Tahfiz.",
      lastUpdated: "2025-12-22",
      aspects: [
        { key: 'j6_1', name: 'Idgham Nun, Mim, Lam & Ra', score: 94, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
        { key: 'j6_2', name: 'Idgham Ya & Wawu', score: 92, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
        { key: 'j6_3', name: 'Iqlab dan Ikhfa Haqiqi', score: 91, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
        { key: 'j6_4', name: 'Tanda-tanda Waqaf', score: 92, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
        { key: 'j6_5', name: 'Waqaf yang didahului sukun', score: 94, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
        { key: 'j6_6', name: 'Waqaf pada huruf Bertasydid', score: 95, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
        { key: 'j6_7', name: "Huruf Muqatha'ah", score: 91, predicate: 'Mumtaz', criteria: 'Sangat Baik' },
      ],
      makharijulHuruf: 94,
      ahkamutTajwid: 93,
      ahkamulWaqf: 94,
      fashahahTartil: 92,
    },
    tahfizRecords: [],
    adab: {
      kedisiplinan: 'A',
      adabMushaf: 'A',
      kerajinanMurojaah: 'A',
      semangatHalaqah: 'A',
      generalNotes: 'Sangat tertib dan disiplin dalam mengikuti halaqah Al-Qur\'an.',
    },
    summaryHafalan: {
      totalSurahLulus: 0,
      totalAyatHafal: 0,
      juzCompleted: [],
      currentJuzInProgress: 30,
      completionPercentage: 0,
    },
  },
  "std-1": {
    student: INITIAL_STUDENTS[1],
    tahsin: createDefaultTahsinGrade(
      6,
      30,
      'Lulus (Naik Jilid)',
      92,
      "Alhamdulillah tuntas materi Iqro' 6 (persiapan khatam), penguasaan hukum nun mati/tanwin dan mim mati sangat fasih dan tartil."
    ),
    tahfizRecords: [
      {
        id: "rec-1",
        surahNumber: 114,
        surahName: "An-Nas",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 6,
        gradeScore: 95,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-01-15",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Lancar sekali, tajwid terjaga baik.",
      },
      {
        id: "rec-2",
        surahNumber: 113,
        surahName: "Al-Falaq",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 5,
        gradeScore: 94,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-01-20",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Qolqolah kubro di akhir ayat sangat jelas.",
      },
      {
        id: "rec-3",
        surahNumber: 112,
        surahName: "Al-Ikhlas",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 4,
        gradeScore: 96,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-01-25",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Lancar mutqin.",
      },
      {
        id: "rec-4",
        surahNumber: 78,
        surahName: "An-Naba'",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 40,
        gradeScore: 92,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-05-10",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Ujian juz 30 tuntas dengan hasil memuaskan.",
      },
      {
        id: "rec-5",
        surahNumber: 79,
        surahName: "An-Nazi'at",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 46,
        gradeScore: 89,
        predicate: "Jayyid Jiddan",
        isMutqin: true,
        date: "2026-05-22",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Perhatikan dengung ghunnah musyaddadah.",
      },
      {
        id: "rec-6",
        surahNumber: 80,
        surahName: "'Abasa",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 42,
        gradeScore: 90,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-06-02",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Bagus, makhraj 'ain dan ha bersih.",
      },
      {
        id: "rec-7",
        surahNumber: 87,
        surahName: "Al-A'la",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 19,
        gradeScore: 95,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-03-12",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Sangat fasih.",
      },
      {
        id: "rec-8",
        surahNumber: 93,
        surahName: "Ad-Duha",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 11,
        gradeScore: 98,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-02-14",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Mumtaz jiddan.",
      },
    ],
    adab: {
      kedisiplinan: "A",
      adabMushaf: "A",
      kerajinanMurojaah: "A",
      semangatHalaqah: "A",
      generalNotes: "Ananda memiliki kesungguhan yang tinggi dalam muroja'ah di rumah dan adab yang tawadhu di halaqah.",
    },
    summaryHafalan: {
      totalSurahLulus: 37,
      totalAyatHafal: 564,
      juzCompleted: [30],
      currentJuzInProgress: 29,
      completionPercentage: 100,
    },
  },
  "std-2": {
    student: INITIAL_STUDENTS[1],
    tahsin: createDefaultTahsinGrade(
      5,
      24,
      'Sedang Ditempuh',
      88,
      "Suara merdu, bacaan tartil dan tenang. Penguasaan harakat tasydid dan ghunnah musyaddadah sangat baik."
    ),
    tahfizRecords: [
      {
        id: "rec-21",
        surahNumber: 78,
        surahName: "An-Naba'",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 40,
        gradeScore: 88,
        predicate: "Jayyid Jiddan",
        isMutqin: true,
        date: "2026-05-18",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Lancar, bacaan tartil.",
      },
      {
        id: "rec-22",
        surahNumber: 79,
        surahName: "An-Nazi'at",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 46,
        gradeScore: 86,
        predicate: "Jayyid Jiddan",
        isMutqin: true,
        date: "2026-05-28",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Perbanyak muroja'ah sambung ayat.",
      },
      {
        id: "rec-23",
        surahNumber: 87,
        surahName: "Al-A'la",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 19,
        gradeScore: 92,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-03-05",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Sangat baik.",
      },
    ],
    adab: {
      kedisiplinan: "A",
      adabMushaf: "A",
      kerajinanMurojaah: "B",
      semangatHalaqah: "A",
      generalNotes: "Santriwati yang rajin dan berakhlak mulia. Ditingkatkan konsistensi muroja'ah harian di rumah.",
    },
    summaryHafalan: {
      totalSurahLulus: 30,
      totalAyatHafal: 450,
      juzCompleted: [],
      currentJuzInProgress: 30,
      completionPercentage: 81,
    },
  },
  "std-3": {
    student: INITIAL_STUDENTS[2],
    tahsin: createDefaultTahsinGrade(
      4,
      18,
      'Sedang Ditempuh',
      81,
      "Pengenalan tanwin dan huruf bersukun berkembang pesat. Perbanyak latihan pantulan huruf qalqalah sukun (baju di toko)."
    ),
    tahfizRecords: [
      {
        id: "rec-31",
        surahNumber: 93,
        surahName: "Ad-Duha",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 11,
        gradeScore: 84,
        predicate: "Jayyid Jiddan",
        isMutqin: true,
        date: "2026-04-10",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Lancar dan percaya diri.",
      },
      {
        id: "rec-32",
        surahNumber: 94,
        surahName: "Al-Insyirah",
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 8,
        gradeScore: 85,
        predicate: "Jayyid Jiddan",
        isMutqin: true,
        date: "2026-04-15",
        examinerTeacherName: "Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz",
        notes: "Bagus.",
      },
    ],
    adab: {
      kedisiplinan: "B",
      adabMushaf: "A",
      kerajinanMurojaah: "B",
      semangatHalaqah: "B",
      generalNotes: "Tunjukkan semangat yang lebih giat saat halaqah pagi.",
    },
    summaryHafalan: {
      totalSurahLulus: 20,
      totalAyatHafal: 280,
      juzCompleted: [],
      currentJuzInProgress: 30,
      completionPercentage: 54,
    },
  },
  "std-4": {
    student: INITIAL_STUDENTS[3],
    tahsin: createDefaultTahsinGrade(
      6,
      32,
      'Lulus (Naik Jilid)',
      95,
      "Tuntas Ujian Kenaikan Jilid 6 (Khatam Metode Iqro' AMM Kotagede Yogyakarta). Siap lanjut Tadarus Al-Qur'an 30 Juz."
    ),
    tahfizRecords: [
      {
        id: "rec-41",
        surahNumber: 67,
        surahName: "Al-Mulk",
        juzNumber: 29,
        ayatFrom: 1,
        ayatTo: 30,
        gradeScore: 97,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-03-01",
        examinerTeacherName: "Usth. Fatimah Az-Zahra, S.Ag, Al-Hafizah",
        notes: "Hafalan sangat kuat dan matang (mutqin).",
      },
      {
        id: "rec-42",
        surahNumber: 68,
        surahName: "Al-Qalam",
        juzNumber: 29,
        ayatFrom: 1,
        ayatTo: 52,
        gradeScore: 93,
        predicate: "Mumtaz",
        isMutqin: true,
        date: "2026-04-15",
        examinerTeacherName: "Usth. Fatimah Az-Zahra, S.Ag, Al-Hafizah",
        notes: "Tajwid rapi.",
      },
    ],
    adab: {
      kedisiplinan: "A",
      adabMushaf: "A",
      kerajinanMurojaah: "A",
      semangatHalaqah: "A",
      generalNotes: "Siswa teladan dalam program tahfiz SMP Islam 9 Bekasi.",
    },
    summaryHafalan: {
      totalSurahLulus: 48,
      totalAyatHafal: 995,
      juzCompleted: [30, 29],
      currentJuzInProgress: 28,
      completionPercentage: 100,
    },
  },
};

// Ensure all 168 students (including all 20 students of 9C) have active, complete reports
ALL_168_STUDENTS.forEach((student) => {
  if (!INITIAL_REPORTS[student.id]) {
    const is9 = student.className.startsWith('9');
    const is8 = student.className.startsWith('8');

    const baseScore = 90 + ((student.name.length * 3) % 7);
    const jilid = (is9 ? 6 : is8 ? 6 : 5) as 1 | 2 | 3 | 4 | 5 | 6;
    const page = is9 ? 32 : is8 ? 24 : 18;

    const tahsin = createDefaultTahsinGrade(
      jilid,
      page,
      'Lulus (Naik Jilid)',
      baseScore,
      is9 
        ? "Tuntas Khatam Iqro' Jilid 6 AMM Yogyakarta. Siap munaqasyah Al-Qur'an dan Tahfiz 3 Juz (28, 29, 30)."
        : is8
        ? "Tuntas materi Iqro' Jilid 6. Mempersiapkan ujian kenaikan jilid dan Tahfiz Juz 29-30."
        : "Tuntas materi tajwid dasar Iqro' Jilid 5-6 dan Tahfiz Juz 30 Mutqin."
    );

    // Provide default tahfiz records for 9C and others
    const tahfizRecords = is9
      ? [
          {
            id: `rec-${student.id}-1`,
            surahNumber: 67,
            surahName: "Al-Mulk",
            juzNumber: 29,
            ayatFrom: 1,
            ayatTo: 30,
            gradeScore: 94,
            predicate: "Mumtaz" as const,
            isMutqin: true,
            date: "2025-11-15",
            examinerTeacherName: "Ust. Mahmud Ali Yafi, S.S, M.Pd.I.",
            notes: "Hafalan lancar dan tajwid mutqin.",
          },
          {
            id: `rec-${student.id}-2`,
            surahNumber: 78,
            surahName: "An-Naba'",
            juzNumber: 30,
            ayatFrom: 1,
            ayatTo: 40,
            gradeScore: 96,
            predicate: "Mumtaz" as const,
            isMutqin: true,
            date: "2025-12-05",
            examinerTeacherName: "Ust. Mahmud Ali Yafi, S.S, M.Pd.I.",
            notes: "Fashahah sangat baik.",
          },
        ]
      : [];

    const totalAyat = tahfizRecords.reduce((acc, r) => acc + (r.ayatTo - r.ayatFrom + 1), 0);
    const targetCount = student.targetSurahCount || (is9 ? 59 : is8 ? 48 : 37);
    const completionPercentage = Math.min(100, Math.round((tahfizRecords.length / targetCount) * 100));

    INITIAL_REPORTS[student.id] = {
      student,
      tahsin,
      tahfizRecords,
      adab: {
        kedisiplinan: 'A',
        adabMushaf: 'A',
        kerajinanMurojaah: 'A',
        semangatHalaqah: 'A',
        generalNotes: `Santri kelas ${student.className} aktif dan istiqamah dalam halaqah Al-Qur'an SMPIA 9.`,
      },
      summaryHafalan: {
        totalSurahLulus: tahfizRecords.length,
        totalAyatHafal: totalAyat,
        juzCompleted: is9 ? [30] : [],
        currentJuzInProgress: is9 ? 29 : is8 ? 29 : 30,
        completionPercentage,
      },
    };
  }
});
