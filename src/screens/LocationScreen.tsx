import React from 'react';
import { Jama } from '../types';
import { SunriseSunsetBar } from '../components/SunriseSunsetBar';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Sun, Compass, Sparkles } from 'lucide-react';

export interface LocationScreenProps {
  sunriseTime: string;
  sunsetTime: string;
  nextSunriseTime: string;
  displaySunrise?: string;
  displaySunset?: string;
  displayNextSunrise?: string;
  isCustomSchedule: boolean;
  onApplySunriseSunset: (
    sunrise: string,
    sunset: string,
    nextSunrise: string,
    cityName?: string,
    lat?: number,
    lng?: number,
    timezone?: string,
    timezoneOffset?: number
  ) => void;
  onResetSchedule: () => void;
  locationName: string;
  baseJamas: Jama[];
  isOtherLocation: boolean;
  timeDisplayMode: 'local' | 'ist';
  onToggleTimeDisplayMode?: (mode: 'local' | 'ist') => void;
  tzAbbreviation: string;
  timeDifferenceText?: string;
  localDayName?: string;
  localDateText?: string;
  localPakshaText?: string;
  localTimeText?: string;
}

export const LocationScreen: React.FC<LocationScreenProps> = (props) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Screen Title Banner */}
      <section className="bg-[#FAF6EF] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-[#D9CFBD] dark:border-slate-800 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-800 dark:text-sky-400 text-xs font-bold mb-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'இடம் & சூரிய கணக்கீடு' : 'Location & Solar Timings'}</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
          {props.locationName || (language === 'ta' ? 'சென்னை' : 'Chennai')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {language === 'ta'
            ? 'பஞ்ச பட்சி சாஸ்திரம் உள்ளூர் சூரிய உதயம் மற்றும் அஸ்தமனத்தை அடிப்படையாகக் கொண்டு கணக்கிடப்படுகிறது. உங்கள் ஊரின் சரியான நேரத்தை அமைக்கவும்.'
            : 'Pancha Pakshi Shastra operates strictly on local sunrise and sunset timings. Search any city or use GPS to calculate exact solar cycles.'}
        </p>
      </section>

      {/* Sunrise, Sunset & Location Calculator Bar - Embedded Inline (No Pop Up) */}
      <section aria-label="Sunrise Sunset and Location Calculator">
        <SunriseSunsetBar {...props} alwaysExpanded={true} />
      </section>
    </div>
  );
};
