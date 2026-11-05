import React, { useState, useMemo } from 'react';
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
import { getTamilDateInfo } from '../utils/tamilCalendar';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
} from 'lucide-react';
import { ThithiTimeGraph } from './ThithiTimeGraph';

export interface EnglishMonthCalendarViewProps {
  onSelectPakshaAndDay: (
    paksha: PakshaType,
    day: DayOfWeek,
    selectedDate?: Date
  ) => void;
  selectedDate?: Date | null;
  onOpenModal?: () => void;
  // Location parameters for location-based calculations
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

export const EnglishMonthCalendarView: React.FC<EnglishMonthCalendarViewProps> = ({
  onSelectPakshaAndDay,
  selectedDate: initialSelectedDate,
  onOpenModal,
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
    return initialSelectedDate || new Date();
  });

  const [viewYear, setViewYear] = useState<number>(() => {
    return (initialSelectedDate || new Date()).getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return (initialSelectedDate || new Date()).getMonth();
  });

  const todayDate = useMemo(() => new Date(), []);
  const todayLunarInfo = useMemo(() => {
    return getLunarDayInfo(
      todayDate,
      locationLat !== null && locationLat !== undefined ? locationLat : 13.0827,
      locationLng !== null && locationLng !== undefined ? locationLng : 80.2707,
      locationTimezoneOffset ?? 330
    );
  }, [todayDate, locationLat, locationLng, locationTimezoneOffset]);

  // Selected date lunar and tamil info
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

  const selectedDayId = `${selectedLunarInfo.paksha}_${selectedLunarInfo.dayOfWeek}`;
  const selectedDayMeta = useMemo(() => {
    return PANCHA_PAKSHI_DAYS.find((d) => d.id === selectedDayId);
  }, [selectedDayId]);

