import React, { useState } from 'react';
import { BirdId, Jama, SubPeriod, PakshaType } from '../types';
import { BIRDS, ACTIVITY_DETAILS } from '../data/panchaPakshiData';
import { getBirdRelationship, RELATIONSHIP_META, getRelationshipTag } from '../data/birdRelationships';
import { Star, ChevronDown, ChevronUp, Sun, Moon, Eye, Copy, Check, Table, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { copyJamasToExcelClipboard, downloadJamasAsPdf, downloadJamasAsImage } from '../utils/excelExport';

interface JamaCardProps {
  jama: Jama;
  selectedBird: BirdId;
  currentMinutes?: number;
  initiallyExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  paksha?: PakshaType;
  cycleStartMinutes?: number;
}

export const JamaCard: React.FC<JamaCardProps> = ({
  jama,
  selectedBird,
  currentMinutes,
  initiallyExpanded = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
  paksha = 'valarpirai',
  cycleStartMinutes = 360,
}) => {
  const {
    language,
    t,
    getBirdName,
    getActivityName,
    getRelationshipName,
  } = useLanguage();

  const [localExpanded, setLocalExpanded] = useState(initiallyExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  const [showAllColumns, setShowAllColumns] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleCopyJamaExcel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await copyJamasToExcelClipboard([jama], {
      selectedBird,
      paksha,
      language,
      format: 'detailed',
    });
    if (res.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await downloadJamasAsPdf([jama], {
        selectedBird,
        paksha,
        language,
        format: 'detailed',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      await downloadJamasAsImage([jama], {
        selectedBird,
        paksha,
        language,
        format: 'detailed',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const birdColumn = jama.columns[selectedBird];
  const mainActDetail = ACTIVITY_DETAILS[birdColumn.mainActivity];

  // Check if this Jama is currently active
  let isCurrentJama = false;
  if (currentMinutes !== undefined) {
    const cycleStartMin = cycleStartMinutes ?? 360;
    const effectiveMin = currentMinutes < cycleStartMin ? currentMinutes + 1440 : currentMinutes;
    isCurrentJama = effectiveMin >= jama.startMinutesFromMidnight && effectiveMin < jama.endMinutesFromMidnight;
  }

  const isSubPeriodActive = (sp: SubPeriod) => {
    if (currentMinutes === undefined || !isCurrentJama) return false;
    const cycleStartMin = cycleStartMinutes ?? 360;
    const effectiveMin = currentMinutes < cycleStartMin ? currentMinutes + 1440 : currentMinutes;
    return effectiveMin >= sp.startMinutesFromMidnight && effectiveMin < sp.endMinutesFromMidnight;
  };

  const birdDisplayName = getBirdName(selectedBird);
  const mainStars = birdColumn.mainActivity === 'Rule' ? 10 : birdColumn.mainActivity === 'Eat' ? 8 : birdColumn.mainActivity === 'Walk' ? 5 : birdColumn.mainActivity === 'Sleep' ? 2 : 1;

  return (
    <div
      id={`jama-card-${jama.jamaNumber}`}
      className={`rounded-lg sm:rounded-xl border transition-all duration-150 overflow-hidden ${
        isCurrentJama
          ? 'bg-[#FFFDF7] dark:bg-slate-900 border-[#D49B28] dark:border-amber-400 ring-2 ring-[#D49B28]/30 dark:ring-amber-400/40 shadow-md'
          : 'bg-[#FAF6EF] dark:bg-slate-900/60 border-[#D9CFBD] dark:border-slate-800 hover:border-[#C8BCA4] dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      {/* Jama Header Bar: Strict horizontal layout with tighter internal padding */}
      <div
        onClick={handleToggle}
        className="px-2 py-1 sm:px-2.5 sm:py-1.5 flex flex-row items-center justify-between gap-1 sm:gap-2 cursor-pointer select-none bg-[#F5EFE4] dark:bg-slate-900/80 hover:bg-[#EFE7DA] dark:hover:bg-slate-850/90 transition-colors"
      >
        {/* Left Side: Icon, Title, Timings, Live Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <div
            className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border ${
              jama.isDay
                ? 'bg-[#C29738]/15 border-[#C29738]/40 text-[#C29738]'
                : 'bg-[#133E46]/15 border-[#133E46]/40 text-[#133E46] dark:text-teal-400'
            }`}
          >
            {jama.isDay ? <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} /> : <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />}
          </div>

          <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight shrink-0">
              {jama.title}
            </h4>
            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded bg-[#EFE7DA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-[#D9CFBD] dark:border-slate-700 shrink-0">
              {jama.startTime}–{jama.endTime}
            </span>
            {isCurrentJama && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-[#2E7D56]/15 text-[#1B4332] dark:text-emerald-300 border border-[#2E7D56]/30 font-bold animate-pulse shrink-0">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <span>{t('liveNow')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Horizontal Metadata Row (Activity label & Star Rating pill) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Horizontal Activity Label */}
          <span
            className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-full border flex items-center gap-1 max-w-[85px] sm:max-w-[120px] truncate ${mainActDetail.bgLight}`}
            title={`${t('thActivity')}: ${getActivityName(birdColumn.mainActivity)}`}
          >
            <span className="truncate">{getActivityName(birdColumn.mainActivity)}</span>
          </span>

          {/* Horizontal Star Rating Label */}
          <span
            className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.2 rounded-md shrink-0"
            title={`${t('thStarRating')}: ${mainStars}★`}
          >
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span>{mainStars}★</span>
          </span>

          {/* Expand/Collapse Chevron Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            aria-label={isExpanded ? 'Collapse Jama' : 'Expand Jama'}
            className="p-1 rounded-md bg-[#EFE7DA] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer border border-[#D9CFBD] dark:border-slate-700 shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} /> : <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Expanded Sub-Periods Table with tighter padding */}
      {isExpanded && (
        <div className="border-t border-[#D9CFBD] dark:border-slate-800/80 p-2 sm:p-2.5 bg-[#EFE7DA]/50 dark:bg-slate-950/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <div className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <span>{birdDisplayName} {t('columnSubPeriods')}</span>
            </div>

            <button
              onClick={() => setShowAllColumns(!showAllColumns)}
              id={`toggle-all-columns-btn-${jama.jamaNumber}`}
              className="text-[10px] sm:text-[11px] text-[#1B4332] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto font-bold"
            >
              <Eye className="w-3 h-3" strokeWidth={1.5} />
              <span>{showAllColumns ? t('showOnlyMyBird') : t('compareAll5Birds')}</span>
            </button>
          </div>

          {!showAllColumns ? (
            /* Selected Bird's 5 Sub-Periods Table */
            <div className="overflow-x-auto rounded-xl border border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF] dark:bg-slate-900 shadow-xs">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#EFE7DA] dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-[#D9CFBD] dark:border-slate-800">
                  <tr>
                    <th scope="col" className="py-1.5 px-2.5">{t('thNumber')}</th>
                    <th scope="col" className="py-1.5 px-2.5">{t('thSubBird')}</th>
                    <th scope="col" className="py-1.5 px-2.5">{t('thActivity')}</th>
                    <th scope="col" className="py-1.5 px-2.5">{t('thStarRating')}</th>
                    <th scope="col" className="py-1.5 px-2.5">{t('thStartTime')}</th>
                    <th scope="col" className="py-1.5 px-2.5">{t('thDuration')}</th>
                    <th scope="col" className="py-1.5 px-2.5">{t('thEndTime')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9CFBD]/60 dark:divide-slate-800/60 font-medium">
                  {birdColumn.subPeriods.map((sp, idx) => {
                    const subBirdInfo = BIRDS[sp.birdId];
                    const act = ACTIVITY_DETAILS[sp.activity];
                    const active = isSubPeriodActive(sp);
                    const rel = getBirdRelationship(selectedBird, sp.birdId, paksha);
                    const relMeta = RELATIONSHIP_META[rel];
                    const subBirdName = getBirdName(sp.birdId);
                    const relName = getRelationshipName(rel);
                    const activityLabel = getActivityName(sp.activity);

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          active
                            ? 'bg-[#C29738]/15 font-semibold text-slate-950 dark:text-white'
                            : 'hover:bg-[#EFE7DA]/70 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <td className="py-1.5 px-2.5 font-mono text-slate-400 dark:text-slate-500 text-[10px]">
                          {active ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-amber-400 inline-block" />
                          ) : (
                            idx + 1
                          )}
                        </td>

                        {/* Bird Name & Relationship Badge under SUB-BIRD column: WCAG contrast compliant */}
                        <td className="py-1.5 px-2.5">
                          <div className="flex flex-nowrap items-center gap-1.5 max-w-[140px] sm:max-w-none">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: subBirdInfo.color }}
                            />
                            <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                              {subBirdName}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border truncate max-w-[60px] sm:max-w-none shrink-0 ${relMeta.badgeText} ${relMeta.badgeBg} ${relMeta.badgeBorder}`}
                            >
                              {relName}
                            </span>
                          </div>
                        </td>

                        {/* Activity badge under ACTIVITY column: WCAG contrast compliant pill badge */}
                        <td className="py-1.5 px-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border truncate max-w-[70px] sm:max-w-none ${act.bgLight}`}
                          >
                            <span className="truncate">{activityLabel}</span>
                          </span>
                        </td>

                        {/* Star Rating */}
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1">
                            <div className="flex items-center text-[#D49B28]">
                              {Array.from({ length: Math.min(sp.star, 5) }).map((_, sIdx) => (
                                <Star key={sIdx} className="w-2.5 h-2.5 fill-[#D49B28]" strokeWidth={1.5} />
                              ))}
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#C29738] dark:text-amber-300 ml-0.5">
                              {sp.star}★
                            </span>
                          </div>
                        </td>

                        {/* Start Time */}
                        <td className="py-1.5 px-2.5 font-mono text-slate-800 dark:text-slate-300 text-[11px]">
                          {sp.startTime}
                        </td>

                        {/* Duration */}
                        <td className="py-1.5 px-2.5 font-mono text-slate-500 dark:text-slate-400 text-[10px]">
                          {sp.durationMinutes}m
                        </td>

                        {/* End Time */}
                        <td className="py-1.5 px-2.5 font-mono text-slate-800 dark:text-slate-300 text-[11px]">
                          {sp.endTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Multi-Column Comparison Table for all 5 birds in this Jama */
            <div className="space-y-1.5">
              {/* Top Controls: Legend + 1-Click Copy for Excel Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1 py-1 rounded-lg bg-[#FAF6EF]/60 dark:bg-slate-900/60 border border-[#D9CFBD]/60 dark:border-slate-800/60 text-[10px]">
                <div className="flex items-center gap-1.5 flex-wrap text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ta' ? 'அந்தர்தசை உறவு:' : 'Tags:'}
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800/80 badge-rel-self"
                    title={language === 'ta' ? 'S - சுயம் (பட்சியின் சொந்த அந்தர்தசை)' : "S - Self (Bird's Own Sub-period)"}
                  >
                    <strong className="font-black text-[9.5px]">S</strong> - {language === 'ta' ? 'சுயம்' : 'Self'}
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800/80 badge-rel-friend"
                    title={language === 'ta' ? 'F - நட்பு பட்சி' : 'F - Friend'}
                  >
                    <strong className="font-black text-[9.5px]">F</strong> - {language === 'ta' ? 'நட்பு' : 'Friend'}
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800/80 badge-rel-enemy"
                    title={language === 'ta' ? 'E - பகை பட்சி' : 'E - Enemy'}
                  >
                    <strong className="font-black text-[9.5px]">E</strong> - {language === 'ta' ? 'பகை' : 'Enemy'}
                  </span>
                </div>

                {/* Action Buttons: Copy for Excel + PDF + Image */}
                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                  {/* Copy for Excel */}
                  <button
                    type="button"
                    onClick={handleCopyJamaExcel}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                      isCopied
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-[#EFE7DA] dark:bg-slate-800 hover:bg-[#D9CFBD] dark:hover:bg-slate-700 text-[#1B4332] dark:text-emerald-300 border-[#D9CFBD] dark:border-slate-700'
                    }`}
                    title={language === 'ta' ? 'இந்த சாமத்தை எக்செல் வடிவத்தில் நகலெடுக்க' : 'Copy this Jama table for Microsoft Excel'}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>{language === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#1B4332] dark:text-emerald-400" />
                        <span>{language === 'ta' ? 'எக்செல்' : 'Excel'}</span>
                      </>
                    )}
                  </button>

                  {/* PDF download */}
                  <button
                    type="button"
                    disabled={isGeneratingPdf}
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer bg-[#FAF6EF] dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-900/60"
                    title={language === 'ta' ? 'இந்த சாமத்தை PDF கோப்பாகப் பதிவிறக்கு' : 'Download this Jama table as PDF'}
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    <span>PDF</span>
                  </button>

                  {/* Image download */}
                  <button
                    type="button"
                    disabled={isGeneratingImage}
                    onClick={handleDownloadImage}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer bg-[#FAF6EF] dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-900/60"
                    title={language === 'ta' ? 'இந்த சாமத்தை PNG படமாகப் பதிவிறக்கு' : 'Download this Jama table as PNG image'}
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    <span>PNG</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#D9CFBD] dark:border-slate-800 bg-[#FAF6EF] dark:bg-slate-900 shadow-xs">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-5 bg-[#EFE7DA] dark:bg-slate-900 text-[11px] font-bold border-b border-[#D9CFBD] dark:border-slate-800">
                    {(Object.keys(jama.columns) as BirdId[]).map((bKey) => {
                      const col = jama.columns[bKey];
                      const bInfo = BIRDS[bKey];
                      const isFocus = bKey === selectedBird;
                      const bDisplayName = getBirdName(bKey);
                      const mainAct = getActivityName(col.mainActivity);

                      return (
                        <div
                          key={bKey}
                          className={`p-2 border-r border-[#D9CFBD] dark:border-slate-800 last:border-r-0 ${
                            isFocus ? 'bg-[#1B4332]/10 border-b-2 border-b-[#1B4332] dark:border-b-amber-400' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: bInfo.color }} />
                              <span className={`truncate ${isFocus ? 'text-[#1B4332] dark:text-amber-300 font-extrabold' : 'text-slate-800 dark:text-slate-200 font-bold'}`}>
                                {bDisplayName}
                              </span>
                            </div>
                            {isFocus && (
                              <span className="text-[8px] bg-[#1B4332] dark:bg-emerald-700 text-white px-1 py-0.2 rounded font-bold shrink-0">
                                {language === 'ta' ? 'தேர்வு' : 'Active'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            <span className="truncate">{mainAct}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 5 Rows of Sub-periods */}
                  {[0, 1, 2, 3, 4].map((subIdx) => (
                    <div key={subIdx} className="grid grid-cols-5 border-b border-[#D9CFBD]/60 dark:border-slate-800/60 divide-x divide-[#D9CFBD]/60 dark:divide-slate-800/60 text-[11px]">
                      {(Object.keys(jama.columns) as BirdId[]).map((bKey) => {
                        const sp = jama.columns[bKey].subPeriods[subIdx];
                        const isFocus = bKey === selectedBird;
                        const active = isSubPeriodActive(sp);
                        const subBirdName = getBirdName(sp.birdId);
                        const actLabel = getActivityName(sp.activity);
                        const spRel = getBirdRelationship(bKey, sp.birdId, paksha);
                        const spTagInfo = getRelationshipTag(spRel);
                        const spRelLabel = language === 'ta' ? spTagInfo.labelTa : spTagInfo.labelEn;

                        return (
                          <div
                            key={bKey}
                            className={`p-1.5 transition-colors ${
                              active
                                ? 'bg-[#C29738]/20 font-bold text-slate-950 dark:text-white'
                                : isFocus
                                ? 'bg-[#1B4332]/5 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[9px] mb-0.5">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                  {subBirdName}
                                </span>
                                <span
                                  title={`${spTagInfo.tag} - ${spRelLabel}`}
                                  className={`inline-block font-black text-[7.5px] px-1 py-0 rounded border shrink-0 ${spTagInfo.badgeBg} ${spTagInfo.badgeText} ${spTagInfo.badgeBorder}`}
                                >
                                  {spTagInfo.tag}
                                </span>
                              </div>
                              <span className="text-[#C29738] dark:text-amber-400 font-mono font-bold shrink-0">{sp.star}★</span>
                            </div>
                            <div className="font-bold text-slate-900 dark:text-slate-200 text-[10px]">{actLabel}</div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                              {sp.startTime} - {sp.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
