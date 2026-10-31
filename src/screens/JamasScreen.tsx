import React from 'react';
import { BirdId, Jama, PakshaType, DayOfWeek, DayCalculationMeta } from '../types';
import { BIRD_EMOJIS } from '../components/BirdSelectModal';
import { PANCHA_PAKSHI_DAYS } from '../data/panchaPakshiRegistry';
import { JamaCard } from '../components/JamaCard';
import { useLanguage } from '../context/LanguageContext';
import { getTamilDateInfo } from '../utils/tamilCalendar';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  Flame,
  Sun,
  Moon,
  Crown,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export interface JamasScreenProps {
  selectedBird: BirdId;
  selectedPaksha: PakshaType;
  selectedDay: DayOfWeek;
  locationName: string;
  runningJamaNumber: number;
  timeDisplayMode: 'local' | 'ist';
  displayJamasList: Jama[];
  activeCurrentMinutes: number;
  expandedJamas: number[];
  onToggleJama: (jamaNumber: number) => void;
  onExpandRunningOnly: () => void;
  onToggleExpandAll: () => void;
  onNavigateToTab: (tab: 'bird' | 'location' | 'calendar') => void;
  selectedCalendarDate?: Date | null;
  dayMeta?: DayCalculationMeta;
  onSelectBird?: (birdId: BirdId) => void;
}