  // Monthly matrix for the English month (Jan - Dec)
  const calendarMatrix = useMemo(() => {
    return getMonthCalendarMatrix(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

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
    const today = new Date();
    setActiveDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectPakshaAndDay(
      todayLunarInfo.paksha,
      todayLunarInfo.dayOfWeek,
      today
    );
  };

  const handleSelectDayCell = (dayInfo: LunarDayInfo) => {
    setActiveDate(dayInfo.date);
    onSelectPakshaAndDay(dayInfo.paksha, dayInfo.dayOfWeek, dayInfo.date);
  };

  const monthName =
    language === 'ta' ? MONTH_NAMES_TA[viewMonth] : MONTH_NAMES_EN[viewMonth];

  const yearOptions: number[] = [];
  const currentYearVal = new Date().getFullYear();
  for (let yr = currentYearVal - 4; yr <= currentYearVal + 4; yr++) {
    yearOptions.push(yr);
  }

  const isTodaySelected =
    activeDate.getFullYear() === todayLunarInfo.year &&
    activeDate.getMonth() === todayLunarInfo.month &&
    activeDate.getDate() === todayLunarInfo.dayNumber;

  return (
    <div className="space-y-4">
      {/* 1. TOP OF DATE SCREEN: Selected Date Detail & Pancha Pakshi Shastra Card with Thithi to Thithi Time Graph */}
      <div
        id="eng-cal-selected-date-details-top"
        className="bg-[#FAF6EF] dark:bg-slate-950 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-xs"
      >
        {/* Thaniya Naal Red Alert Banner */}
        {selectedTamilInfo.isThaniyaNaal && (
          <div className="p-3 rounded-xl bg-rose-500/15 border-2 border-rose-500/80 text-rose-950 dark:text-rose-100 flex items-center gap-2.5 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-black text-rose-700 dark:text-rose-300">
                🚨 {language === 'ta' ? 'தனிய நாள் எச்சரிக்கை (Red Alert)!' : 'Thaniya Naal Warning (Red Alert)!'}
              </div>
              <div className="text-[11px] mt-0.5 text-rose-900 dark:text-rose-200">
                {language === 'ta'
                  ? `${selectedTamilInfo.tamilMonthNameTa} ${selectedTamilInfo.tamilDate} தனிய நாளாகும். பஞ்சபட்சி சாஸ்திரப்படி சுபகாரியங்களைத் தவிர்க்கவும்.`
                  : `${selectedTamilInfo.tamilMonthNameEn} ${selectedTamilInfo.tamilDate} is an inauspicious Thaniya Naal. Avoid starting auspicious ventures.`}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட நாள் விபரம்:' : 'Selected Date Details:'}
              </span>
              {isTodaySelected && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-bold">
                  {t('todayButton')}
                </span>
              )}
              {selectedTamilInfo.isThaniyaNaal && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-black">
                  🚨 தனிய நாள்
                </span>
              )}
            </div>

            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span className="text-amber-700 dark:text-amber-400">
                {activeDate.toLocaleDateString(
                  language === 'ta' ? 'ta-IN' : 'en-US',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="font-bold">
                {selectedTamilInfo.tamilMonthNameTa} {selectedTamilInfo.tamilDate}
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>{selectedLunarInfo.moonEmoji}</span>
              <span
                className={
                  selectedLunarInfo.paksha === 'valarpirai'
                    ? 'text-amber-700 dark:text-amber-400 font-bold'
                    : 'text-indigo-700 dark:text-indigo-400 font-bold'
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
              <span className="font-extrabold text-slate-900 dark:text-white">
                ({getDayName(selectedLunarInfo.dayOfWeek)})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onSelectPakshaAndDay(
                selectedLunarInfo.paksha,
                selectedLunarInfo.dayOfWeek,
                activeDate
              )
            }
            id="eng-cal-apply-date-btn"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('selectThisDateBtn')}</span>
          </button>
        </div>

        {/* Astronomical & Shastra Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#D9CFBD] dark:border-slate-800 text-xs">
          {/* Thithi in Tanglish */}
          <div className="p-2.5 rounded-xl bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <span>{language === 'ta' ? 'திதி (Tanglish)' : 'Tithi (Tanglish)'}</span>
            </div>
            <div className="font-black text-amber-700 dark:text-amber-400 mt-0.5 truncate text-xs sm:text-sm">
              {selectedLunarInfo.tithiNameTanglish || selectedLunarInfo.tithiNameEn}{' '}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                ({selectedLunarInfo.tithiNameTa})
              </span>
            </div>
          </div>

          {/* Moon Illumination */}
          <div className="p-2.5 rounded-xl bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'ta' ? 'நிலவு வெளிச்சம்' : 'Illumination'}
            </div>
            <div className="font-black text-slate-900 dark:text-white mt-0.5">
              {selectedLunarInfo.illuminationPercent}%
            </div>
          </div>

          {/* Day / Night Ruler Bird */}
          <div className="p-2.5 rounded-xl bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'ta' ? 'பகல் / இரவு அரசன்' : 'Day / Night Ruler'}
            </div>
            <div className="font-black text-amber-700 dark:text-amber-400 mt-0.5 truncate">
              {selectedDayMeta?.dayRulingBird && selectedDayMeta?.nightRulingBird ? (
                <>
                  {getBirdName(selectedDayMeta.dayRulingBird)} /{' '}
                  {getBirdName(selectedDayMeta.nightRulingBird)}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          {/* Dying Bird */}
          <div className="p-2.5 rounded-xl bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'ta' ? 'இறக்கும் பட்சி' : 'Dying Bird'}
            </div>
            <div className="font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              {(() => {
                const dyingBird =
                  selectedDayMeta?.dyingBird ||
                  selectedDayMeta?.dayDyingBird ||
                  selectedDayMeta?.nightDyingBird;
                return dyingBird ? getBirdName(dyingBird) : '—';
              })()}
            </div>
          </div>
        </div>

        {/* Dedicated Thithi to Thithi Time Graph Component */}
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

      {/* Controls Bar: Prev/Next Month, Month/Year Dropdown, Today */}
      <div className="bg-[#FAF6EF] dark:bg-slate-950/80 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        {/* Month Navigation */}
        <div className="flex items-center justify-between md:justify-start gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label={t('prevMonth')}
            id="eng-cal-prev-month-btn"
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[#EFE7DA] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DCCB] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors shadow-2xs flex items-center justify-center active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base sm:text-lg">
            <span>{monthName}</span>
            <span>{viewYear}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hidden sm:inline">
              {language === 'ta' ? 'ஆங்கில நாட்காட்டி' : 'English Calendar'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label={t('nextMonth')}
            id="eng-cal-next-month-btn"
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[#EFE7DA] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DCCB] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors shadow-2xs flex items-center justify-center active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdowns & Today Shortcut */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          <button
            type="button"
            onClick={handleJumpToToday}
            id="eng-cal-jump-today-btn"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1B4332] text-white hover:bg-[#133024] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ta' ? 'இன்று' : 'Today'}</span>
          </button>

          {/* Month Selector */}
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            aria-label="Select Month"
            className="min-h-[44px] bg-[#EFE7DA] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <option key={idx} value={idx}>
                {language === 'ta' ? MONTH_NAMES_TA[idx] : MONTH_NAMES_EN[idx]}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            aria-label="Select Year"
            className="min-h-[44px] bg-[#EFE7DA] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
          >
            {yearOptions.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title={language === 'ta' ? 'முழுத்திரை நாட்காட்டியைத் திற' : 'Open Fullscreen Modal'}
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{language === 'ta' ? 'பாப்அப்' : 'Popup'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Monthly Matrix Grid (7 columns: Sun to Sat) */}
      <div className="bg-[#FAF6EF] dark:bg-slate-900/90 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-2.5 sm:p-4 shadow-xs">
        {/* Weekday Column Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {WEEKDAY_KEYS.map((wkDay) => {
            const isWeekend = wkDay === 'sunday' || wkDay === 'saturday';
            return (
              <div
                key={wkDay}
                className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                  isWeekend
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60'
                }`}
              >
                {getDayShortName(wkDay)}
              </div>
            );
          })}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarMatrix.map((dayInfo, idx) => {
            if (!dayInfo) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[54px] sm:min-h-[68px] rounded-xl bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/30 opacity-20 pointer-events-none"
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
                id={`eng-cal-cell-${dayInfo.dateString}`}
                className={`min-h-[54px] sm:min-h-[68px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer relative active:scale-95 touch-manipulation select-none ${
                  isThaniya
                    ? isSelected
                      ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-500 shadow-md font-bold z-10'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500/70 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/50 hover:bg-rose-100'
                    : isSelected
                    ? 'bg-amber-500/25 border-amber-500 dark:border-amber-400 text-slate-950 dark:text-white shadow-md ring-2 ring-amber-500/60 dark:ring-amber-400/60 font-bold z-10'
                    : isTodayCell
                    ? 'bg-emerald-50 dark:bg-slate-800/90 border-emerald-500 dark:border-emerald-400/70 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-500/40'
                    : isValarpirai
                    ? 'bg-[#F8F4EB] dark:bg-slate-900/90 hover:bg-[#EDE5D6] dark:hover:bg-slate-800 border-amber-300 dark:border-amber-500/20 text-slate-800 dark:text-slate-200'
                    : 'bg-[#F8F4EB] dark:bg-slate-900/90 hover:bg-[#EDE5D6] dark:hover:bg-slate-800 border-indigo-300 dark:border-indigo-500/20 text-slate-800 dark:text-slate-200'
                }`}
              >
                {/* Top Row: English Day Number & Alert / Today marker */}
                <div className="w-full flex items-center justify-between px-0.5">
                  <span
                    className={`text-xs sm:text-sm font-black ${
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
                    <span
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-black animate-pulse"
                      title="தனிய நாள் (Red Alert)"
                    >
                      🚨
                    </span>
                  ) : isTodayCell ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"
                      title="Today"
                    />
                  ) : null}
                </div>

                {/* Middle: Moon Phase & Tamil Date */}
                <div className="my-0.5 flex items-center justify-center gap-0.5 leading-none">
                  <span className="text-xs sm:text-sm">{dayInfo.moonEmoji}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono font-bold ${
                      isThaniya
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cellTamilInfo.tamilDate}
                  </span>
                </div>

                {/* Bottom: Pirai Tag */}
                <div className="w-full truncate">
                  <span
                    className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold block truncate ${
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
                      ? language === 'ta'
                        ? 'தனிய'
                        : 'Alert'
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
  );
};
