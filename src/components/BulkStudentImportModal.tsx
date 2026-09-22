import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  ClipboardCopy, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Sparkles, 
  Users, 
  GraduationCap, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Student, Teacher } from '../types';
import { 
  ParsedStudentRow, 
  parseRawTextStudents, 
  parseExcelStudents, 
  assignTeacherForClass, 
  getDefaultTargetForClass, 
  generateAutoNis,
  downloadExcelTemplate, 
  downloadCsvTemplate,
  SMPIA9_FULL_ROSTER,
  SMPIA9_VALID_CLASSES,
  isSmpia9ClassValid,
  normalizeClassName
} from '../utils/studentImporter';

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  existingStudents: Student[];
  onImportStudents: (students: Student[], mode: 'append' | 'replace') => void;
}

export const BulkStudentImportModal: React.FC<BulkStudentImportModalProps> = ({
  isOpen,
  onClose,
  teachers,
  existingStudents,
  onImportStudents,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'preset'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignMode, setAssignMode] = useState<'auto' | string>('auto'); // 'auto' or teacherId

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse text when user types or clicks "Analisis"
  const handleParseText = () => {
    if (!pasteText.trim()) {
      setParsedRows([]);
      return;
    }
    const rows = parseRawTextStudents(pasteText);
    setParsedRows(rows);
  };

  // Quick sample paste showcasing all 9 official classes (7A-7C, 8A-8C, 9A-9C)
  const handleLoadPasteExample = () => {
    const sample = 
`Muhammad Fatih Al-Ayyubi	0112894001	7A	L	0812-1002-3344
Aisyah Humaira Putri	0112894005	7A	P	0812-7788-9900
Rizky Ramadhan Saputra	0112894011	7B	L	0858-9900-1122
Hafizhah Khairunnisa	0112894014	7B	P	0877-1122-3344
Muhammad Yusuf Al-Ayyubi	0112894021	7C	L	0812-3322-1100
Annisa Zahra Nuraini	0112894023	7C	P	0812-4455-6677
Ibrahim Hanif Al-Farisi	0103456001	8A	L	0819-0987-6543
Khadijah Nabila Zahir	0103456003	8A	P	0821-3344-5566
Salman Al-Farisi Ramadhan	0103456011	8B	L	0813-2233-4411
Safira Aulia Rahman	0103456013	8B	P	0857-4455-6633
Fajar Siddiq Pratama	0103456021	8C	L	0877-5566-7788
Tiara Dewi Maharani	0103456023	8C	P	0856-1122-3344
Zaid bin Haritsah Al-Anshari	0098765001	9A	L	0878-1122-3344
Maryam Sholihatul Jannah	0098765004	9A	P	0812-9988-7766
Abdullah Azzam Pratama	0098765011	9B	L	0857-1122-8899
Salma Aqila Lathifah	0098765013	9B	P	0812-4455-8811
Salman Al-Hakim Ramadhan	0098765021	9C	L	0812-5566-7788
Naila Zahra Al-Munawwarah	0098765022	9C	P	0878-3344-5566`;

    setPasteText(sample);
    const rows = parseRawTextStudents(sample);
    setParsedRows(rows);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const rows = parseExcelStudents(buffer);
        setParsedRows(rows);
      } catch (err) {
        console.error('Gagal membaca file Excel:', err);
        alert('Gagal membaca file Excel atau CSV. Pastikan format file sesuai.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Load Preset SMPIA 9 Roster
  const handleLoadPresetRoster = () => {
    const convertedRows: ParsedStudentRow[] = SMPIA9_FULL_ROSTER.map((std) => ({
      name: std.name,
      nisn: std.nisn,
      className: std.className,
      nis: std.nis,
      gender: std.gender,
      parentPhone: std.parentPhone,
      targetJuz: std.targetJuz,
      isValid: true,
    }));
    setParsedRows(convertedRows);
    setActiveTab('preset');
  };

  // Remove a row from parsed table
  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Allow user to correct class directly in preview table
  const handleUpdateRowClass = (index: number, newClass: string) => {
    setParsedRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };
      const normalized = normalizeClassName(newClass);
      row.className = normalized;
      const isAllowed = isSmpia9ClassValid(normalized);

      if (!isAllowed) {
        row.isValid = false;
        row.validationError = `Kelas "${normalized}" tidak valid. Pilihan kelas resmi: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C.`;
      } else {
        row.isValid = Boolean(row.name && row.name.trim().length > 1);
        row.validationError = undefined;
        const targets = getDefaultTargetForClass(normalized);
        row.targetJuz = targets.targetJuz;
      }
      copy[index] = row;
      return copy;
    });
  };

  // Allow user to toggle/correct gender directly in preview table
  const handleUpdateRowGender = (index: number, newGender: 'L' | 'P') => {
    setParsedRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], gender: newGender };
      return copy;
    });
  };

  // Submit and save
  const handleFinalSubmit = () => {
    // Only import rows that are valid and strictly belong to one of the 9 official classes (7A-7C, 8A-8C, 9A-9C)
    const validRows = parsedRows.filter(
      (r) => r.isValid && r.name.trim() && isSmpia9ClassValid(r.className)
    );
    if (validRows.length === 0) {
      alert('Tidak ada data murid yang valid untuk diimpor. Pastikan nama terisi dan kelas dipilih dari 9 rombel resmi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C).');
      return;
    }

    const studentsToSave: Student[] = validRows.map((row, idx) => {
      const cls = row.className || '7A';
      const targets = getDefaultTargetForClass(cls);
      const generatedNis = row.nis || generateAutoNis(cls, idx);
      
      const teacherId = 
        assignMode === 'auto' 
          ? assignTeacherForClass(cls, teachers)
          : assignMode;

      return {
        id: `std-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        name: row.name,
        nisn: row.nisn,
        className: cls,
        nis: generatedNis,
        gender: row.gender || 'L',
        teacherId,
        targetJuz: row.targetJuz || targets.targetJuz,
        targetSurahCount: targets.targetSurahCount,
        parentPhone: row.parentPhone || '',
      };
    });

    onImportStudents(studentsToSave, importMode);
    onClose();
  };

  // Summary counts
  const validCount = parsedRows.filter((r) => r.isValid && isSmpia9ClassValid(r.className)).length;
  const invalidCount = parsedRows.length - validCount;
  const count7 = parsedRows.filter((r) => r.className.startsWith('7')).length;
  const count8 = parsedRows.filter((r) => r.className.startsWith('8')).length;
  const count9 = parsedRows.filter((r) => r.className.startsWith('9')).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl">
              <Users className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Impor Data Massal Murid SMP Islam Al Azhar 9 Bekasi
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Masukkan Nama, NISN, dan Kelas (Kelas 7, 8, dan 9) secara serentak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">

          {/* Sub Navigation Method Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'paste'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ClipboardCopy className="w-3.5 h-3.5" />
                Salin-Tempel (Excel/Teks)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'upload'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Unggah File (.xlsx / .csv)
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLoadPresetRoster();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'preset'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Roster Baku SMPIA 9 ({SMPIA9_FULL_ROSTER.length} Siswa)
              </button>
            </div>

            {/* Download Template Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Template:</span>
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-[11px] font-bold border border-emerald-200 cursor-pointer"
                title="Unduh Format File Excel Resmi"
              >
                <Download className="w-3 h-3" />
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-bold border border-slate-300 cursor-pointer"
                title="Unduh Format CSV"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
            </div>
          </div>

          {/* TAB 1: PASTE TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Tempelkan Baris Data Murid dari Excel / Spreadsheet / Catatan:</span>
                </label>
                <button
                  type="button"
                  onClick={handleLoadPasteExample}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                >
                  Muat Contoh Data Kelas 7 - 9
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Contoh susunan kolom (pisahkan dengan Tab atau Koma):\nNama Santri\tNISN\tKelas\nMuhammad Fatih Al-Ayyubi\t0112894001\t7A\nAisyah Humaira Putri\t0112894002\t7A\nIbrahim Hanif Al-Farisi\t0103456001\t8A\nKhadijah Nabila Zahir\t0103456003\t8B\nZaid bin Haritsah\t0098765001\t9A`}
                  className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 text-slate-900 leading-relaxed resize-y"
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[11px] text-slate-500">
                  Tip: Copy langsung sel-sel kolom dari Microsoft Excel atau Google Sheets, lalu paste ke sini.
                </p>
                <button
                  type="button"
                  onClick={handleParseText}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Analisis & Tampilkan Tabel Pratinjau
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedFileName ? selectedFileName : 'Klik atau Tarik File Excel / CSV ke Sini'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>. Sistem akan otomatis mendeteksi kolom Nama, NISN, dan Kelas.
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Pilih File dari Komputer
                </button>
              </div>

              {isProcessing && (
                <div className="text-center py-2 text-emerald-800 font-semibold animate-pulse">
                  Sedang membaca dan menganalisis file Excel...
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESET SMPIA 9 */}
          {activeTab === 'preset' && (
            <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Roster Baku SMP Islam Al Azhar 9 Bekasi Terpilih</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Telah disiapkan <strong>{SMPIA9_FULL_ROSTER.length} data murid santri</strong> lengkap untuk 9 rombel kelas resmi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C) beserta NISN 10-digit, jenis kelamin (Ikhwan/Akhwat), nomor induk (NIS) resmi tahun ajaran, dan target hafalan per jenjang.
              </p>
            </div>
          )}

          {/* STATS & FILTER SUMMARY BANNER */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Hasil Analisis:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {validCount} Santri Terverifikasi
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      {invalidCount} Perlu Perbaikan
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                    Kls 7 (7A, 7B, 7C): {count7} santri
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900">
                    Kls 8 (8A, 8B, 8C): {count8} santri
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-900">
                    Kls 9 (9A, 9B, 9C): {count9} santri
                  </span>
                </div>
              </div>

              {/* Notice for invalid classes if any */}
              {invalidCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong>Pemberitahuan Validasi Data:</strong>
                    <span> Terdapat {invalidCount} data yang nama atau rombelnya belum lengkap. Silakan tentukan kelas resmi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C) pada tabel pratinjau di bawah.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PREVIEW TABLE */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Pratinjau Data Murid yang Akan Dimasukkan ({parsedRows.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  Anda dapat mengubah Kelas & Jenis Kelamin langsung pada tabel sebelum disimpan
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase text-[10px] font-bold z-10">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Santri</th>
                      <th className="py-2.5 px-3 text-center">NISN</th>
                      <th className="py-2.5 px-3 text-center">Kelas (9 Rombel Resmi)</th>
                      <th className="py-2.5 px-3 text-center">Jenis Kelamin</th>
                      <th className="py-2.5 px-3">Target Kurikulum</th>
                      <th className="py-2.5 px-3">Pembimbing Otomatis</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row, idx) => {
                      const targets = getDefaultTargetForClass(row.className);
                      const tId = assignMode === 'auto' ? assignTeacherForClass(row.className, teachers) : assignMode;
                      const teacher = teachers.find((t) => t.id === tId);
                      const isValidClass = isSmpia9ClassValid(row.className);

                      return (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-50 transition-colors ${
                            !row.isValid ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {row.name}
                            {row.validationError && (
                              <span className="block text-[10px] text-rose-600 font-normal">
                                ⚠️ {row.validationError}
                              </span>
                            )}
                            {row.parentPhone && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Telp: {row.parentPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">
                            {row.nisn || <span className="text-slate-400 italic text-[10px]">-</span>}
                            {row.nisn && row.nisn.length !== 10 && (
                              <span className="block text-[9px] text-amber-600 font-sans">
                                ({row.nisn.length} digit)
                              </span>
                            )}
                          </td>

                          {/* Editable Class Dropdown with 9 Official Classes (7A-7C, 8A-8C, 9A-9C) */}
                          <td className="py-2 px-3 text-center min-w-[130px]">
                            <select
                              value={isValidClass ? row.className : ''}
                              onChange={(e) => handleUpdateRowClass(idx, e.target.value)}
                              className={`w-full text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer ${
                                !isValidClass
                                  ? 'border-rose-400 bg-rose-50 text-rose-800'
                                  : row.className.startsWith('7')
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : row.className.startsWith('8')
                                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                                  : 'border-purple-300 bg-purple-50 text-purple-800'
                              }`}
                            >
                              {!isValidClass && (
                                <option value="" disabled>
                                  ⚠️ Pilih Kelas Resmi
                                </option>
                              )}
                              {SMPIA9_VALID_CLASSES.map((c) => (
                                <option key={c} value={c}>
                                  Kelas {c}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Editable Gender Dropdown */}
                          <td className="py-2 px-3 text-center min-w-[110px]">
                            <select
                              value={row.gender === 'P' ? 'P' : 'L'}
                              onChange={(e) => handleUpdateRowGender(idx, e.target.value as 'L' | 'P')}
                              className={`text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer ${
                                row.gender === 'P'
                                  ? 'border-pink-300 bg-pink-50 text-pink-700'
                                  : 'border-cyan-300 bg-cyan-50 text-cyan-800'
                              }`}
                            >
                              <option value="L">L (Laki-laki / Ikhwan)</option>
                              <option value="P">P (Perempuan / Akhwat)</option>
                            </select>
                          </td>

                          <td className="py-2 px-3 text-emerald-800 font-semibold text-[11px]">
                            {row.targetJuz || targets.targetJuz}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">
                            {teacher?.name.split(',')[0] || 'Guru Halaqah'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONFIGURATION OPTIONS */}
          {parsedRows.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Pilihan Penerapan Impor:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Append vs Replace Mode */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Mode Penyimpanan Data:</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>
                        <strong>Tambahkan ke Data yang Ada</strong> (Gabung dengan {existingStudents.length} murid saat ini)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-rose-700 focus:ring-rose-600"
                      />
                      <span className="text-rose-900">
                        <strong>Ganti Seluruh Data Murid</strong> (Timpa dan gunakan {validCount} murid baru ini saja)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Teacher Allocation Mode */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Alokasi Guru Pembimbing Halaqah:</label>
                  <select
                    value={assignMode}
                    onChange={(e) => setAssignMode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-semibold"
                  >
                    <option value="auto">
                      Otomatis Sesuai Jenjang Rombel (7: Ust. Ridwan, 8: Usth. Fatimah, 9: Ust. Faqih)
                    </option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        Tentukan ke: {t.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Setiap murid baru otomatis diinisialisasi dengan data rapot tahsin, hafalan, dan adab.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            {parsedRows.length > 0 ? (
              <span>
                Siap memasukkan <strong>{validCount}</strong> santri ke pangkalan data SMP Islam Al Azhar 9.
              </span>
            ) : (
              <span>Silakan tempelkan teks, unggah file Excel, atau pilih Roster Baku.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={parsedRows.length === 0 || validCount === 0}
              onClick={handleFinalSubmit}
              className={`w-1/2 sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                parsedRows.length > 0 && validCount > 0
                  ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Terapkan ({validCount} Santri)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
