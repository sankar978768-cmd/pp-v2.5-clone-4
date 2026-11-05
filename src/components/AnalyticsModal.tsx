import React, { useState, useEffect } from 'react';
import { BirdId, Jama, PakshaType } from '../types';
import { ActivityChartView } from './ActivityChartView';
import { MasterTableView } from './MasterTableView';
import { BirdRelationshipsView } from './BirdRelationshipsView';
import { useLanguage } from '../context/LanguageContext';
import { X, TrendingUp, Table, Users, Sparkles } from 'lucide-react';

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
}) => {
  const { language, t, getBirdName } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chart' | 'master' | 'relationships'>(initialTab);

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
