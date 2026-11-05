import React, { useState, useMemo } from 'react';
import { PakshaType, DayOfWeek } from '../types';
import {
  TAMIL_MONTHS,
  TamilMonthDef,
  getTamilDateInfo,
  getTamilMonthMatrix,
  TamilDateInfo,
} from '../utils/tamilCalendar';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  Table as TableIcon,
  CalendarDays,
  Bird,
} from 'lucide-react';

export interface TamilMonthCalendarViewProps {
  onSelectPakshaAndDay: (paksha: PakshaType, day: DayOfWeek, selectedDate?: Date) => void;
  selectedDate?: Date | null;
}

const WEEKDAY_HEADERS = [
  { key: 'sunday', ta: 'ஞாயிறு', taShort: 'ஞா', en: 'Sun' },
  { key: 'monday', ta: 'திங்கள்', taShort: 'திங்', en: 'Mon' },
  { key: 'tuesday', ta: 'செவ்வாய்', taShort: 'செவ்', en: 'Tue' },
  { key: 'wednesday', ta: 'புதன்', taShort: 'புதன்', en: 'Wed' },
  { key: 'thursday', ta: 'வியாழன்', taShort: 'வியா', en: 'Thu' },
  { key: 'friday', ta: 'வெள்ளி', taShort: 'வெள்', en: 'Fri' },
  { key: 'saturday', ta: 'சனி', taShort: 'சனி', en: 'Sat' },
];

