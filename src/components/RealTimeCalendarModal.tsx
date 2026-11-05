import React, { useState, useEffect, useMemo } from 'react';
import { PakshaType, DayOfWeek } from '../types';
import { PANCHA_PAKSHI_DAYS } from '../data/panchaPakshiRegistry';
import { BIRDS } from '../data/panchaPakshiData';
import {
  getLunarDayInfo,
  getMonthCalendarMatrix,
  MONTH_NAMES_EN,
  MONTH_NAMES_TA,
  LunarDayInfo,
} from '../utils/lunarCalendar';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { getTamilDateInfo } from '../utils/tamilCalendar';
import { ThithiTimeGraph } from './ThithiTimeGraph';

interface RealTimeCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPaksha: PakshaType;
  currentDay: DayOfWeek;
  onSelectPakshaAndDay: (
    paksha: PakshaType,
    day: DayOfWeek,
    selectedDate?: Date
  ) => void;
  selectedDate?: Date | null;
  todayLunarInfo?: LunarDayInfo;
  todayDate?: Date;
  locationLat?: number | null;
  locationLng?: number | null;
  locationName?: string;
  locationTimezoneOffset?: number;
  timeDisplayMode?: 'local' | 'ist';
  sunriseTime?: string;
  sunsetTime?: string;
  nextSunriseTime?: string;
}

