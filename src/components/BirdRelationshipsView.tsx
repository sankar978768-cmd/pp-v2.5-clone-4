import React, { useState } from 'react';
import { BirdId, PakshaType } from '../types';
import { BIRDS, ALL_BIRD_IDS } from '../data/panchaPakshiData';
import {
  getBirdFriends,
  getBirdEnemies,
  getBirdNeutrals,
  getBirdRelationship,
  RELATIONSHIP_META,
} from '../data/birdRelationships';
import { Heart, ShieldAlert, Scale, ArrowRightLeft, Sparkles, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BirdRelationshipsViewProps {
  selectedBird: BirdId;
  onSelectBird: (birdId: BirdId) => void;
  paksha?: PakshaType;
  hideCompatibilityInspector?: boolean;
}

export const BirdRelationshipsView: React.FC<BirdRelationshipsViewProps> = ({
  selectedBird,
  onSelectBird,
  paksha = 'valarpirai',
  hideCompatibilityInspector = false,
}) => {
  const {
    language,
    t,
    getBirdName,
    getDirectionName,
    getRelationshipName,
    getPakshaName,
  } = useLanguage();

  const [activePaksha, setActivePaksha] = useState<PakshaType>(paksha);
  const [compareBirdA, setCompareBirdA] = useState<BirdId>(selectedBird);
  const [compareBirdB, setCompareBirdB] = useState<BirdId>(
    selectedBird === 'vulture' ? 'owl' : 'vulture'
  );

  const mainBird = BIRDS[selectedBird];
  const friends = getBirdFriends(selectedBird, activePaksha);
  const enemies = getBirdEnemies(selectedBird, activePaksha);
  const neutrals = getBirdNeutrals(selectedBird, activePaksha);

  const relAtoB = getBirdRelationship(compareBirdA, compareBirdB, activePaksha);
  const relBtoA = getBirdRelationship(compareBirdB, compareBirdA, activePaksha);
  const birdAInfo = BIRDS[compareBirdA];
  const birdBInfo = BIRDS[compareBirdB];

  return (
    <div id="bird-relationships-view" className="space-y-5">
      {/* Header Bar with Paksha Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('tabRelationships')}</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-medium">
              {t('piraiSpecific')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {language === 'ta'
              ? 'வளர்பிறை மற்றும் தேய்பிறை காலங்களில் ஒவ்வொரு பட்சிக்குமான நட்பு, பகை மற்றும் சம பட்சிகளின் சாஸ்திர வழிகாட்டி.'
              : 'Pancha Pakshi Shastra relationship guidelines determining allies and adversaries for each bird in Valarpirai and Theipirai.'}
          </p>
        </div>

        {/* Pirai Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-center shrink-0">
          <button
            onClick={() => setActivePaksha('valarpirai')}
            id="paksha-valarpirai-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePaksha === 'valarpirai'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('valarpirai')}
          </button>
          <button
            onClick={() => setActivePaksha('theipirai')}
            id="paksha-theipirai-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePaksha === 'theipirai'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('theipirai')}
          </button>
        </div>
      </div>

      {/* Selected Bird Spotlight Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xl border shadow-inner"
              style={{
                backgroundColor: `${mainBird.color}20`,
                borderColor: `${mainBird.color}60`,
                color: mainBird.color,
              }}
            >
              {getBirdName(selectedBird)[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">
                  {getBirdName(selectedBird)}
                </h4>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {getPakshaName(activePaksha)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('directionLabel')} {getDirectionName(selectedBird)}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-center">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t('clickBirdInspect')}</span>
          </div>
        </div>

        {/* 3 Relationship Columns for Selected Bird */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Friends Card */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>{t('friendsHeader')}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {friends.length} {t('birdsUnit')}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'ta'
                ? 'நட்பு பட்சிகள். இவற்றின் அந்தர்தசை காலங்களில் சுப காரியங்கள், முக்கிய முயற்சிகள் செய்ய மிகவும் உகந்தது.'
                : 'Allied birds. Sub-periods of these birds offer maximum harmony, favorable momentum, and support for crucial initiatives.'}
            </p>

            <div className="space-y-2 pt-1">
              {friends.map((friendId) => {
                const fInfo = BIRDS[friendId];
                const fName = getBirdName(friendId);
                return (
                  <button
                    key={friendId}
                    onClick={() => onSelectBird(friendId)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-emerald-500/20 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border"
                        style={{
                          backgroundColor: `${fInfo.color}20`,
                          borderColor: `${fInfo.color}60`,
                          color: fInfo.color,
                        }}
                      >
                        {fName[0]}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                          {fName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      {getRelationshipName('friend')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enemies Card */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{t('enemiesHeader')}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                {enemies.length} {t('birdsUnit')}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'ta'
                ? 'பகை பட்சிகள். இவற்றின் அந்தர்தசை காலங்களில் முக்கிய முடிவுகள், வாக்குவாதங்கள் மற்றும் புதிய உடன்படிக்கைகளை தவிர்க்கவும்.'
                : 'Adversary birds. Sub-periods of these birds diminish vitality; avoid entering confrontations or signing high-stake commitments.'}
            </p>

            <div className="space-y-2 pt-1">
              {enemies.map((enemyId) => {
                const eInfo = BIRDS[enemyId];
                const eName = getBirdName(enemyId);
                return (
                  <button
                    key={enemyId}
                    onClick={() => onSelectBird(enemyId)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-855 border border-rose-500/20 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border"
                        style={{
                          backgroundColor: `${eInfo.color}20`,
                          borderColor: `${eInfo.color}60`,
                          color: eInfo.color,
                        }}
                      >
                        {eName[0]}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-rose-300 transition-colors">
                          {eName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                      {getRelationshipName('enemy')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neutrals Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Scale className="w-4 h-4 text-slate-400" />
                <span>{t('neutralsHeader')}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-bold">
                {neutrals.length} {t('birdsUnit')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ta'
                ? 'சம பட்சிகள். இவற்றின் அந்தர்தசைகளில் நடுத்தரமான பலன்கள் கிடைக்கும்.'
                : 'Balanced relations without strong polarity. Sub-periods generate standard, moderate outcomes according to bird activity.'}
            </p>

            <div className="space-y-2 pt-1">
              {neutrals.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 rounded-lg bg-slate-900/50">
                  {language === 'ta' ? 'சம பட்சிகள் இல்லை' : 'No neutral birds'}
                </div>
              ) : (
                neutrals.map((neutralId) => {
                  const nInfo = BIRDS[neutralId];
                  const nName = getBirdName(neutralId);
                  return (
                    <button
                      key={neutralId}
                      onClick={() => onSelectBird(neutralId)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border"
                          style={{
                            backgroundColor: `${nInfo.color}20`,
                            borderColor: `${nInfo.color}60`,
                            color: nInfo.color,
                          }}
                        >
                          {nName[0]}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-slate-200 transition-colors">
                            {nName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                        {getRelationshipName('neutral')}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete 5-Bird Matrix Reference Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{t('masterMatrixTitle')} - {getPakshaName(activePaksha)}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'ta'
                ? 'ஐந்து பட்சிகளுக்குமான நட்பு, பகை, சம உறவுகளின் முழுமையான அட்டவணை.'
                : 'Complete authoritative table showing mutual friendships and enmities across all 5 birds.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-4">{t('thMatrixBird')}</th>
                <th scope="col" className="py-3 px-4">{t('thMatrixFriends')}</th>
                <th scope="col" className="py-3 px-4">{t('thMatrixEnemies')}</th>
                <th scope="col" className="py-3 px-4">{t('thMatrixNeutrals')}</th>
                <th scope="col" className="py-3 px-4 text-center">{t('thMatrixAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {ALL_BIRD_IDS.map((bId) => {
                const bInfo = BIRDS[bId];
                const bName = getBirdName(bId);
                const bFriends = getBirdFriends(bId, activePaksha);
                const bEnemies = getBirdEnemies(bId, activePaksha);
                const bNeutrals = getBirdNeutrals(bId, activePaksha);
                const isSelected = selectedBird === bId;

                return (
                  <tr
                    key={bId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 border-l-2 border-amber-400'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Bird Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border"
                          style={{
                            backgroundColor: `${bInfo.color}20`,
                            borderColor: `${bInfo.color}60`,
                            color: bInfo.color,
                          }}
                        >
                          {bName[0]}
                        </span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{bName}</span>
                            {isSelected && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                                {t('activeBadge')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Friends */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {bFriends.map((fId) => (
                          <span
                            key={fId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {getBirdName(fId)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Enemies */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {bEnemies.map((eId) => (
                          <span
                            key={eId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-semibold"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            {getBirdName(eId)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Neutrals */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {bNeutrals.length === 0 ? (
                          <span className="text-slate-500 text-[11px] italic">
                            {language === 'ta' ? 'இல்லை' : 'None'}
                          </span>
                        ) : (
                          bNeutrals.map((nId) => (
                            <span
                              key={nId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]"
                            >
                              {getBirdName(nId)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Select Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectBird(bId)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? t('selectedState') : t('selectThisDay')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Pair Compatibility Checker */}
      {!hideCompatibilityInspector && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                {t('compatibilityInspectorTitle')}
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {getPakshaName(activePaksha)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Bird A selector */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">{t('primaryBirdLabel')}</label>
              <select
                value={compareBirdA}
                onChange={(e) => setCompareBirdA(e.target.value as BirdId)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {ALL_BIRD_IDS.map((id) => (
                  <option key={id} value={id}>
                    {getBirdName(id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Center vs icon */}
            <div className="flex justify-center text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400 border border-slate-700">
                VS
              </div>
            </div>

            {/* Bird B selector */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">{t('secondaryBirdLabel')}</label>
              <select
                value={compareBirdB}
                onChange={(e) => setCompareBirdB(e.target.value as BirdId)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {ALL_BIRD_IDS.map((id) => (
                  <option key={id} value={id}>
                    {getBirdName(id)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mutual Result Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* A to B */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">
                  {language === 'ta'
                    ? `${getBirdName(compareBirdA)} பட்சியின் பார்வை ${getBirdName(compareBirdB)} மீது:`
                    : `${getBirdName(compareBirdA)}'s perspective toward ${getBirdName(compareBirdB)}:`}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${RELATIONSHIP_META[relAtoB].badgeBg} ${RELATIONSHIP_META[relAtoB].badgeText} ${RELATIONSHIP_META[relAtoB].badgeBorder}`}
                  >
                    {getRelationshipName(relAtoB)}
                  </span>
                  <span className="text-xs text-slate-300">
                    {language === 'ta'
                      ? (relAtoB === 'friend' ? 'மிகவும் சாதகமானது, வெற்றி தரும்' : relAtoB === 'enemy' ? 'சாதகமற்றது, தடைகள் வரலாம்' : 'சமநிலை பலன்கள்')
                      : RELATIONSHIP_META[relAtoB].description}
                  </span>
                </div>
              </div>

              {/* B to A */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">
                  {language === 'ta'
                    ? `${getBirdName(compareBirdB)} பட்சியின் பார்வை ${getBirdName(compareBirdA)} மீது:`
                    : `${getBirdName(compareBirdB)}'s perspective toward ${getBirdName(compareBirdA)}:`}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${RELATIONSHIP_META[relBtoA].badgeBg} ${RELATIONSHIP_META[relBtoA].badgeText} ${RELATIONSHIP_META[relBtoA].badgeBorder}`}
                  >
                    {getRelationshipName(relBtoA)}
                  </span>
                  <span className="text-xs text-slate-300">
                    {language === 'ta'
                      ? (relBtoA === 'friend' ? 'மிகவும் சாதகமானது, வெற்றி தரும்' : relBtoA === 'enemy' ? 'சாதகமற்றது, தடைகள் வரலாம்' : 'சமநிலை பலன்கள்')
                      : RELATIONSHIP_META[relBtoA].description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
