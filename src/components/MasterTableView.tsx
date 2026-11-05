import React, { useState } from 'react';
import { BirdId, Jama } from '../types';
import { JAMAS_DATA, BIRDS, ACTIVITY_DETAILS } from '../data/panchaPakshiData';
import { Sun, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MasterTableViewProps {
  selectedBird: BirdId;
  customJamas?: Jama[];
}

export const MasterTableView: React.FC<MasterTableViewProps> = ({
  selectedBird,
  customJamas,
}) => {
  const { language, t, getBirdName, getActivityName } = useLanguage();
  const jamas = customJamas || JAMAS_DATA;
  const [jamaFilter, setJamaFilter] = useState<'all' | 'day' | 'night'>('all');

  const filteredJamas = jamas.filter((j) => {
    if (jamaFilter === 'day') return j.isDay;
    if (jamaFilter === 'night') return !j.isDay;
    return true;
  });

  const birdKeys: BirdId[] = ['vulture', 'owl', 'crow', 'cock', 'peacock'];

  return (
    <div id="master-table-view" className="space-y-4">
      {/* Header Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6EF] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('masterTableTitle')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] dark:text-emerald-300 border border-[#1B4332]/30 font-bold">
              {t('activeHighlight')}: {getBirdName(selectedBird)}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'அனைத்து 5 பட்சிகளுக்குமான முழுமையான 10 சாமங்கள் மற்றும் அந்தர்தசை நேர அட்டவணை.'
              : 'Original full astronomical calculation table for all 5 birds side-by-side with exact star values & minutes.'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#EFE7DA] dark:bg-slate-950 p-1 rounded-xl border border-[#D9CFBD] dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
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

      {/* Rules & Terminology Reference Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#FAF6EF] dark:bg-slate-950/60 p-4 rounded-2xl border border-[#D9CFBD] dark:border-slate-800/80">
        <div>
          <span className="font-bold text-[#C29738] dark:text-amber-400 flex items-center gap-1.5 mb-1">
            <Sun className="w-3.5 h-3.5 text-[#C29738]" strokeWidth={1.5} />
            <span>{language === 'ta' ? 'பகல் விதிகள் (சூரியோதயம் முதல் அஸ்தமனம் வரை - 720 நிமிடங்கள்):' : 'Day Rules (Sunrise to Sunset - 720 mins total):'}</span>
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {getActivityName('Rule')}: 48m | {getActivityName('Walk')}: 36m | {getActivityName('Eat')}: 30m | {getActivityName('Sleep')}: 18m | {getActivityName('Die')}: 12m = 144m / {language === 'ta' ? 'சாமம்' : 'Jama'}
          </p>
        </div>

        <div>
          <span className="font-bold text-[#133E46] dark:text-purple-400 flex items-center gap-1.5 mb-1">
            <Moon className="w-3.5 h-3.5 text-[#133E46] dark:text-purple-400" strokeWidth={1.5} />
            <span>{language === 'ta' ? 'இரவு விதிகள் (அஸ்தமனம் முதல் மறு உதயம் வரை - 720 நிமிடங்கள்):' : 'Night Rules (Sunset to Sunrise - 720 mins total):'}</span>
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {getActivityName('Rule')}: 24m | {getActivityName('Eat')}: 30m | {getActivityName('Walk')}: 30m | {getActivityName('Sleep')}: 24m | {getActivityName('Die')}: 36m = 144m / {language === 'ta' ? 'சாமம்' : 'Jama'}
          </p>
        </div>
      </div>

      {/* The Master Jamas Grid */}
      <div className="space-y-6">
        {filteredJamas.map((jama) => (
          <div
            key={jama.jamaNumber}
            className="bg-[#FAF6EF] dark:bg-slate-900/70 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 overflow-hidden shadow-xs"
          >
            {/* Jama banner */}
            <div className="bg-[#EFE7DA]/70 dark:bg-slate-900 px-4 sm:px-5 py-3 border-b border-[#D9CFBD] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    jama.isDay ? 'bg-[#C29738]' : 'bg-[#133E46]'
                  }`}
                />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{jama.title}</h4>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  ({jama.startTime} – {jama.endTime})
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6EF] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#D9CFBD] dark:border-slate-700">
                {jama.isDay ? t('dayPeriod') : t('nightPeriod')}
              </span>
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
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: bInfo.color }}
                          />
                          <span>{bName}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                            ({actName})
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] bg-[#1B4332] text-white px-1.5 py-0.5 rounded-full font-bold">
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
                            <span className="font-bold text-slate-900 dark:text-white">
                              {subBirdName}
                            </span>
                            <span className="text-[#C29738] dark:text-amber-400 font-mono text-[11px] font-bold">
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
        ))}
      </div>
    </div>
  );
};