const WEEKDAY_KEYS: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const RealTimeCalendarModal: React.FC<RealTimeCalendarModalProps> = ({
  isOpen,
  onClose,
  currentPaksha,
  currentDay,
  onSelectPakshaAndDay,
  selectedDate: initialSelectedDate,
  todayLunarInfo: propTodayLunarInfo,
  todayDate: propTodayDate,
  locationLat,
  locationLng,
  locationName,
  locationTimezoneOffset,
  timeDisplayMode = 'local',
  sunriseTime,
  sunsetTime,
  nextSunriseTime,
}) => {
  const { language, t, getBirdName, getDayName, getDayShortName } =
    useLanguage();

  const [activeDate, setActiveDate] = useState<Date>(() => {
    return initialSelectedDate || propTodayDate || new Date();
  });

  const [viewYear, setViewYear] = useState<number>(() => {
    return (initialSelectedDate || propTodayDate || new Date()).getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return (initialSelectedDate || propTodayDate || new Date()).getMonth();
  });

  // Real-time ticking clock for "Live Now" banner
  const [liveNow, setLiveNow] = useState<Date>(new Date());
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Today's real-time lunar information (anchored to today, never stale)
  const todayLunarInfo = useMemo(() => {
    return propTodayLunarInfo || getLunarDayInfo(propTodayDate || liveNow);
  }, [propTodayLunarInfo, propTodayDate, liveNow]);

  // Active selected date's lunar information
  const selectedLunarInfo = useMemo(() => {
    return getLunarDayInfo(
      activeDate,
      locationLat !== null && locationLat !== undefined ? locationLat : 13.0827,
      locationLng !== null && locationLng !== undefined ? locationLng : 80.2707,
      locationTimezoneOffset ?? 330
    );
  }, [activeDate, locationLat, locationLng, locationTimezoneOffset]);

  const selectedTamilInfo = useMemo(() => {
    return getTamilDateInfo(activeDate);
  }, [activeDate]);

  // Find Pancha Pakshi day metadata for selected date
  const selectedDayId = `${selectedLunarInfo.paksha}_${selectedLunarInfo.dayOfWeek}`;
  const selectedDayMeta = useMemo(() => {
    return PANCHA_PAKSHI_DAYS.find((d) => d.id === selectedDayId);
  }, [selectedDayId]);

  // Monthly matrix
  const calendarMatrix = useMemo(() => {
    return getMonthCalendarMatrix(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Keep view synchronized if opened with a specific selected date
  useEffect(() => {
    if (initialSelectedDate) {
      setActiveDate(initialSelectedDate);
      setViewYear(initialSelectedDate.getFullYear());
      setViewMonth(initialSelectedDate.getMonth());
    }
  }, [initialSelectedDate, isOpen]);

  if (!isOpen) return null;

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

  const handleJumpToToday = () => {
    const today = propTodayDate || new Date();
    setActiveDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleSelectDayCell = (dayInfo: LunarDayInfo) => {
    setActiveDate(dayInfo.date);
    onSelectPakshaAndDay(dayInfo.paksha, dayInfo.dayOfWeek, dayInfo.date);
  };

  const handleApplyRealtimeToday = () => {
    const today = propTodayDate || new Date();
    setActiveDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectPakshaAndDay(
      todayLunarInfo.paksha,
      todayLunarInfo.dayOfWeek,
      today
    );
  };

  const handleDirectDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      const newDate = new Date(y, m - 1, d, 12, 0, 0);
      setActiveDate(newDate);
      setViewYear(y);
      setViewMonth(m - 1);
      const info = getLunarDayInfo(newDate);
      onSelectPakshaAndDay(info.paksha, info.dayOfWeek, newDate);
    }
  };

  const monthName =
    language === 'ta' ? MONTH_NAMES_TA[viewMonth] : MONTH_NAMES_EN[viewMonth];

  const yearOptions: number[] = [];
  const currentYearVal = new Date().getFullYear();
  for (let yr = currentYearVal - 5; yr <= currentYearVal + 5; yr++) {
    yearOptions.push(yr);
  }

  const isTodaySelected =
    activeDate.getFullYear() === todayLunarInfo.year &&
    activeDate.getMonth() === todayLunarInfo.month &&
    activeDate.getDate() === todayLunarInfo.dayNumber;

  const isCurrentAppSynced =
    currentPaksha === selectedLunarInfo.paksha &&
    currentDay === selectedLunarInfo.dayOfWeek;

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="realtime-calendar-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] my-auto select-none">
        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#D9CFBD] dark:border-slate-800 flex items-center justify-between bg-[#EFE7DA]/70 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>{t('calendarTitle')}</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {language === 'ta' ? 'ஆங்கில நாட்காட்டி (Default)' : 'English Calendar (Default)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('calendarSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Calendar"
            id="close-realtime-calendar-btn"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Live Real-Time Banner (Android & Mobile Fast-Sync) */}
          <div className="bg-gradient-to-r from-amber-500/10 via-[#FAF6EF] dark:via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] tracking-wider border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t('liveTodayBadge')}</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{liveNow.toLocaleTimeString()}</span>
                  </span>
                </div>

                <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>
                    {todayLunarInfo.moonEmoji}{' '}
                    {language === 'ta'
                      ? todayLunarInfo.paksha === 'valarpirai'
                        ? 'வளர்பிறை'
                        : 'தேய்பிறை'
                      : todayLunarInfo.paksha === 'valarpirai'
                      ? 'Valarpirai (Waxing)'
                      : 'Theipirai (Waning)'}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-amber-700 dark:text-amber-300 font-bold">
                    {getDayName(todayLunarInfo.dayOfWeek)}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                    {language === 'ta'
                      ? todayLunarInfo.tithiNameTa
                      : todayLunarInfo.tithiNameEn}{' '}
                    ({todayLunarInfo.illuminationPercent}%{' '}
                    {language === 'ta' ? 'நிலவு' : 'Moon'})
                  </span>
                </div>
              </div>

              {/* 1-Tap Sync with Today Button */}
              <button
                type="button"
                onClick={handleApplyRealtimeToday}
                id="apply-today-realtime-btn"
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>{t('applyTodayBtn')}</span>
              </button>
            </div>
          </div>

          {/* Selected Date Detail & Pancha Pakshi Preview Card (TOP POSITION) */}
          <div
            id="modal-selected-date-details-top"
            className="bg-[#FAF6EF] dark:bg-slate-950 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3"
          >
            {/* Red Alert warning if selected date is a Thaniya Naal */}
            {selectedTamilInfo.isThaniyaNaal && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border-2 border-rose-500/70 text-rose-950 dark:text-rose-100 flex items-center gap-2 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  🚨 {language === 'ta'
                    ? `சிவப்பு எச்சரிக்கை: ${selectedTamilInfo.tamilMonthNameTa} ${selectedTamilInfo.tamilDate} தனிய நாளாகும். சுபகாரியங்களைத் தவிர்க்கவும்!`
                    : `Red Alert: ${selectedTamilInfo.tamilMonthNameEn} ${selectedTamilInfo.tamilDate} is an inauspicious Thaniya Naal. Avoid auspicious ventures!`}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட நாள்:' : 'Selected Date Details:'}
                  </span>
                  {selectedTamilInfo.isThaniyaNaal ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-black uppercase tracking-wider">
                      🚨 தனிய நாள்
                    </span>
                  ) : null}
                  {isTodaySelected && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-bold">
                      {t('todayButton')}
                    </span>
                  )}
                  {isCurrentAppSynced && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('appliedNotice')}</span>
                    </span>
                  )}
                </div>

                <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span className="text-amber-700 dark:text-amber-300 font-black">
                    {selectedTamilInfo.tamilMonthNameTa} {selectedTamilInfo.tamilDate}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span>{selectedLunarInfo.moonEmoji}</span>
                  <span
                    className={
                      selectedLunarInfo.paksha === 'valarpirai'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-indigo-700 dark:text-indigo-400'
                    }
                  >
                    {language === 'ta'
                      ? selectedLunarInfo.paksha === 'valarpirai'
                        ? 'வளர்பிறை'
                        : 'தேய்பிறை'
                      : selectedLunarInfo.paksha === 'valarpirai'
                      ? 'Valarpirai'
                      : 'Theipirai'}
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold">
                    {getDayName(selectedLunarInfo.dayOfWeek)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                    (
                    {activeDate.toLocaleDateString(
                      language === 'ta' ? 'ta-IN' : 'en-US',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                    )
                  </span>
                </div>
              </div>

              {/* Apply / Confirmed Button */}
              <button
                type="button"
                onClick={() => {
                  onSelectPakshaAndDay(
                    selectedLunarInfo.paksha,
                    selectedLunarInfo.dayOfWeek,
                    activeDate
                  );
                  onClose();
                }}
                id="apply-selected-calendar-date-btn"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>{t('selectThisDateBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Astrological Breakdown: Tithi, Moon Phase, Illumination & Shastra Rulers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#D9CFBD] dark:border-slate-800 text-[11px]">
              {/* Tithi in Tanglish */}
              <div className="bg-[#EFE7DA]/60 dark:bg-slate-900/80 p-2 rounded-xl border border-[#D9CFBD] dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {language === 'ta' ? 'திதி (Tanglish)' : 'Tithi (Tanglish)'}
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400 truncate block">
                  {selectedLunarInfo.tithiNameTanglish || selectedLunarInfo.tithiNameEn}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({selectedLunarInfo.tithiNameTa})
                  </span>
                </span>
              </div>

              {/* Moon Phase & Illumination */}
              <div className="bg-[#EFE7DA]/60 dark:bg-slate-900/80 p-2 rounded-xl border border-[#D9CFBD] dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{t('illuminationLabel')}</span>
                <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <span>{selectedLunarInfo.illuminationPercent}%</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">
                    {language === 'ta'
                      ? selectedLunarInfo.moonPhaseNameTa
                      : selectedLunarInfo.moonPhaseNameEn}
                  </span>
                </span>
              </div>

              {/* Day Ruler Bird */}
              <div className="bg-[#EFE7DA]/60 dark:bg-slate-900/80 p-2 rounded-xl border border-[#D9CFBD] dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>{t('dayRulerShort')}</span>
                </span>
                <span className="font-bold text-amber-800 dark:text-amber-200 truncate block">
                  {selectedDayMeta?.dayRulingBird
                    ? getBirdName(selectedDayMeta.dayRulingBird)
                    : '—'}
                </span>
              </div>

              {/* Dying Bird */}
              <div className="bg-[#EFE7DA]/60 dark:bg-slate-900/80 p-2 rounded-xl border border-[#D9CFBD] dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] flex items-center gap-1">
                  <Moon className="w-3 h-3 text-purple-500" />
                  <span>{t('nightRulerShort')}</span>
                </span>
                <span className="font-bold text-purple-800 dark:text-purple-200 truncate block">
                  {selectedDayMeta?.nightRulingBird
                    ? getBirdName(selectedDayMeta.nightRulingBird)
                    : '—'}
                </span>
              </div>
            </div>

            {/* Thithi to Thithi Time Graph Component */}
            <ThithiTimeGraph
              selectedDate={activeDate}
              onSelectDate={(newDate) => {
                setActiveDate(newDate);
                const info = getLunarDayInfo(
                  newDate,
                  locationLat !== null && locationLat !== undefined ? locationLat : 13.0827,
                  locationLng !== null && locationLng !== undefined ? locationLng : 80.2707,
                  locationTimezoneOffset ?? 330
                );
                onSelectPakshaAndDay(info.paksha, info.dayOfWeek, newDate);
              }}
              locationLat={locationLat}
              locationLng={locationLng}
              locationName={locationName}
              locationTimezoneOffset={locationTimezoneOffset}
              timeDisplayMode={timeDisplayMode}
              sunriseTime={sunriseTime}
              sunsetTime={sunsetTime}
              nextSunriseTime={nextSunriseTime}
            />
          </div>

          {/* Calendar Month & Navigation Controls */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Prev / Month / Next */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label={t('prevMonth')}
                id="cal-prev-month-btn"
                className="p-1.5 rounded-lg bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                <span>{monthName}</span>
                <span>{viewYear}</span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label={t('nextMonth')}
                id="cal-next-month-btn"
                className="p-1.5 rounded-lg bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Jump to Today & Month/Year Selectors */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleJumpToToday}
                id="cal-jump-today-btn"
                className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EF] dark:bg-slate-800 hover:bg-[#EFE7DA] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-[#D9CFBD] dark:border-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span>{t('todayButton')}</span>
              </button>

              {/* Month Dropdown */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                aria-label="Select Month"
                className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] rounded-lg px-2 py-1.5 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
              >
                {Array.from({ length: 12 }).map((_, idx) => (
                  <option key={idx} value={idx}>
                    {language === 'ta' ? MONTH_NAMES_TA[idx] : MONTH_NAMES_EN[idx]}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                aria-label="Select Year"
                className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] rounded-lg px-2 py-1.5 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Direct Native Date input for Android touch ease */}
              <input
                type="date"
                onChange={handleDirectDateInput}
                value={selectedLunarInfo.dateString}
                aria-label="Select specific date"
                className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-amber-500 w-28 text-center shadow-2xs"
                title={t('datePickerLabel')}
              />
            </div>
          </div>

          {/* Monthly Matrix Grid */}
          <div className="bg-[#FAF6EF] dark:bg-slate-950/90 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-2 sm:p-3 overflow-hidden">
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 text-center">
              {WEEKDAY_KEYS.map((wkDay) => {
                const isWeekend = wkDay === 'sunday' || wkDay === 'saturday';
                return (
                  <div
                    key={wkDay}
                    className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                      isWeekend ? 'text-amber-700 dark:text-amber-400/90' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {getDayShortName(wkDay)}
                  </div>
                );
              })}
            </div>

            {/* Calendar Day Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarMatrix.map((dayInfo, idx) => {
                if (!dayInfo) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[46px] sm:min-h-[58px] rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/40 opacity-20 pointer-events-none"
                    />
                  );
                }

                const isSelected =
                  activeDate.getFullYear() === dayInfo.year &&
                  activeDate.getMonth() === dayInfo.month &&
                  activeDate.getDate() === dayInfo.dayNumber;

                const isTodayCell = dayInfo.isToday;
                const isValarpirai = dayInfo.paksha === 'valarpirai';
                const cellTamilInfo = getTamilDateInfo(dayInfo.date);
                const isThaniya = cellTamilInfo.isThaniyaNaal;

                return (
                  <button
                    key={dayInfo.dateString}
                    type="button"
                    onClick={() => handleSelectDayCell(dayInfo)}
                    id={`cal-date-${dayInfo.dateString}`}
                    className={`min-h-[46px] sm:min-h-[58px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer relative active:scale-95 ${
                      isThaniya
                        ? isSelected
                          ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-500 shadow-md font-bold z-10'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500/70 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/50 hover:bg-rose-100'
                        : isSelected
                        ? 'bg-amber-500/25 border-amber-500 dark:border-amber-400 text-slate-950 dark:text-white shadow-md ring-2 ring-amber-500/60 dark:ring-amber-400/60 font-bold z-10'
                        : isTodayCell
                        ? 'bg-emerald-50 dark:bg-slate-800/90 border-emerald-500 dark:border-emerald-400/70 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-500/40'
                        : isValarpirai
                        ? 'bg-[#F8F4EB] dark:bg-slate-900/90 hover:bg-[#EDE5D6] dark:hover:bg-slate-800 border-[#D9CFBD] dark:border-amber-500/20 text-slate-800 dark:text-slate-200'
                        : 'bg-[#F8F4EB] dark:bg-slate-900/90 hover:bg-[#EDE5D6] dark:hover:bg-slate-800 border-[#D9CFBD] dark:border-indigo-500/20 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {/* Top Row: Day Number & Today dot / Alert badge */}
                    <div className="w-full flex items-center justify-between px-0.5">
                      <span
                        className={`text-xs sm:text-sm font-extrabold ${
                          isThaniya && !isSelected
                            ? 'text-rose-700 dark:text-rose-300'
                            : isSelected
                            ? 'text-amber-800 dark:text-amber-300'
                            : isTodayCell
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {dayInfo.dayNumber}
                      </span>

                      {isThaniya ? (
                        <span className="text-[9px] text-rose-600 dark:text-rose-400 font-black" title="தனிய நாள் (Red Alert)">
                          🚨
                        </span>
                      ) : isTodayCell ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"
                          title="Today"
                        />
                      ) : null}
                    </div>

                    {/* Middle: Moon Phase Graphic & Tamil Date */}
                    <div className="my-0.2 flex items-center justify-center gap-0.5 leading-none">
                      <span className="text-xs">{dayInfo.moonEmoji}</span>
                      <span className={`text-[9px] font-mono font-bold ${isThaniya ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cellTamilInfo.tamilDate}
                      </span>
                    </div>

                    {/* Bottom: Pirai Tag */}
                    <div className="w-full truncate">
                      <span
                        className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-semibold block truncate ${
                          isThaniya
                            ? isSelected
                              ? 'bg-rose-700 text-white font-black'
                              : 'bg-rose-500/20 text-rose-800 dark:text-rose-200 font-bold'
                            : isValarpirai
                            ? isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                            : isSelected
                            ? 'bg-indigo-500 text-white font-bold'
                            : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300'
                        }`}
                      >
                        {isThaniya
                          ? (language === 'ta' ? 'தனிய' : 'Alert')
                          : language === 'ta'
                          ? isValarpirai
                            ? 'வளர்'
                            : 'தேய்'
                          : isValarpirai
                          ? 'Waxing'
                          : 'Waning'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            {language === 'ta'
              ? 'வானியல் முறைப்படி சூரிய-சந்திர கோணம் மூலம் கணக்கிடப்படுகிறது.'
              : 'Computed via solar-lunar astronomical elongation equations.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold cursor-pointer ml-auto transition-colors"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
