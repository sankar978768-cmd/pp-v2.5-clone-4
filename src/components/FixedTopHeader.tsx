import React from 'react';
import { BirdId, PakshaType, DayOfWeek, DayCalculationMeta } from '../types';
import { BIRD_EMOJIS } from './BirdSelectModal';
import { PANCHA_PAKSHI_DAYS } from '../data/panchaPakshiRegistry';
import { useLanguage } from '../context/LanguageContext';
import {
  Menu,
  Sun,
  Moon,
  CalendarDays,
} from 'lucide-react';

export interface FixedTopHeaderProps {
  onOpenSideMenu: () => void;
  selectedPaksha: PakshaType;
  selectedDay: DayOfWeek;
  selectedCalendarDate: Date | null;
  locationName: string;
  selectedBird: BirdId;
  theme: string;
  setTheme: (theme: 'bright' | 'dark') => void;
  language: string;
  setLanguage: (lang: 'en' | 'ta') => void;
  timeDisplayMode: 'local' | 'ist';
  onToggleTimeDisplayMode: (mode: 'local' | 'ist') => void;
  tzAbbreviation?: string;
  dayMeta?: DayCalculationMeta;
  runningJamaNumber?: number;
  onOpenCalendar?: () => void;
}

export const FixedTopHeader: React.FC<FixedTopHeaderProps> = ({
  onOpenSideMenu,
  selectedPaksha,
  selectedDay,
  selectedBird,
  theme,
  setTheme,
  language,
  setLanguage,
  timeDisplayMode,
  onToggleTimeDisplayMode,
  tzAbbreviation = 'Local',
  dayMeta,
  runningJamaNumber = 1,
  onOpenCalendar,
}) => {
  const { getBirdName } = useLanguage();

  const currentDayMeta =
    dayMeta ||
    PANCHA_PAKSHI_DAYS.find((d) => d.id === `${selectedPaksha}_${selectedDay}`) ||
    PANCHA_PAKSHI_DAYS[0];

  const dayRulerBird = currentDayMeta?.dayRulingBird;
  const nightRulerBird = currentDayMeta?.nightRulingBird;
  const dyingBird =
    currentDayMeta?.dyingBird ||
    currentDayMeta?.dayDyingBird ||
    currentDayMeta?.nightDyingBird;

  const isDayRunning = runningJamaNumber >= 1 && runningJamaNumber <= 5;

  return (
    <header
      id="fixed-top-header"
      className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-[#E8DFCE] dark:border-slate-800 shadow-xs transition-colors duration-150 pt-[calc(4px+env(safe-area-inset-top,0px))] pb-1 sm:pb-1.5"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-3">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 h-8 sm:h-9">
          {/* Left Zone: Hamburger Side Menu Button + Bird Mark & Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSideMenu}
              id="top-side-menu-trigger-btn"
              className="h-8 w-8 rounded-lg bg-[#1B4332] hover:bg-[#133024] text-white flex items-center justify-center shrink-0 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs touch-manipulation"
              title={language === 'ta' ? 'பக்க மெனுவை திறக்கவும்' : 'Open Side Menu'}
              aria-label={language === 'ta' ? 'பக்க மெனுவை திறக்கவும்' : 'Open Side Menu'}
            >
              <Menu className="w-4 h-4 text-amber-400" />
            </button>

            {/* Bird Mark & App Title */}
            <button
              type="button"
              onClick={onOpenSideMenu}
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
              title={language === 'ta' ? 'பட்சி மாற்ற மெனுவை திறக்கவும்' : 'Click to change bird or settings'}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-sm sm:text-base font-black shadow-xs shrink-0 select-none">
                {BIRD_EMOJIS[selectedBird] || '🦅'}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                Pancha Pakshi
              </span>
            </button>
          </div>

          {/* Center / Right Zone: Dedicated IST Switcher + Preferences */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* IST Switcher (Always accessible in top bar) */}
            <div
              id="header-ist-switcher"
              className="h-7 sm:h-8 p-0.5 rounded-lg bg-[#FAF6EE] dark:bg-slate-900 border border-[#E8DFCE] dark:border-slate-800 flex items-center shadow-2xs select-none"
            >
              <button
                type="button"
                onClick={() => onToggleTimeDisplayMode('local')}
                id="header-switch-local-btn"
                className={`h-full px-2 sm:px-2.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  timeDisplayMode === 'local'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
                title={language === 'ta' ? `உள்ளூர் சூரிய நேரம் (${tzAbbreviation})` : `Local Solar Time (${tzAbbreviation})`}
              >
                <span>📍</span>
                <span className="hidden min-[420px]:inline">{tzAbbreviation || 'Local'}</span>
                <span className="min-[420px]:hidden">Loc</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleTimeDisplayMode('ist')}
                id="header-switch-ist-btn"
                className={`h-full px-2 sm:px-2.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  timeDisplayMode === 'ist'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
                title={language === 'ta' ? 'இந்திய நிலையான நேரம் (IST +05:30)' : 'Indian Standard Time (IST +05:30)'}
              >
                <span>🇮🇳</span>
                <span>IST</span>
              </button>
            </div>

            {/* Panchang Grid Icon (English Calendar Default) - Placed next to IST switcher */}
            <button
              type="button"
              onClick={onOpenCalendar}
              id="header-panchang-grid-btn"
              className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg bg-[#FAF6EE] dark:bg-slate-900 hover:bg-amber-500/15 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 border border-[#E8DFCE] dark:border-slate-800 hover:border-amber-400/50 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs touch-manipulation select-none"
              title={
                language === 'ta'
                  ? 'பஞ்சாங்கம் நாட்காட்டி கட்டம் (English Calendar Default)'
                  : 'Panchang Grid (English Calendar Default)'
              }
              aria-label={
                language === 'ta'
                  ? 'பஞ்சாங்கம் நாட்காட்டி கட்டம்'
                  : 'Panchang Grid'
              }
            >
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'bright' : 'dark')}
              className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
              title={language === 'ta' ? 'தோற்றம் மாற்றவும்' : 'Toggle Theme'}
              aria-label={language === 'ta' ? 'தோற்றம் மாற்றவும்' : 'Toggle Theme'}
            >
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 dark:hidden text-amber-500" />
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden dark:block text-amber-400" />
            </button>

            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center text-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
              title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
              aria-label={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
            >
              {language === 'en' ? 'த' : 'EN'}
            </button>
          </div>
        </div>

        {/* Sticky Top Bar Rulers Strip (Day Ruler, Night Ruler, Dying Bird) */}
        {currentDayMeta && (
          <div
            id="top-bar-rulers-strip"
            className="flex items-center justify-between gap-1 sm:gap-2 pt-1 mt-0.5 border-t border-[#E8DFCE]/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar text-[10px] sm:text-[11px]"
          >
            {/* Day Ruler Chip */}
            <div
              className={`flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md border transition-all ${
                isDayRunning
                  ? 'bg-amber-500/15 text-amber-950 dark:text-amber-200 border-amber-500/40 font-bold'
                  : 'bg-amber-500/5 text-amber-900/70 dark:text-amber-300/70 border-amber-500/20'
              }`}
              title={language === 'ta' ? 'பகல் அரசு பட்சி (சாமம் 1-5)' : 'Day Ruler Bird (Jamas 1-5)'}
            >
              <span className="text-[11px]">☀️</span>
              <span className="text-[9px] sm:text-[10px] font-semibold opacity-75">
                {language === 'ta' ? 'பகல்:' : 'Day:'}
              </span>
              <span className="font-extrabold flex items-center gap-0.5">
                {dayRulerBird && BIRD_EMOJIS[dayRulerBird]} {dayRulerBird ? getBirdName(dayRulerBird) : '-'}
              </span>
              {isDayRunning && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </div>

            {/* Night Ruler Chip */}
            <div
              className={`flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md border transition-all ${
                !isDayRunning
                  ? 'bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border-indigo-500/40 font-bold'
                  : 'bg-indigo-500/5 text-indigo-900/70 dark:text-indigo-300/70 border-indigo-500/20'
              }`}
              title={language === 'ta' ? 'இரவு அரசு பட்சி (சாமம் 6-10)' : 'Night Ruler Bird (Jamas 6-10)'}
            >
              <span className="text-[11px]">🌙</span>
              <span className="text-[9px] sm:text-[10px] font-semibold opacity-75">
                {language === 'ta' ? 'இரவு:' : 'Night:'}
              </span>
              <span className="font-extrabold flex items-center gap-0.5">
                {nightRulerBird && BIRD_EMOJIS[nightRulerBird]} {nightRulerBird ? getBirdName(nightRulerBird) : '-'}
              </span>
              {!isDayRunning && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </div>

            {/* Dying Bird Chip */}
            <div
              className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-950 dark:text-rose-200 border border-rose-500/30"
              title={language === 'ta' ? 'சாவுப் பட்சி / மரண பட்சி (சுபகாரியம் தவிர்)' : 'Dying Bird (Inauspicious)'}
            >
              <span className="text-[11px]">⚠️</span>
              <span className="text-[9px] sm:text-[10px] font-semibold opacity-75">
                {language === 'ta' ? 'சாவு:' : 'Dying:'}
              </span>
              <span className="font-extrabold flex items-center gap-0.5 text-rose-700 dark:text-rose-300">
                {dyingBird && BIRD_EMOJIS[dyingBird]} {dyingBird ? getBirdName(dyingBird) : '-'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
