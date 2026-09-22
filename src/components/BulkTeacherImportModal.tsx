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
  GraduationCap, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Teacher } from '../types';
import { 
  ParsedTeacherRow, 
  parseRawTextTeachers, 
  parseExcelTeachers, 
  downloadTeacherExcelTemplate, 
  downloadTeacherCsvTemplate,
  SMPIA9_TEACHER_ROSTER 
} from '../utils/teacherImporter';

interface BulkTeacherImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTeachers: Teacher[];
  onImportTeachers: (teachers: Teacher[], mode: 'append' | 'replace') => void;
}

export const BulkTeacherImportModal: React.FC<BulkTeacherImportModalProps> = ({
  isOpen,
  onClose,
  existingTeachers,
  onImportTeachers,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'preset'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedTeacherRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse text when user types or clicks
  const handleParseText = () => {
    if (!pasteText.trim()) {
      setParsedRows([]);
      return;
    }
    const rows = parseRawTextTeachers(pasteText);
    setParsedRows(rows);
  };

  // Quick sample paste
  const handleLoadPasteExample = () => {
    const sample = 
`Ustadz Ahmad Fauzi, S.Pd.I, Al-Hafizh	198507122010011005	L	7A, 7B	Tahsin & Tahfiz	0812-8877-6655
Ustadz Muhammad Ridwan, Lc., M.Ag.	198903152014021008	L	7C, 8A	Tahsin & Tahfiz	0813-1122-3344
Ustadzah Siti Fatimah, S.Ag., Al-Hafizhah	199104202016042003	P	8B, 8C	Tahsin & Tahfiz	0857-9988-1122
Ustadz Hanif Al-Banjari, S.Q., M.Pd.	198711052012011004	L	9A, 9B	Tahfiz	0878-3344-5566
Ustadzah Nurul Hidayah, S.Pd.I	199308142018032006	P	7A, 8A, 9A	Tahsin & Tahfiz	0821-4455-6677
Ustadz Zulkifli Rahman, S.Th.I	199002182015021007	L	7B, 8B, 9B	Tahfiz	0819-7788-9900`;

    setPasteText(sample);
    const rows = parseRawTextTeachers(sample);
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
        const rows = parseExcelTeachers(buffer);
        setParsedRows(rows);
      } catch (err) {
        alert('Gagal membaca berkas. Pastikan format file Excel atau CSV valid.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Preset loading
  const handleLoadPresetRoster = () => {
    const rows: ParsedTeacherRow[] = SMPIA9_TEACHER_ROSTER.map((t) => ({
      name: t.name,
      nip: t.nip,
      gender: t.gender,
      assignedClasses: t.assignedClasses,
      specialty: t.specialty,
      phone: t.phone,
      isValid: true,
    }));
    setParsedRows(rows);
  };

  // Execute Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data guru yang valid untuk diimpor.');
      return;
    }

    const newTeachers: Teacher[] = validRows.map((r, index) => ({
      id: `tch-imp-${Date.now()}-${index}`,
      name: r.name,
      nip: r.nip,
      gender: r.gender,
      assignedClasses: r.assignedClasses,
      specialty: r.specialty,
      phone: r.phone,
    }));

    onImportTeachers(newTeachers, importMode);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Impor Massal Data Guru / Asatidz
              </h3>
              <p className="text-xs text-slate-500">
                Tambahkan banyak dewan asatidz sekaligus dari Excel, CSV, atau salin-tempel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardCopy className="w-4 h-4" />
              <span>Salin-Tempel Teks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Unggah File (Excel / CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preset'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Preset Dewan Guru SMPIA 9</span>
            </button>
          </div>

          {/* Template Download Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 pb-2">
            <button
              type="button"
              onClick={downloadTeacherExcelTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer transition-colors"
              title="Unduh format spreadsheet Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template Excel</span>
            </button>
            <button
              type="button"
              onClick={downloadTeacherCsvTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer transition-colors"
              title="Unduh format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: PASTE TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">
                  Tempel Baris Data Guru dari Excel / Notepad:
                </label>
                <button
                  type="button"
                  onClick={handleLoadPasteExample}
                  className="text-emerald-800 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  Muat Contoh Format
                </button>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                onBlur={handleParseText}
                rows={6}
                placeholder={`Format per baris (pisahkan dengan TAB atau Koma):\nNama Guru [TAB] NIP [TAB] L/P [TAB] Kelas [TAB] Spesialisasi [TAB] No. WA\n\nContoh:\nUstadz Ahmad Fauzi, S.Pd.I	198507122010011005	L	7A, 7B	Tahsin & Tahfiz	0812-8877-6655\nUstadzah Siti Fatimah, S.Ag.	199104202016042003	P	8A, 8B	Tahsin & Tahfiz	0857-9988-1122`}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900 focus:outline-emerald-800 focus:bg-white"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParseText}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Analisis Teks ({pasteText.split('\n').filter(Boolean).length} baris)
                </button>
                {pasteText && (
                  <button
                    type="button"
                    onClick={() => {
                      setPasteText('');
                      setParsedRows([]);
                    }}
                    className="text-rose-600 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Bersihkan Teks
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Klik atau Seret Berkas Excel / CSV ke Sini
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Mendukung .xlsx, .xls, dan .csv dengan deteksi otomatis kolom Nama, NIP, Kelas, dll.
                  </p>
                </div>
                {selectedFileName && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-400 text-emerald-900 rounded-xl font-bold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{selectedFileName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRESET DEWAN ASATIDZ */}
          {activeTab === 'preset' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Daftar Dewan Asatidz SMP Islam Al Azhar 9 Bekasi
                  </h4>
                  <p className="text-slate-500 text-xs">
                    Preset 6 Ustadz & Ustadzah pengampu Tahsin & Tahfiz lengkap dari Kelas 7 s.d. 9.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadPresetRoster}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Muat Preset Roster
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {SMPIA9_TEACHER_ROSTER.map((t, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">{t.name}</strong>
                      <span className="text-[11px] text-slate-500">NIP: {t.nip}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {t.assignedClasses.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">Pratinjau Data Guru ({parsedRows.length})</h4>
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {invalidCount} Bermasalah
                    </span>
                  )}
                </div>

                {/* Import Mode Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-slate-600 font-medium">Metode Impor:</label>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-emerald-800"
                  >
                    <option value="append">Tambahkan ke daftar yang ada (Append)</option>
                    <option value="replace">Gantikan seluruh daftar guru (Replace)</option>
                  </select>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Guru</th>
                      <th className="p-2.5">NIP</th>
                      <th className="p-2.5">Panggilan</th>
                      <th className="p-2.5">Kelas Binaan</th>
                      <th className="p-2.5">Bidang</th>
                      <th className="p-2.5">No WA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className={`hover:bg-slate-50 ${!r.isValid ? 'bg-rose-50/60' : ''}`}>
                        <td className="p-2.5 text-slate-400">{i + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {r.name}
                          {r.validationError && (
                            <span className="block text-[10px] text-rose-600 font-normal">
                              {r.validationError}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{r.nip}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.gender === 'P' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {r.gender === 'P' ? 'Ustadzah' : 'Ustadz'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {r.assignedClasses.join(', ')}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700">{r.specialty}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{r.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/70">
          <div className="text-slate-500 text-[11px]">
            {parsedRows.length > 0 ? (
              <span>
                Siap memproses <strong>{validCount}</strong> guru baru ke sistem.
              </span>
            ) : (
              <span>Pilih file atau tempel teks daftar ustadz/ustadzah di atas.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200/70 rounded-xl font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Impor {validCount} Guru ke Sistem</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
