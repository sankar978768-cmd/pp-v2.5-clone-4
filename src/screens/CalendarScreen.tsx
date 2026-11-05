import React, { useState } from 'react';
import { PakshaType, DayOfWeek, Jama } from '../types';
import { EnglishMonthCalendarView } from '../components/EnglishMonthCalendarView';
import { PakshaDaySelector } from '../components/PakshaDaySelector';
import { TamilMonthCalendarView } from '../components/TamilMonthCalendarView';
import { useLanguage } from '../context/LanguageContext';
import { getTamilDateInfo } from '../utils/tamilCalendar';
import { getLunarDayInfo } from '../utils/lunarCalendar';
import {
  Calendar,
  CalendarDays,
  Flame,
  Moon,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export interface CalendarScreenProps {
  selectedPaksha: PakshaType;
  selectedDay: DayOfWeek;
  onSelectPakshaAndDay: (paksha: PakshaType, day: DayOfWeek, selectedDate?: Date) => void;
  onCustomDayUploaded?: (dayId: string, jamas: Jama[]) => void;
  onOpenCalendar: () => void;
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

  const activeDate = selectedDate || new Date();
  const activeTamilInfo = getTamilDateInfo(activeDate);
  const activeLunarInfo = getLunarDayInfo(
    activeDate,
    locationLat !== null && locationLat !== undefined ? locationLat : 13.0827,
    locationLng !== null && locationLng !== undefined ? locationLng : 80.2707,
    locationTimezoneOffset ?? 330
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Screen Title & Active Date Banner */}
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

      {/* Main Calendar View Section */}
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
