import React, { useMemo } from 'react';
import {
  getThithiDayTimeline,
  ThithiDayTimeline,
  ThithiSpan,
  DayThithiSegment,
} from '../utils/thithiCalculator';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Flame,
  Moon,
  Sun,
  Activity,
  Layers,
  MapPin,
  Sunrise,
  Sunset,
  Globe,
  Compass,
} from 'lucide-react';

export interface ThithiTimeGraphProps {
  selectedDate: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
  compact?: boolean;
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

export const ThithiTimeGraph: React.FC<ThithiTimeGraphProps> = ({
  selectedDate,
  onSelectDate,
  className = '',
  compact = false,
  locationLat,
  locationLng,
  locationName,
  locationTimezoneOffset,
  timeDisplayMode = 'local',
  sunriseTime,
  sunsetTime,
  nextSunriseTime,
}) => {
  const { language } = useLanguage();

  const timeline: ThithiDayTimeline = useMemo(() => {
    return getThithiDayTimeline(selectedDate, {
      lat: locationLat !== null && locationLat !== undefined ? locationLat : 13.0827,
      lng: locationLng !== null && locationLng !== undefined ? locationLng : 80.2707,
      timezoneOffsetMinutes: locationTimezoneOffset ?? 330,
      cityName: locationName || 'Chennai',
      timeDisplayMode,
      sunriseTime,
      sunsetTime,
      nextSunriseTime,
    });
  }, [
    selectedDate,
    locationLat,
    locationLng,
    locationName,
    locationTimezoneOffset,
    timeDisplayMode,
    sunriseTime,
    sunsetTime,
    nextSunriseTime,
  ]);

  const {
    currentActiveThithi,
    previousThithi,
    nextThithi,
    daySegments,
    hasTransitionToday,
    transitionFormatted,
    transitionFormattedIst,
    transitionTextEn,
    transitionTextTa,
    isToday,
    currentElapsedPercent,
    currentRemainingTimeText,
    currentElapsedTimeText,
    liveCurrentTimeFormatted,
    dayProgressPercent,
    cityName,
    lat,
    lng,
    tzLabel,
    isOtherThanIst,
    udayaTithi,
    udayaSunriseFormatted,
    sunrisePercentOnBar,
    sunsetPercentOnBar,
    sunriseClockText,
    sunsetClockText,
  } = timeline;

  const activePaksha = currentActiveThithi.paksha;
  const isValarpirai = activePaksha === 'valarpirai';

  return (
    <div
      id="thithi-time-graph-container"
      className={`rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-[#FBF8F1] via-[#F5EFE4] to-[#EFE7DA] dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 p-3 sm:p-4 text-xs shadow-xs space-y-3 select-none ${className}`}
    >
      {/* 1. Header with Tanglish & Tamil Thithi Badge + Location Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
            <Activity className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {language === 'ta' ? 'திதி நேர வரைபடம்' : 'Thithi to Thithi Time Graph'}
              </span>
              <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-300">
                Tanglish
              </span>
              {isToday && (
                <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{language === 'ta' ? 'நேரலை' : 'Live Now'}</span>
                </span>
              )}
            </div>

            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              <span className="text-amber-700 dark:text-amber-400">
                {currentActiveThithi.nameTanglish}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs sm:text-sm">
                ({currentActiveThithi.nameTa})
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {isValarpirai
                  ? language === 'ta'
                    ? 'வளர்பிறை'
                    : 'Valarpirai'
                  : language === 'ta'
                  ? 'தேய்பிறை'
                  : 'Theipirai'}
              </span>
            </div>
          </div>
        </div>

        {/* Location Badge & Timezone */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate max-w-[120px] font-black">{cityName}</span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px]">
              ({lat.toFixed(1)}°, {lng.toFixed(1)}° · {tzLabel})
            </span>
          </div>

          {hasTransitionToday && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-[10px] font-bold">
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate max-w-[200px]">
                {language === 'ta' ? transitionTextTa : transitionTextEn}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. UDAYA TITHI LOCATION BANNER (சூரியோதய திதி - Traditional Location-Based Anchor) */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-50/70 dark:via-slate-900 to-amber-500/10 border border-amber-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
            <Sunrise className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black tracking-wider text-amber-900 dark:text-amber-400 flex items-center gap-1">
              <span>{language === 'ta' ? 'சூரியோதய திதி (Udaya Tithi):' : "Today's Udaya Tithi (At Sunrise):"}</span>
              <span className="text-slate-500 font-mono font-normal">@{cityName}</span>
            </div>
            <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
              <span className="text-amber-700 dark:text-amber-400">{udayaTithi.nameTanglish}</span>{' '}
              <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">({udayaTithi.nameTa})</span>{' '}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-normal">
                ({language === 'ta' ? 'சூரிய உதயம்' : 'Sunrise'}: {sunriseClockText} · {language === 'ta' ? 'மறைவு' : 'Sunset'}: {sunsetClockText})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-center text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0">
          <Compass className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>{language === 'ta' ? 'ஸ்தல திதி கணக்கீடு' : 'Topocentric Drik Ganitha'}</span>
        </div>
      </div>

      {/* 3. Visual 24-Hour Day Timeline Graph Bar (00:00 to 24:00 in Location Time) */}
      <div className="space-y-1.5 bg-[#FAF6EF]/90 dark:bg-slate-950/60 p-2.5 sm:p-3 rounded-xl border border-amber-500/20 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-600 dark:text-slate-400 flex-wrap gap-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>
              {language === 'ta'
                ? `24 மணிநேர வரைபடம் (${cityName} நேரம்)`
                : `24-Hour Day Timeline (${cityName} Local Time)`}
            </span>
          </span>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono text-[9px]">
              <Sunrise className="w-3 h-3" /> {sunriseClockText}
            </span>
            <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-mono text-[9px]">
              <Sunset className="w-3 h-3" /> {sunsetClockText}
            </span>
            {transitionFormatted && (
              <span className="text-rose-700 dark:text-rose-400 font-black">
                {language === 'ta' ? `முடிவு: ${transitionFormatted}` : `Ends: ${transitionFormatted}`}
              </span>
            )}
          </div>
        </div>

        {/* Segmented Timeline Bar */}
        <div className="relative w-full h-8 sm:h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex border border-amber-400/40 dark:border-amber-500/20 shadow-inner">
          {daySegments.map((seg, idx) => {
            const isValar = seg.tithi.paksha === 'valarpirai';
            const bgClass =
              idx === 0
                ? isValar
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950'
                  : 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 text-white'
                : isValar
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950'
                : 'bg-gradient-to-r from-indigo-800 via-purple-700 to-indigo-900 text-white';

            return (
              <div
                key={`thithi-seg-${idx}`}
                style={{ width: `${seg.widthPercent}%` }}
                className={`h-full relative flex items-center justify-between px-2 text-[10px] sm:text-xs font-black transition-all border-r last:border-r-0 border-white/30 dark:border-slate-900/40 select-none ${bgClass}`}
                title={`${seg.tithi.nameTanglish} (${seg.tithi.nameTa}): ${seg.startClockText} - ${seg.endClockText} (${seg.durationHoursText})`}
              >
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <span className="truncate">{seg.tithi.nameTanglish}</span>
                  <span className="opacity-75 text-[9px] hidden sm:inline">
                    ({seg.tithi.nameTa})
                  </span>
                </div>

                <span className="text-[9px] font-mono opacity-90 shrink-0 ml-1">
                  {seg.durationHoursText}
                </span>
              </div>
            );
          })}

          {/* Local Sunrise Marker */}
          {sunrisePercentOnBar > 0 && sunrisePercentOnBar < 100 && (
            <div
              style={{ left: `${sunrisePercentOnBar}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 pointer-events-none -translate-x-1/2 flex flex-col items-center justify-end"
              title={`Local Sunrise at ${sunriseClockText}`}
            >
              <span className="absolute -top-3.5 text-[8px] font-bold text-amber-700 dark:text-amber-300">
                🌅
              </span>
            </div>
          )}

          {/* Local Sunset Marker */}
          {sunsetPercentOnBar > 0 && sunsetPercentOnBar < 100 && (
            <div
              style={{ left: `${sunsetPercentOnBar}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 z-10 pointer-events-none -translate-x-1/2 flex flex-col items-center justify-end"
              title={`Local Sunset at ${sunsetClockText}`}
            >
              <span className="absolute -top-3.5 text-[8px] font-bold text-indigo-700 dark:text-indigo-300">
                🌇
              </span>
            </div>
          )}

          {/* Current Live Time Marker Cursor (if selected date is today in location) */}
          {isToday && dayProgressPercent !== undefined && (
            <div
              style={{ left: `${dayProgressPercent}%` }}
              className="absolute top-0 bottom-0 w-1 bg-rose-600 z-20 pointer-events-none shadow-md flex flex-col items-center justify-start -translate-x-1/2"
            >
              <span className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white animate-ping" />
              <span className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white" />
              <span className="absolute -bottom-4 px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black whitespace-nowrap shadow-xs">
                NOW {liveCurrentTimeFormatted}
              </span>
            </div>
          )}
        </div>

        {/* Hour Graduation Ticks */}
        <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-mono px-0.5 pt-1">
          <span>00:00</span>
          <span className="hidden sm:inline">04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span className="hidden sm:inline">20:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* 4. Live Active Thithi Progress Bar (Elapsed vs Remaining) */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 p-2.5 sm:p-3 rounded-xl border border-amber-300/70 dark:border-amber-900/40 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-amber-900 dark:text-amber-300">
              {currentActiveThithi.nameTanglish} ({currentActiveThithi.nameTa})
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
              {currentActiveThithi.startFormatted} ➔ {currentActiveThithi.endFormatted}
            </span>
            {isOtherThanIst && (
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px]">
                ({currentActiveThithi.startFormattedIst} ➔ {currentActiveThithi.endFormattedIst} IST)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-extrabold">
              {language === 'ta' ? 'மொத்த காலம்:' : 'Duration:'} {currentActiveThithi.durationHoursText}
            </span>
            {isToday && currentElapsedPercent !== undefined && (
              <span className="text-emerald-700 dark:text-emerald-400 font-black">
                {currentElapsedPercent}% {language === 'ta' ? 'முடிந்தது' : 'Elapsed'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Fill Bar */}
        {isToday && currentElapsedPercent !== undefined && (
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative shadow-inner">
              <div
                style={{ width: `${currentElapsedPercent}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 relative"
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-medium">
              <span>
                {language === 'ta' ? 'நடந்தது:' : 'Elapsed:'}{' '}
                <strong className="text-slate-900 dark:text-white">
                  {currentElapsedTimeText}
                </strong>
              </span>
              <span>
                {language === 'ta' ? 'மீதம்:' : 'Remaining:'}{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {currentRemainingTimeText}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Special Spiritual / Astrological Significance Note */}
        {currentActiveThithi.specialSignificance && (
          <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/70 dark:border-amber-900/40 text-[10px] text-amber-950 dark:text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-amber-900 dark:text-amber-300 font-extrabold">
                {currentActiveThithi.deity}:{' '}
              </strong>
              <span>
                {language === 'ta'
                  ? currentActiveThithi.specialSignificanceTa
                  : currentActiveThithi.specialSignificance}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Sequential Thithi-to-Thithi Progression (3 Connected Step Cards) */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{language === 'ta' ? 'திதி வரிசை (முந்தைய ➔ நடப்பு ➔ அடுத்தது)' : 'Thithi to Thithi Progression'}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {cityName} ({tzLabel})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Card 1: Previous Thithi */}
          <div className="p-2 sm:p-2.5 rounded-xl border border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF] dark:bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">
                <span>◀ {language === 'ta' ? 'முந்தைய திதி' : 'Previous Thithi'}</span>
                <span>{previousThithi.paksha === 'valarpirai' ? 'வளர்பிறை' : 'தேய்பிறை'}</span>
              </div>
              <div className="font-black text-xs text-slate-800 dark:text-slate-200 truncate">
                {previousThithi.nameTanglish}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  ({previousThithi.nameTa})
                </span>
              </div>
            </div>

            <div className="mt-2 text-[9px] font-mono text-slate-500 dark:text-slate-400 border-t border-[#D9CFBD]/60 dark:border-slate-800 pt-1 space-y-0.5">
              <div>{language === 'ta' ? 'தொடக்கம்:' : 'From:'} {previousThithi.startFormatted}</div>
              <div>{language === 'ta' ? 'முடிவு:' : 'To:'} {previousThithi.endFormatted}</div>
              {isOtherThanIst && (
                <div className="text-[8px] text-slate-400">
                  IST: {previousThithi.startShortTime} ➔ {previousThithi.endShortTime}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Current Thithi (Active & Highlighted) */}
          <div className="p-2 sm:p-2.5 rounded-xl border-2 border-amber-500/80 dark:border-amber-400 bg-amber-500/15 dark:bg-amber-500/20 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <span className="absolute -right-2 -bottom-2 text-2xl opacity-15 select-none pointer-events-none">
              ★
            </span>

            <div>
              <div className="flex items-center justify-between text-[9px] font-black text-amber-900 dark:text-amber-300 mb-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>★ {language === 'ta' ? 'நடப்பு திதி' : 'Current Thithi'}</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                  {currentActiveThithi.durationHoursText}
                </span>
              </div>
              <div className="font-black text-sm text-amber-950 dark:text-white truncate">
                {currentActiveThithi.nameTanglish}{' '}
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  ({currentActiveThithi.nameTa})
                </span>
              </div>
            </div>

            <div className="mt-2 text-[9px] font-mono text-amber-900 dark:text-amber-200 border-t border-amber-500/30 pt-1 space-y-0.5">
              <div>{language === 'ta' ? 'தொடக்கம்:' : 'From:'} {currentActiveThithi.startFormatted}</div>
              <div className="font-bold text-amber-950 dark:text-amber-300">
                {language === 'ta' ? 'முடிவு:' : 'To:'} {currentActiveThithi.endFormatted}
              </div>
              {isOtherThanIst && (
                <div className="text-[8px] text-amber-700/80 dark:text-amber-400/80">
                  IST: {currentActiveThithi.startFormattedIst} ➔ {currentActiveThithi.endFormattedIst}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Next Thithi */}
          <div className="p-2 sm:p-2.5 rounded-xl border border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF] dark:bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">
                <span>{language === 'ta' ? 'அடுத்த திதி' : 'Next Thithi'} ▶</span>
                <span>{nextThithi.paksha === 'valarpirai' ? 'வளர்பிறை' : 'தேய்பிறை'}</span>
              </div>
              <div className="font-black text-xs text-slate-800 dark:text-slate-200 truncate">
                {nextThithi.nameTanglish}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  ({nextThithi.nameTa})
                </span>
              </div>
            </div>

            <div className="mt-2 text-[9px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
              <div>{language === 'ta' ? 'தொடக்கம்:' : 'From:'} {nextThithi.startFormatted}</div>
              <div>{language === 'ta' ? 'முடிவு:' : 'To:'} {nextThithi.endFormatted}</div>
              {isOtherThanIst && (
                <div className="text-[8px] text-slate-400">
                  IST: {nextThithi.startShortTime} ➔ {nextThithi.endShortTime}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