export const TamilMonthCalendarView: React.FC<TamilMonthCalendarViewProps> = ({
  onSelectPakshaAndDay,
  selectedDate: initialSelectedDate,
}) => {
  const { language, getDayName } = useLanguage();

  const [activeDate, setActiveDate] = useState<Date>(() => {
    return initialSelectedDate || new Date();
  });

  const activeTamilInfo = useMemo(() => {
    return getTamilDateInfo(activeDate);
  }, [activeDate]);

  // Selected Tamil Month and Gregorian Year view states
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    return activeTamilInfo.tamilMonthIndex;
  });

  const [currentGregorianYear, setCurrentGregorianYear] = useState<number>(() => {
    return activeDate.getFullYear();
  });

  // Tab mode: 'calendar' (monthly grid) or 'table' (12 months reference chart from screenshot)
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  // Matrix calculation for the selected Tamil month
  const monthMatrixData = useMemo(() => {
    return getTamilMonthMatrix(currentGregorianYear, selectedMonthIndex);
  }, [currentGregorianYear, selectedMonthIndex]);

  const selectedMonthDef = TAMIL_MONTHS[selectedMonthIndex];

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setCurrentGregorianYear((y) => y - 1);
    } else {
      setSelectedMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setCurrentGregorianYear((y) => y + 1);
    } else {
      setSelectedMonthIndex((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setActiveDate(today);
    const todayInfo = getTamilDateInfo(today);
    setSelectedMonthIndex(todayInfo.tamilMonthIndex);
    setCurrentGregorianYear(today.getFullYear());
    onSelectPakshaAndDay(todayInfo.paksha, todayInfo.dayOfWeek, today);
  };

  const handleSelectDay = (dayInfo: TamilDateInfo) => {
    setActiveDate(dayInfo.gregorianDate);
    onSelectPakshaAndDay(dayInfo.paksha, dayInfo.dayOfWeek, dayInfo.gregorianDate);
  };

  return (
    <div className="space-y-4 animate-fadeIn select-none">
      {/* 1. Header with View Toggle (Calendar Grid vs Thaniya Naatkal Master Table) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-[#D9CFBD] dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-400 text-xs font-bold mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>{language === 'ta' ? 'தமிழ் மாத நாட்காட்டி & தனிய நாட்கள்' : 'Tamil Month Calendar & Thaniya Naatkal'}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{selectedMonthDef.nameTa} ({selectedMonthDef.nameEn})</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono">
              {selectedMonthDef.zodiacRasiTa} • {activeTamilInfo.tamilYearNameTa}
            </span>
          </h2>
        </div>

        {/* View Switcher Pills */}
        <div className="inline-flex items-center rounded-xl bg-[#EFE7DA] dark:bg-slate-950 border border-[#D9CFBD] dark:border-slate-800 p-1 text-xs font-semibold self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'calendar'
                ? 'bg-[#FAF6EF] dark:bg-slate-850 text-slate-950 dark:text-white font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ta' ? 'மாத நாட்காட்டி' : 'Month Grid'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-rose-500 text-white font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'தனிய நாட்கள் அட்டவணை' : 'Thaniya Naatkal Table'}</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT RED ALERT BANNER if selected date is a Thaniya Naal (Inauspicious Bird Day) */}
      {activeTamilInfo.isThaniyaNaal ? (
        <div className="bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-red-600/20 border-2 border-rose-500/70 dark:border-rose-500/80 rounded-2xl p-3.5 sm:p-4 text-rose-950 dark:text-rose-100 shadow-md animate-scaleIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                  🚨 {language === 'ta' ? 'சிவப்பு எச்சரிக்கை (RED ALERT)' : 'RED ALERT: NON-AUSPICIOUS'}
                </span>
                <span className="font-extrabold text-sm text-rose-800 dark:text-rose-300">
                  {activeTamilInfo.tamilMonthNameTa} {activeTamilInfo.tamilDate}-ஆம் தேதி
                </span>
                <span className="text-xs text-rose-700/80 dark:text-rose-300/80 font-mono">
                  ({activeTamilInfo.dateString})
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-100 leading-snug">
                {language === 'ta'
                  ? 'பஞ்சபட்சி சாஸ்திரப்படி இந்நாள் "தனிய நாள்" (பட்சி வித்தை பலவீனப்படும் நாள்). சுபகாரியங்கள், முக்கிய முதலீடுகள், புதிய முயற்சிகள் அல்லது முக்கிய பயணங்கள் தொடங்குவதைத் தவிர்க்கவும்!'
                  : 'According to Pancha Pakshi Shastra, today is a designated "Thaniya Naal" (Inauspicious Day). Avoid commencing auspicious ceremonies, signing major contracts, or vital travel!'}
              </p>

              <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium pt-0.5 flex items-center gap-2">
                <span>{language === 'ta' ? `மாதத்தின் தனிய தேதிகள்: ${selectedMonthDef.thaniyaDates.join(', ')}` : `Month's Inauspicious Dates: ${selectedMonthDef.thaniyaDates.join(', ')}`}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 px-3.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">
              {language === 'ta'
                ? `தேர்வு: ${activeTamilInfo.tamilMonthNameTa} ${activeTamilInfo.tamilDate} (${activeTamilInfo.dateString}) — இது தனிய நாள் அல்ல (சுபகாரியங்களுக்கு நன்று)`
                : `Selected: ${activeTamilInfo.tamilMonthNameEn} ${activeTamilInfo.tamilDate} (${activeTamilInfo.dateString}) — Auspicious / Standard Day`}
            </span>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 font-bold hidden sm:inline">
            {language === 'ta' ? 'சுப நாள்' : 'Auspicious'}
          </span>
        </div>
      )}

      {/* 3. CALENDAR VIEW MODE */}
      {viewMode === 'calendar' && (
        <div className="space-y-3">
          {/* Quick Month Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {TAMIL_MONTHS.map((m) => {
              const isSelected = selectedMonthIndex === m.index;
              return (
                <button
                  key={m.index}
                  type="button"
                  onClick={() => setSelectedMonthIndex(m.index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-[#FAF6EF] dark:bg-slate-900 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#D9CFBD] dark:border-slate-800'
                  }`}
                >
                  <span>{m.nameTa}</span>
                </button>
              );
            })}
          </div>

          {/* Month Bar with Prev / Next & Jump to Today */}
          <div className="bg-[#FAF6EF] dark:bg-slate-950 p-2.5 rounded-xl border border-[#D9CFBD] dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                id="tamil-cal-prev-month"
                className="p-1.5 rounded-lg bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shadow-2xs"
                title={language === 'ta' ? 'முந்தைய மாதம்' : 'Previous Month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white px-1">
                {selectedMonthDef.nameTa} ({selectedMonthDef.nameEn}) • {currentGregorianYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                id="tamil-cal-next-month"
                className="p-1.5 rounded-lg bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shadow-2xs"
                title={language === 'ta' ? 'அடுத்த மாதம்' : 'Next Month'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold hidden sm:flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? `தனிய தேதிகள்: ${selectedMonthDef.thaniyaDates.join(', ')}` : `Alert: ${selectedMonthDef.thaniyaDates.join(', ')}`}</span>
              </span>

              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-2xs transition-colors"
              >
                {language === 'ta' ? 'இன்று' : 'Today'}
              </button>
            </div>
          </div>

          {/* 7-Column Tamil Monthly Grid */}
          <div className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-2 sm:p-3 shadow-xs">
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
              {WEEKDAY_HEADERS.map((h, i) => (
                <div
                  key={h.key}
                  className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    i === 0 || i === 6
                      ? 'text-amber-800 dark:text-amber-400 bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{language === 'ta' ? h.taShort : h.en}</span>
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {monthMatrixData.days.map((dayInfo, idx) => {
                if (!dayInfo) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[56px] sm:min-h-[68px] rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/40 opacity-20 pointer-events-none"
                    />
                  );
                }

                const isSelected =
                  activeDate.getFullYear() === dayInfo.gregorianDate.getFullYear() &&
                  activeDate.getMonth() === dayInfo.gregorianDate.getMonth() &&
                  activeDate.getDate() === dayInfo.gregorianDate.getDate();

                const isToday = dayInfo.isToday;
                const isThaniya = dayInfo.isThaniyaNaal;

                return (
                  <button
                    key={`tamil-day-${dayInfo.tamilDate}-${dayInfo.dateString}`}
                    type="button"
                    onClick={() => handleSelectDay(dayInfo)}
                    id={`tamil-date-${dayInfo.tamilMonthIndex}-${dayInfo.tamilDate}`}
                    className={`min-h-[56px] sm:min-h-[68px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer relative active:scale-95 touch-manipulation select-none ${
                      isThaniya
                        ? isSelected
                          ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-500 shadow-md font-bold z-10'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500/70 text-rose-950 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/60 ring-1 ring-rose-500/40'
                        : isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md ring-2 ring-emerald-500/50 font-bold z-10'
                        : isToday
                        ? 'bg-amber-50 dark:bg-slate-800 border-amber-500 text-slate-900 dark:text-white ring-1 ring-amber-500/40'
                        : 'bg-[#F8F4EB] dark:bg-slate-900/90 hover:bg-[#EDE5D6] dark:hover:bg-slate-800 border-[#D9CFBD] dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {/* Top Row: Tamil Date Number & Status Indicator */}
                    <div className="w-full flex items-center justify-between px-0.5">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isThaniya && !isSelected
                            ? 'text-rose-700 dark:text-rose-300'
                            : isSelected
                            ? 'text-white'
                            : isToday
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {dayInfo.tamilDate}
                      </span>

                      {/* Red Alert Pill or Today Pill */}
                      {isThaniya ? (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-black tracking-tight ${
                            isSelected
                              ? 'bg-white text-rose-700'
                              : 'bg-rose-600 text-white animate-pulse'
                          }`}
                          title="தனிய நாள் (Red Alert: Non-Auspicious)"
                        >
                          🚨 தனிய
                        </span>
                      ) : isToday ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-emerald-500/50" title="Today" />
                      ) : null}
                    </div>

                    {/* Middle: Moon Phase & Gregorian Snippet */}
                    <div className="my-0.5 flex items-center gap-1 text-[11px] leading-none">
                      <span className="text-xs">{dayInfo.moonEmoji}</span>
                      <span
                        className={`text-[10px] font-medium font-mono ${
                          isSelected
                            ? 'text-white/90'
                            : isThaniya
                            ? 'text-rose-700 dark:text-rose-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {dayInfo.gregorianDate.getDate()}{' '}
                        {dayInfo.gregorianDate.toLocaleString(language === 'ta' ? 'ta-IN' : 'en-US', {
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {/* Bottom: Paksha / Tithi indicator */}
                    <div className="w-full truncate text-[9px] font-semibold">
                      <span
                        className={`${
                          isSelected
                            ? 'text-white/80'
                            : isThaniya
                            ? 'text-rose-800 dark:text-rose-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {dayInfo.paksha === 'valarpirai'
                          ? (language === 'ta' ? 'வளர்' : 'Valar')
                          : (language === 'ta' ? 'தேய்' : 'Thei')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="p-3 rounded-xl bg-[#FAF6EF] dark:bg-slate-950 border border-[#D9CFBD] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                  🚨
                </span>
                <span className="font-bold text-rose-800 dark:text-rose-300">
                  {language === 'ta' ? 'சிவப்பு எச்சரிக்கை: தனிய நாள் (சுபகாரியங்கள் தவிர்க்கவும்)' : 'Red Alert: Thaniya Naal (Non-Auspicious Day)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {language === 'ta' ? 'சுப நாள் (நற்காரியங்களுக்கு ஏற்றது)' : 'Standard Auspicious Day'}
                </span>
              </div>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {language === 'ta' ? 'தேதியைத் தட்டவும்' : 'Tap any date to calculate Jamas'}
            </span>
          </div>
        </div>
      )}

      {/* 4. MASTER THANIYA NAATKAL TABLE VIEW (Matching User Screenshot) */}
      {viewMode === 'table' && (
        <div className="space-y-4 animate-scaleIn">
          {/* Ornate Frame Card */}
          <div className="bg-gradient-to-b from-[#FBF8F1] to-[#FAF6EF] dark:from-slate-900 dark:to-slate-950 border-2 border-amber-600/40 dark:border-amber-500/30 rounded-2xl p-3 sm:p-5 shadow-lg relative overflow-hidden">
            {/* Ornate Top Banner Header */}
            <div className="text-center pb-3 border-b-2 border-amber-500/30 mb-4">
              <div className="inline-block px-5 py-1.5 rounded-xl bg-[#591C21] text-amber-100 font-black text-lg sm:text-xl tracking-wide shadow-md border border-amber-400/40">
                <span>தனிய நாட்கள் (Thaniya Naatkal)</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-300 mt-1 font-semibold">
                பஞ்சபட்சி சாஸ்திரப்படி சுபகாரியங்கள் தொடங்கக் கூடாத தனிய நாட்கள் வரும் தமிழ் தேதிகள்
              </p>
            </div>

            {/* Table with Birds Artwork & 12 Months */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-amber-800/30 dark:border-amber-500/30 rounded-xl overflow-hidden shadow-xs text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#3D1418] text-amber-200">
                    <th className="py-2.5 px-3 text-left font-black border-r border-amber-700/40 w-1/2 sm:w-5/12">
                      தமிழ் மாதம் (Tamil Month)
                    </th>
                    <th className="py-2.5 px-3 text-center font-black border-r border-amber-700/40 w-1/4 sm:w-3/12">
                      ராசி (Zodiac)
                    </th>
                    <th className="py-2.5 px-3 text-center font-black text-rose-300 w-1/4 sm:w-4/12 bg-[#4D151B]">
                      🚨 தனிய நாட்கள் தமிழ் தேதிகள்
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-800/20 dark:divide-slate-800">
                  {TAMIL_MONTHS.map((m, idx) => {
                    const isCurrentMonth = m.index === activeTamilInfo.tamilMonthIndex;
                    return (
                      <tr
                        key={m.index}
                        onClick={() => {
                          setSelectedMonthIndex(m.index);
                          setViewMode('calendar');
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrentMonth
                            ? 'bg-amber-500/15 font-black text-amber-900 dark:text-amber-200'
                            : idx % 2 === 0
                            ? 'bg-amber-500/5 hover:bg-amber-500/10'
                            : 'bg-[#FAF6EF]/60 dark:bg-slate-900/40 hover:bg-amber-500/10'
                        }`}
                        title="Click to view month calendar"
                      >
                        <td className="py-2 px-3 border-r border-amber-800/20 dark:border-slate-800 flex items-center gap-2">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">❖</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {m.nameTa}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">
                            ({m.nameEn})
                          </span>
                          {isCurrentMonth && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                              நடப்பு
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-center border-r border-amber-800/20 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
                          <span>{m.zodiacRasiTa}</span>
                        </td>

                        <td className="py-2 px-3 text-center font-mono font-black text-rose-700 dark:text-rose-300 bg-rose-500/10">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-800 dark:text-rose-200 tracking-wider">
                            {m.thaniyaDates.join(', ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Classical Shastra Note (குறிப்பு) from Screenshot */}
            <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs">
                  🪔
                </span>
                <span className="uppercase tracking-wider">குறிப்பு (Important Shastra Note):</span>
              </div>

              <p className="font-medium leading-relaxed italic pl-7">
                "தனிய நாட்களில் பட்சி வித்தை பழக்குவது என்பது அந்த நாட்களில் சுபகாரியங்கள் எதுவும் தொடங்காமல் இருப்பதைக் குறிக்கும்.
                பஞ்சபட்சி சாஸ்திரத்தில் இந்நாட்கள் சிறப்பு கவனத்துடன் கருதப்படுகின்றன."
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-semibold pl-7">
                <span className="flex items-center gap-1">🦅 சேவல் / வல்லூறு</span>
                <span>•</span>
                <span className="flex items-center gap-1">🦉 ஆந்தை</span>
                <span>•</span>
                <span className="flex items-center gap-1">🐦‍⬛ காகம்</span>
                <span>•</span>
                <span className="flex items-center gap-1">🦜 கிளி</span>
                <span>•</span>
                <span className="flex items-center gap-1">🦚 மயில்</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
