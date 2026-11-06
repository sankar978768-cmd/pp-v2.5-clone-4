import React, { useState, useEffect } from 'react';
import { PakshaType, DayOfWeek, Jama } from '../types';
import { EnglishMonthCalendarView } from '../components/EnglishMonthCalendarView';
import { PakshaDaySelector } from '../components/PakshaDaySelector';
import { TamilMonthCalendarView } from '../components/TamilMonthCalendarView';
import { useLanguage } from '../context/LanguageContext';
import { getTamilDateInfo } from '../utils/tamilCalendar';
import { getLunarDayInfo } from '../utils/lunarCalendar';
import {
  searchDates,
  buildDateSearchResult,
  DateSearchResult,
} from '../utils/dateSearch';
import {
  Calendar,
  CalendarDays,
  Flame,
  Moon,
  Layers,
  Sparkles,
  ShieldAlert,
  Search,
  X,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export interface CalendarScreenProps {
  selectedPaksha: PakshaType;
  selectedDay: DayOfWeek;
  onSelectPakshaAndDay: (paksha: PakshaType, day: DayOfWeek, selectedDate?: Date) => void;
  onCustomDayUploaded?: (dayId: string, jamas: Jama[]) => void;
  onOpenCalendar: () => void;
  onNavigateToTab?: (tab: 'jamas' | 'bird' | 'location' | 'calendar') => void;
  selectedDate?: Date | null;
  // Location props
  locationLat?: number | null;
  locationLng?: number | null;
  locationName?: string;
  locationTimezoneOffset?: number;
  timeDisplayMode?: 'local' | 'ist';
  sunriseTime?: string;
  sunsetTime?: string;
  nextSunriseTime?: string;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  selectedPaksha,
  selectedDay,
  onSelectPakshaAndDay,
  onCustomDayUploaded,
  onOpenCalendar,
  onNavigateToTab,
  selectedDate,
  locationLat,
  locationLng,
  locationName,
  locationTimezoneOffset,
  timeDisplayMode = 'local',
  sunriseTime,
  sunsetTime,
  nextSunriseTime,
}) => {
  const { language, getPakshaName, getDayName } = useLanguage();

  // Screen Sub-tab: 'english' (English Calendar Panchang Grid - Default), 'tamil' (Tamil Month Calendar) or 'paksha' (Paksha & Weekdays)
  const [calendarSubTab, setCalendarSubTab] = useState<'english' | 'tamil' | 'paksha'>('english');

  // Date Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DateSearchResult[]>([]);
  const [selectedResultAlert, setSelectedResultAlert] = useState<string | null>(null);

  const activeDate = selectedDate || new Date();
  const effectiveLat = locationLat !== null && locationLat !== undefined ? locationLat : 13.0827;
  const effectiveLng = locationLng !== null && locationLng !== undefined ? locationLng : 80.2707;
  const effectiveTzOffset = locationTimezoneOffset ?? 330;

  const activeTamilInfo = getTamilDateInfo(activeDate);
  const activeLunarInfo = getLunarDayInfo(
    activeDate,
    effectiveLat,
    effectiveLng,
    effectiveTzOffset
  );

  // Live search debouncing / execution
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const results = searchDates(
        trimmed,
        activeDate,
        effectiveLat,
        effectiveLng,
        effectiveTzOffset
      );
      setSearchResults(results);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, activeDate, effectiveLat, effectiveLng, effectiveTzOffset]);

  // Handle native HTML date input
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    if (!isNaN(dateObj.getTime())) {
      const res = buildDateSearchResult(
        dateObj,
        'custom',
        undefined,
        undefined,
        'Selected Date',
        effectiveLat,
        effectiveLng,
        effectiveTzOffset
      );
      setSearchQuery(val);
      setSearchResults([res]);
    }
  };

  // Jump directly to Jamas for that date
  const handleJumpToJamas = (res: DateSearchResult) => {
    onSelectPakshaAndDay(res.paksha, res.dayOfWeek, res.date);
    if (onNavigateToTab) {
      onNavigateToTab('jamas');
    }
  };

  // Select and view on Calendar
  const handleSelectInCalendar = (res: DateSearchResult) => {
    onSelectPakshaAndDay(res.paksha, res.dayOfWeek, res.date);
    const msg =
      language === 'ta'
        ? `${res.titleTa} தேர்ந்தெடுக்கப்பட்டது! பக்ஷம்: ${res.paksha === 'valarpirai' ? 'வளர்பிறை' : 'தேய்பிறை'}, திதி: ${res.tithiNameTa}`
        : `Selected ${res.titleEn}! Paksha: ${res.paksha === 'valarpirai' ? 'Valarpirai' : 'Theipirai'}, Tithi: ${res.tithiNameTanglish}`;
    setSelectedResultAlert(msg);
    setTimeout(() => setSelectedResultAlert(null), 3500);
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn">
      {/* 1. Selection Toast Notification */}
      {selectedResultAlert && (
        <div className="p-3 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-between gap-2 border border-emerald-500 animate-scaleIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{selectedResultAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedResultAlert(null)}
            className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Historical & Future Date Search Bar */}
      <section
        aria-label="Search Historical and Future Dates"
        className="bg-[#FAF6EF] dark:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label
            htmlFor="calendar-date-search-input"
            className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
            <span>
              {language === 'ta'
                ? 'வரலாற்று & எதிர்கால தேதி தேடல்'
                : 'Historical & Future Date Search'}
            </span>
          </label>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பெயர், மாதம் அல்லது ஆண்டு மூலம் தேடுக'
              : 'Search by date, festival, or year'}
          </span>
        </div>

        {/* Search Input Box */}
        <div className="relative flex items-center">
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>

          <input
            id="calendar-date-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'எ.கா. 15 Aug 1947, 26 Jan 1950, பொங்கல், தீபாவளி, சித்திரை 1, 2030...'
                : 'e.g., 15 Aug 1947, 26 Jan 1950, Pongal, Deepavali, Chithirai 1, 2030...'
            }
            className="w-full pl-9 pr-20 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-[#D9CFBD] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 font-medium transition-all"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Native Date Picker trigger */}
            <label
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-[#EFE7DA] dark:hover:bg-slate-700 cursor-pointer relative"
              title={language === 'ta' ? 'தேதி தேர்ந்தெடு' : 'Pick date via calendar'}
            >
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                onChange={handleNativeDateChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Pick date from native calendar"
              />
            </label>
          </div>
        </div>

        {/* Search Results Preview Cards */}
        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#D9CFBD]/60 dark:border-slate-800/80 animate-scaleIn">
            <div className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>
                {language === 'ta'
                  ? `கண்டறியப்பட்ட தேதிகள் (${searchResults.length})`
                  : `Found Dates (${searchResults.length})`}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                {language === 'ta' ? 'சாமங்களுக்கு தாவ கிளிக் செய்க' : 'Click to jump to Jamas'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  className={`p-3 rounded-xl border transition-all ${
                    res.isThaniyaNaal
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                      : 'bg-white dark:bg-slate-800/90 border-[#D9CFBD] dark:border-slate-700 hover:border-[#1B4332]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {language === 'ta' ? res.titleTa : res.titleEn}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {language === 'ta' ? res.subtitleTa : res.subtitleEn}
                      </div>
                    </div>

                    {res.badgeText && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                        {res.badgeText}
                      </span>
                    )}
                  </div>

                  {res.isThaniyaNaal && (
                    <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>{language === 'ta' ? 'தனிய நாள் (சுபகாரியம் தவிர்)' : 'Thaniya Naal (Inauspicious)'}</span>
                    </div>
                  )}

                  {/* Actions: Jump to Jamas vs View in Calendar */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#D9CFBD]/50 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleJumpToJamas(res)}
                      className="flex-1 min-h-[36px] px-2.5 py-1 rounded-lg bg-[#1B4332] hover:bg-[#133024] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                      title={language === 'ta' ? 'இந்த நாளுக்கான சாமங்களுக்கு உடனே தாவுக' : "Jump directly to this day's 10 Jamas schedule"}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'ta' ? 'சாமங்களுக்கு தாவுக ➔' : 'Jump to Jamas ➔'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectInCalendar(res)}
                      className="px-2.5 py-1 min-h-[36px] rounded-lg border border-[#D9CFBD] dark:border-slate-700 bg-[#EFE7DA] dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-[#D9CFBD] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                      title={language === 'ta' ? 'நாட்காட்டியில் பார்க்க' : 'Select in Calendar'}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'தேர்ந்தெடு' : 'Select'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Screen Title & Active Date Banner */}
      <section className="bg-[#FAF6EF] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'தேதி, பக்ஷம் & தமிழ் நாட்காட்டி' : 'Date, Paksha & Tamil Calendar'}</span>
              </span>

              {activeTamilInfo.isThaniyaNaal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black animate-pulse shadow-xs">
                  🚨 {language === 'ta' ? 'இன்று தனிய நாள் (Red Alert)' : 'Today is Thaniya Naal (Red Alert)'}
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
              <span>{activeTamilInfo.tamilMonthNameTa} {activeTamilInfo.tamilDate}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>{getPakshaName(selectedPaksha)} · {getDayName(selectedDay)}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-amber-700 dark:text-amber-400">
                {activeLunarInfo.tithiNameTanglish} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">({activeLunarInfo.tithiNameTa})</span>
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {language === 'ta'
                ? 'தமிழ் மாத நாட்காட்டியில் சுபகாரியங்கள் தொடங்கக் கூடாத தனிய நாட்கள் சிவப்பு எச்சரிக்கையுடன் (Red Alert) குறிக்கப்பட்டுள்ளன.'
                : 'Tamil Month Calendar highlights non-auspicious bird days (Thaniya Naatkal) in Red Alert according to Pancha Pakshi Shastra.'}
            </p>
          </div>

          {/* Quick Panchang Modal Launcher Button */}
          <button
            type="button"
            onClick={onOpenCalendar}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1B4332] text-white hover:bg-[#133024] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all self-start sm:self-center shrink-0"
            title={language === 'ta' ? 'பஞ்சாங்கம் நாட்காட்டியைத் திற' : 'Open Astronomical Panchang'}
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>{language === 'ta' ? 'பஞ்சாங்கம் பாப்அப்' : 'Panchang Grid'}</span>
          </button>
        </div>

        {/* Tab Switcher: English Calendar vs Tamil Month Calendar vs Paksha & Day Selector */}
        <div className="mt-4 pt-3 border-t border-[#D9CFBD] dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCalendarSubTab('english')}
            id="tab-english-calendar"
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              calendarSubTab === 'english'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E5DCCB] dark:hover:bg-slate-700'
            }`}
          >
            <CalendarDays className={`w-3.5 h-3.5 ${calendarSubTab === 'english' ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{language === 'ta' ? 'ஆங்கில நாட்காட்டி (Default)' : 'English Calendar (Default)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCalendarSubTab('tamil')}
            id="tab-tamil-calendar"
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              calendarSubTab === 'tamil'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E5DCCB] dark:hover:bg-slate-700'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${calendarSubTab === 'tamil' ? 'text-amber-400' : 'text-rose-500'}`} />
            <span>{language === 'ta' ? 'தமிழ் மாத நாட்காட்டி' : 'Tamil Month Calendar (Red Alert)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCalendarSubTab('paksha')}
            id="tab-paksha-selector"
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              calendarSubTab === 'paksha'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E5DCCB] dark:hover:bg-slate-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ta' ? 'பக்ஷம் & கிழமை' : 'Paksha & Weekday'}</span>
          </button>
        </div>
      </section>

      {/* 4. Main Calendar View Section */}
      <section aria-label="Calendar Management" className="bg-[#FAF6EF] dark:bg-slate-900/90 p-3 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
        {calendarSubTab === 'english' ? (
          <EnglishMonthCalendarView
            onSelectPakshaAndDay={onSelectPakshaAndDay}
            selectedDate={selectedDate}
            onOpenModal={onOpenCalendar}
            locationLat={locationLat}
            locationLng={locationLng}
            locationName={locationName}
            locationTimezoneOffset={locationTimezoneOffset}
            timeDisplayMode={timeDisplayMode}
            sunriseTime={sunriseTime}
            sunsetTime={sunsetTime}
            nextSunriseTime={nextSunriseTime}
          />
        ) : calendarSubTab === 'tamil' ? (
          <TamilMonthCalendarView
            onSelectPakshaAndDay={onSelectPakshaAndDay}
            selectedDate={selectedDate}
          />
        ) : (
          <PakshaDaySelector
            selectedPaksha={selectedPaksha}
            selectedDay={selectedDay}
            onSelectPakshaAndDay={onSelectPakshaAndDay}
            onCustomDayUploaded={onCustomDayUploaded}
            onOpenCalendar={onOpenCalendar}
            selectedDate={selectedDate}
          />
        )}
      </section>
    </div>
  );
};
