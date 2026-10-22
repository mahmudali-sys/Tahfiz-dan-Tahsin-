import jsPDF from 'jspdf';
import { Student, SchoolSettings, TahfizSurahRecord } from '../types';
import { drawAlAzharLogo, drawYPIALogo } from './pdfGenerator';
import { formatToIndonesianDate } from '../components/IndonesianDatePicker';

export interface JuzCertificateData {
  juzNumber: number;
  juzName: string;
  surahRange: string;
  totalSurah: number;
  totalAyat: number;
  score: number;
  predicate: string;
  date: string;
  certificateNumber?: string;
}

export const JUZ_METADATA: Record<number, { name: string; range: string; totalSurah: number; totalAyat: number }> = {
  1: {
    name: "ALIF LAM MIM",
    range: "Surat Al-Fatihah: 1 s.d. Surat Al-Baqarah: 141",
    totalSurah: 2,
    totalAyat: 148,
  },
  2: {
    name: "SAYAQUULU",
    range: "Surat Al-Baqarah: 142 s.d. Surat Al-Baqarah: 252",
    totalSurah: 1,
    totalAyat: 111,
  },
  3: {
    name: "TILKAR RUSUL",
    range: "Surat Al-Baqarah: 253 s.d. Surat Ali 'Imran: 92",
    totalSurah: 2,
    totalAyat: 126,
  },
  4: {
    name: "LAN TANAALU",
    range: "Surat Ali 'Imran: 93 s.d. Surat An-Nisa': 23",
    totalSurah: 2,
    totalAyat: 131,
  },
  5: {
    name: "WAL MUHSHANATU",
    range: "Surat An-Nisa': 24 s.d. Surat An-Nisa': 147",
    totalSurah: 1,
    totalAyat: 124,
  },
  6: {
    name: "LA YUHIBBULLAH",
    range: "Surat An-Nisa': 148 s.d. Surat Al-Ma'idah: 81",
    totalSurah: 2,
    totalAyat: 110,
  },
  7: {
    name: "WA IDZA SAMI'U",
    range: "Surat Al-Ma'idah: 82 s.d. Surat Al-An'am: 110",
    totalSurah: 2,
    totalAyat: 149,
  },
  8: {
    name: "WA LAW ANNANA",
    range: "Surat Al-An'am: 111 s.d. Surat Al-A'raf: 87",
    totalSurah: 2,
    totalAyat: 142,
  },
  9: {
    name: "QALAL MALA'U",
    range: "Surat Al-A'raf: 88 s.d. Surat Al-Anfal: 40",
    totalSurah: 2,
    totalAyat: 159,
  },
  10: {
    name: "WA'LAMU",
    range: "Surat Al-Anfal: 41 s.d. Surat At-Taubah: 92",
    totalSurah: 2,
    totalAyat: 127,
  },
  11: {
    name: "YA'TADZIRUUN",
    range: "Surat At-Taubah: 93 s.d. Surat Hud: 5",
    totalSurah: 3,
    totalAyat: 151,
  },
  12: {
    name: "WA MA MIN DAABBAH",
    range: "Surat Hud: 6 s.d. Surat Yusuf: 52",
    totalSurah: 2,
    totalAyat: 170,
  },
  13: {
    name: "WA MA UBARRII",
    range: "Surat Yusuf: 53 s.d. Surat Ibrahim: 52",
    totalSurah: 3,
    totalAyat: 154,
  },
  14: {
    name: "RUBA'MA",
    range: "Surat Al-Hijr: 1 s.d. Surat An-Nahl: 128",
    totalSurah: 2,
    totalAyat: 227,
  },
  15: {
    name: "SUBHANALLADZI",
    range: "Surat Al-Isra': 1 s.d. Surat Al-Kahf: 74",
    totalSurah: 2,
    totalAyat: 185,
  },
  16: {
    name: "QALA ALAM",
    range: "Surat Al-Kahf: 75 s.d. Surat Ta-Ha: 135",
    totalSurah: 3,
    totalAyat: 269,
  },
  17: {
    name: "IQTARABA",
    range: "Surat Al-Anbiya': 1 s.d. Surat Al-Hajj: 78",
    totalSurah: 2,
    totalAyat: 190,
  },
  18: {
    name: "QAD AFLAHA",
    range: "Surat Al-Mu'minun: 1 s.d. Surat Al-Furqan: 20",
    totalSurah: 3,
    totalAyat: 202,
  },
  19: {
    name: "WA QALAL LADZINA",
    range: "Surat Al-Furqan: 21 s.d. Surat An-Naml: 55",
    totalSurah: 3,
    totalAyat: 339,
  },
  20: {
    name: "AMMAN KHALAQA",
    range: "Surat An-Naml: 56 s.d. Surat Al-'Ankabut: 45",
    totalSurah: 3,
    totalAyat: 171,
  },
  21: {
    name: "UT-LU MA UUHIYA",
    range: "Surat Al-'Ankabut: 46 s.d. Surat Al-Ahzab: 30",
    totalSurah: 5,
    totalAyat: 178,
  },
  22: {
    name: "WA MAN YAQNUT",
    range: "Surat Al-Ahzab: 31 s.d. Surat Yasin: 27",
    totalSurah: 4,
    totalAyat: 169,
  },
  23: {
    name: "WA MA LIYA",
    range: "Surat Yasin: 28 s.d. Surat Az-Zumar: 31",
    totalSurah: 4,
    totalAyat: 357,
  },
  24: {
    name: "FAMAN AZHLAMU",
    range: "Surat Az-Zumar: 32 s.d. Surat Fushshilat: 46",
    totalSurah: 3,
    totalAyat: 175,
  },
  25: {
    name: "ILAIHI YURADDU",
    range: "Surat Fushshilat: 47 s.d. Surat Al-Jatsiyah: 37",
    totalSurah: 5,
    totalAyat: 246,
  },
  26: {
    name: "HA MIM",
    range: "Surat Al-Ahqaf: 1 s.d. Surat Adz-Dzariyat: 30",
    totalSurah: 6,
    totalAyat: 195,
  },
  27: {
    name: "QALA FAMA KHATHBUKUM",
    range: "Surat Adz-Dzariyat: 31 s.d. Surat Al-Hadid: 29",
    totalSurah: 7,
    totalAyat: 399,
  },
  28: {
    name: "QAD SAMI'A",
    range: "Surat Al-Mujadilah: 1 s.d. Surat At-Tahrim: 12",
    totalSurah: 9,
    totalAyat: 137,
  },
  29: {
    name: "TABARAK",
    range: "Surat Al-Mulk: 1 s.d. Surat Al-Mursalat: 50",
    totalSurah: 11,
    totalAyat: 431,
  },
  30: {
    name: "'AMMA YATASA'ALUUN (JUZ 'AMMA)",
    range: "Surat An-Naba': 1 s.d. Surat An-Nas: 6",
    totalSurah: 37,
    totalAyat: 564,
  },
};

