import React, { useState } from 'react';
import { BirdId, Jama, PakshaType, DayOfWeek } from '../types';
import { JAMAS_DATA, BIRDS, ACTIVITY_DETAILS, ALL_BIRD_IDS } from '../data/panchaPakshiData';
import { getBirdRelationship, getRelationshipTag } from '../data/birdRelationships';
import { Sun, Moon, Copy, Check, Download, CheckSquare, Square, CheckCircle2, Table, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  copyJamasToExcelClipboard,
  downloadJamasCsv,
  downloadJamasAsPdf,
  downloadJamasAsImage,
} from '../utils/excelExport';

export interface MasterTableViewProps {
  selectedBird: BirdId;
  customJamas?: Jama[];
  paksha?: PakshaType;
  selectedDay?: DayOfWeek;
  selectedCalendarDate?: Date | null;
  locationName?: string;
  timeDisplayMode?: 'local' | 'ist';
}

export const MasterTableView: React.FC<MasterTableViewProps> = ({
  selectedBird,
  customJamas,
  paksha = 'valarpirai',
  selectedDay = 'sunday',
  selectedCalendarDate = null,
  locationName = 'Chennai',
  timeDisplayMode = 'local',
}) => {
  const { language, t, getBirdName, getActivityName } = useLanguage();
  const jamas = customJamas || JAMAS_DATA;
  const [jamaFilter, setJamaFilter] = useState<'all' | 'day' | 'night'>('all');

  // Multi-Jama Selection State for Excel / PDF / Image export
  const [selectedJamaNumbers, setSelectedJamaNumbers] = useState<number[]>(() =>
    jamas.map((j) => j.jamaNumber)
  );
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(3);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [singleCopiedId, setSingleCopiedId] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [singleLoading, setSingleLoading] = useState<{ id: number; type: 'pdf' | 'img' } | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'detailed' | 'compact'>('detailed');

  const filteredJamas = jamas.filter((j) => {
    if (jamaFilter === 'day') return j.isDay;
    if (jamaFilter === 'night') return !j.isDay;
    return true;
  });

  const birdKeys: BirdId[] = ALL_BIRD_IDS;

  // Range and selection handlers
  const handleApplyRange = (start: number, end: number) => {
    const min = Math.max(1, Math.min(start, end));
    const max = Math.min(jamas.length, Math.max(start, end));
    setRangeStart(min);
    setRangeEnd(max);
    const newSelected: number[] = [];
    for (let i = min; i <= max; i++) {
      newSelected.push(i);
    }
    setSelectedJamaNumbers(newSelected);
  };

  const handleToggleSelectJama = (num: number) => {
    setSelectedJamaNumbers((prev) => {
      const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num].sort((a, b) => a - b);
      if (next.length > 0) {
        setRangeStart(next[0]);
        setRangeEnd(next[next.length - 1]);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setRangeStart(1);
    setRangeEnd(jamas.length);
    setSelectedJamaNumbers(jamas.map((j) => j.jamaNumber));
  };

  const handleSelectDay = () => {
    setRangeStart(1);
    setRangeEnd(5);
    setSelectedJamaNumbers(jamas.filter((j) => j.isDay).map((j) => j.jamaNumber));
  };

  const handleSelectNight = () => {
    setRangeStart(6);
    setRangeEnd(10);
    setSelectedJamaNumbers(jamas.filter((j) => !j.isDay).map((j) => j.jamaNumber));
  };

  const handleClearSelection = () => {
    setSelectedJamaNumbers([]);
  };

  const selectedJamasList = jamas.filter((j) => selectedJamaNumbers.includes(j.jamaNumber));

  const getExportFilename = (ext: 'pdf' | 'png' | 'csv') => {
    if (selectedJamasList.length === 0) return `pancha_pakshi_5_birds.${ext}`;
    const sorted = [...selectedJamasList].sort((a, b) => a.jamaNumber - b.jamaNumber);
    const minJ = sorted[0].jamaNumber;
    const maxJ = sorted[sorted.length - 1].jamaNumber;
    return minJ === maxJ
      ? `pancha_pakshi_5_birds_jama_${minJ}.${ext}`
      : `pancha_pakshi_5_birds_jamas_${minJ}_to_${maxJ}.${ext}`;
  };

  // Excel Copy Handler
  const handleCopySelectedToExcel = async () => {
    if (selectedJamasList.length === 0) return;
    const res = await copyJamasToExcelClipboard(selectedJamasList, {
      selectedBird,
      paksha,
      selectedDay,
      selectedCalendarDate,
      locationName,
      timeDisplayMode,
      language,
      format: exportFormat,
    });

    if (res.success) {
      setIsCopied(true);
      const msg =
        language === 'ta'
          ? `தேர்ந்தெடுக்கப்பட்ட ${res.count} சாமங்கள் எக்செல் வடிவத்தில் நகலெடுக்கப்பட்டது! Excel அல்லது Sheets-ல் ஒட்டவும் (Paste / Ctrl+V).`
          : `Successfully copied ${res.count} selected Jamas for Excel! Press Ctrl+V (or Paste) in Microsoft Excel / Google Sheets.`;
      setFeedbackToast(msg);
      setTimeout(() => {
        setIsCopied(false);
        setFeedbackToast(null);
      }, 4000);
    }
  };

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    if (selectedJamasList.length === 0 || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const filename = getExportFilename('pdf');
      const success = await downloadJamasAsPdf(
        selectedJamasList,
        {
          selectedBird,
          paksha,
          selectedDay,
          selectedCalendarDate,
          locationName,
          timeDisplayMode,
          language,
          format: exportFormat,
        },
        filename
      );
      if (success) {
        setFeedbackToast(
          language === 'ta'
            ? `PDF (${filename}) வெற்றிகரமாகப் பதிவிறக்கப்பட்டது!`
            : `PDF (${filename}) downloaded successfully!`
        );
        setTimeout(() => setFeedbackToast(null), 4000);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Image (PNG) Download Handler
  const handleDownloadImage = async () => {
    if (selectedJamasList.length === 0 || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const filename = getExportFilename('png');
      const success = await downloadJamasAsImage(
        selectedJamasList,
        {
          selectedBird,
          paksha,
          selectedDay,
          selectedCalendarDate,
          locationName,
          timeDisplayMode,
          language,
          format: exportFormat,
        },
        filename
      );
      if (success) {
        setFeedbackToast(
          language === 'ta'
            ? `அட்டவணைப் படம் (${filename}) வெற்றிகரமாகப் பதிவிறக்கப்பட்டது!`
            : `Table image (${filename}) downloaded successfully!`
        );
        setTimeout(() => setFeedbackToast(null), 4000);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadCsv = () => {
    if (selectedJamasList.length === 0) return;
    const filename = getExportFilename('csv');
    downloadJamasCsv(
      selectedJamasList,
      {
        selectedBird,
        paksha,
        selectedDay,
        selectedCalendarDate,
        locationName,
        timeDisplayMode,
        language,
        format: exportFormat,
      },
      filename
    );
  };

  const handleCopySingleJama = async (jamaToCopy: Jama) => {
    const res = await copyJamasToExcelClipboard([jamaToCopy], {
      selectedBird,
      paksha,
      selectedDay,
      selectedCalendarDate,
      locationName,
      timeDisplayMode,
      language,
      format: exportFormat,
    });
    if (res.success) {
      setSingleCopiedId(jamaToCopy.jamaNumber);
      const msg =
        language === 'ta'
          ? `சாமம் ${jamaToCopy.jamaNumber} எக்செல் வடிவத்தில் நகலெடுக்கப்பட்டது!`
          : `Jama ${jamaToCopy.jamaNumber} copied for Excel!`;
      setFeedbackToast(msg);
      setTimeout(() => {
        setSingleCopiedId(null);
        setFeedbackToast(null);
      }, 3000);
    }
  };

  const handleDownloadSinglePdf = async (jamaToExport: Jama) => {
    setSingleLoading({ id: jamaToExport.jamaNumber, type: 'pdf' });
    try {
      await downloadJamasAsPdf([jamaToExport], {
        selectedBird,
        paksha,
        selectedDay,
        selectedCalendarDate,
        locationName,
        timeDisplayMode,
        language,
        format: exportFormat,
      });
    } finally {
      setSingleLoading(null);
    }
  };

  const handleDownloadSingleImage = async (jamaToExport: Jama) => {
    setSingleLoading({ id: jamaToExport.jamaNumber, type: 'img' });
    try {
      await downloadJamasAsImage([jamaToExport], {
        selectedBird,
        paksha,
        selectedDay,
        selectedCalendarDate,
        locationName,
        timeDisplayMode,
        language,
        format: exportFormat,
      });
    } finally {
      setSingleLoading(null);
    }
  };

  return (
    <div id="master-table-view" className="space-y-4">
      {/* Toast Feedback Notification Banner */}
      {feedbackToast && (
        <div className="p-3 sm:p-4 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-between gap-3 animate-scaleIn border border-emerald-500">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-white/80 hover:text-white font-bold p-1 cursor-pointer shrink-0"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6EF] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
            <span>{t('masterTableTitle')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] dark:text-emerald-300 border border-[#1B4332]/30 font-bold">
              {t('activeHighlight')}: {getBirdName(selectedBird)}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'அனைத்து 5 பட்சிகளுக்குமான முழுமையான 10 சாமங்கள் மற்றும் அந்தர்தசை நேர அட்டவணை. விரும்பிய சாமங்களைத் தேர்வு செய்து எக்செல் நகல் எடுக்கலாம்.'
              : 'Original full astronomical calculation table for all 5 birds side-by-side. Select any Jamas to copy directly into Microsoft Excel or Google Sheets.'}
          </p>
        </div>

        {/* View Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#EFE7DA] dark:bg-slate-950 p-1 rounded-xl border border-[#D9CFBD] dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setJamaFilter('all')}
            id="master-filter-all"
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
              jamaFilter === 'all'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('all10Jamas')}
          </button>
          <button
            type="button"
            onClick={() => setJamaFilter('day')}
            id="master-filter-day"
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-bold ${
              jamaFilter === 'day'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
            <span>{t('dayJamas1to5')}</span>
          </button>
          <button
            type="button"
            onClick={() => setJamaFilter('night')}
            id="master-filter-night"
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-bold ${
              jamaFilter === 'night'
                ? 'bg-[#133E46] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
            <span>{t('nightJamas6to10')}</span>
          </button>
        </div>
      </div>

      {/* Excel, PDF & Image Export & Range Selection Toolbar */}
      <div className="bg-[#FAF6EF] dark:bg-slate-900 p-3.5 sm:p-4.5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs space-y-3.5">
        {/* Top: Selection status & Format toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332] dark:bg-emerald-400 animate-pulse" />
              <span>
                {language === 'ta'
                  ? `தேர்ந்தெடுக்கப்பட்ட சாமங்கள்: ${selectedJamaNumbers.length} / ${jamas.length}`
                  : `Selected Range: ${selectedJamaNumbers.length} of ${jamas.length} Jamas`}
                {selectedJamaNumbers.length > 0 && (
                  <span className="ml-1.5 text-xs text-[#1B4332] dark:text-emerald-300 font-mono font-bold bg-[#1B4332]/10 px-2 py-0.5 rounded-full">
                    (Jama {Math.min(...selectedJamaNumbers)} - {Math.max(...selectedJamaNumbers)})
                  </span>
                )}
              </span>
            </span>

            {/* Format toggle: Detailed vs Compact */}
            <div className="flex items-center gap-1 bg-[#EFE7DA] dark:bg-slate-950 p-0.5 rounded-lg border border-[#D9CFBD] dark:border-slate-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setExportFormat('detailed')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  exportFormat === 'detailed'
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title={
                  language === 'ta'
                    ? 'விரிவான பத்திகள் (செயல்பாடு, உறவு, நட்சத்திரம் தனித்தனி பத்திகளாக)'
                    : 'Detailed columns (Activity, Tag, Stars separated)'
                }
              >
                {language === 'ta' ? 'முழு விவரம்' : 'Detailed'}
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('compact')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  exportFormat === 'compact'
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title={
                  language === 'ta'
                    ? 'சுருக்கமான பத்திகள் (ஒரே கலத்தில் இணைக்கப்பட்டது)'
                    : 'Compact columns (Combined in one cell per bird)'
                }
              >
                {language === 'ta' ? 'சுருக்கம்' : 'Compact'}
              </button>
            </div>
          </div>

          {/* Quick Selection & Custom Range Stepper */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Quick Presets */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[11px] text-slate-500 font-semibold mr-0.5">
                {language === 'ta' ? 'வரம்பு:' : 'Range:'}
              </span>
              <button
                type="button"
                onClick={() => handleApplyRange(1, 3)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all cursor-pointer shadow-2xs ${
                  rangeStart === 1 && rangeEnd === 3 && selectedJamaNumbers.length === 3
                    ? 'bg-[#1B4332] text-white border-[#1B4332] ring-1 ring-[#1B4332]/50'
                    : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
                }`}
                title={language === 'ta' ? 'சாமம் 1 முதல் 3 வரை தேர்வு செய்' : 'Select Jamas 1 to 3'}
              >
                {language === 'ta' ? 'சாமம் 1 to 3' : 'Jamas 1 to 3'}
              </button>
              <button
                type="button"
                onClick={handleSelectDay}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  rangeStart === 1 && rangeEnd === 5 && selectedJamaNumbers.length === 5
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
                }`}
              >
                {language === 'ta' ? 'பகல் (1-5)' : 'Day (1-5)'}
              </button>
              <button
                type="button"
                onClick={handleSelectNight}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  rangeStart === 6 && rangeEnd === 10 && selectedJamaNumbers.length === 5
                    ? 'bg-[#133E46] text-white border-[#133E46]'
                    : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
                }`}
              >
                {language === 'ta' ? 'இரவு (6-10)' : 'Night (6-10)'}
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  selectedJamaNumbers.length === jamas.length
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#D9CFBD]'
                }`}
              >
                {language === 'ta' ? 'அனைத்தும் (1-10)' : 'All (1-10)'}
              </button>
              {selectedJamaNumbers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  {language === 'ta' ? 'நீக்கு' : 'Clear'}
                </button>
              )}
            </div>

            {/* Custom From / To selectors */}
            <div className="flex items-center gap-1.5 bg-[#EFE7DA] dark:bg-slate-950 px-2 py-1 rounded-lg border border-[#D9CFBD] dark:border-slate-800 text-[11px]">
              <span className="text-slate-600 dark:text-slate-400 font-bold">
                {language === 'ta' ? 'முதல்:' : 'From:'}
              </span>
              <select
                value={rangeStart}
                onChange={(e) => handleApplyRange(Number(e.target.value), rangeEnd)}
                className="bg-[#FAF6EF] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                aria-label="Start Jama"
              >
                {jamas.map((j) => (
                  <option key={j.jamaNumber} value={j.jamaNumber}>
                    J{j.jamaNumber} ({j.isDay ? (language === 'ta' ? 'பகல்' : 'Day') : (language === 'ta' ? 'இரவு' : 'Night')})
                  </option>
                ))}
              </select>

              <span className="text-slate-600 dark:text-slate-400 font-bold">
                {language === 'ta' ? 'வரை:' : 'To:'}
              </span>
              <select
                value={rangeEnd}
                onChange={(e) => handleApplyRange(rangeStart, Number(e.target.value))}
                className="bg-[#FAF6EF] dark:bg-slate-800 border border-[#D9CFBD] dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                aria-label="End Jama"
              >
                {jamas.map((j) => (
                  <option key={j.jamaNumber} value={j.jamaNumber}>
                    J{j.jamaNumber} ({j.isDay ? (language === 'ta' ? 'பகல்' : 'Day') : (language === 'ta' ? 'இரவு' : 'Night')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Row: Copy for Excel + Download PDF + Download Image + Download CSV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-[#D9CFBD]/60 dark:border-slate-800/80">
          {/* 1. Copy Selected for Excel */}
          <button
            type="button"
            disabled={selectedJamaNumbers.length === 0}
            onClick={handleCopySelectedToExcel}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 ${
              selectedJamaNumbers.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-800 text-slate-500'
                : isCopied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                : 'bg-[#1B4332] hover:bg-[#133024] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
            }`}
            title={
              language === 'ta'
                ? 'வண்ணங்கள் மற்றும் பத்திகளுடன் கூடிய எக்செல் அட்டவணையை கிளிப்போர்டில் நகலெடுக்க'
                : 'Copies formatted table with colors and columns ready to paste into Microsoft Excel or Google Sheets'
            }
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">
                  {language === 'ta'
                    ? `${selectedJamaNumbers.length} சாமங்கள் நகலெடுக்கப்பட்டது! ✓`
                    : `Copied ${selectedJamaNumbers.length} Jamas! ✓`}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {language === 'ta'
                    ? `எக்செல் நகல் (${selectedJamaNumbers.length})`
                    : `Copy (${selectedJamaNumbers.length}) for Excel`}
                </span>
              </>
            )}
          </button>

          {/* 2. Download PDF */}
          <button
            type="button"
            disabled={selectedJamaNumbers.length === 0 || isGeneratingPdf}
            onClick={handleDownloadPdf}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 border ${
              selectedJamaNumbers.length === 0 || isGeneratingPdf
                ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 border-slate-300 text-slate-400'
                : 'bg-rose-700 hover:bg-rose-800 dark:bg-rose-800 dark:hover:bg-rose-700 text-white border-rose-800'
            }`}
            title={
              language === 'ta'
                ? 'அனைத்து 5 பட்சிகளின் கணக்கீட்டு அட்டவணையை உயர்தர PDF கோப்பாகப் பதிவிறக்கு'
                : 'Download high-quality A4 Landscape PDF for all 5 birds side-by-side'
            }
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                <span>{language === 'ta' ? 'PDF தயாராகிறது...' : 'Creating PDF...'}</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {language === 'ta'
                    ? `PDF பதிவிறக்கு (${selectedJamaNumbers.length})`
                    : `Download PDF (${selectedJamaNumbers.length})`}
                </span>
              </>
            )}
          </button>

          {/* 3. Download Image (PNG) */}
          <button
            type="button"
            disabled={selectedJamaNumbers.length === 0 || isGeneratingImage}
            onClick={handleDownloadImage}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 border ${
              selectedJamaNumbers.length === 0 || isGeneratingImage
                ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 border-slate-300 text-slate-400'
                : 'bg-[#133E46] hover:bg-[#0c282e] dark:bg-teal-800 dark:hover:bg-teal-700 text-white border-[#133E46]'
            }`}
            title={
              language === 'ta'
                ? 'அனைத்து 5 பட்சிகளின் பக்கவாட்டு அட்டவணையை உயர் தெளிவுத்திறன் PNG படமாகப் பதிவிறக்கு'
                : 'Download high-resolution PNG image of the 5-birds side-by-side calculation table'
            }
          >
            {isGeneratingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                <span>{language === 'ta' ? 'படம் தயாராகிறது...' : 'Creating Image...'}</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {language === 'ta'
                    ? `படம் பதிவிறக்கு (PNG)`
                    : `Download Image (PNG)`}
                </span>
              </>
            )}
          </button>

          {/* 4. Download CSV */}
          <button
            type="button"
            disabled={selectedJamaNumbers.length === 0}
            onClick={handleDownloadCsv}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
              selectedJamaNumbers.length === 0
                ? 'opacity-50 cursor-not-allowed border-slate-300 text-slate-400'
                : 'bg-[#FAF6EF] dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#EFE7DA] dark:hover:bg-slate-700'
            }`}
            title="Download UTF-8 CSV with Tamil support for Excel"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {language === 'ta' ? 'CSV பதிவிறக்கு (.csv)' : 'Download (.csv)'}
            </span>
          </button>
        </div>
      </div>

      {/* Rules & Terminology Reference Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#FAF6EF] dark:bg-slate-950/60 p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800/80">
        <div>
          <span className="font-bold text-[#C29738] dark:text-amber-400 flex items-center gap-1.5 mb-1">
            <Sun className="w-3.5 h-3.5 text-[#C29738]" strokeWidth={1.5} />
            <span>
              {language === 'ta'
                ? 'பகல் விதிகள் (சூரியோதயம் முதல் அஸ்தமனம் வரை - 720 நிமிடங்கள்):'
                : 'Day Rules (Sunrise to Sunset - 720 mins total):'}
            </span>
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {getActivityName('Rule')}: 48m | {getActivityName('Walk')}: 36m | {getActivityName('Eat')}: 30m |{' '}
            {getActivityName('Sleep')}: 18m | {getActivityName('Die')}: 12m = 144m /{' '}
            {language === 'ta' ? 'சாமம்' : 'Jama'}
          </p>
        </div>

        <div>
          <span className="font-bold text-[#133E46] dark:text-purple-400 flex items-center gap-1.5 mb-1">
            <Moon className="w-3.5 h-3.5 text-[#133E46] dark:text-purple-400" strokeWidth={1.5} />
            <span>
              {language === 'ta'
                ? 'இரவு விதிகள் (அஸ்தமனம் முதல் மறு உதயம் வரை - 720 நிமிடங்கள்):'
                : 'Night Rules (Sunset to Sunrise - 720 mins total):'}
            </span>
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {getActivityName('Rule')}: 24m | {getActivityName('Eat')}: 30m | {getActivityName('Walk')}: 30m |{' '}
            {getActivityName('Sleep')}: 24m | {getActivityName('Die')}: 36m = 144m /{' '}
            {language === 'ta' ? 'சாமம்' : 'Jama'}
          </p>
        </div>
      </div>

      {/* Relationship Tag Legend */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-[#EFE7DA]/60 dark:bg-slate-950/70 rounded-xl border border-[#D9CFBD] dark:border-slate-800 text-xs flex-wrap">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {language === 'ta' ? 'அந்தர்தசை உறவு குறியீடுகள் (பட்சியின் சொந்த உறவு):' : 'Sub-period Tags (Relative to each bird):'}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800/80 badge-rel-self"
            title={language === 'ta' ? 'S - சுயம் (பட்சியின் சொந்த அந்தர்தசை)' : "S - Self (Bird's Own Period)"}
          >
            <strong className="font-black text-[11px]">S</strong> = {language === 'ta' ? 'சுயம் (Self)' : 'Self'}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800/80 badge-rel-friend"
            title={language === 'ta' ? 'F - நட்பு பட்சி' : 'F - Friend'}
          >
            <strong className="font-black text-[11px]">F</strong> = {language === 'ta' ? 'நட்பு (Friend)' : 'Friend'}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800/80 badge-rel-enemy"
            title={language === 'ta' ? 'E - பகை பட்சி' : 'E - Enemy'}
          >
            <strong className="font-black text-[11px]">E</strong> = {language === 'ta' ? 'பகை (Enemy)' : 'Enemy'}
          </span>
        </div>
      </div>

      {/* The Master Jamas Grid */}
      <div className="space-y-6">
        {filteredJamas.map((jama) => {
          const isJamaSelected = selectedJamaNumbers.includes(jama.jamaNumber);

          return (
            <div
              key={jama.jamaNumber}
              className={`bg-[#FAF6EF] dark:bg-slate-900/70 rounded-2xl border transition-all overflow-hidden shadow-xs ${
                isJamaSelected
                  ? 'border-[#1B4332] dark:border-emerald-500/80 ring-1 ring-[#1B4332]/30 dark:ring-emerald-500/30'
                  : 'border-[#D9CFBD] dark:border-slate-800 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Jama banner with selection checkbox and 1-click copy */}
              <div
                className={`px-3 sm:px-5 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2 transition-colors ${
                  isJamaSelected
                    ? 'bg-[#EFE7DA] dark:bg-slate-850 border-[#C8BCA4] dark:border-slate-700'
                    : 'bg-[#FAF6EF]/80 dark:bg-slate-900 border-[#D9CFBD] dark:border-slate-800'
                }`}
              >
                {/* Left: Checkbox + Jama Title + Timings */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSelectJama(jama.jamaNumber)}
                    className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-[#1B4332] dark:hover:text-emerald-400 select-none"
                    title={isJamaSelected ? 'Deselect from Excel copy' : 'Select for Excel copy'}
                  >
                    {isJamaSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#1B4332] dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      jama.isDay ? 'bg-[#C29738]' : 'bg-[#133E46]'
                    }`}
                  />
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {jama.title}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    ({jama.startTime} – {jama.endTime})
                  </span>
                </div>

                {/* Right: Export Buttons (Copy, PDF, Image) + Period Badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Copy Single Jama */}
                  <button
                    type="button"
                    onClick={() => handleCopySingleJama(jama)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      singleCopiedId === jama.jamaNumber
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-[#FAF6EF] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#EFE7DA]'
                    }`}
                    title={language === 'ta' ? 'இந்த சாமத்தை எக்செல் நகல் எடுக்க' : 'Copy this Jama for Excel'}
                  >
                    {singleCopiedId === jama.jamaNumber ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span className="hidden sm:inline">
                          {language === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {language === 'ta' ? 'எக்செல் நகல்' : 'Copy'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* PDF Single Jama */}
                  <button
                    type="button"
                    disabled={singleLoading?.id === jama.jamaNumber}
                    onClick={() => handleDownloadSinglePdf(jama)}
                    className="px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 bg-[#FAF6EF] dark:bg-slate-800 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title={language === 'ta' ? 'இந்த சாமத்தை PDF கோப்பாகப் பதிவிறக்கு' : 'Download this Jama as PDF'}
                  >
                    {singleLoading?.id === jama.jamaNumber && singleLoading?.type === 'pdf' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  {/* Image Single Jama */}
                  <button
                    type="button"
                    disabled={singleLoading?.id === jama.jamaNumber}
                    onClick={() => handleDownloadSingleImage(jama)}
                    className="px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 bg-[#FAF6EF] dark:bg-slate-800 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-900/60 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                    title={language === 'ta' ? 'இந்த சாமத்தை PNG படமாகப் பதிவிறக்கு' : 'Download this Jama as Image (PNG)'}
                  >
                    {singleLoading?.id === jama.jamaNumber && singleLoading?.type === 'img' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">PNG</span>
                  </button>

                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6EF] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#D9CFBD] dark:border-slate-700">
                    {jama.isDay ? t('dayPeriod') : t('nightPeriod')}
                  </span>
                </div>
              </div>

              {/* Horizontal Scrollable Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[960px]">
                  {/* 5 Column Headers */}
                  <div className="grid grid-cols-5 divide-x divide-[#D9CFBD] dark:divide-slate-800 bg-[#EFE7DA]/80 dark:bg-slate-950/80 border-b border-[#D9CFBD] dark:border-slate-800 text-xs font-bold">
                    {birdKeys.map((bKey) => {
                      const col = jama.columns[bKey];
                      const bInfo = BIRDS[bKey];
                      const isSelected = bKey === selectedBird;
                      const bName = getBirdName(bKey);
                      const actName = getActivityName(col.mainActivity);

                      return (
                        <div
                          key={bKey}
                          className={`p-3 flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1B4332]/10 border-t-2 border-t-[#1B4332] text-[#1B4332] dark:text-emerald-300'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: bInfo.color }}
                            />
                            <span className="truncate">{bName}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                              ({actName})
                            </span>
                          </div>

                          {isSelected && (
                            <span className="text-[10px] bg-[#1B4332] text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">
                              {t('activeBadge')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 5 Sub-period Rows */}
                  {[0, 1, 2, 3, 4].map((subRowIdx) => (
                    <div
                      key={subRowIdx}
                      className="grid grid-cols-5 divide-x divide-[#D9CFBD]/60 dark:divide-slate-800/80 border-b border-[#D9CFBD]/60 dark:border-slate-800/60 last:border-b-0 text-xs"
                    >
                      {birdKeys.map((bKey) => {
                        const sp = jama.columns[bKey].subPeriods[subRowIdx];
                        const act = ACTIVITY_DETAILS[sp.activity];
                        const isSelected = bKey === selectedBird;
                        const subBirdName = getBirdName(sp.birdId);
                        const actName = getActivityName(sp.activity);
                        const spRel = getBirdRelationship(bKey, sp.birdId, paksha);
                        const spTagInfo = getRelationshipTag(spRel);
                        const spRelLabel = language === 'ta' ? spTagInfo.labelTa : spTagInfo.labelEn;

                        return (
                          <div
                            key={bKey}
                            className={`p-2.5 transition-colors ${
                              isSelected
                                ? 'bg-[#1B4332]/5 hover:bg-[#1B4332]/10'
                                : 'hover:bg-[#EFE7DA]/50 dark:hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {subBirdName}
                                </span>
                                <span
                                  title={`${spTagInfo.tag} - ${spRelLabel}`}
                                  className={`inline-block font-black text-[8px] px-1 py-0.2 rounded border shrink-0 ${spTagInfo.badgeBg} ${spTagInfo.badgeText} ${spTagInfo.badgeBorder}`}
                                >
                                  {spTagInfo.tag}
                                </span>
                              </div>
                              <span className="text-[#C29738] dark:text-amber-400 font-mono text-[11px] font-bold shrink-0">
                                {sp.star}★
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${act.bgLight}`}
                              >
                                {actName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                {sp.durationMinutes}m
                              </span>
                            </div>

                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                              {sp.startTime} – {sp.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
