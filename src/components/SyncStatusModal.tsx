import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Cloud, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Download, 
  Upload, 
  Check, 
  Clock, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { detectDeviceName } from '../services/syncService';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  lastUpdatedByDevice?: string;
  serverVersion: number;
  totalStudents: number;
  totalReports: number;
  onManualSync: () => Promise<void>;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  isSyncing,
  lastSyncTime,
  lastUpdatedByDevice,
  serverVersion,
  totalStudents,
  totalReports,
  onManualSync,
  onExportBackup,
  onImportBackup,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const currentDevice = detectDeviceName();

  if (!isOpen) return null;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        onImportBackup(text);
        setImportStatus('Backup berhasil dipulihkan!');
        setTimeout(() => setImportStatus(null), 3500);
      } catch (err) {
        setImportStatus('Gagal membaca file backup');
      }
    };
    reader.readAsText(file);
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Belum pernah';
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 10) return 'Baru saja';
    if (diffSec < 60) return `${diffSec} detik yang lalu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Sinkronisasi Cloud Real-Time
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Sinkronkan Laptop, iPad & HP
              </h2>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {/* Multi-Device Visual Indicators */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
              <span>Status Perangkat Terhubung:</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1 Basis Data Terpusat
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Laptop */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentDevice.includes('Laptop') || currentDevice.includes('PC')
                  ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Laptop className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-xs font-bold text-slate-800">Laptop / PC</div>
                <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sinkron</span>
                </div>
                {(currentDevice.includes('Laptop') || currentDevice.includes('PC')) && (
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">
                    Perangkat Ini
                  </span>
                )}
              </div>

              {/* iPad / Tablet */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentDevice.includes('iPad') || currentDevice.includes('Tablet')
                  ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Tablet className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-xs font-bold text-slate-800">iPad / Tablet</div>
                <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sinkron</span>
                </div>
                {(currentDevice.includes('iPad') || currentDevice.includes('Tablet')) && (
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">
                    Perangkat Ini
                  </span>
                )}
              </div>

              {/* HP */}
              <div className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentDevice.includes('HP') || currentDevice.includes('Smartphone')
                  ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-xs font-bold text-slate-800">HP (Ponsel)</div>
                <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sinkron</span>
                </div>
                {(currentDevice.includes('HP') || currentDevice.includes('Smartphone')) && (
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">
                    Perangkat Ini
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sync Stats Info */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5" /> Terakhir Disinkronkan:
              </span>
              <span className="font-bold text-slate-800">{formatTimeAgo(lastSyncTime)}</span>
            </div>
            
            {lastUpdatedByDevice && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Terakhir Diperbarui Oleh:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {lastUpdatedByDevice}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Jumlah Data Aktif:</span>
              <span className="font-bold text-slate-800">{totalStudents} Siswa • {totalReports} Rapot</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Revisi Versi Server:</span>
              <span className="font-mono font-bold text-slate-700">v{serverVersion}</span>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Setiap kali Anda menginput nilai di <strong>Laptop</strong>, sistem otomatis menyimpan ke server. Saat Anda membuka di <strong>iPad</strong> atau <strong>HP</strong>, data langsung terupdate tanpa perlu input ulang.
            </p>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-lg bg-slate-800 text-white text-xs font-semibold text-center animate-in fade-in">
              {importStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang (Tarik Data Terbaru)'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Unduh seluruh basis data siswa dan nilai rapot dalam format JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Cadangkan Data</span>
              </button>

              <label className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Pulihkan Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>SMP Islam Al Azhar 9 Bekasi</span>
          <button 
            type="button" 
            onClick={onClose} 
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
