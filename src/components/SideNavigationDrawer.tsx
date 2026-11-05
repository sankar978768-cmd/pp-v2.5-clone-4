import React, { useState, useEffect } from 'react';
import { BirdId, PakshaType, DayOfWeek, DayCalculationMeta, Jama } from '../types';
import { PakshaDaySelector } from './PakshaDaySelector';
import { SunriseSunsetBar } from './SunriseSunsetBar';
import { BirdSelector } from './BirdSelector';
import { BIRD_EMOJIS } from './BirdSelectModal';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Calendar,
  MapPin,
  Feather,
  BarChart3,
  Settings,
  Layers,
  Sparkles,
  Clock,
  RotateCcw,
  Sun,
  Moon,
  ChevronRight,
  TrendingUp,
  Table,
  Users,
} from 'lucide-react';

export type DrawerCategory = 'all' | 'date' | 'location' | 'bird' | 'analytics' | 'settings';

export interface SideNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: DrawerCategory;
  // Category: Date & Paksha
  selectedPaksha: PakshaType;
  selectedDay: DayOfWeek;
  selectedCalendarDate: Date | null;
  onSelectPakshaAndDay: (paksha: PakshaType, day: DayOfWeek, selectedDate?: Date) => void;
  onCustomDayUploaded?: (dayId: string, jamas: Jama[]) => void;
  onOpenCalendarModal: () => void;
  // Category: Location & Solar
  sunriseTime: string;
  sunsetTime: string;
  nextSunriseTime: string;
  displaySunrise?: string;
  displaySunset?: string;
  displayNextSunrise?: string;
  isCustomSchedule: boolean;
  onApplySunriseSunset: (
    sunrise: string,
    sunset: string,
    nextSunrise: string,
    cityName?: string,
    lat?: number,
    lng?: number,
    timezone?: string,
    timezoneOffset?: number
  ) => void;
  onResetSchedule: () => void;
  locationName: string;
  baseJamas: Jama[];
  isOtherLocation: boolean;
  timeDisplayMode: 'local' | 'ist';
  onToggleTimeDisplayMode?: (mode: 'local' | 'ist') => void;
  tzAbbreviation: string;
  timeDifferenceText?: string;
  localDayName?: string;
  localDateText?: string;
  localPakshaText?: string;
  localTimeText?: string;
  // Category: Bird
  selectedBird: BirdId;
  onSelectBird: (birdId: BirdId) => void;
  dayMeta?: DayCalculationMeta;
  // Category: Analytics Modals
  onOpenAnalyticsModal: (tab: 'chart' | 'master' | 'relationships') => void;
  onOpenLookupModal: () => void;
}

