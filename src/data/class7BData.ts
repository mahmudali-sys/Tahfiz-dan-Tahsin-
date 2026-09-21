import { Student, StudentReportData, IqroMaterialAspect, TahsinPredicate } from '../types';
import { getPredicate } from './quranData';

export const STUDENTS_7B: Student[] = [
  {
    id: "std-7b-1",
    nis: "4309-2425019",
    nisn: "0112425019",
    name: "Adrian Qianno Ikhwani",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-2",
    nis: "4309-2425020",
    nisn: "0112425020",
    name: "Aisyah Nirvana Putri Hargono",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "3",
  },
  {
    id: "std-7b-3",
    nis: "4309-2425021",
    nisn: "0112425021",
    name: "Alby Nayaka Abdillah",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-4",
    nis: "4309-2425022",
    nisn: "0112425022",
    name: "Aldwyn Priya Tungga Iskandar",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-5",
    nis: "4309-2425023",
    nisn: "0112425023",
    name: "Alesha Bellvania Setiawan",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-6",
    nis: "4309-2425024",
    nisn: "0112425024",
    name: "Alfarizqi Fabian Supriyanto",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-7",
    nis: "4309-2425025",
    nisn: "0112425025",
    name: "Azka Alvaro Ramadhan",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "5",
  },
  {
    id: "std-7b-8",
    nis: "4309-2425026",
    nisn: "0112425026",
    name: "Azri Jovian Nusa Barlian",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "ALQ",
  },
  {
    id: "std-7b-9",
    nis: "4309-2425027",
    nisn: "0112425027",
    name: "Enzo Shiro Orvil",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "3",
  },
  {
    id: "std-7b-10",
    nis: "4309-2425028",
    nisn: "0112425028",
    name: "Kenzo Malikha Yusuf",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-11",
    nis: "4309-2425029",
    nisn: "0112425029",
    name: "Larasati Kusuma Candra",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "3",
  },
  {
    id: "std-7b-12",
    nis: "4309-2425030",
    nisn: "0112425030",
    name: "Lunaira Malika Radin",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "3",
  },
  {
    id: "std-7b-13",
    nis: "4309-2425031",
    nisn: "0112425031",
    name: "Nadia Amalia Jatmiko",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "5",
  },
  {
    id: "std-7b-14",
    nis: "4309-2425032",
    nisn: "0112425032",
    name: "Rayhan Afrilio",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "6",
  },
  {
    id: "std-7b-15",
    nis: "4309-2425033",
    nisn: "0112425033",
    name: "Rayhan Rafie Putra Yulianto",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "ALQ",
  },
  {
    id: "std-7b-16",
    nis: "4309-2425034",
    nisn: "0112425034",
    name: "Tangguh Maheswara Harwitodjati",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "5",
  },
  {
    id: "std-7b-17",
    nis: "4309-2425035",
    nisn: "0112425035",
    name: "Zahara Safaa Aziz Khan",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "3",
  },
  {
    id: "std-7b-18",
    nis: "4309-2425036",
    nisn: "0112425036",
    name: "Zavina Carissa Najwa Afifah",
    gender: "P",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "5",
  },
  {
    id: "std-7b-19",
    nis: "4309-2425058",
    nisn: "0112425058",
    name: "Hanan Sakya Waranggana",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "4",
  },
  {
    id: "std-7b-20",
    nis: "4309-2425060",
    nisn: "0112425060",
    name: "Pradipta Raditya Rangga",
    gender: "L",
    className: "7B",
    teacherId: "tch-1",
    targetJuz: "Juz 30 (Tuntas Mutqin)",
    targetSurahCount: 37,
    kelompok: "5",
  },
];

