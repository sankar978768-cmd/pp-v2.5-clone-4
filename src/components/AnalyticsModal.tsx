import React, { useState, useEffect } from 'react';
import { BirdId, Jama, PakshaType, DayOfWeek } from '../types';
import { ActivityChartView } from './ActivityChartView';
import { MasterTableView } from './MasterTableView';
import { BirdRelationshipsView } from './BirdRelationshipsView';
import { useLanguage } from '../context/LanguageContext';
import { X, TrendingUp, Table, Users, Sparkles, Copy, Check, CheckCircle2 } from 'lucide-react';
import { copyComparisonTextToClipboard } from '../utils/excelExport';

export interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chart' | 'master' | 'relationships';
  selectedBird: BirdId;
  onSelectBird: (birdId: BirdId) => void;
  displayJamasList: Jama[];
  displaySunrise?: string;
  displaySunset?: string;
  displayNextSunrise?: string;
  selectedPaksha?: PakshaType;
  selectedDay?: DayOfWeek;
  selectedCalendarDate?: Date | null;
  locationName?: string;
  timeDisplayMode?: 'local' | 'ist';
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'chart',
  selectedBird,
  onSelectBird,
  displayJamasList,
  displaySunrise,
  displaySunset,
  displayNextSunrise,
  selectedPaksha = 'valarpirai',
  selectedDay = 'sunday',
  selectedCalendarDate = null,
  locationName = 'Chennai',
  timeDisplayMode = 'local',
}) => {
  const { language, t, getBirdName } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chart' | 'master' | 'relationships'>(initialTab);

  // Jama Range State for Comparison Copy
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(3);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const minRange = Math.max(1, Math.min(rangeStart, rangeEnd));
  const maxRange = Math.min(displayJamasList.length || 10, Math.max(rangeStart, rangeEnd));

  const selectedRangeJamas = displayJamasList.filter(
    (j) => j.jamaNumber >= minRange && j.jamaNumber <= maxRange
  );

  const handleApplyRange = (start: number, end: number) => {
    const min = Math.max(1, Math.min(start, end));
    const max = Math.min(displayJamasList.length || 10, Math.max(start, end));
    setRangeStart(min);
    setRangeEnd(max);
  };

  const handleCopyComparisonToClipboard = async () => {
    if (selectedRangeJamas.length === 0) return;
    const res = await copyComparisonTextToClipboard(selectedRangeJamas, {
      selectedBird,
      paksha: selectedPaksha,
      selectedDay,
      selectedCalendarDate,
      locationName,
      timeDisplayMode,
      language,
    });

    if (res.success) {
      setIsCopied(true);
      const msg =
        language === 'ta'
          ? `சாமங்கள் ${minRange} முதல் ${maxRange} வரை 5 பட்சிகள் ஒப்பீட்டு அட்டவணை உரை வடிவில் கிளிப்போர்டில் நகலெடுக்கப்பட்டது!`
          : `5-bird comparison table for Jamas ${minRange} to ${maxRange} successfully copied to clipboard as text!`;
      setFeedbackToast(msg);
      setTimeout(() => {
        setIsCopied(false);
        setFeedbackToast(null);
      }, 4000);
    }
  };

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle escape key
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF] dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-amber-400 flex items-center justify-center font-bold text-lg shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 id="analytics-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ta' ? 'பஞ்ச பட்சி பகுப்பாய்வு & அட்டவணைகள்' : 'Pancha Pakshi Analytics & Tools'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ta'
                  ? `தேர்ந்தெடுக்கப்பட்ட பட்சி: ${getBirdName(selectedBird)}`
                  : `Active Bird: ${getBirdName(selectedBird)}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            aria-label={language === 'ta' ? 'மூடுக' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#EFE7DA]/50 dark:bg-slate-950/70 border-b border-[#D9CFBD] dark:border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'chart'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('tabChart')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'master'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>{t('tabMaster')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('relationships')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'relationships'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'ta' ? 'பட்சி உறவுகள்' : 'Bird Relationships'}</span>
          </button>
        </div>

        {/* Copy Comparison to Clipboard Toolbar with User-Defined Jama Range */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#FAF6EF] dark:bg-slate-900 border-b border-[#D9CFBD] dark:border-slate-800 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Range Selection Controls */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
              <span>{language === 'ta' ? 'சாம வரம்பு:' : 'Range:'}</span>
              <span className="font-mono text-[#1B4332] dark:text-emerald-400 bg-[#1B4332]/10 px-1.5 py-0.2 rounded font-black">
                (J{minRange} - J{maxRange})
              </span>
            </span>

            {/* Quick Preset Buttons */}
            <button
              type="button"
              onClick={() => handleApplyRange(1, 3)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all cursor-pointer ${
                minRange === 1 && maxRange === 3
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                  : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
              }`}
              title={language === 'ta' ? 'சாமம் 1 முதல் 3 வரை' : 'Jamas 1 to 3'}
            >
              {language === 'ta' ? 'சாமம் 1-3' : '1 to 3'}
            </button>

            <button
              type="button"
              onClick={() => handleApplyRange(1, 5)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                minRange === 1 && maxRange === 5
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                  : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
              }`}
            >
              {language === 'ta' ? 'பகல் (1-5)' : 'Day (1-5)'}
            </button>

            <button
              type="button"
              onClick={() => handleApplyRange(6, 10)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                minRange === 6 && maxRange === 10
                  ? 'bg-[#133E46] text-white border-[#133E46] shadow-2xs'
                  : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
              }`}
            >
              {language === 'ta' ? 'இரவு (6-10)' : 'Night (6-10)'}
            </button>

            <button
              type="button"
              onClick={() => handleApplyRange(1, displayJamasList.length || 10)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                minRange === 1 && maxRange === (displayJamasList.length || 10)
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                  : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
              }`}
            >
              {language === 'ta' ? 'அனைத்தும் (1-10)' : 'All (1-10)'}
            </button>

            {/* Custom From / To */}
            <div className="flex items-center gap-1 bg-[#EFE7DA] dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-[#D9CFBD] dark:border-slate-800 text-[11px] ml-1">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'முதல்' : 'From'}</span>
              <select
                value={minRange}
                onChange={(e) => handleApplyRange(Number(e.target.value), maxRange)}
                className="bg-[#FAF6EF] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 rounded px-1 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                aria-label="Start Jama"
              >
                {displayJamasList.map((j) => (
                  <option key={j.jamaNumber} value={j.jamaNumber}>
                    J{j.jamaNumber}
                  </option>
                ))}
              </select>

              <span className="text-slate-500 font-medium">{language === 'ta' ? 'வரை' : 'To'}</span>
              <select
                value={maxRange}
                onChange={(e) => handleApplyRange(minRange, Number(e.target.value))}
                className="bg-[#FAF6EF] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 rounded px-1 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                aria-label="End Jama"
              >
                {displayJamasList.map((j) => (
                  <option key={j.jamaNumber} value={j.jamaNumber}>
                    J{j.jamaNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 'Copy Comparison to Clipboard' Button */}
          <button
            type="button"
            onClick={handleCopyComparisonToClipboard}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
              isCopied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                : 'bg-[#1B4332] hover:bg-[#133024] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
            }`}
            title={
              language === 'ta'
                ? `தேர்ந்தெடுத்த சாமங்கள் ${minRange} முதல் ${maxRange} வரை 5 பட்சிகளின் ஒப்பீட்டு அட்டவணையை உரை வடிவில் கிளிப்போர்டில் நகலெடுக்க`
                : `Copy the 5-bird side-by-side comparison table for Jamas ${minRange} to ${maxRange} as formatted text to clipboard`
            }
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>
                  {language === 'ta'
                    ? `ஒப்பீடு நகலெடுக்கப்பட்டது! (J${minRange}-J${maxRange}) ✓`
                    : `Comparison Copied to Clipboard! ✓`}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>
                  {language === 'ta'
                    ? `ஒப்பீட்டை கிளிப்போர்டில் நகலெடு (Copy Comparison to Clipboard)`
                    : `Copy Comparison to Clipboard`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Toast Banner */}
        {feedbackToast && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-between gap-3 animate-scaleIn border border-emerald-500 shrink-0">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackToast(null)}
              className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain">
          {activeTab === 'chart' && (
            <ActivityChartView
              selectedBird={selectedBird}
              customJamas={displayJamasList}
              sunriseTime={displaySunrise}
              sunsetTime={displaySunset}
              nextSunriseTime={displayNextSunrise}
              onSelectBird={onSelectBird}
            />
          )}

          {activeTab === 'master' && (
            <MasterTableView
              selectedBird={selectedBird}
              customJamas={displayJamasList}
              paksha={selectedPaksha}
              selectedDay={selectedDay}
              selectedCalendarDate={selectedCalendarDate}
              locationName={locationName}
              timeDisplayMode={timeDisplayMode}
            />
          )}

          {activeTab === 'relationships' && (
            <BirdRelationshipsView
              selectedBird={selectedBird}
              onSelectBird={onSelectBird}
              paksha={selectedPaksha}
            />
          )}
        </div>
      </div>
    </div>
  );
};
