import React from 'react';
import { BirdId, DayCalculationMeta, PakshaType } from '../types';
import { BIRDS } from '../data/panchaPakshiData';
import { motion } from 'motion/react';
import { Sun, Moon, Skull, Feather } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BirdSelectorProps {
  selectedBird: BirdId;
  onSelectBird: (birdId: BirdId) => void;
  dayMeta?: DayCalculationMeta;
  paksha?: PakshaType;
}

export const BirdSelector: React.FC<BirdSelectorProps> = ({ selectedBird, onSelectBird, dayMeta, paksha }) => {
  const { language, t, getBirdName, getPakshaName } = useLanguage();
  const birdsList = Object.values(BIRDS);
  const activePaksha = paksha || dayMeta?.paksha || 'valarpirai';

  // Dynamic role determination based on active day meta if present
  const getDayRelation = (birdId: BirdId) => {
    if (dayMeta) {
      if (dayMeta.dayRulingBird === birdId) return 'Ruling Bird';
      if (dayMeta.dayDyingBird === birdId) return 'Dying Bird';
      return null;
    }
    return BIRDS[birdId].dayRelation;
  };

  const getNightRelation = (birdId: BirdId) => {
    if (dayMeta) {
      if (dayMeta.nightRulingBird === birdId) return 'Ruling Bird';
      if (dayMeta.nightDyingBird === birdId) return 'Dying Bird';
      return null;
    }
    return BIRDS[birdId].nightRelation;
  };

  return (
    <section aria-label="Bird Selection" className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('selectYourBird')}</span>
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">
          {dayMeta
            ? (language === 'ta' ? dayMeta.tamilName : dayMeta.name)
            : getPakshaName(activePaksha)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {birdsList.map((bird) => {
          const isSelected = selectedBird === bird.id;
          const dayRel = getDayRelation(bird.id);
          const nightRel = getNightRelation(bird.id);
          const bName = getBirdName(bird.id);

          return (
            <motion.button
              key={bird.id}
              onClick={() => onSelectBird(bird.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id={`bird-select-btn-${bird.id}`}
              className={`relative flex flex-col p-4 sm:p-5 rounded-2xl text-left transition-all duration-150 min-h-[120px] cursor-pointer touch-manipulation border ${
                isSelected
                  ? 'bg-[#FFFDF7] dark:bg-slate-900 border-[#1B4332] dark:border-amber-400 ring-2 ring-[#1B4332]/40 dark:ring-amber-400/40 shadow-md'
                  : 'bg-[#FAF6EF] dark:bg-slate-900/60 hover:bg-[#EFE7DA] dark:hover:bg-slate-850 border-[#D9CFBD] dark:border-slate-800 hover:border-[#C8BCA4] dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B4332] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1B4332] dark:bg-amber-400"></span>
                </span>
              )}

              {/* Bird Icon & Pure Name */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                  style={{
                    backgroundColor: `${bird.color}18`,
                    borderColor: `${bird.color}50`,
                    color: bird.color,
                  }}
                >
                  {bName[0]}
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm sm:text-base truncate ${isSelected ? 'text-slate-950 dark:text-white font-extrabold' : 'text-slate-900 dark:text-slate-200'}`}>
                    {bName}
                  </h3>
                </div>
              </div>

              {/* Role Indicators */}
              <div className="mt-auto pt-2.5 border-t border-[#D9CFBD] dark:border-slate-800/80 space-y-1.5 text-[10px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {dayRel === 'Ruling Bird' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C29738]/15 text-[#8C6B1C] dark:text-amber-300 border border-[#C29738]/30 font-bold">
                      <Sun className="w-3 h-3 text-[#C29738]" strokeWidth={1.5} /> {t('dayRulerShort')}
                    </span>
                  )}
                  {nightRel === 'Ruling Bird' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#133E46]/15 text-[#133E46] dark:text-purple-300 border border-[#133E46]/30 font-bold">
                      <Moon className="w-3 h-3 text-[#133E46] dark:text-purple-400" strokeWidth={1.5} /> {t('nightRulerShort')}
                    </span>
                  )}
                  {dayRel === 'Dying Bird' && nightRel === 'Dying Bird' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-[#1e293b] dark:text-rose-200 border border-rose-500/30 font-bold">
                      <Skull className="w-3 h-3 text-rose-600 dark:text-rose-400" strokeWidth={1.5} /> {t('dyingShort')}
                    </span>
                  ) : (
                    <>
                      {dayRel === 'Dying Bird' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-[#1e293b] dark:text-rose-200 border border-rose-500/30 font-bold">
                          <Skull className="w-3 h-3 text-rose-600 dark:text-rose-400" strokeWidth={1.5} /> {t('dayDyingShort')}
                        </span>
                      )}
                      {nightRel === 'Dying Bird' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-[#1e293b] dark:text-rose-200 border border-rose-500/30 font-bold">
                          <Skull className="w-3 h-3 text-rose-600 dark:text-rose-400" strokeWidth={1.5} /> {t('nightDyingShort')}
                        </span>
                      )}
                    </>
                  )}
                  {!dayRel && !nightRel && (
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      {language === 'ta' ? 'இயல்பு' : 'Standard'}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
