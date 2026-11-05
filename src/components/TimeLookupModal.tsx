import React, { useState, useEffect } from 'react';
import { BirdId, Jama } from '../types';
import { BIRDS, ACTIVITY_DETAILS } from '../data/panchaPakshiData';
import { getCurrentStatus } from '../utils/calculator';
import { calculateSolarTimes } from '../utils/solarCalculator';
import { LocationSearchBar } from './LocationSearchBar';
import { Clock, CheckCircle2, ShieldAlert, Sparkles, X, Sunrise, Sunset, Sun, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TimeLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBird: BirdId;
  customJamas?: Jama[];
  onApplySunriseSunset?: (sunrise: string, sunset: string, nextSunrise: string, cityName?: string) => void;
  currentSunrise?: string;
  currentSunset?: string;
  currentNextSunrise?: string;
  isCustomSchedule?: boolean;
  onResetSchedule?: () => void;
  locationName?: string;
}

export const TimeLookupModal: React.FC<TimeLookupModalProps> = ({
  isOpen,
  onClose,
  selectedBird,
  customJamas,
  onApplySunriseSunset,
  currentSunrise = '06:00',
  currentSunset = '18:00',
  currentNextSunrise = '06:00',
  isCustomSchedule = false,
  onResetSchedule,
  locationName,
}) => {
  const { language, t, getBirdName, getActivityName, getActivityStatus, getActivityDescription } = useLanguage();
  const [inputTime, setInputTime] = useState<string>('10:30');
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');

  // Custom Sunrise/Sunset states
  const [sunriseVal, setSunriseVal] = useState(currentSunrise);
  const [sunsetVal, setSunsetVal] = useState(currentSunset);
  const [nextSunriseVal, setNextSunriseVal] = useState(currentNextSunrise);
  const [cityNameVal, setCityNameVal] = useState(locationName || '');
  const [activeTab, setActiveTab] = useState<'lookup' | 'sun-config'>('lookup');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    setSunriseVal(currentSunrise);
    setSunsetVal(currentSunset);
    setNextSunriseVal(currentNextSunrise);
    if (locationName) setCityNameVal(locationName);
  }, [currentSunrise, currentSunset, currentNextSunrise, locationName]);

  if (!isOpen) return null;

  // Convert input time to minutes
  const [hoursStr, minutesStr] = inputTime.split(':');
  let hrs = parseInt(hoursStr || '0', 10);
  const mins = parseInt(minutesStr || '0', 10);
  if (amPm === 'PM' && hrs < 12) hrs += 12;
  if (amPm === 'AM' && hrs === 12) hrs = 0;
  const lookupMinutes = hrs * 60 + mins;

  const result = getCurrentStatus(selectedBird, lookupMinutes, customJamas);
  const birdDisplayName = getBirdName(selectedBird);
  const act = ACTIVITY_DETAILS[result.activeSubPeriod.activity];

  const handleSetPresetTime = (hours: number, minutes: number) => {
    let h = hours;
    let period: 'AM' | 'PM' = 'AM';
    if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    }
    if (h === 0) h = 12;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    setInputTime(`${hStr}:${mStr}`);
    setAmPm(period);
  };

  const handleSetNow = () => {
    const d = new Date();
    handleSetPresetTime(d.getHours(), d.getMinutes());
  };

  const handleAdjustMinutes = (delta: number) => {
    const [hS, mS] = inputTime.split(':');
    let totalMins = (parseInt(hS || '0', 10) % 12) * 60 + parseInt(mS || '0', 10);
    if (amPm === 'PM') totalMins += 720;
    totalMins = (totalMins + delta + 1440) % 1440;
    const newH = Math.floor(totalMins / 60);
    const newM = totalMins % 60;
    handleSetPresetTime(newH, newM);
  };

  const handleApplySun = () => {
    if (onApplySunriseSunset) {
      onApplySunriseSunset(sunriseVal, sunsetVal, nextSunriseVal, cityNameVal || undefined);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError(language === 'ta' ? 'ஜிபிஎஸ் வசதி ஆதரிக்கப்படவில்லை.' : 'Geolocation not supported by browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const { latitude, longitude } = pos.coords;
        const calc = calculateSolarTimes(latitude, longitude);
        setSunriseVal(calc.sunrise);
        setSunsetVal(calc.sunset);
        setNextSunriseVal(calc.nextSunrise);
        setCityNameVal(language === 'ta' ? `ஜிபிஎஸ் (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)` : `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.message || (language === 'ta' ? 'ஜிபிஎஸ் பெற முடியவில்லை.' : 'Unable to retrieve GPS.'));
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF6EF] dark:bg-slate-900 border border-[#D9CFBD] dark:border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#D9CFBD] dark:border-slate-800 flex items-center justify-between bg-[#EFE7DA]/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'ta' ? 'நேர தேடல் & சூரியோதய அமைப்புகள்' : 'Pancha Pakshi Calculator Tools'}
            </h3>
          </div>
          <button
            onClick={onClose}
            id="close-time-lookup-btn"
            aria-label="Close"
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('lookup')}
            id="tab-lookup-btn"
            className={`flex-1 min-h-[44px] py-2.5 font-semibold text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center ${
              activeTab === 'lookup'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('anyTimeLookup')}
          </button>
          <button
            onClick={() => setActiveTab('sun-config')}
            id="tab-sun-config-btn"
            className={`flex-1 min-h-[44px] py-2.5 font-semibold text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center ${
              activeTab === 'sun-config'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ta' ? 'சூரியோதயம் / அஸ்தமனம்' : 'Custom Sunrise / Sunset'}
          </button>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto space-y-4">
          {activeTab === 'lookup' ? (
            <>
              {/* Time Input Controls */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ta'
                    ? `${birdDisplayName} பட்சிக்கான நேரத்தைத் தேர்ந்தெடுக்கவும்`
                    : `Select Time to Calculate for ${birdDisplayName}`}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    id="lookup-time-input"
                    className="min-h-[46px] bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-base w-full focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAmPm('AM')}
                      className={`min-h-[40px] px-3.5 py-1.5 text-xs rounded-lg font-extrabold transition-all cursor-pointer ${
                        amPm === 'AM'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmPm('PM')}
                      className={`min-h-[40px] px-3.5 py-1.5 text-xs rounded-lg font-extrabold transition-all cursor-pointer ${
                        amPm === 'PM'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* 1-Tap Mobile Presets for Android Touch Ease */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  <button
                    type="button"
                    onClick={handleSetNow}
                    id="modal-preset-now"
                    className="min-h-[38px] px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    <span>⚡ {t('nowPreset')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdjustMinutes(30)}
                    id="modal-preset-plus30m"
                    className="min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors active:scale-95 shrink-0"
                  >
                    {t('plus30m')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdjustMinutes(60)}
                    id="modal-preset-plus1h"
                    className="min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors active:scale-95 shrink-0"
                  >
                    {t('plus1h')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetPresetTime(6, 0)}
                    id="modal-preset-sunrise"
                    className="min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors active:scale-95 shrink-0"
                  >
                    06:00 AM
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetPresetTime(12, 0)}
                    id="modal-preset-noon"
                    className="min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors active:scale-95 shrink-0"
                  >
                    12:00 PM
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetPresetTime(18, 0)}
                    id="modal-preset-sunset"
                    className="min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors active:scale-95 shrink-0"
                  >
                    06:00 PM
                  </button>
                </div>
              </div>

              {/* Calculation Result Card */}
              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{language === 'ta' ? 'தேர்ந்தெடுத்த நேரம்:' : 'Target Time:'}</span>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {result.timeDisplay}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{language === 'ta' ? 'நடப்பு சாமம்:' : 'Active Jama:'}</span>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {result.activeJama.title}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-[#EFE7DA]/50 dark:bg-slate-900 p-3 rounded-lg border border-[#D9CFBD] dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'ta' ? 'பட்சியின் முக்கிய தொழில்:' : "Selected Bird's Jama State:"}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {getActivityName(result.selectedBirdMainActivity)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {result.activeJama.startTime} – {result.activeJama.endTime}
                    </div>
                  </div>

                  <div className="bg-[#EFE7DA]/50 dark:bg-slate-900 p-3 rounded-lg border border-[#D9CFBD] dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'ta' ? 'அந்தர்தசை தொழில்:' : 'Active Sub-Period (Anthardasa):'}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${act.bgLight}`}>
                        {getActivityName(result.activeSubPeriod.activity)}
                      </span>
                      <span className="text-amber-600 dark:text-amber-300 font-mono text-xs font-bold">
                        {result.activeSubPeriod.star}★
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      {result.activeSubPeriod.startTime} – {result.activeSubPeriod.endTime}
                    </div>
                  </div>
                </div>

                {/* Auspicious Guidance */}
                <div className="bg-[#EFE7DA]/50 dark:bg-slate-900/90 rounded-lg p-3 border border-[#D9CFBD] dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {result.activeSubPeriod.activity === 'Rule' || result.activeSubPeriod.activity === 'Eat' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : result.activeSubPeriod.activity === 'Die' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {getActivityStatus(result.activeSubPeriod.activity)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {getActivityDescription(result.activeSubPeriod.activity)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Custom Sunrise / Sunset Configurator */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
                  {language === 'ta'
                    ? 'உங்கள் இடத்திற்கு ஏற்ப சூரியோதயம் மற்றும் அஸ்தமன நேரங்களை மாற்றி சாமங்களை கணக்கிடுங்கள்.'
                    : 'Customize Sunrise and Sunset to dynamically rescale all 10 Jamas proportionally according to your location.'}
                </p>
                <button
                  onClick={handleDetectGPS}
                  disabled={geoLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{geoLoading ? (language === 'ta' ? 'ஜிபிஎஸ்...' : 'GPS...') : (language === 'ta' ? 'ஜிபிஎஸ்' : 'GPS Detect')}</span>
                </button>
              </div>

              {geoError && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                  {geoError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'ta' ? 'சூரியோதயம் (இன்று)' : 'Sunrise (Today)'}</span>
                  </label>
                  <input
                    type="time"
                    value={sunriseVal}
                    onChange={(e) => {
                      setSunriseVal(e.target.value);
                      setCityNameVal('');
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-sm w-full focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Sunset className="w-3.5 h-3.5 text-purple-500" />
                    <span>{language === 'ta' ? 'அஸ்தமனம் (இன்று)' : 'Sunset (Today)'}</span>
                  </label>
                  <input
                    type="time"
                    value={sunsetVal}
                    onChange={(e) => {
                      setSunsetVal(e.target.value);
                      setCityNameVal('');
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-sm w-full focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{language === 'ta' ? 'சூரியோதயம் (நாளை)' : 'Sunrise (Tomorrow)'}</span>
                  </label>
                  <input
                    type="time"
                    value={nextSunriseVal}
                    onChange={(e) => {
                      setNextSunriseVal(e.target.value);
                      setCityNameVal('');
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-sm w-full focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Location Search & 5 Recent Searches */}
              <div className="pt-1">
                <LocationSearchBar
                  currentLocationName={cityNameVal}
                  onApplyLocationSchedule={(sr, ss, nsr, locName) => {
                    setSunriseVal(sr);
                    setSunsetVal(ss);
                    setNextSunriseVal(nsr);
                    setCityNameVal(locName);
                    if (onApplySunriseSunset) {
                      onApplySunriseSunset(sr, ss, nsr, locName);
                    }
                  }}
                  onResetStandard={() => {
                    if (onResetSchedule) onResetSchedule();
                    setSunriseVal('06:00');
                    setSunsetVal('18:00');
                    setNextSunriseVal('06:00');
                    setCityNameVal('');
                  }}
                  isCustomActive={isCustomSchedule}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApplySun}
                  id="apply-sunrise-sunset-btn"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-md"
                >
                  {language === 'ta' ? '10 சாமங்களையும் கணக்கிடுக' : 'Recalculate All 10 Jamas'}
                </button>
                {isCustomSchedule && (
                  <button
                    onClick={() => {
                      if (onResetSchedule) onResetSchedule();
                      setSunriseVal('06:00');
                      setSunsetVal('18:00');
                      setNextSunriseVal('06:00');
                      setCityNameVal('');
                    }}
                    id="reset-standard-schedule-btn"
                    className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {language === 'ta' ? 'இயல்பு நிலை' : 'Reset Standard'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold cursor-pointer"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
