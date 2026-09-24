import React, { useState, useMemo, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Clock, CalendarDays } from 'lucide-react';

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Universal date parser that handles ISO (YYYY-MM-DD), slash (DD/MM/YYYY or YYYY/MM/DD),
 * dash (DD-MM-YYYY), ISO timestamps, and Indonesian text (e.g., "22 Desember 2025").
 */
export function parseDateString(dateStr?: string | null): { 
  year: number; 
  month: number; 
  day: number; 
  dayName: string; 
  formatted: string;
  iso: string;
} {
  const fallbackDate = new Date();
  
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    const year = fallbackDate.getFullYear();
    const month = fallbackDate.getMonth();
    const day = fallbackDate.getDate();
    const dayName = INDONESIAN_DAYS[fallbackDate.getDay()];
    const monthName = INDONESIAN_MONTHS[month];
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const formatted = `${dayName}, ${day} ${monthName} ${year}`;
    return { year, month, day, dayName, formatted, iso };
  }

  try {
    let clean = dateStr.trim();
    if (clean.includes('T')) {
      clean = clean.split('T')[0];
    }

    // Try text with Indonesian month names e.g. "22 Desember 2025"
    for (let m = 0; m < INDONESIAN_MONTHS.length; m++) {
      const mName = INDONESIAN_MONTHS[m];
      if (clean.toLowerCase().includes(mName.toLowerCase())) {
        const words = clean.replace(/[,]/g, ' ').split(/\s+/).filter(Boolean);
        const mIdx = words.findIndex((w) => w.toLowerCase().includes(mName.toLowerCase()));
        if (mIdx > 0 && mIdx < words.length - 1) {
          const day = parseInt(words[mIdx - 1], 10);
          const year = parseInt(words[mIdx + 1], 10);
          if (!isNaN(day) && !isNaN(year) && year > 1900 && year < 2100) {
            const date = new Date(year, m, day);
            if (!isNaN(date.getTime())) {
              const dayName = INDONESIAN_DAYS[date.getDay()];
              const iso = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const formatted = `${dayName}, ${day} ${mName} ${year}`;
              return { year, month: m, day, dayName, formatted, iso };
            }
          }
        }
      }
    }

    // Check delimited formats: YYYY-MM-DD or DD-MM-YYYY or DD/MM/YYYY or YYYY/MM/DD
    const parts = clean.split(/[/.-]/);
    if (parts.length === 3) {
      let p0 = parseInt(parts[0], 10);
      let p1 = parseInt(parts[1], 10);
      let p2 = parseInt(parts[2], 10);

      let year = p0;
      let month = p1 - 1;
      let day = p2;

      // If parts[2] has 4 digits (e.g. 24-09-2026 or 24/09/2026)
      if (parts[2].length === 4 || p2 > 1000) {
        day = p0;
        month = p1 - 1;
        year = p2;
      } else if (parts[0].length === 4 || p0 > 1000) {
        // YYYY-MM-DD
        year = p0;
        month = p1 - 1;
        day = p2;
      }

      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 1900 && year < 2100) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          const dayName = INDONESIAN_DAYS[date.getDay()];
          const monthName = INDONESIAN_MONTHS[month];
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const formatted = `${dayName}, ${day} ${monthName} ${year}`;
          return { year, month, day, dayName, formatted, iso };
        }
      }
    }

    // Fallback standard JS Date parse
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      const dayName = INDONESIAN_DAYS[d.getDay()];
      const monthName = INDONESIAN_MONTHS[month];
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const formatted = `${dayName}, ${day} ${monthName} ${year}`;
      return { year, month, day, dayName, formatted, iso };
    }
  } catch (err) {
    console.error('Error parsing date string:', err);
  }

  // Safe fallback to today
  const year = fallbackDate.getFullYear();
  const month = fallbackDate.getMonth();
  const day = fallbackDate.getDate();
  const dayName = INDONESIAN_DAYS[fallbackDate.getDay()];
  const monthName = INDONESIAN_MONTHS[month];
  const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const formatted = `${dayName}, ${day} ${monthName} ${year}`;
  return { year, month, day, dayName, formatted, iso };
}

export function toIsoDate(dateStr?: string | null): string {
  return parseDateString(dateStr).iso;
}

