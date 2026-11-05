import React, { useState, useEffect } from 'react';
import { BirdId, Jama, SubPeriod, ActivityType } from '../types';
import { BIRDS, ACTIVITY_DETAILS } from '../data/panchaPakshiData';
import { getCurrentPanchaStatus, PanchaPakshiStatus } from '../utils/calculator';
import { Clock, Star, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CurrentStatusBannerProps {
  selectedBird: BirdId;
  customJamas?: Jama[];
  currentMinutes?: number;
  isOtherLocation?: boolean;
  timeDisplayMode?: 'local' | 'ist';
  tzAbbreviation?: string;
  locationName?: string;
}

export const CurrentStatusBanner: React.FC<CurrentStatusBannerProps> = ({
  selectedBird,
  customJamas,
  currentMinutes: parentMinutes,
  isOtherLocation = false,
  timeDisplayMode = 'local',
  tzAbbreviation = 'Local',
  locationName,
}) => {
  const {
    language,
    t,
    getBirdName,
    getActivityName,
  } = useLanguage();

  const [simulatedMinutes, setSimulatedMinutes] = useState<number | null>(null);
  const [internalLiveMinutes, setInternalLiveMinutes] = useState<number>(() => {
    if (typeof parentMinutes === 'number') return parentMinutes;
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Keep internalLiveMinutes synchronized with parentMinutes or fallback clock
  useEffect(() => {
    if (typeof parentMinutes === 'number') {
      setInternalLiveMinutes(parentMinutes);
    }
  }, [parentMinutes]);

  // Ticker for live updates if parent does not provide
  useEffect(() => {
    if (typeof parentMinutes === 'number') return;
    const interval = setInterval(() => {
      const now = new Date();
      setInternalLiveMinutes(now.getHours() * 60 + now.getMinutes());
    }, 15000);
    return () => clearInterval(interval);
  }, [parentMinutes]);

  const activeMinutes = simulatedMinutes !== null ? simulatedMinutes : internalLiveMinutes;
  const isLive = simulatedMinutes === null;

  const status: PanchaPakshiStatus = getCurrentPanchaStatus(
    selectedBird,
    activeMinutes,
    customJamas
  );
  const bird = BIRDS[selectedBird];
  const subBird = BIRDS[status.activeSubPeriod.birdId];
  const mainActDetail = ACTIVITY_DETAILS[status.selectedBirdMainActivity];
  const actDetail = ACTIVITY_DETAILS[status.activeSubPeriod.activity];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulatedMinutes(Number(e.target.value));
  };

  const handleResetToLive = () => {
    setSimulatedMinutes(null);
  };

  const birdDisplayName = getBirdName(selectedBird);

  return (
    <section
      aria-label="Real-time Status"
      id="current-status-banner-card"
      className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Top Bar: Live Status & Interactive Minute Scrubber */}
      <div className="bg-[#EFE7DA]/60 dark:bg-slate-950/80 px-4 py-2.5 border-b border-[#D9CFBD] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className="relative flex h-3 w-3"
              title={isLive ? 'Real-time Live Synced' : 'Testing custom simulated time'}
            >
              {isLive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isLive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {isLive ? t('liveNow') : t('customTimeBadge')}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {status.timeDisplay}
            </span>

            {/* Timezone Badge for Other Location */}
            {isOtherLocation && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {timeDisplayMode === 'ist' ? 'IST' : tzAbbreviation}
              </span>
            )}

            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-amber-700 dark:text-amber-300 font-semibold">
              {status.activeJama.title}
            </span>
            <span className="text-slate-500 text-[11px]">
              ({status.activeJama.isDay ? t('dayJama') : t('nightJama')})
            </span>
          </div>
        </div>

        {/* Time Scrubber */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="time-slider-scrubber" className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('scrubTime')}
          </label>
          <input
            id="time-slider-scrubber"
            type="range"
            min="0"
            max="1439"
            step="15"
            value={activeMinutes}
            onChange={handleSliderChange}
            aria-label="Scrub through 24-hour time to test bird calculations"
            className="w-28 sm:w-44 accent-amber-500 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          {!isLive && (
            <button
              onClick={handleResetToLive}
              id="reset-live-time-scrubber-btn"
              className="text-[11px] px-2 py-0.5 rounded bg-[#EFE7DA] dark:bg-slate-800 hover:bg-[#E5DBCB] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title={t('resetToCurrentLive')}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{t('resetToLive')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Status Grid: Active Jama & Active Anthardasa */}
      <div className="p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Selected Bird's Main Jama Activity */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#EFE7DA]/50 dark:bg-slate-950/60 border border-[#D9CFBD] dark:border-slate-800">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl shrink-0 border shadow-xs"
            style={{
              backgroundColor: `${bird.color}20`,
              borderColor: `${bird.color}60`,
              color: bird.color,
            }}
          >
            {birdDisplayName[0]}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ta' ? `${birdDisplayName} சாமத் தொழில்` : `${birdDisplayName}'s Jama Activity`}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-sm sm:text-base font-extrabold px-2.5 py-0.5 rounded-lg border ${mainActDetail.bgLight}`}>
                {getActivityName(status.selectedBirdMainActivity)}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {status.activeJama.startTime} – {status.activeJama.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Running Sub-Period (Anthardasa) */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#EFE7DA]/50 dark:bg-slate-950/60 border border-[#D9CFBD] dark:border-slate-800">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl shrink-0 border shadow-xs"
            style={{
              backgroundColor: `${subBird.color}20`,
              borderColor: `${subBird.color}60`,
              color: subBird.color,
            }}
          >
            {getBirdName(status.activeSubPeriod.birdId)[0]}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{language === 'ta' ? 'நடப்பு அந்தர்தசை' : 'Active Sub-Period (Anthardasa)'}</span>
              <div className="flex items-center text-amber-500 text-xs font-mono font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="ml-1 text-amber-700 dark:text-amber-300">{status.activeSubPeriod.star}★</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {getBirdName(status.activeSubPeriod.birdId)}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${actDetail.bgLight}`}>
                {getActivityName(status.activeSubPeriod.activity)}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {status.activeSubPeriod.startTime} – {status.activeSubPeriod.endTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
