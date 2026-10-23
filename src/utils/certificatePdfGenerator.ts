import jsPDF from 'jspdf';
import { Student, SchoolSettings } from '../types';

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
 * Loads image element safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Generate PDF Sertifikat Kelulusan Tahfiz Per Juz Sesuai Format Resmi Sekolah
 * Template background: /assets/cert_tahfiz_official.png (Kepala Sekolah: Andi Krisdianto, S.Pd.I)
 * Ukuran Kertas: A4 Landscape (297mm x 210mm)
 */
export async function generateCertificatePDF(
  student: Student,
  certData: JuzCertificateData,
  settings: SchoolSettings,
  _teacherName?: string
) {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  try {
    // Siapkan font cursive Google Font jika didukung
    if (typeof document !== 'undefined' && document.fonts) {
      try {
        await Promise.allSettled([
          document.fonts.load("bold 72px 'Great Vibes'"),
          document.fonts.load("bold 72px 'Alex Brush'"),
        ]);
      } catch {
        // Abaikan jika offline / timeout
      }
    }

    // Buat canvas off-screen dengan resolusi tinggi (1550 x 1106)
    const canvas = document.createElement('canvas');
    canvas.width = 1550;
    canvas.height = 1106;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context tidak tersedia');
    }

    // 1. Gambar Template Resmi Sekolah
    // Template ini sudah memuat logo SMP Al Azhar & YPIA, ornamen ribbon navy & emas,
    // judul SERTIFIKAT TAHFIZ JUZIYYAH, logo Cambridge, stempel resmi, tanda tangan,
    // dan nama Kepala Sekolah: Andi Krisdianto, S.Pd.I
    const bgImg = await loadImage('/assets/cert_tahfiz_official.png');
    ctx.drawImage(bgImg, 0, 0, 1550, 1106);

    const centerX = 1550 / 2;

    // 2. Render Nama Santri dalam Kaligrafi Emas Mewah
    // Sesuaikan ukuran font jika nama sangat panjang agar tetap rapi & proporsional
    const nameLength = student.name.length;
    let fontSize = 72;
    if (nameLength > 35) {
      fontSize = 54;
    } else if (nameLength > 25) {
      fontSize = 62;
    }

    ctx.save();
    ctx.font = `italic ${fontSize}px 'Great Vibes', 'Alex Brush', cursive`;
    ctx.fillStyle = '#C59B27';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 2;
    ctx.fillText(student.name, centerX, 545);
    ctx.restore();

    // 3. Render Pernyataan Tasmi' Bil Ghaib
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Baris 1: Selamat telah melaksanakan Tasmi' Al-Qur'an Juz X dalam sekali duduk
    ctx.font = "bold 23px 'Plus Jakarta Sans', 'Arial', sans-serif";
    ctx.fillStyle = '#1e293b';
    ctx.fillText(
      `Selamat telah melaksanakan Tasmi' Al-Qur'an Juz ${certData.juzNumber} dalam sekali duduk`,
      centerX,
      675
    );

    // Baris 2: Semoga penghargaan ini menjadi motivasi untuk menambah dan memelihara hafalan dengan baik.
    ctx.font = "normal 18px 'Plus Jakarta Sans', 'Arial', sans-serif";
    ctx.fillStyle = '#475569';
    ctx.fillText(
      'Semoga penghargaan ini menjadi motivasi untuk menambah dan memelihara hafalan dengan baik.',
      centerX,
      712
    );
    ctx.restore();

    // Export canvas ke JPEG resolusi tinggi
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Tempelkan gambar ke dokumen PDF A4 Landscape tepat 297mm x 210mm
    doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  } catch (err) {
    console.error('Canvas render error, fallback ke jsPDF direct:', err);

    // Fallback: langsung embed gambar background + draw text
    try {
      doc.addImage('/assets/cert_tahfiz_official.png', 'PNG', 0, 0, pageWidth, pageHeight);
    } catch {
      // background solid jika gambar gagal
      doc.setFillColor(254, 252, 246);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(197, 155, 39); // Emas #C59B27
    doc.text(student.name, pageWidth / 2, 105, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Selamat telah melaksanakan Tasmi' Al-Qur'an Juz ${certData.juzNumber} dalam sekali duduk`,
      pageWidth / 2,
      128,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Semoga penghargaan ini menjadi motivasi untuk menambah dan memelihara hafalan dengan baik.',
      pageWidth / 2,
      135,
      { align: 'center' }
    );
  }

  // Jaminan A4: Tepat 1 Halaman
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  // Unduh sertifikat PDF
  const safeName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Sertifikat_Tahfiz_Juz_${certData.juzNumber}_${safeName}.pdf`;
  doc.save(filename);
}