export const JamasScreen: React.FC<JamasScreenProps> = ({
  selectedBird,
  selectedPaksha,
  selectedDay,
  locationName,
  runningJamaNumber,
  timeDisplayMode,
  displayJamasList,
  activeCurrentMinutes,
  expandedJamas,
  onToggleJama,
  onExpandRunningOnly,
  onToggleExpandAll,
  onNavigateToTab,
  selectedCalendarDate,
  dayMeta,
  onSelectBird,
}) => {
  const { language, t, getBirdName, getPakshaName, getDayName } = useLanguage();
  const currentBirdDisplayName = getBirdName(selectedBird);

  const activeDate = selectedCalendarDate || new Date();
  const activeTamilInfo = getTamilDateInfo(activeDate);

  // Derive Canonical Astrological Rulers for today's Paksha & Day
  const activeDayId = `${selectedPaksha}_${selectedDay}`;
  const currentDayMeta =
    dayMeta ||
    PANCHA_PAKSHI_DAYS.find((d) => d.id === activeDayId) ||
    PANCHA_PAKSHI_DAYS[0];

  const dayRulerBird = currentDayMeta?.dayRulingBird;
  const nightRulerBird = currentDayMeta?.nightRulingBird;
  const dyingBird =
    currentDayMeta?.dyingBird ||
    currentDayMeta?.dayDyingBird ||
    currentDayMeta?.nightDyingBird;

  const isDayRulerRunning = runningJamaNumber >= 1 && runningJamaNumber <= 5;
  const isNightRulerRunning = runningJamaNumber >= 6 && runningJamaNumber <= 10;

  const handleJumpToRunningJama = () => {
    if (!expandedJamas.includes(runningJamaNumber)) {
      onToggleJama(runningJamaNumber);
    }
    const cardEl = document.getElementById(`jama-card-${runningJamaNumber}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => {
        cardEl.classList.remove('ring-4', 'ring-amber-400');
      }, 1500);
    }
  };

  return (
    <div className="space-y-1 animate-fadeIn">
      {/* 1. RED ALERT BANNER if current viewing date is a Thaniya Naal */}
      {activeTamilInfo.isThaniyaNaal && (
        <div className="bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-red-600/20 border-2 border-rose-500/80 rounded-xl p-2.5 sm:p-3 text-rose-950 dark:text-rose-100 shadow-md animate-scaleIn mb-1">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
                  🚨 {language === 'ta' ? 'சிவப்பு எச்சரிக்கை (RED ALERT)' : 'RED ALERT: NON-AUSPICIOUS'}
                </span>
                <span className="font-extrabold text-xs text-rose-800 dark:text-rose-300">
                  {activeTamilInfo.tamilMonthNameTa} {activeTamilInfo.tamilDate}-ஆம் தேதி
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('calendar')}
                  className="text-xs underline text-rose-700 dark:text-rose-300 font-bold hover:text-rose-900 cursor-pointer"
                >
                  {language === 'ta' ? 'நாட்காட்டியில் பார்க்க' : 'View Calendar'}
                </button>
              </div>

              <p className="text-xs font-bold text-rose-900 dark:text-rose-100 leading-snug">
                {language === 'ta'
                  ? 'பஞ்சபட்சி சாஸ்திரப்படி இந்நாள் "தனிய நாள்" (சுபகாரியங்கள் தவிர்க்கப்பட வேண்டிய நாள்). இந்நாளில் பட்சி பலவீனம் அடைவதால் புதிய முயற்சிகள் அல்லது முக்கிய பயணங்களைத் தவிர்ப்பது நன்று.'
                  : 'According to Pancha Pakshi Shastra, today is an inauspicious "Thaniya Naal". Avoid commencing auspicious ceremonies, signing major contracts, or vital travel.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Jamas Screen Top Status & Astrological Rulers Strip */}
      <section
        aria-label="10 Jama Calculation Controls and Astrological Rulers"
        className="bg-white dark:bg-slate-900/90 p-2.5 sm:p-3.5 rounded-xl border border-[#E8DFCE] dark:border-slate-800 shadow-xs space-y-2 mb-1"
      >
        {/* Top Row: Active Bird, Paksha, Day, Location + Expand/Collapse Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('bird')}
              className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center text-2xl shadow-xs shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
              title={language === 'ta' ? 'பட்சி மாற்ற கிளிக் செய்க' : 'Click to view bird profile'}
            >
              {BIRD_EMOJIS[selectedBird] || '🦅'}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {currentBirdDisplayName}
                </h1>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {language === 'ta'
                      ? `சாமம் ${runningJamaNumber} நடப்பில்`
                      : `Jama ${runningJamaNumber} Running`}
                  </span>
                </span>
                {timeDisplayMode === 'ist' && (
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    🇮🇳 IST (+05:30)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                <button
                  type="button"
                  onClick={() => onNavigateToTab('calendar')}
                  className="flex items-center gap-1 hover:text-[#1B4332] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeTamilInfo.tamilMonthNameTa} {activeTamilInfo.tamilDate} ·
                  </span>
                  <span>{getPakshaName(selectedPaksha).split(' ')[0]} · {getDayName(selectedDay)}</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('location')}
                  className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate max-w-[120px]">{locationName || (language === 'ta' ? 'சென்னை' : 'Chennai')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expand/Contract Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={onExpandRunningOnly}
              id="expand-running-jama-only-btn"
              className={`min-h-[42px] text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                expandedJamas.length === 1 && expandedJamas[0] === runningJamaNumber
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-900 dark:text-amber-300'
                  : 'bg-[#FAF6EE] dark:bg-slate-800 border-[#E8DFCE] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t('runningJamaExpandedOnly')}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('runningOnlyBtn')}</span>
            </button>

            <button
              type="button"
              onClick={onToggleExpandAll}
              id="toggle-expand-all-jamas-btn"
              className="min-h-[42px] text-xs px-3 py-1.5 rounded-xl border border-[#E8DFCE] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {expandedJamas.length === 10 ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'ta' ? 'அனைத்தையும் சுருக்கு' : 'Collapse All'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'ta' ? '10 சாமங்களையும் விரி' : 'Expand All 10'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dedicated Astrological Rulers Top Bar (Day Ruler, Night Ruler, Dying Bird) */}
        <div
          id="jamas-screen-astrological-rulers"
          className="pt-3 border-t border-[#E8DFCE]/80 dark:border-slate-800/80"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {language === 'ta'
                  ? 'இன்றைய ஆளும் & சாவுப் பட்சிகள்'
                  : "Today's Ruling & Dying Birds"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {getPakshaName(selectedPaksha).split(' ')[0]} · {getDayName(selectedDay)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {/* 1. Day Ruler (பகல் அரசு) */}
            <div
              onClick={() => {
                if (dayRulerBird && onSelectBird) onSelectBird(dayRulerBird);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && dayRulerBird && onSelectBird) {
                  onSelectBird(dayRulerBird);
                }
              }}
              className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer relative select-none flex flex-col justify-between ${
                selectedBird === dayRulerBird
                  ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500 ring-1 sm:ring-2 ring-amber-500/30'
                  : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/50 hover:border-amber-400'
              }`}
              title={language === 'ta' ? 'பகல் அரசு பட்சியைத் தேர்ந்தெடுக்க கிளிக் செய்க' : 'Click to select Day Ruler bird'}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 min-w-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                    <Sun className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-amber-800 dark:text-amber-400 truncate leading-tight">
                    {language === 'ta' ? 'பகல் அரசு' : 'Day Ruler'}
                  </span>
                </div>

                {isDayRulerRunning && (
                  <span className="text-[8px] font-black bg-emerald-500 text-white px-1 sm:px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0 shadow-2xs">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    <span className="hidden min-[400px]:inline">{language === 'ta' ? 'நடப்பு' : 'Live'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 min-w-0">
                <span className="text-base sm:text-2xl shrink-0 drop-shadow-2xs leading-none">
                  {dayRulerBird ? BIRD_EMOJIS[dayRulerBird] : '🦅'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {dayRulerBird ? getBirdName(dayRulerBird) : '-'}
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                    {language === 'ta' ? '06:00 - 18:00' : '06:00 - 18:00'}
                  </span>
                </div>
              </div>

              {selectedBird === dayRulerBird && (
                <span className="text-[8px] sm:text-[9px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded mt-1 self-start truncate">
                  {language === 'ta' ? 'உங்கள் பட்சி' : 'Your Bird'}
                </span>
              )}
            </div>

            {/* 2. Night Ruler (இரவு அரசு) */}
            <div
              onClick={() => {
                if (nightRulerBird && onSelectBird) onSelectBird(nightRulerBird);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && nightRulerBird && onSelectBird) {
                  onSelectBird(nightRulerBird);
                }
              }}
              className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer relative select-none flex flex-col justify-between ${
                selectedBird === nightRulerBird
                  ? 'bg-indigo-500/15 dark:bg-indigo-500/20 border-indigo-500 ring-1 sm:ring-2 ring-indigo-500/30'
                  : 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200/90 dark:border-indigo-900/50 hover:border-indigo-400'
              }`}
              title={language === 'ta' ? 'இரவு அரசு பட்சியைத் தேர்ந்தெடுக்க கிளிக் செய்க' : 'Click to select Night Ruler bird'}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 min-w-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                    <Moon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-indigo-800 dark:text-indigo-400 truncate leading-tight">
                    {language === 'ta' ? 'இரவு அரசு' : 'Night Ruler'}
                  </span>
                </div>

                {isNightRulerRunning && (
                  <span className="text-[8px] font-black bg-emerald-500 text-white px-1 sm:px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0 shadow-2xs">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    <span className="hidden min-[400px]:inline">{language === 'ta' ? 'நடப்பு' : 'Live'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 min-w-0">
                <span className="text-base sm:text-2xl shrink-0 drop-shadow-2xs leading-none">
                  {nightRulerBird ? BIRD_EMOJIS[nightRulerBird] : '🐦'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {nightRulerBird ? getBirdName(nightRulerBird) : '-'}
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                    {language === 'ta' ? '18:00 - 06:00' : '18:00 - 06:00'}
                  </span>
                </div>
              </div>

              {selectedBird === nightRulerBird && (
                <span className="text-[8px] sm:text-[9px] font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-500/20 px-1 py-0.2 rounded mt-1 self-start truncate">
                  {language === 'ta' ? 'உங்கள் பட்சி' : 'Your Bird'}
                </span>
              )}
            </div>

            {/* 3. Dying Bird (சாவுப் பட்சி / மரண பட்சி) */}
            <div
              onClick={() => {
                if (dyingBird && onSelectBird) onSelectBird(dyingBird);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && dyingBird && onSelectBird) {
                  onSelectBird(dyingBird);
                }
              }}
              className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer relative select-none flex flex-col justify-between ${
                selectedBird === dyingBird
                  ? 'bg-rose-500/15 dark:bg-rose-500/25 border-rose-500 ring-1 sm:ring-2 ring-rose-500/30'
                  : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/50 hover:border-rose-400'
              }`}
              title={language === 'ta' ? 'சாவுப் பட்சியைப் பார்க்க கிளிக் செய்க' : 'Click to view Dying Bird info'}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 min-w-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-rose-600 text-white flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                    <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-rose-800 dark:text-rose-400 truncate leading-tight">
                    {language === 'ta' ? 'சாவுப் பட்சி' : 'Dying Bird'}
                  </span>
                </div>

                <span className="text-[8px] sm:text-[9px] font-black bg-rose-600/20 border border-rose-500/40 text-rose-800 dark:text-rose-300 px-1 sm:px-1.5 py-0.2 rounded-full shrink-0">
                  {language === 'ta' ? 'தவிர்' : 'Avoid'}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 min-w-0">
                <span className="text-base sm:text-2xl shrink-0 drop-shadow-2xs leading-none">
                  {dyingBird ? BIRD_EMOJIS[dyingBird] : '🦉'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {dyingBird ? getBirdName(dyingBird) : '-'}
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-rose-700 dark:text-rose-400 font-semibold truncate block">
                    {language === 'ta' ? 'சுபகாரியம் தவிர்' : 'Inauspicious'}
                  </span>
                </div>
              </div>

              {selectedBird === dyingBird && (
                <span className="text-[8px] sm:text-[9px] font-black text-rose-800 dark:text-rose-200 bg-rose-500/25 border border-rose-500/40 px-1 py-0.2 rounded mt-1 self-start animate-pulse truncate">
                  🚨 {language === 'ta' ? 'உங்கள் பட்சி!' : 'Your Bird!'}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. 10 Jamas Cards Grid with tighter space-y-0.5 */}
      <section aria-label="10 Jamas Schedule List" className="space-y-0.5">
        {displayJamasList.map((jama) => (
          <JamaCard
            key={jama.jamaNumber}
            jama={jama}
            selectedBird={selectedBird}
            currentMinutes={activeCurrentMinutes}
            isExpanded={expandedJamas.includes(jama.jamaNumber)}
            onToggleExpand={() => onToggleJama(jama.jamaNumber)}
            paksha={selectedPaksha}
            cycleStartMinutes={displayJamasList[0]?.startMinutesFromMidnight ?? 360}
          />
        ))}
      </section>

      {/* Quick Jump Floating Action Button (Active when multiple cards are expanded) */}
      {expandedJamas.length > 1 && (
        <div className="fixed bottom-14 sm:bottom-16 right-3 sm:right-6 z-30 animate-fadeIn">
          <button
            type="button"
            onClick={handleJumpToRunningJama}
            id="quick-jump-running-jama-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-[#1B4332] dark:bg-amber-500 hover:bg-[#133024] dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs shadow-lg border border-amber-400/50 hover:shadow-xl active:scale-95 transition-all cursor-pointer touch-manipulation select-none"
            title={
              language === 'ta'
                ? `நடப்பு சாமம் ${runningJamaNumber}-க்கு தாவுக`
                : `Quick Jump to Running Jama ${runningJamaNumber}`
            }
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 fill-amber-400 dark:fill-slate-950" />
            <span className="font-extrabold tracking-tight">
              {language === 'ta'
                ? `சாமம் ${runningJamaNumber} (நேரலை)`
                : `Jump to Jama ${runningJamaNumber}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
