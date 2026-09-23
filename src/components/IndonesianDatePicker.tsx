import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function parseDateString(dateStr: string): { year: number; month: number; day: number; dayName: string; formatted: string } | null {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;

    const dayName = INDONESIAN_DAYS[date.getDay()];
    const monthName = INDONESIAN_MONTHS[month];
    const formatted = `${dayName}, ${day} ${monthName} ${year}`;
    return { year, month, day, dayName, formatted };
  } catch {
    return null;
  }
}

export function formatToIndonesianDate(dateStr: string, includeDayName = true): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr || '-';
  if (includeDayName) return parsed.formatted;
  return `${parsed.day} ${INDONESIAN_MONTHS[parsed.month]} ${parsed.year}`;
}

export function getTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getYesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface IndonesianDatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (newDateStr: string) => void;
  colorTheme?: 'emerald' | 'blue' | 'amber';
  helperText?: string;
  required?: boolean;
  quickAction?: {
    label: string;
    onClick: () => void;
  };
}

export const IndonesianDatePicker: React.FC<IndonesianDatePickerProps> = ({
  label,
  value,
  onChange,
  colorTheme = 'emerald',
  helperText,
  required = false,
  quickAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected date
  const parsed = useMemo(() => parseDateString(value), [value]);

  // Calendar view month & year state
  const [viewYear, setViewYear] = useState<number>(() => parsed?.year || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => parsed?.month ?? new Date().getMonth());

  // Sync view month when value changes
  React.useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  // Generate calendar grid for current viewMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Minggu
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days: { dayNum: number; isCurrentMonth: boolean; dateStr: string; isToday: boolean; isSelected: boolean }[] = [];

    const todayStr = getTodayIso();

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
      });
    }

    // Next month padding to fill complete grid (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
      });
    }

    return days;
  }, [viewYear, viewMonth, value]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const themeClasses = {
    emerald: {
      badgeBg: 'bg-emerald-700 text-white',
      accentText: 'text-emerald-800',
      activeDay: 'bg-emerald-700 text-white font-black shadow-md',
      todayBorder: 'border-emerald-500 font-bold text-emerald-700',
      buttonBg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300',
      focusRing: 'focus:ring-emerald-500',
      iconColor: 'text-emerald-700',
      bannerBg: 'bg-emerald-50/80 border-emerald-200',
    },
    blue: {
      badgeBg: 'bg-blue-700 text-white',
      accentText: 'text-blue-800',
      activeDay: 'bg-blue-700 text-white font-black shadow-md',
      todayBorder: 'border-blue-500 font-bold text-blue-700',
      buttonBg: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300',
      focusRing: 'focus:ring-blue-500',
      iconColor: 'text-blue-700',
      bannerBg: 'bg-blue-50/80 border-blue-200',
    },
    amber: {
      badgeBg: 'bg-amber-600 text-white',
      accentText: 'text-amber-800',
      activeDay: 'bg-amber-600 text-white font-black shadow-md',
      todayBorder: 'border-amber-500 font-bold text-amber-700',
      buttonBg: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300',
      focusRing: 'focus:ring-amber-500',
      iconColor: 'text-amber-700',
      bannerBg: 'bg-amber-50/80 border-amber-200',
    },
  }[colorTheme];

  return (
    <div className="space-y-1.5">
      {/* Label and Quick Action */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className={`w-4 h-4 ${themeClasses.iconColor}`} />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        {quickAction && (
          <button
            type="button"
            onClick={quickAction.onClick}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
          >
            {quickAction.label}
          </button>
        )}
      </div>

      {/* Main Interactive Display Box */}
      <div
        className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
          isOpen ? 'ring-2 ring-emerald-500 border-emerald-400 bg-white shadow-sm' : `${themeClasses.bannerBg} hover:border-slate-400 cursor-pointer`
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Big Hari & Tanggal Badge */}
            <div
              className={`px-3 py-1.5 rounded-lg text-center font-bold shrink-0 ${themeClasses.badgeBg}`}
            >
              <div className="text-[10px] tracking-wider uppercase font-black">
                {parsed?.dayName || 'HARI'}
              </div>
              <div className="text-lg leading-tight font-black">
                {parsed?.day || '--'}
              </div>
            </div>

            {/* Date Details Text */}
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900">
                {parsed?.formatted || 'Belum dipilih'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {parsed
                    ? `Hari ${parsed.dayName} • Tanggal ${parsed.day} ${INDONESIAN_MONTHS[parsed.month]} ${parsed.year}`
                    : 'Klik untuk membuka kalender'}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${themeClasses.buttonBg}`}
            >
              {isOpen ? 'Tutup Kalender' : 'Pilih / Ganti'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Dropdown / Popover Calendar */}
      {isOpen && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150 z-30">
          {/* Calendar Header: Month & Year Navigator */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevMonth();
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
              <span>{INDONESIAN_MONTHS[viewMonth]}</span>
              <span className="text-slate-500 font-semibold">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextMonth();
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Names Row: Min, Sen, Sel, Rab, Kam, Jum, Sab */}
          <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[11px] text-slate-500 mb-1">
            <div className="text-rose-600">Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div className="text-emerald-700">Jum</div>
            <div>Sab</div>
          </div>

          {/* Day Grid Cells */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarDays.map((cd, idx) => {
              return (
                <button
                  key={`${cd.dateStr}-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(cd.dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 sm:h-9 w-full rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                    cd.isSelected
                      ? themeClasses.activeDay
                      : cd.isToday
                      ? `border-2 ${themeClasses.todayBorder} bg-slate-50`
                      : cd.isCurrentMonth
                      ? 'text-slate-800 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-50'
                  }`}
                  title={`${cd.dateStr} (${formatToIndonesianDate(cd.dateStr, true)})`}
                >
                  {cd.dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Preset Buttons Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(getTodayIso());
                  setIsOpen(false);
                }}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] cursor-pointer transition-colors shadow-2xs"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(getYesterdayIso());
                  setIsOpen(false);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[10px] cursor-pointer transition-colors"
              >
                Kemarin
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer px-2 py-0.5"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Hidden/Native fallback sync input for form submission & accessibility */}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-hidden="true"
      />

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};