export function formatToIndonesianDate(dateStr?: string | null, includeDayName = true): string {
  const parsed = parseDateString(dateStr);
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
  value: string; // YYYY-MM-DD or any recognized date string
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Guarantee clean parsed date object with day name, formatted string, and ISO value
  const parsed = useMemo(() => parseDateString(value), [value]);
  const isoValue = parsed.iso;

  // Calendar view month & year state
  const [viewYear, setViewYear] = useState<number>(() => parsed.year);
  const [viewMonth, setViewMonth] = useState<number>(() => parsed.month);

  // Sync view month when value changes
  React.useEffect(() => {
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }, [parsed.year, parsed.month]);

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
        isSelected: dateStr === isoValue,
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
        isSelected: dateStr === isoValue,
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
        isSelected: dateStr === isoValue,
      });
    }

    return days;
  }, [viewYear, viewMonth, isoValue]);

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
      focusRing: 'focus:ring-emerald-500 focus:border-emerald-500',
      iconColor: 'text-emerald-700',
      bannerBg: 'bg-emerald-50/90 border-emerald-200',
      bannerBorder: 'border-emerald-300',
      tagBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    blue: {
      badgeBg: 'bg-blue-700 text-white',
      accentText: 'text-blue-800',
      activeDay: 'bg-blue-700 text-white font-black shadow-md',
      todayBorder: 'border-blue-500 font-bold text-blue-700',
      buttonBg: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300',
      focusRing: 'focus:ring-blue-500 focus:border-blue-500',
      iconColor: 'text-blue-700',
      bannerBg: 'bg-blue-50/90 border-blue-200',
      bannerBorder: 'border-blue-300',
      tagBg: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    amber: {
      badgeBg: 'bg-amber-600 text-white',
      accentText: 'text-amber-800',
      activeDay: 'bg-amber-600 text-white font-black shadow-md',
      todayBorder: 'border-amber-500 font-bold text-amber-700',
      buttonBg: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300',
      focusRing: 'focus:ring-amber-500 focus:border-amber-500',
      iconColor: 'text-amber-700',
      bannerBg: 'bg-amber-50/90 border-amber-200',
      bannerBorder: 'border-amber-300',
      tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
    },
  }[colorTheme];

  const triggerNativePicker = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Quick Action */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Calendar className={`w-4 h-4 ${themeClasses.iconColor}`} />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        {quickAction && (
          <button
            type="button"
            onClick={quickAction.onClick}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
          >
            {quickAction.label}
          </button>
        )}
      </div>

      {/* Main Interactive Compound Component */}
      <div className={`rounded-2xl border ${themeClasses.bannerBorder} ${themeClasses.bannerBg} p-2.5 sm:p-3 shadow-2xs space-y-2.5`}>
        {/* Row 1: Direct Native Date Input + Quick Preset Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Real, interactive date input with calendar trigger */}
          <div className="relative flex-1 min-w-[160px]">
            <input
              ref={dateInputRef}
              type="date"
              value={isoValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val) onChange(val);
              }}
              className={`w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-extrabold text-slate-900 shadow-2xs cursor-pointer focus:ring-2 ${themeClasses.focusRing}`}
              title="Klik untuk memilih tanggal langsung lewat kalender sistem"
            />
          </div>

          {/* Quick Action Presets: Hari Ini & Kemarin */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onChange(getTodayIso())}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isoValue === getTodayIso()
                  ? `${themeClasses.badgeBg} border-transparent shadow-xs`
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Pilih tanggal hari ini"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => onChange(getYesterdayIso())}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isoValue === getYesterdayIso()
                  ? `${themeClasses.badgeBg} border-transparent shadow-xs`
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Pilih tanggal kemarin"
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                isOpen
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
              title="Buka / tutup kalender interaktif Indonesia"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{isOpen ? 'Tutup' : 'Kalender'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Rich Indonesian Day & Formatted Date Display Card */}
        <div 
          onClick={triggerNativePicker}
          className="bg-white/90 hover:bg-white border border-slate-200/90 rounded-xl p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors shadow-2xs group"
          title="Klik untuk mengubah tanggal lewat pemilih kalender"
        >
          <div className="flex items-center gap-3">
            {/* Big Badge: Hari & Tanggal */}
            <div className={`px-2.5 py-1 rounded-lg text-center font-black shrink-0 ${themeClasses.badgeBg}`}>
              <div className="text-[9px] tracking-wider uppercase">{parsed.dayName}</div>
              <div className="text-base sm:text-lg leading-tight">{parsed.day}</div>
            </div>

            {/* Detailed Indonesian Date Text */}
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-900 flex items-center gap-1.5">
                <span>{parsed.formatted}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Format: {isoValue} (Tahun {parsed.year})</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-bold text-blue-700 group-hover:underline shrink-0 flex items-center gap-1">
            <span>Ubah Tanggal</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
              Tutup Kalender
            </button>
          </div>
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};