export const SideNavigationDrawer: React.FC<SideNavigationDrawerProps> = ({
  isOpen,
  onClose,
  initialCategory = 'all',
  selectedPaksha,
  selectedDay,
  selectedCalendarDate,
  onSelectPakshaAndDay,
  onCustomDayUploaded,
  onOpenCalendarModal,
  sunriseTime,
  sunsetTime,
  nextSunriseTime,
  displaySunrise,
  displaySunset,
  displayNextSunrise,
  isCustomSchedule,
  onApplySunriseSunset,
  onResetSchedule,
  locationName,
  baseJamas,
  isOtherLocation,
  timeDisplayMode,
  onToggleTimeDisplayMode,
  tzAbbreviation,
  timeDifferenceText,
  localDayName,
  localDateText,
  localPakshaText,
  localTimeText,
  selectedBird,
  onSelectBird,
  dayMeta,
  onOpenAnalyticsModal,
  onOpenLookupModal,
}) => {
  const { language, setLanguage, t, getBirdName, getPakshaName, getDayName } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [activeCategory, setActiveCategory] = useState<DrawerCategory>(initialCategory);

  useEffect(() => {
    if (isOpen && initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: language === 'ta' ? 'அனைத்தும்' : 'All', icon: Layers },
    {
      id: 'date',
      label: language === 'ta' ? 'தேதி & பக்ஷம்' : 'Date & Paksha',
      icon: Calendar,
      badge: `${getPakshaName(selectedPaksha).split(' ')[0]} · ${getDayName(selectedDay).slice(0, 3)}`,
    },
    {
      id: 'location',
      label: language === 'ta' ? 'இடம் & சூரியன்' : 'Location & Solar',
      icon: MapPin,
      badge: (locationName || 'Chennai').slice(0, 10),
    },
    {
      id: 'bird',
      label: language === 'ta' ? 'பட்சி தேர்வு' : 'Bird Selection',
      icon: Feather,
      badge: `${BIRD_EMOJIS[selectedBird] || ''} ${getBirdName(selectedBird)}`,
    },
    {
      id: 'analytics',
      label: language === 'ta' ? 'பகுப்பாய்வு' : 'Analytics & Tools',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: language === 'ta' ? 'அமைப்புகள்' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pancha Pakshi Side Menu"
        className="fixed inset-y-0 left-0 w-full max-w-md sm:max-w-lg bg-[#FAF6EF] dark:bg-slate-900 border-r border-[#D9CFBD] dark:border-slate-800 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out pt-[calc(10px+env(safe-area-inset-top,0px))] pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF]/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-amber-400 font-bold flex items-center justify-center text-lg shadow-xs">
              {BIRD_EMOJIS[selectedBird] || '🦅'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{language === 'ta' ? 'பஞ்ச பட்சி மெனு' : 'Pancha Pakshi Menu'}</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {language === 'ta' ? 'அமைப்புகள்' : 'Controls'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ta'
                  ? 'தேதி, இடம் மற்றும் பகுப்பாய்வு'
                  : 'Date, solar, bird, and analytics'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            aria-label={language === 'ta' ? 'மெனுவை மூடுக' : 'Close side menu'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#EFE7DA] dark:bg-slate-950/70 border-b border-[#D9CFBD] dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as DrawerCategory)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'bg-[#FAF6EF] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#EFE7DA] dark:hover:bg-slate-700 border border-[#D9CFBD] dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body with categorized sections */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain">
          {/* SECTION 1: Date & Paksha */}
          {(activeCategory === 'all' || activeCategory === 'date') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1B4332] dark:text-emerald-400" />
                  <span>{language === 'ta' ? '1. தேதி & பக்ஷம்' : '1. Date & Paksha'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCalendarModal();
                  }}
                  className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'ta' ? 'பஞ்சாங்கம் நாட்காட்டி' : 'Panchang Calendar'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-[#FAF6EF] dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
                <PakshaDaySelector
                  selectedPaksha={selectedPaksha}
                  selectedDay={selectedDay}
                  onSelectPakshaAndDay={onSelectPakshaAndDay}
                  onCustomDayUploaded={onCustomDayUploaded}
                  onOpenCalendar={onOpenCalendarModal}
                  selectedDate={selectedCalendarDate}
                />
              </div>
            </div>
          )}

          {/* SECTION 2: Location & Solar Timings */}
          {(activeCategory === 'all' || activeCategory === 'location') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{language === 'ta' ? '2. இடம் & சூரிய உதயம் / அஸ்தமனம்' : '2. Location & Solar Timings'}</span>
                </h3>
              </div>

              <div className="bg-[#FAF6EF] dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
                <SunriseSunsetBar
                  sunriseTime={sunriseTime}
                  sunsetTime={sunsetTime}
                  nextSunriseTime={nextSunriseTime}
                  displaySunrise={displaySunrise}
                  displaySunset={displaySunset}
                  displayNextSunrise={displayNextSunrise}
                  isCustomSchedule={isCustomSchedule}
                  onApplySunriseSunset={onApplySunriseSunset}
                  onResetSchedule={onResetSchedule}
                  locationName={locationName}
                  baseJamas={baseJamas}
                  isOtherLocation={isOtherLocation}
                  timeDisplayMode={timeDisplayMode}
                  onToggleTimeDisplayMode={onToggleTimeDisplayMode}
                  tzAbbreviation={tzAbbreviation}
                  timeDifferenceText={timeDifferenceText}
                  localDayName={localDayName}
                  localDateText={localDateText}
                  localPakshaText={localPakshaText}
                  localTimeText={localTimeText}
                  alwaysExpanded={true}
                />
              </div>
            </div>
          )}

          {/* SECTION 3: Bird Selection & Ruling Status */}
          {(activeCategory === 'all' || activeCategory === 'bird') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'ta' ? '3. பட்சி தேர்வு & அரசு/சாவு நிலை' : '3. Bird Selection & Status'}</span>
                </h3>
              </div>

              <div className="bg-[#FAF6EF] dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
                <BirdSelector
                  selectedBird={selectedBird}
                  onSelectBird={onSelectBird}
                  dayMeta={dayMeta}
                  paksha={selectedPaksha}
                />
              </div>
            </div>
          )}

          {/* SECTION 4: Analytics Full View Options */}
          {(activeCategory === 'all' || activeCategory === 'analytics') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ta' ? '4. விரிவான பகுப்பாய்வு' : '4. Advanced Analytics'}</span>
                </h3>
              </div>

              <div className="bg-[#FAF6EF] dark:bg-slate-900 p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'ta'
                    ? 'முழு திரை பார்வையில் செயல்பாடு அலை வரைபடம், 24 மணி நேர அட்டவணை மற்றும் பட்சி உறவுகளை காண்க.'
                    : 'Open full-screen visual wave charts, 24-hour multi-bird master table, and bird relationship rules.'}
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnalyticsModal('chart');
                    }}
                    className="w-full min-h-[44px] p-3 rounded-xl bg-[#EFE7DA] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DCCB] text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {t('tabChart')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {language === 'ta' ? '24 மணி அலை வரைபடம் & நட்சத்திர புள்ளிகள்' : '24-hour wave curve & stars'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnalyticsModal('master');
                    }}
                    className="w-full min-h-[44px] p-3 rounded-xl bg-[#EFE7DA] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DCCB] text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Table className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {t('tabMaster')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {language === 'ta' ? '5 பட்சிகளின் ஒப்பீட்டு அட்டவணை' : '5-bird comparison matrix'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnalyticsModal('relationships');
                    }}
                    className="w-full min-h-[44px] p-3 rounded-xl bg-[#EFE7DA] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DCCB] text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {language === 'ta' ? 'பட்சி நட்பு/பகை விதிகள்' : 'Bird Friendship & Enemy Rules'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {language === 'ta' ? 'உப-பட்சிகளின் உறவு அட்டவணை' : 'Anthardasa sub-period compatibility'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: App Preferences & Settings */}
          {(activeCategory === 'all' || activeCategory === 'settings') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>{language === 'ta' ? '5. விருப்பங்கள் & அமைப்புகள்' : '5. Preferences & Settings'}</span>
                </h3>
              </div>

              <div className="bg-[#FAF6EF] dark:bg-slate-900 p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs space-y-3">
                {/* Language Switcher */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'ta' ? 'மொழி / Language' : 'Language'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'ta' ? 'தமிழ் அல்லது ஆங்கிலம்' : 'Tamil or English'}
                    </div>
                  </div>
                  <div className="flex items-center p-1 rounded-xl bg-[#EFE7DA] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-[#FAF6EF] dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-extrabold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('ta')}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        language === 'ta'
                          ? 'bg-[#FAF6EF] dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-extrabold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>

                {/* Theme Switcher */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D9CFBD]/60 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'ta' ? 'தோற்றம் / Theme' : 'Appearance'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'ta' ? 'வெளிச்சம் அல்லது இரவு முறை' : 'Bright Ivory or Deep Slate'}
                    </div>
                  </div>
                  <div className="flex items-center p-1 rounded-xl bg-[#EFE7DA] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTheme('bright')}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        theme === 'bright'
                          ? 'bg-[#FAF6EF] text-amber-800 shadow-xs font-extrabold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'ta' ? 'பகல்' : 'Bright'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-sky-300 shadow-xs font-extrabold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'இரவு' : 'Dark'}</span>
                    </button>
                  </div>
                </div>

                {/* Reset to Today Defaults */}
                <div className="pt-2 border-t border-[#D9CFBD]/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onResetSchedule();
                    }}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('resetToDayDefaults')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer info */}
        <div className="px-4 py-3 border-t border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF]/80 dark:bg-slate-900/60 text-center shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'பஞ்ச பட்சி சாஸ்திரம் · 10 சாமங்கள் முதன்மை முகப்பு'
              : 'Pancha Pakshi Shastra · 10 Jamas Dedicated Dashboard'}
          </p>
        </div>
      </div>
    </div>
  );
};
