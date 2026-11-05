import React, { useEffect } from 'react';
import { BirdId } from '../types';
import { BIRDS } from '../data/panchaPakshiData';
import { useLanguage } from '../context/LanguageContext';
import { X, Check } from 'lucide-react';

export interface BirdSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBird: BirdId;
  onSelectBird: (birdId: BirdId) => void;
}

export const BIRD_EMOJIS: Record<BirdId, string> = {
  vulture: '🦅',
  owl: '🦉',
  crow: '🐦',
  cock: '🐓',
  peacock: '🦚',
};

export const BirdSelectModal: React.FC<BirdSelectModalProps> = ({
  isOpen,
  onClose,
  selectedBird,
  onSelectBird,
}) => {
  const { language, t, getBirdName } = useLanguage();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const birdsList = Object.values(BIRDS);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('selectYourBird') || 'Select Bird'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#FAF6EF] dark:bg-slate-900 rounded-2xl shadow-2xl border border-[#D9CFBD] dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D9CFBD] dark:border-slate-800 bg-[#EFE7DA]/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {BIRD_EMOJIS[selectedBird] || '🐦'}
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {t('selectYourBird')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'ta' ? 'உங்கள் பஞ்ச பட்சியைத் தேர்ந்தெடுக்கவும்' : 'Choose your Pancha Pakshi birth or ruling bird'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Birds Selection List */}
        <div className="p-3 sm:p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {birdsList.map((bird) => {
            const isSelected = selectedBird === bird.id;
            const birdName = getBirdName(bird.id);
            const emoji = BIRD_EMOJIS[bird.id] || '🐦';

            return (
              <button
                key={bird.id}
                type="button"
                onClick={() => {
                  onSelectBird(bird.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left active:scale-[0.98] ${
                  isSelected
                    ? 'bg-amber-500/10 dark:bg-amber-400/15 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30'
                    : 'bg-[#FAF6EF] dark:bg-slate-800/50 hover:bg-[#EFE7DA] dark:hover:bg-slate-800 border-[#D9CFBD] dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                    style={{
                      backgroundColor: `${bird.color}15`,
                      borderColor: `${bird.color}40`,
                    }}
                  >
                    {emoji}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{birdName}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold uppercase">
                          {language === 'ta' ? 'தேர்வு' : 'Active'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 dark:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
