import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentReportData, SchoolSettings } from '../types';
import {
  ALAZHAR_TAHSIN_CURRICULUM,
  getTahsinCurriculum,
  getTahfizTableConfig,
  TahfizScopeMode,
  TahfizColumnCell,
  getLetterScore,
  RENTANG_NILAI_STANDARDS,
  getAutomatedTahsinJilidNote,
} from '../data/alazharReportFormat';

function drawAlAzharLogo(doc: jsPDF, x: number, y: number, radius: number) {
  // Outer Blue Circle
  doc.setFillColor(0, 102, 153);
  doc.circle(x, y, radius, 'F');

  // White Ring
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y, radius * 0.88, 'F');

  // Middle Blue Fill
  doc.setFillColor(0, 102, 153);
  doc.circle(x, y, radius * 0.78, 'F');

  // Golden Crescent
  doc.setFillColor(245, 195, 45);
  doc.circle(x - radius * 0.08, y, radius * 0.48, 'F');
  doc.setFillColor(0, 102, 153);
  doc.circle(x + radius * 0.12, y - radius * 0.05, radius * 0.42, 'F');

  // Star / Core
  doc.setFillColor(245, 195, 45);
  doc.circle(x + radius * 0.15, y - radius * 0.05, radius * 0.12, 'F');
}

function drawYPIALogo(doc: jsPDF, x: number, y: number, radius: number) {
  // Outer Green Circle
  doc.setFillColor(0, 128, 64);
  doc.circle(x, y, radius, 'F');

  // White Ring
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y, radius * 0.88, 'F');

  // Middle Green Fill
  doc.setFillColor(0, 128, 64);
  doc.circle(x, y, radius * 0.78, 'F');

  // White Mosque Dome Motif
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y + radius * 0.05, radius * 0.45, 'F');
  doc.setFillColor(0, 128, 64);
  doc.circle(x, y - radius * 0.15, radius * 0.38, 'F');

  // White Crescent on top
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y - radius * 0.28, radius * 0.14, 'F');
  doc.setFillColor(0, 128, 64);
  doc.circle(x, y - radius * 0.23, radius * 0.11, 'F');
}