export function create7BReports(): Record<string, StudentReportData> {
  const reports: Record<string, StudentReportData> = {};

  STUDENTS_7B.forEach((student, index) => {
    // Determine completed aspects based on their kelompok and realistic screenshot scores
    const isAlq = student.kelompok === 'ALQ';
    const isK6 = student.kelompok === '6';
    const isK5 = student.kelompok === '5';
    const isK4 = student.kelompok === '4';

    const jilidLevel: 3 | 4 | 5 | 6 = isAlq || isK6 ? 6 : isK5 ? 5 : isK4 ? 4 : 3;

    // Aspects from Jilid 3 to 6
    const aspects: IqroMaterialAspect[] = [
      // Jilid 3
      { key: 'j3_1', name: 'Harokat Kasroh, Dhommah', score: 92 + (index % 3), predicate: 'Mumtaz', criteria: 'Sangat Baik' },
      { key: 'j3_2', name: 'Mad Asli Alif, Wawu & Ya sukun', score: 91 + (index % 4), predicate: 'Mumtaz', criteria: 'Sangat Baik' },
      { key: 'j3_3', name: 'Mad Silah Qoshiroh', score: 90 + (index % 5), predicate: 'Mumtaz', criteria: 'Sangat Baik' },

      // Jilid 4 (if reached)
      ...(jilidLevel >= 4
        ? [
            { key: 'j4_1', name: 'Tanwin Fathah, Kasroh & Dhommah', score: 93 - (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j4_2', name: 'Lin Huruf Ya & Wawu Sukun', score: 90 + (index % 4), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j4_3', name: 'Qolqolah', score: 92 - (index % 4), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j4_4', name: 'Huruf-huruf Sukun/Mati', score: 91 + (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
          ]
        : []),

      // Jilid 5 (if reached)
      ...(jilidLevel >= 5
        ? [
            { key: 'j5_1', name: 'Alif Lam Syamsiyyah & Qomariyyah', score: 90 + (index % 4), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j5_2', name: "Mad 'Aridh Lissukun dan Mad 'Iwad", score: 88 + (index % 5), predicate: 'Jayyid Jiddan' as TahsinPredicate, criteria: 'Baik' },
            { key: 'j5_3', name: 'Waqaf pada Ta Marbutoh', score: 93 - (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j5_4', name: 'Gunnah Nun dan Mim Bertasydid', score: 90 + (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j5_5', name: 'Mad Wajib & Mad Jaiz', score: 92 - (index % 4), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j5_6', name: 'Huruf-huruf bertasydid', score: 91 + (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j5_7', name: 'Mad Lazim Mutsaqqol Kilmi', score: 88 + (index % 5), predicate: 'Jayyid Jiddan' as TahsinPredicate, criteria: 'Baik' },
            { key: 'j5_8', name: 'Lafdzul Jalalah Tafkhim Tarqiq', score: 92 - (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
            { key: 'j5_9', name: 'Idgham Nun, Mim, Lam & Ro', score: 90 + (index % 3), predicate: 'Mumtaz' as TahsinPredicate, criteria: 'Sangat Baik' },
          ]
        : []),

      // Jilid 6 (if reached)
      ...(jilidLevel === 6
        ? [
            { key: 'j6_1', name: 'Idgham Ya & Wawu', score: isAlq ? 92 : 84, predicate: (isAlq ? 'Mumtaz' : 'Jayyid') as TahsinPredicate, criteria: 'Baik' },
            { key: 'j6_2', name: 'Iqlab dan Ikhfa Haqiqi', score: isAlq ? 90 : 82, predicate: (isAlq ? 'Mumtaz' : 'Jayyid') as TahsinPredicate, criteria: 'Baik' },
            { key: 'j6_3', name: 'Tanda-tanda Waqaf', score: isAlq ? 93 : 84, predicate: (isAlq ? 'Mumtaz' : 'Jayyid') as TahsinPredicate, criteria: 'Baik' },
            { key: 'j6_4', name: 'Waqaf yang didahului sukun', score: isAlq ? 93 : 82, predicate: (isAlq ? 'Mumtaz' : 'Jayyid') as TahsinPredicate, criteria: 'Baik' },
            { key: 'j6_5', name: 'Waqaf pada huruf Bertasydid', score: isAlq ? 92 : 80, predicate: (isAlq ? 'Mumtaz' : 'Jayyid') as TahsinPredicate, criteria: 'Baik' },
            { key: 'j6_6', name: "Huruf Muqotho'ah", score: isAlq ? 90 : 82, predicate: (isAlq ? 'Mumtaz' : 'Jayyid') as TahsinPredicate, criteria: 'Baik' },
          ]
        : []),
    ];

    const validScores = aspects.map((a) => a.score);
    const avg = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 88;

    // Tahfiz surahs passed
    const passedSurahCount = isAlq ? 37 : isK6 ? 25 : isK5 ? 18 : 12;
    const tahfizRecords = [];
    for (let sNum = 114; sNum > 114 - passedSurahCount; sNum--) {
      const score = 85 + (sNum % 11);
      tahfizRecords.push({
        id: `rec-7b-${student.id}-${sNum}`,
        surahNumber: sNum,
        surahName: `Surat ke-${sNum}`,
        juzNumber: 30,
        ayatFrom: 1,
        ayatTo: 10,
        gradeScore: score,
        predicate: getPredicate(score),
        isMutqin: true,
        date: '2025-12-20',
        examinerTeacherName: 'Ust. Muhammad Ridwan, S.Pd.I, Al-Hafiz',
      });
    }

    reports[student.id] = {
      student,
      tahsin: {
        jilid: jilidLevel,
        halaman: 25,
        jilidStatus: isAlq ? 'Lulus (Naik Jilid)' : 'Sedang Ditempuh',
        averageScore: avg,
        overallPredicate: getPredicate(avg),
        levelBook: `Iqro' Jilid ${jilidLevel} - AMM Yogyakarta`,
        notes: `Santri menunjukkan ketekunan dalam tajwid dan fashahah makharijul huruf pada tingkat Iqro' ${jilidLevel}.`,
        lastUpdated: '2025-12-22',
        aspects,
        makharijulHuruf: avg + 1,
        ahkamutTajwid: avg,
        ahkamulWaqf: avg - 1,
        fashahahTartil: avg,
      },
      tahfizRecords,
      adab: {
        kedisiplinan: 'A',
        adabMushaf: 'A',
        kerajinanMurojaah: 'A',
        semangatHalaqah: 'A',
        generalNotes: 'Menjaga adab terhadap mushaf dan selalu hadir tepat waktu di halaqah tahfiz.',
      },
      summaryHafalan: {
        totalSurahLulus: tahfizRecords.length,
        totalAyatHafal: tahfizRecords.length * 8,
        juzCompleted: isAlq ? [30] : [],
        currentJuzInProgress: 30,
        completionPercentage: Math.min(100, Math.round((tahfizRecords.length / 37) * 100)),
      },
    };
  });

  return reports;
}
