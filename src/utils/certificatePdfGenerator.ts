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
 * Mengambil data base64 dari kop surat resmi untuk rendering PDF
 */
async function getKopImageDataUrl(): Promise<string> {
  if (typeof document !== 'undefined') {
    const imgEl = document.getElementById('certificate-official-kop') as HTMLImageElement | null;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgEl, 0, 0);
          return canvas.toDataURL('image/jpeg', 0.95);
        }
      } catch (e) {
        console.warn('Canvas export kop error:', e);
      }
    }
  }

  if (typeof window !== 'undefined') {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
            return;
          }
        } catch {
          // ignore
        }
        resolve('/assets/aistudio/IMG_1417_e831045f.jpeg');
      };
      img.onerror = () => resolve('/assets/aistudio/IMG_1417_e831045f.jpeg');
      img.src = '/assets/aistudio/IMG_1417_e831045f.jpeg';
    });
  }

  return '/assets/aistudio/IMG_1417_e831045f.jpeg';
}

/**
 * Generate PDF Sertifikat Kelulusan Tahfiz Per Juz (Ukuran Kertas A4 Landscape)
 */
export async function generateCertificatePDF(
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

  // 2. KOP SURAT RESMI (AL MUHAJIRIEN JAKAPERMAI WAQF FOUNDATION - AL AZHAR 9)
  // Rasio gambar kop asli: 1858 x 461 (~4.03)
  const kopWidth = 158;
  const kopHeight = 39.2;
  const kopX = (pageWidth - kopWidth) / 2;
  const kopY = 15;

  let kopSuccess = false;
  try {
    const kopData = await getKopImageDataUrl();
    if (kopData) {
      doc.addImage(kopData, 'JPEG', kopX, kopY, kopWidth, kopHeight);
      kopSuccess = true;
    }
  } catch (err) {
    console.warn('Gagal memuat gambar kop resmi di PDF:', err);
  }

  if (!kopSuccess) {
    // Fallback kop teks resmi Al Muhajirien & Al Azhar 9
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 90, 54);
    doc.text('AL MUHAJIRIEN JAKAPERMAI WAQF FOUNDATION', pageWidth / 2, 19, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setTextColor(0, 102, 153);
    doc.text('MANAGE', pageWidth / 2, 23, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(0, 90, 54);
    doc.text('AL AZHAR 9 ISLAMIC JUNIOR HIGH SCHOOL', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(0, 102, 153);
    doc.text('NPSN : 60728504  “A” ACCREDITED  NSS : 204022501131', pageWidth / 2, 32.5, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(40, 50, 45);
    doc.text('Jl. Kemang Pratama Raya - Kemang Pratama, Bekasi 17116', pageWidth / 2, 36, { align: 'center' });
    doc.text('Phone Number. 021-82421942   website : https://smpia9.sch.id.   Email : info@smpia9.sch.id', pageWidth / 2, 39, { align: 'center' });

    // Garis Ganda Hijau
    doc.setDrawColor(0, 90, 54);
    doc.setLineWidth(0.3);
    doc.line(22, 42, pageWidth - 22, 42);
    doc.setLineWidth(1.0);
    doc.line(22, 43.5, pageWidth - 22, 43.5);
  }

  // 3. JUDUL SERTIFIKAT & NOMOR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 81, 50); // Emerald Green
  doc.text('SYAHADAH TAHFIZ AL-QUR\'AN', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(184, 134, 11);
  doc.text('SERTIFIKAT KELULUSAN HAFALAN TAHFIZ PER JUZ', pageWidth / 2, 65, { align: 'center' });

  // Nomor Sertifikat Resmi
  const certNumber = certData.certificateNumber || `09/TAHFIZ/SMPIA-9/J.${certData.juzNumber}/${new Date().getFullYear()}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nomor: ${certNumber}`, pageWidth / 2, 69.5, { align: 'center' });

  // 4. BADAN SERTIFIKAT
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Direktorat Pendidikan SMP Islam Al Azhar 9 Bekasi menerangkan dengan sesungguhnya bahwa:', pageWidth / 2, 76.5, { align: 'center' });

  // Nama Siswa (Elegan & Menonjol)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(student.name.toUpperCase(), pageWidth / 2, 85, { align: 'center' });

  // Garis bawah emas di bawah nama
  const nameWidth = doc.getTextWidth(student.name.toUpperCase());
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - nameWidth / 2 - 4, 87, pageWidth / 2 + nameWidth / 2 + 4, 87);

  // Identitas Siswa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const studentMetaText = `NISN: ${student.nisn || '-'}   •   NIS: ${student.nis || '-'}   •   Kelas: ${student.className}`;
  doc.text(studentMetaText, pageWidth / 2, 92, { align: 'center' });

  // Pernyataan Kelulusan
  doc.text('Telah mengikuti Ujian Tasmi\' Bil Ghaib dan dinyatakan memenuhi standar kompetensi tahfiz dengan predikat:', pageWidth / 2, 98, { align: 'center' });

  // BADGE PENCAPAIAN JUZ & PREDIKAT
  const boxWidth = 224;
  const boxHeight = 25;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxY = 101.5;

  // Background box pencapaian
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'S');

  // Judul Juz
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(0, 102, 153);
  const juzFullTitle = `LULUS MUTQIN: JUZ ${certData.juzNumber} (${certData.juzName.toUpperCase()})`;
  doc.text(juzFullTitle, pageWidth / 2, boxY + 7.5, { align: 'center' });

  // Rincian Cakupan Surat
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const rangeInfo = `${certData.surahRange} (${certData.totalSurah} Surah • ${certData.totalAyat} Ayat)`;
  doc.text(rangeInfo, pageWidth / 2, boxY + 13.5, { align: 'center' });

  // Skor dan Predikat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(184, 134, 11);
  const scoreInfo = `Nilai Tasmi': ${certData.score}   •   Predikat: ${certData.predicate.toUpperCase()}   •   Status: MUTQIN`;
  doc.text(scoreInfo, pageWidth / 2, boxY + 20, { align: 'center' });

  // Do'a / Harapan
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const doaText = '"Semoga hafalan Al-Qur\'an yang telah diselesaikan senantiasa terjaga di dalam dada, menjadi syafa\'at di yaumil akhir, serta berakhlak mulia dengan nilai-nilai Al-Qur\'an."';
  doc.text(doaText, pageWidth / 2, 131, { align: 'center' });

  // 5. TANGGAL & TANDA TANGAN RESMI KEPALA SEKOLAH (TUNGGAL, KANAN BAWAH)
  const footerY = 139;
  const colRightX = pageWidth - 65;

  // Tanggal di atas tanda tangan Kepala Sekolah
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const certDateStr = certData.date ? formatToIndonesianDate(certData.date, true) : '20 Oktober 2026';
  doc.text(`Bekasi, ${certDateStr}`, colRightX, footerY, { align: 'center' });

  // Jabatan: Kepala Sekolah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Kepala SMP Islam Al Azhar 9 Bekasi', colRightX, footerY + 5.5, { align: 'center' });

  // Nama Kepala Sekolah — Andi Krisdianto, S.Pd.I
  const principalName = settings.principalName || 'Andi Krisdianto, S.Pd.I';
  const principalNip = settings.principalNip || '19760812 200212 1 003';
  const nameSignY = footerY + 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(principalName, colRightX, nameSignY, { align: 'center' });
  const princWidth = doc.getTextWidth(principalName);
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
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