export function getJuzMetadata(juzNumber: number) {
  return JUZ_METADATA[juzNumber] || {
    name: `JUZ ${juzNumber}`,
    range: `Khatam Hafalan Juz ${juzNumber}`,
    totalSurah: 1,
    totalAyat: 100,
  };
}

/**
 * Generate PDF Sertifikat Kelulusan Tahfiz Per Juz (Ukuran Kertas A4 Landscape)
 */
export function generateCertificatePDF(
  student: Student,
  certData: JuzCertificateData,
  settings: SchoolSettings,
  teacherName?: string
) {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. BACKGROUND ELEGAN & ISLAMIC ORNAMENTAL BORDER
  // Latar belakang gading lembut
  doc.setFillColor(254, 252, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Bingkai luar emas tebal
  doc.setDrawColor(184, 134, 11); // Dark Goldenrod
  doc.setLineWidth(1.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Garis tipis aksen emas
  doc.setDrawColor(218, 165, 32); // Goldenrod
  doc.setLineWidth(0.5);
  doc.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);

  // Bingkai dalam hijau Al-Azhar
  doc.setDrawColor(0, 102, 153); // Al-Azhar Blue/Teal
  doc.setLineWidth(0.8);
  doc.rect(12.5, 12.5, pageWidth - 25, pageHeight - 25);

  // Ornamen Sudut (Corner Geometric Flourishes)
  const drawCornerDeco = (cx: number, cy: number, signX: number, signY: number) => {
    doc.setFillColor(184, 134, 11);
    doc.rect(cx - 3 * signX, cy - 3 * signY, 6 * signX, 6 * signY, 'F');
    doc.setFillColor(0, 102, 153);
    doc.circle(cx, cy, 2, 'F');
    doc.setFillColor(245, 195, 45);
    doc.circle(cx, cy, 1, 'F');
  };
  drawCornerDeco(12.5, 12.5, 1, 1);
  drawCornerDeco(pageWidth - 12.5, 12.5, -1, 1);
  drawCornerDeco(12.5, pageHeight - 12.5, 1, -1);
  drawCornerDeco(pageWidth - 12.5, pageHeight - 12.5, -1, -1);

  // 2. KOP RESMI AL-AZHAR (SESUAI RAPOT)
  const logoSize = 18;
  const logoY = 16;
  const leftLogoX = 24;
  const rightLogoX = pageWidth - 24 - logoSize;

  // Render logo kiri (Sekolah Al-Azhar)
  const renderLogo = (logoSrc: string | undefined, x: number, y: number, fallback: () => void) => {
    if (!logoSrc) {
      fallback();
      return;
    }
    try {
      let fmt = 'PNG';
      if (logoSrc.includes('image/jpeg') || logoSrc.includes('image/jpg')) fmt = 'JPEG';
      doc.addImage(logoSrc, fmt, x, y, logoSize, logoSize);
    } catch {
      fallback();
    }
  };

  renderLogo(settings.schoolLogo, leftLogoX, logoY, () => {
    drawAlAzharLogo(doc, leftLogoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2);
  });

  renderLogo(settings.foundationLogo, rightLogoX, logoY, () => {
    drawYPIALogo(doc, rightLogoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2);
  });

  // Teks Header Kop Tengah (Sesuai Rapot)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('YAYASAN PESANTREN ISLAM AL-AZHAR', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('DIREKTORAT PENDIDIKAN DASAR DAN MENENGAH', pageWidth / 2, 23, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(0, 102, 153);
  doc.text(settings.schoolName || 'SMP ISLAM AL AZHAR 9 BEKASI', pageWidth / 2, 28.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text('STATUS TERAKREDITASI "A"', pageWidth / 2, 32.5, { align: 'center' });
  doc.text(settings.address || 'Jl. Kemang Pratama Raya No. 1, Rawalumbu, Kota Bekasi 17116 Telp. (021) 82414144', pageWidth / 2, 36, { align: 'center' });

  // Garis Pembatas Ganda Kop Surat (Tebal atas, tipis bawah sesuai Rapot Resmi)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(22, 39, pageWidth - 22, 39);

  doc.setLineWidth(0.25);
  doc.line(22, 39.8, pageWidth - 22, 39.8);

  // 3. JUDUL SERTIFIKAT & NOMOR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 81, 50); // Emerald Green
  doc.text('SYAHADAH TAHFIZ AL-QUR\'AN', pageWidth / 2, 48, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(184, 134, 11);
  doc.text('SERTIFIKAT KELULUSAN HAFALAN TAHFIZ PER JUZ', pageWidth / 2, 53, { align: 'center' });

  // Nomor Sertifikat Resmi
  const certNumber = certData.certificateNumber || `09/TAHFIZ/SMPIA-9/J.${certData.juzNumber}/${new Date().getFullYear()}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nomor: ${certNumber}`, pageWidth / 2, 57.5, { align: 'center' });

  // 4. BADAN SERTIFIKAT
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Direktorat Pendidikan SMP Islam Al Azhar 9 Bekasi menerangkan dengan sesungguhnya bahwa:', pageWidth / 2, 65, { align: 'center' });

  // Nama Siswa (Elegan & Menonjol)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(student.name.toUpperCase(), pageWidth / 2, 74, { align: 'center' });

  // Garis bawah emas di bawah nama
  const nameWidth = doc.getTextWidth(student.name.toUpperCase());
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - nameWidth / 2 - 4, 76, pageWidth / 2 + nameWidth / 2 + 4, 76);

  // Identitas Siswa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const studentMetaText = `NISN: ${student.nisn || '-'}   •   NIS: ${student.nis || '-'}   •   Kelas: ${student.className}`;
  doc.text(studentMetaText, pageWidth / 2, 81.5, { align: 'center' });

  // Pernyataan Kelulusan
  doc.text('Telah mengikuti Ujian Tasmi\' Bil Ghaib dan dinyatakan memenuhi standar kompetensi tahfiz dengan predikat:', pageWidth / 2, 88.5, { align: 'center' });

  // BADGE PENCAPAIAN JUZ & PREDIKAT
  const boxWidth = 230;
  const boxHeight = 27;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxY = 92;

  // Background box pencapaian
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'S');

  // Judul Juz
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(0, 102, 153);
  const juzFullTitle = `LULUS MUTQIN: JUZ ${certData.juzNumber} (${certData.juzName.toUpperCase()})`;
  doc.text(juzFullTitle, pageWidth / 2, boxY + 8, { align: 'center' });

  // Rincian Cakupan Surat
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const rangeInfo = `${certData.surahRange} (${certData.totalSurah} Surah • ${certData.totalAyat} Ayat)`;
  doc.text(rangeInfo, pageWidth / 2, boxY + 14, { align: 'center' });

  // Skor dan Predikat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(184, 134, 11);
  const scoreInfo = `Nilai Tasmi': ${certData.score}   •   Predikat: ${certData.predicate.toUpperCase()}   •   Status: MUTQIN`;
  doc.text(scoreInfo, pageWidth / 2, boxY + 21, { align: 'center' });

  // Do'a / Harapan
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const doaText = '"Semoga hafalan Al-Qur\'an yang telah diselesaikan senantiasa terjaga di dalam dada, menjadi syafa\'at di yaumil akhir, serta berakhlak mulia dengan nilai-nilai Al-Qur\'an."';
  doc.text(doaText, pageWidth / 2, 126, { align: 'center' });

  // 5. TANGGAL & TANDA TANGAN RESMI
  const footerY = 135;
  const colLeftX = 60;
  const colRightX = pageWidth - 60;

  // Tanggal di kanan atas tanda tangan Kepala Sekolah
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const certDateStr = certData.date ? formatToIndonesianDate(certData.date, true) : '20 Oktober 2026';
  doc.text(`Bekasi, ${certDateStr}`, colRightX, footerY, { align: 'center' });

  // Jabatan Kiri: Koordinator Tahfiz
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', colLeftX, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Koordinator Tahfiz Al-Qur\'an', colLeftX, footerY + 9.5, { align: 'center' });

  // Jabatan Kanan: Kepala Sekolah
  doc.setFont('helvetica', 'normal');
  doc.text('Mengesahkan,', colRightX, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala SMP Islam Al Azhar 9 Bekasi', colRightX, footerY + 9.5, { align: 'center' });

  // Ruang Tanda Tangan & Cap Stempel
  // Cap Stempel Bulat Emas di tengah bawah
  const stampX = pageWidth / 2;
  const stampY = footerY + 18;
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.6);
  doc.circle(stampX, stampY, 11);
  doc.setLineWidth(0.2);
  doc.circle(stampX, stampY, 9.8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(184, 134, 11);
  doc.text('SMP ISLAM AL AZHAR 9', stampX, stampY - 4, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(15, 81, 50);
  doc.text('★ MUTQIN ★', stampX, stampY + 0.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(184, 134, 11);
  doc.text('TAHFIZ QUR\'AN', stampX, stampY + 5, { align: 'center' });

  // Nama Pejabat Tanda Tangan
  const nameSignY = footerY + 34;

  // Nama Koordinator Tahfiz (Kiri)
  const coordinatorName = settings.coordinatorName || teacherName || 'Mahmud Ali Yafi, S.S, M.Pd.I.';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(coordinatorName, colLeftX, nameSignY, { align: 'center' });
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  const coordWidth = doc.getTextWidth(coordinatorName);
  doc.line(colLeftX - coordWidth / 2, nameSignY + 1.2, colLeftX + coordWidth / 2, nameSignY + 1.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NIP. 19850612 201101 1 003', colLeftX, nameSignY + 5, { align: 'center' });

  // Nama Kepala Sekolah (Kanan) — Andi Krisdianto, S.Pd.I
  const principalName = settings.principalName || 'Andi Krisdianto, S.Pd.I';
  const principalNip = settings.principalNip || '19760812 200212 1 003';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(principalName, colRightX, nameSignY, { align: 'center' });
  const princWidth = doc.getTextWidth(principalName);
  doc.line(colRightX - princWidth / 2, nameSignY + 1.2, colRightX + princWidth / 2, nameSignY + 1.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`NIP. ${principalNip}`, colRightX, nameSignY + 5, { align: 'center' });

  // GARANSI STANDAR KERTAS A4: Sertifikat Harus Tepat 1 Lembar Saja!
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  // Simpan file sertifikat PDF
  const safeName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Sertifikat_Tahfiz_Juz_${certData.juzNumber}_${safeName}.pdf`;
  doc.save(filename);
}
