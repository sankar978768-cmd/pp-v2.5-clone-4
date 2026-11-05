import React from 'react';
import { BirdId, Jama, DayCalculationMeta, PakshaType } from '../types';
import { BirdSelector } from '../components/BirdSelector';
import { BirdRelationshipsView } from '../components/BirdRelationshipsView';

export interface BirdScreenProps {
  selectedBird: BirdId;
  onSelectBird: (birdId: BirdId) => void;
  dayMeta?: DayCalculationMeta;
  paksha: PakshaType;
  customJamas?: Jama[];
  currentMinutes?: number;
  isOtherLocation?: boolean;
  timeDisplayMode?: 'local' | 'ist';
  tzAbbreviation?: string;
  locationName?: string;
}

export const BirdScreen: React.FC<BirdScreenProps> = ({
  selectedBird,
  onSelectBird,
  dayMeta,
  paksha,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 5 Birds Selector Grid with Ruling/Dying Roles */}
      <section
        aria-label="Choose Bird"
        className="bg-[#FAF6EF] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs space-y-3"
      >
        <BirdSelector
          selectedBird={selectedBird}
          onSelectBird={onSelectBird}
          dayMeta={dayMeta}
          paksha={paksha}
        />
      </section>

      {/* Bird Relationships & Friendship Compatibility Matrix (with compatibility inspector removed) */}
      <section
        aria-label="Bird Relationships Matrix"
        className="bg-[#FAF6EF] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs space-y-3"
      >
        <BirdRelationshipsView
          selectedBird={selectedBird}
          onSelectBird={onSelectBird}
          paksha={paksha}
          hideCompatibilityInspector={true}
        />
      </section>
    </div>
  );
};