export function generateRapotPDF(
  reportData: StudentReportData,
  settings: SchoolSettings,
  teacherName?: string,
  startJilid: number = 1,
  tahfizScope: TahfizScopeMode = 'all'
) {
  // A4 Portrait: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { student, tahsin, tahfizRecords } = reportData;
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 10;
  const rightMargin = 10;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 190 mm

  let currentY = 8;

  // 1. HEADER DENGAN LOGO KIRI & KANAN (Universal untuk Seluruh Rapot Santri)
  const logoBoxSize = 14; // Diperbesar dari 10mm menjadi 14mm agar terlihat proporsional dan jelas
  const logoRadius = 7;
  const logoInsetX = 14; // Digeser ke tengah sebesar 14mm dari batas margin tepi

  // Dapatkan logo terbaru dari settings atau persistent storage agar berlaku untuk semua murid
  let effectiveSchoolLogo = settings.schoolLogo;
  let effectiveFoundationLogo = settings.foundationLogo;
  if (!effectiveSchoolLogo || !effectiveFoundationLogo) {
    try {
      const stored = localStorage.getItem('SMPIA9_SCHOOL_SETTINGS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!effectiveSchoolLogo && parsed.schoolLogo) effectiveSchoolLogo = parsed.schoolLogo;
        if (!effectiveFoundationLogo && parsed.foundationLogo) effectiveFoundationLogo = parsed.foundationLogo;
      }
    } catch {}
  }

  const renderLogoSafely = (
    docInstance: jsPDF,
    logoSrc: string | undefined,
    x: number,
    y: number,
    size: number,
    fallbackDraw: () => void
  ) => {
    if (!logoSrc) {
      fallbackDraw();
      return;
    }
    try {
      let format = 'PNG';
      if (logoSrc.includes('image/jpeg') || logoSrc.includes('image/jpg') || /\.jpe?g($|\?)/i.test(logoSrc)) {
        format = 'JPEG';
      } else if (logoSrc.includes('image/webp') || /\.webp($|\?)/i.test(logoSrc)) {
        format = 'WEBP';
      }
      docInstance.addImage(logoSrc, format, x, y, size, size);
    } catch {
      try {
        docInstance.addImage(logoSrc, undefined as any, x, y, size, size);
      } catch {
        fallbackDraw();
      }
    }
  };

  // Logo Sekolah (Kiri - diperbesar & digeser ke tengah)
  renderLogoSafely(doc, effectiveSchoolLogo, leftMargin + logoInsetX, currentY, logoBoxSize, () => {
    drawAlAzharLogo(doc, leftMargin + logoInsetX + logoRadius, currentY + logoRadius, logoRadius);
  });

  // Logo Yayasan (Kanan - diperbesar & digeser ke tengah)
  renderLogoSafely(
    doc,
    effectiveFoundationLogo,
    pageWidth - rightMargin - logoBoxSize - logoInsetX,
    currentY,
    logoBoxSize,
    () => {
      drawYPIALogo(doc, pageWidth - rightMargin - logoInsetX - logoRadius, currentY + logoRadius, logoRadius);
    }
  );

  // Nomor Halaman / Seri di pojok kanan atas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(settings.pageNumber || '11', pageWidth - rightMargin - 1, currentY + 2.5, { align: 'right' });

  // Teks Kop Tengah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 15, 15);
  doc.text('LAPORAN HASIL BELAJAR TAHFIZ DAN TAHSIN', pageWidth / 2, currentY + 3.5, { align: 'center' });

  currentY += 4.5;
  doc.setFontSize(10.5);
  doc.text(settings.schoolName || 'SMP ISLAM AL AZHAR 9 BEKASI', pageWidth / 2, currentY + 3.5, { align: 'center' });

  currentY += 4.5;
  doc.setFontSize(8.8);
  doc.text(`TAHUN PELAJARAN ${settings.academicYear || '2025/2026'}`, pageWidth / 2, currentY + 3.5, { align: 'center' });

  currentY += 7.5;

  // 2. IDENTITAS SISWA (2 Kolom Bersih, Tanpa Kotak Tebal)
  const colLeftLabelX = leftMargin;
  const colLeftValX = leftMargin + 32;
  const colRightLabelX = leftMargin + 110;
  const colRightValX = leftMargin + 130;

  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);

  // Baris 1: Nama Peserta Didik & Kelas
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Peserta Didik', colLeftLabelX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${student.name}`, colLeftValX, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Kelas', colRightLabelX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${student.className}`, colRightValX, currentY);

  currentY += 3.6;

  // Baris 2: Nomor Induk Siswa & Semester
  doc.setFont('helvetica', 'bold');
  doc.text('Nomor Induk Siswa', colLeftLabelX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${student.nis}`, colLeftValX, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Semester', colRightLabelX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${settings.semester || 'I (Satu)'}`, colRightValX, currentY);

  currentY += 4.2;

  // 3. A. MATERI PELAJARAN -> 1. TAHSIN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 15, 15);
  doc.text('A. Materi Pelajaran', leftMargin, currentY);
  currentY += 3.4;
  doc.text('1. Tahsin', leftMargin + 2, currentY);
  currentY += 1.2;

  // BANGUN TABEL TAHSIN (Mulai dari Jilid 1 sampai 6 Sesuai Permintaan)
  const curriculum = getTahsinCurriculum(startJilid);
  const totalTahsinAspectRows = curriculum.reduce((sum, g) => sum + g.aspects.length, 0);

  // Bangun body row dengan rowSpan presisi
  const tahsinTableBody: any[] = [];
  let isFirstRowOfAll = true;

  curriculum.forEach((jilidGroup) => {
    const jilidRowsCount = jilidGroup.aspects.length;

    // Hitung rata-rata nilai jilid ini untuk catatan otomatis
    let jilidScoreSum = 0;
    jilidGroup.aspects.forEach((asp) => {
      let sc = asp.defaultScore;
      if (tahsin.aspects && tahsin.aspects.length > 0) {
        const found = tahsin.aspects.find(
          (a) => a.key === asp.id || a.name.toLowerCase().includes(asp.name.toLowerCase().slice(0, 10))
        );
        if (found) sc = found.score;
        else if (tahsin.jilidHistory && tahsin.jilidHistory[jilidGroup.jilid as any]?.score) {
          sc = tahsin.jilidHistory[jilidGroup.jilid as any].score;
        }
      } else if (tahsin.jilidHistory && tahsin.jilidHistory[jilidGroup.jilid as any]?.score) {
        sc = tahsin.jilidHistory[jilidGroup.jilid as any].score;
      }
      jilidScoreSum += sc;
    });
    const jilidAvgScore = Math.round(jilidScoreSum / jilidRowsCount);
    const jilidAutoNote = getAutomatedTahsinJilidNote(
      jilidGroup.jilid,
      jilidAvgScore,
      student.name,
      tahsin.jilidHistory?.[jilidGroup.jilid as any]?.notes
    );

    jilidGroup.aspects.forEach((aspect, aIdx) => {
      const isFirstOfJilid = aIdx === 0;

      // Cari apakah student memiliki nilai spesifik pada aspek ini
      let scoreNum = aspect.defaultScore;
      if (tahsin.aspects && tahsin.aspects.length > 0) {
        const found = tahsin.aspects.find(
          (a) => a.key === aspect.id || a.name.toLowerCase().includes(aspect.name.toLowerCase().slice(0, 10))
        );
        if (found) {
          scoreNum = found.score;
        }
      } else if (tahsin.jilidHistory && tahsin.jilidHistory[jilidGroup.jilid as any]) {
        const histScore = tahsin.jilidHistory[jilidGroup.jilid as any]?.score;
        if (histScore && histScore > 0) scoreNum = histScore;
      }

      const letterGrade = getLetterScore(scoreNum);

      const rowCells: any[] = [];

      // No (Rowspan untuk seluruh tabel Tahsin)
      if (isFirstRowOfAll) {
        rowCells.push({
          content: '1',
          rowSpan: totalTahsinAspectRows,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' },
        });
        // Mata Pelajaran (Rowspan untuk seluruh tabel Tahsin)
        rowCells.push({
          content: 'Tahsin',
          rowSpan: totalTahsinAspectRows,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' },
        });
        isFirstRowOfAll = false;
      }

      // Jilid (Rowspan per jilid)
      if (isFirstOfJilid) {
        rowCells.push({
          content: jilidGroup.jilidLabel,
          rowSpan: jilidRowsCount,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' },
        });
      }

      // Aspek Penilaian: Materi Iqra'
      rowCells.push({
        content: aspect.name,
        styles: { halign: 'left', valign: 'middle' },
      });

      // Aspek Penilaian: Angka
      rowCells.push({
        content: scoreNum.toString(),
        styles: { halign: 'center', valign: 'middle', fontStyle: 'normal' },
      });

      // Aspek Penilaian: Huruf
      rowCells.push({
        content: letterGrade,
        styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' },
      });

      // Keterangan Kenaikan Jilid (Rowspan per jilid)
      if (isFirstOfJilid) {
        rowCells.push({
          content: jilidGroup.keterangan,
          rowSpan: jilidRowsCount,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fontSize: 5 },
        });
        // Catatan Perkembangan Otomatis Sesuai Nilai Guru (Rowspan per jilid)
        rowCells.push({
          content: jilidAutoNote,
          rowSpan: jilidRowsCount,
          styles: { halign: 'left', valign: 'middle', fontStyle: 'italic', fontSize: 4.8 },
        });
      }

      tahsinTableBody.push(rowCells);
    });
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: leftMargin, right: rightMargin },
    theme: 'plain',
    tableWidth: contentWidth,
    pageBreak: 'avoid',
    styles: {
      fontSize: 5.4,
      cellPadding: 0.45,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.12,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 5.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.12,
      cellPadding: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 5 },  // No
      1: { cellWidth: 14 }, // Mata Pelajaran
      2: { cellWidth: 7 },  // Jilid
      3: { cellWidth: 62 }, // Materi Iqra'
      4: { cellWidth: 10 }, // Angka
      5: { cellWidth: 10 }, // Huruf
      6: { cellWidth: 32 }, // Keterangan Kenaikan Jilid
      7: { cellWidth: 50 }, // Catatan Perkembangan Santri Otomatis
    },
    head: [
      [
        { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Mata Pelajaran', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Jilid', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Aspek Penilaian', colSpan: 3, styles: { halign: 'center' } },
        { content: 'Keterangan Kenaikan Jilid', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Catatan Perkembangan Santri', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      ],
      [
        { content: "Materi Iqra'", styles: { halign: 'center' } },
        { content: 'Angka', styles: { halign: 'center' } },
        { content: 'Huruf', styles: { halign: 'center' } },
      ],
    ],
    body: tahsinTableBody,
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 2.5;

  // 4. BAGIAN 2: TAHFIZ (3 KOLOM BERDAMPINGAN SECARA PARALEL)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 15, 15);
  doc.text('2. Tahfiz', leftMargin + 2, currentY);
  currentY += 1.2;

  // Helper untuk lookup nilai siswa pada surah
  const findSurahScore = (surahNumber: number, surahName: string) => {
    const normName = surahName.toLowerCase().replace(/[^a-z]/g, '');
    const rec = tahfizRecords.find(
      (r) => r.surahNumber === surahNumber || r.surahName.toLowerCase().replace(/[^a-z]/g, '') === normName
    );
    if (rec && rec.gradeScore > 0) {
      return {
        nilai: rec.gradeScore.toString(),
        ket: getLetterScore(rec.gradeScore),
      };
    }
    return { nilai: '-', ket: '-' };
  };

  const tahfizConfig = getTahfizTableConfig(tahfizScope);
  const tahfizTableBody: any[] = [];

  const formatCell = (cell: TahfizColumnCell | undefined) => {
    if (!cell || cell.type === 'empty') {
      return [
        { content: '', styles: { halign: 'center' } },
        { content: '', styles: { halign: 'left' } },
        { content: '', styles: { halign: 'center' } },
        { content: '', styles: { halign: 'center' } },
      ];
    }
    if (cell.type === 'banner') {
      return [
        {
          content: cell.label || '',
          colSpan: 4,
          styles: {
            halign: 'center',
            fontStyle: 'bold',
            fillColor: [248, 248, 248],
            textColor: [0, 0, 0],
          },
        },
      ];
    }
    const s = cell.item!;
    const sc = findSurahScore(s.surahNumber, s.name);
    return [
      { content: s.no.toString(), styles: { halign: 'center' } },
      { content: s.name, styles: { halign: 'left' } },
      { content: sc.nilai, styles: { halign: 'center' } },
      { content: sc.ket, styles: { halign: 'center' } },
    ];
  };

  for (let r = 0; r < tahfizConfig.rowCount; r++) {
    const row: any[] = [];
    row.push(...formatCell(tahfizConfig.col1[r]));
    row.push(...formatCell(tahfizConfig.col2[r]));
    row.push(...formatCell(tahfizConfig.col3[r]));
    tahfizTableBody.push(row);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: leftMargin, right: rightMargin },
    theme: 'plain',
    tableWidth: contentWidth,
    pageBreak: 'avoid',
    styles: {
      fontSize: 5.1,
      cellPadding: 0.3,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.12,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 5.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.12,
      cellPadding: 0.4,
    },
    columnStyles: {
      // Blok 1 (63.3 mm)
      0: { cellWidth: 5.5 },
      1: { cellWidth: 35.8 },
      2: { cellWidth: 11 },
      3: { cellWidth: 11 },
      // Blok 2 (63.3 mm)
      4: { cellWidth: 5.5 },
      5: { cellWidth: 35.8 },
      6: { cellWidth: 11 },
      7: { cellWidth: 11 },
      // Blok 3 (63.3 mm)
      8: { cellWidth: 5.5 },
      9: { cellWidth: 35.8 },
      10: { cellWidth: 11 },
      11: { cellWidth: 11 },
    },
    head: [
      [
        { content: tahfizConfig.headerTitles[0], colSpan: 4, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: tahfizConfig.headerTitles[1], colSpan: 4, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: tahfizConfig.headerTitles[2], colSpan: 4, styles: { halign: 'center', fontStyle: 'bold' } },
      ],
      [
        { content: 'No' },
        { content: 'Surat' },
        { content: 'Nilai' },
        { content: 'Ket' },
        { content: 'No' },
        { content: 'Surat' },
        { content: 'Nilai' },
        { content: 'Ket' },
        { content: 'No' },
        { content: 'Surat' },
        { content: 'Nilai' },
        { content: 'Ket' },
      ],
    ],
    body: tahfizTableBody,
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 2.8;

  // 5. FOOTER: RENTANG NILAI (KIRI) & TANDA TANGAN (KANAN)
  const footerLeftX = leftMargin + 2;
  const footerRightX = pageWidth - rightMargin - 40;

  // Header Rentang Nilai
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(10, 10, 10);
  doc.text('RENTANG NILAI', footerLeftX, currentY);

  // Tanggal & Jabatan (Kanan)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(`${settings.city || 'Bekasi'}, ${settings.reportDate || '22 Desember 2025'}`, footerRightX, currentY, {
    align: 'center',
  });

  currentY += 3.2;
  doc.setFont('helvetica', 'normal');
  doc.text(settings.coordinatorTitle || 'Koordinator Tahfiz', footerRightX, currentY, { align: 'center' });

  // 5 Baris Kriteria Rentang Nilai
  const rentangLines = [
    { code: 'A (91 - 100)', label: ': Mumtaz', desc: ': Kesalahan maksimal 5/Surat' },
    { code: 'B (81 - 90)', label: ': Jayyid Jiddan', desc: ': Kesalahan antara 6 -10/Surat' },
    { code: 'C (71 - 80)', label: ': Jayyid', desc: ': Kesalahan antara 11-15/Surat' },
    { code: 'D (61 - 70)', label: ': Maqbul', desc: ': Kesalahan antara 16 - 20/Surat' },
    { code: 'E (0 - 60)', label: ': Rasib', desc: ': Kesalahan lebih dari 21/Surat' },
  ];

  doc.setFontSize(6);
  rentangLines.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.text(item.code, footerLeftX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, footerLeftX + 17, currentY);
    doc.text(item.desc, footerLeftX + 37, currentY);
    currentY += 2.5;
  });

  currentY += 2.5;

  // Orang Tua/Wali di sebelah kiri
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('Orang Tua/Wali,', footerLeftX, currentY);

  // Ruang Tanda Tangan
  currentY += 10;

  // Tanda tangan Orang Tua (Kiri)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text('(____________________________)', footerLeftX, currentY);

  // Tanda tangan Koordinator Tahfiz (Kanan)
  doc.setFont('helvetica', 'bold');
  const coordinatorDisplay = settings.coordinatorName || teacherName || 'Mahmud Ali Yafi, S.S, M.Pd.I.';
  doc.text(coordinatorDisplay, footerRightX, currentY, { align: 'center' });

  // GARANSI MUTLAK: Rapot Harus 1 Lembar Saja!
  // Jika ada halaman ke-2 akibat kalkulasi millimeter minor, hapus halaman selanjutnya:
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  // Simpan file PDF
  const fileName = `Rapot_Tahfiz_Tahsin_${student.name.replace(/\s+/g, '_')}_${student.className.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
