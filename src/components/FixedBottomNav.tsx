import React, { useMemo } from 'react';
import { BirdId, PakshaType, DayOfWeek } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Calendar, Zap, Layers, AlertCircle } from 'lucide-react';
import { BIRD_EMOJIS } from './BirdSelectModal';
import { getTamilDateInfo } from '../utils/tamilCalendar';

export type BottomNavTab = 'jamas' | 'bird' | 'location' | 'calendar';

export interface FixedBottomNavProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  selectedBird: BirdId;
  locationName: string;
  selectedCalendarDate: Date | null;
  selectedPaksha?: PakshaType;
  selectedDay?: DayOfWeek;
  variant?: 'default' | 'compact';
}

export const FixedBottomNav: React.FC<FixedBottomNavProps> = ({
  activeTab,
  onSelectTab,
  selectedBird,
  locationName,
  selectedCalendarDate,
  selectedPaksha,
  selectedDay,
  variant = 'compact',
}) => {
  const { language, getBirdName, getDayShortName } = useLanguage();

  // Dynamic Location Label: Automatically displays chosen location (e.g. Chennai, Madurai, London)
  const dynamicLocationLabel = useMemo(() => {
    const trimmed = (locationName || '').trim();
    return trimmed.length > 0 ? trimmed : (language === 'ta' ? 'சென்னை' : 'Chennai');
  }, [locationName, language]);

  // Active date Thaniya Naal alert check
  const isThaniyaActive = useMemo(() => {
    const d = selectedCalendarDate || new Date();
    return getTamilDateInfo(d).isThaniyaNaal;
  }, [selectedCalendarDate]);

  // Dynamic Calendar Label: e.g., "21 Oct · Thei Wed" or "🚨 21 Oct · Thei Wed"
  const dynamicCalendarLabel = useMemo(() => {
    const d = selectedCalendarDate || new Date();
    const dayNum = d.getDate();
    const monthShort = d.toLocaleString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short' });
    const pakshaShort = selectedPaksha
      ? (language === 'ta' ? (selectedPaksha === 'valarpirai' ? 'வளர்' : 'தேய்') : (selectedPaksha === 'valarpirai' ? 'Valar' : 'Thei'))
      : '';
    const dayShort = selectedDay
      ? getDayShortName(selectedDay)
      : d.toLocaleString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short' });

    const pakshaDay = `${pakshaShort} ${dayShort}`.trim();
    const prefix = isThaniyaActive ? '🚨 ' : '';
    return `${prefix}${dayNum} ${monthShort}${pakshaDay ? ` · ${pakshaDay}` : ''}`;
  }, [selectedCalendarDate, selectedPaksha, selectedDay, language, getDayShortName, isThaniyaActive]);

  const navItems: {
    id: BottomNavTab;
    label: string;
    Icon: React.ElementType | null;
    isBird?: boolean;
    tooltip: string;
  }[] = [
    {
      id: 'jamas',
      label: language === 'ta' ? '10 சாமம்' : '10 Jamas',
      Icon: Zap,
      tooltip: language === 'ta' ? '10 சாமங்கள் கணக்கீடு' : '10 Jamas Calculations',
    },
    {
      id: 'bird',
      label: getBirdName(selectedBird) || (language === 'ta' ? 'பட்சி' : 'Bird'),
      Icon: null,
      isBird: true,
      tooltip: language === 'ta' ? `பட்சி விவரம்: ${getBirdName(selectedBird)}` : `Bird Profile: ${getBirdName(selectedBird)}`,
    },
    {
      id: 'location',
      label: dynamicLocationLabel,
      Icon: MapPin,
      tooltip: language === 'ta' ? `இடம் & சூரியன்: ${dynamicLocationLabel}` : `Location & Solar: ${dynamicLocationLabel}`,
    },
    {
      id: 'calendar',
      label: dynamicCalendarLabel,
      Icon: Calendar,
      tooltip: language === 'ta' ? `தேதி & பக்ஷம்: ${dynamicCalendarLabel}` : `Calendar & Date: ${dynamicCalendarLabel}`,
    },
  ];

  return (
    <nav
      id="fixed-bottom-nav"
      className={`fixed bottom-0 left-0 right-0 z-40 w-full bg-[#FAF6EF]/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-[#D9CFBD] dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.4)] transition-colors duration-150 ${
        variant === 'compact'
          ? 'pb-[max(0.15rem,env(safe-area-inset-bottom))]'
          : 'pb-[max(0.35rem,env(safe-area-inset-bottom))]'
      }`}
      aria-label="Mobile Bottom Navigation Bar"
    >
      <div className="max-w-4xl mx-auto px-1.5 sm:px-3">
        <div className="grid grid-cols-4 w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`bottom-nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[44px] relative flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer touch-manipulation select-none ${
                  variant === 'compact'
                    ? 'py-1 px-0.5 sm:px-1 gap-0.5'
                    : 'py-1.5 sm:py-2 px-1 gap-1 min-h-[48px]'
                } ${
                  isActive
                    ? 'text-[#1B4332] dark:text-emerald-400 font-extrabold bg-[#1B4332]/8 dark:bg-emerald-500/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-[#EFE7DA]/70 dark:hover:bg-slate-900/60 font-medium'
                }`}
                title={item.tooltip}
                aria-selected={isActive}
                role="tab"
              >
                {/* Active Top Highlight Indicator */}
                {isActive && (
                  <span
                    className={`absolute top-0 left-2 right-2 rounded-full bg-[#1B4332] dark:bg-emerald-400 shadow-xs ${
                      variant === 'compact' ? 'h-[2px]' : 'h-[3px]'
                    }`}
                  />
                )}

                {item.isBird ? (
                  <span
                    className={`leading-none select-none transition-all duration-150 shrink-0 flex items-center justify-center ${
                      variant === 'compact' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                    } ${
                      isActive ? 'scale-110 drop-shadow-xs' : 'opacity-85'
                    }`}
                    aria-hidden="true"
                  >
                    {BIRD_EMOJIS[selectedBird] || '🦅'}
                  </span>
                ) : item.Icon ? (
                  <div className="relative flex items-center justify-center">
                    <item.Icon
                      className={`transition-all duration-150 shrink-0 ${
                        variant === 'compact'
                          ? isActive
                            ? 'w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#1B4332] dark:text-emerald-400 scale-105'
                            : 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400'
                          : isActive
                          ? 'w-5 h-5 text-[#1B4332] dark:text-emerald-400 scale-105'
                          : 'w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500 dark:text-slate-400'
                      }`}
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    {item.id === 'calendar' && isThaniyaActive && (
                      <span
                        className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-950 animate-pulse"
                        title="தனிய நாள் (Red Alert)"
                      />
                    )}
                  </div>
                ) : null}

                <span
                  className={`tracking-tight truncate max-w-full transition-colors ${
                    variant === 'compact'
                      ? 'text-[9px] sm:text-[10px] leading-tight'
                      : 'text-[10px] sm:text-[11px]'
                  } ${
                    isActive
                      ? 'text-[#1B4332] dark:text-emerald-300 font-black'
                      : 'text-slate-700 dark:text-slate-400 font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
