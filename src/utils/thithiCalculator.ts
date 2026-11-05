import { PakshaType } from '../types';
import { calculateSolarTimes } from './solarCalculator';

export const TITHI_NAMES_TANGLISH: string[] = [
  // Valarpirai (Shukla Paksha) 1 to 15
  'Prathamai',
  'Thuvithiyai',
  'Thirithiyai',
  'Chathurthi',
  'Panchami',
  'Sashti',
  'Sapthami',
  'Ashtami',
  'Navami',
  'Dasami',
  'Ekadhasi',
  'Thuvadhasi',
  'Thirayodhasi',
  'Chathurdhasi',
  'Pournami', // 15
  // Theipirai (Krishna Paksha) 1 to 15
  'Prathamai',
  'Thuvithiyai',
  'Thirithiyai',
  'Chathurthi',
  'Panchami',
  'Sashti',
  'Sapthami',
  'Ashtami',
  'Navami',
  'Dasami',
  'Ekadhasi',
  'Thuvadhasi',
  'Thirayodhasi',
  'Chathurdhasi',
  'Amavasai', // 30
];

export const TITHI_NAMES_TA: string[] = [
  'பிரதமை',
  'துவிதியை',
  'திருதியை',
  'சதுர்த்தி',
  'பஞ்சமி',
  'சஷ்டி',
  'சப்தமி',
  'அஷ்டமி',
  'நவமி',
  'தசமி',
  'ஏகாதசி',
  'துவாதசி',
  'திரயோதசி',
  'சதுர்த்தசி',
  'பௌர்ணமி',
  'பிரதமை',
  'துவிதியை',
  'திருதியை',
  'சதுர்த்தி',
  'பஞ்சமி',
  'சஷ்டி',
  'சப்தமி',
  'அஷ்டமி',
  'நவமி',
  'தசமி',
  'ஏகாதசி',
  'துவாதசி',
  'திரயோதசி',
  'சதுர்த்தசி',
  'அமாவாசை',
];

export interface ThithiSpecialMeta {
  deity: string;
  deityTa: string;
  significanceEn: string;
  significanceTa: string;
  isFastingDay?: boolean;
}

export const TITHI_SIGNIFICANCE: Record<number, ThithiSpecialMeta> = {
  3: {
    deity: 'Lord Ganesha (Vinayagar)',
    deityTa: 'விநாயகர் பெருமான்',
    significanceEn: 'Vinayagar Chaturthi worship; removal of obstacles',
    significanceTa: 'விநாயகர் சதுர்த்தி வழிபாடு; காரிய விக்னங்கள் நீங்கும்',
    isFastingDay: true,
  },
  5: {
    deity: 'Lord Murugan',
    deityTa: 'முருகப் பெருமான்',
    significanceEn: 'Sashti Viratham; victory over adversity, fertility & health',
    significanceTa: 'சஷ்டி விரதம்; எதிர்ப்புகள் விலகும், குழந்தைப்பேறு & ஆரோக்கியம்',
    isFastingDay: true,
  },
  7: {
    deity: 'Lord Bhairavar',
    deityTa: 'பைரவர் & துர்க்கை',
    significanceEn: 'Bhairava worship; avoid starting new travel or debt agreements',
    significanceTa: 'பைரவர் வழிபாடு; சுப பிரயாணம் மற்றும் நிதி ஒப்பந்தங்களைத் தவிர்க்கவும்',
  },
  8: {
    deity: 'Sri Rama & Goddess Durga',
    deityTa: 'ஸ்ரீ ராமர் & துர்க்கை',
    significanceEn: 'Sri Rama puja; traditional wisdom avoids housewarming on Navami',
    significanceTa: 'ராமபிரான் வழிபாடு; முக்கிய கிரகப்பிரவேசம் செய்ய மரபில் தவிர்',
  },
  10: {
    deity: 'Lord Maha Vishnu',
    deityTa: 'மகா விஷ்ணு',
    significanceEn: 'Shukla Ekadhasi Viratham; supreme spiritual merit and cleansing',
    significanceTa: 'சுக்ல ஏகாதசி விரதம்; சகல பாவ விமோசனம் & மோட்ச பலன்',
    isFastingDay: true,
  },
  11: {
    deity: 'Lord Vishnu / Tulasi',
    deityTa: 'துளசி & விஷ்ணு',
    significanceEn: 'Ekadhasi Parana & Tulasi Pooja; charitable donation day',
    significanceTa: 'ஏகாதசி பாரணை & துளசி பூஜை; அன்னதானம் செய்ய உகந்தது',
  },
  12: {
    deity: 'Lord Shiva & Nandi',
    deityTa: 'சிவபெருமான் & நந்தி',
    significanceEn: 'Valarpirai Pradosham (4:30 PM - 6:00 PM); debt relief & peace',
    significanceTa: 'வளர்பிறை பிரதோஷம் (மாலை 4:30 - 6:00); கடன் நிவர்த்தி & நல்வாழ்வு',
    isFastingDay: true,
  },
  14: {
    deity: 'Goddess Lakshmi & Lord Satyanarayana',
    deityTa: 'மகாலட்சுமி & சத்யநாராயணர்',
    significanceEn: 'Pournami (Full Moon); Girivalam, Satyanarayana Vratha & all prosperity',
    significanceTa: 'பௌர்ணமி முழு நிலவு; கிரிவலம், சத்யநாராயண பூஜை & சகல சௌபாக்கியம்',
    isFastingDay: true,
  },
  18: {
    deity: 'Sankatahara Ganapathi',
    deityTa: 'சங்கடஹர கணபதி',
    significanceEn: 'Sankatahara Chaturthi; evening moonrise fasting for distress relief',
    significanceTa: 'சங்கடஹர சதுர்த்தி விரதம்; துன்பங்கள் தீர்க்கும் சந்திர தரிசனம்',
    isFastingDay: true,
  },
  20: {
    deity: 'Lord Murugan',
    deityTa: 'முருகப் பெருமான்',
    significanceEn: 'Theipirai Sashti; dedicated prayer for courage and healing',
    significanceTa: 'தேய்பிறை சஷ்டி; மனத்துணிவு மற்றும் நோய் நிவாரணம்',
    isFastingDay: true,
  },
  22: {
    deity: 'Kala Bhairavar',
    deityTa: 'கால பைரவர்',
    significanceEn: 'Theipirai Ashtami; special worship to eliminate fear and debt',
    significanceTa: 'தேய்பிறை அஷ்டமி; கால பைரவர் வழிபாடு, பயம் & கடன் நீக்கம்',
  },
  25: {
    deity: 'Lord Maha Vishnu',
    deityTa: 'மகா விஷ்ணு',
    significanceEn: 'Krishna Ekadhasi Viratham; deep meditative fasting',
    significanceTa: 'கிருஷ்ண ஏகாதசி விரதம்; மன அமைதி மற்றும் மோட்ச பலன்',
    isFastingDay: true,
  },
  27: {
    deity: 'Lord Shiva & Nandeeshwarar',
    deityTa: 'சிவபெருமான் & நந்தீஸ்வரர்',
    significanceEn: 'Theipirai Pradosham (Evening 4:30 - 6:00 PM); ultimate Shiva worship',
    significanceTa: 'தேய்பிறை பிரதோஷம் (மாலை 4:30 - 6:00); மகத்தான சிவபூஜை',
    isFastingDay: true,
  },
  28: {
    deity: 'Lord Shiva (Lingodbhava)',
    deityTa: 'மாத சிவராத்திரி',
    significanceEn: 'Masa Shivaratri; night vigilance and archana for liberation',
    significanceTa: 'மாத சிவராத்திரி; இரவு விழிப்பு மற்றும் லிங்க பூஜை',
    isFastingDay: true,
  },
  29: {
    deity: 'Ancestors (Pitrus) & Lord Surya/Chandra',
    deityTa: 'பித்ருக்கள் & சூரிய சந்திரர்',
    significanceEn: 'Amavasai (New Moon); Pitru Tarpanam and lineage blessing',
    significanceTa: 'அமாவாசை; முன்னோர்கள் பித்ரு தர்ப்பணம் & வம்சவிருத்தி ஆசி',
    isFastingDay: true,
  },
};

export interface LocationThithiOptions {
  lat?: number;
  lng?: number;
  timezoneOffsetMinutes?: number; // e.g. 330 for IST (+5:30)
  cityName?: string;
  cityNameTa?: string;
  timeDisplayMode?: 'local' | 'ist';
  sunriseTime?: string;
  sunsetTime?: string;
  nextSunriseTime?: string;
}

export interface ThithiSpan {
  tithiIndex: number;
  tithiNumber: number; // 1 to 15
  paksha: PakshaType;
  nameTanglish: string;
  nameTa: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  durationHoursText: string;
  startFormatted: string; // e.g. "03 Nov, 02:15 PM"
  endFormatted: string;   // e.g. "04 Nov, 01:20 PM"
  startShortTime: string; // e.g. "02:15 PM"
  endShortTime: string;   // e.g. "01:20 PM"
  startFormattedIst?: string;
  endFormattedIst?: string;
  isSpecialAuspicious: boolean;
  specialSignificance?: string;
  specialSignificanceTa?: string;
  deity?: string;
  deityTa?: string;
}

export interface DayThithiSegment {
  tithi: ThithiSpan;
  segmentStartMs: number;
  segmentEndMs: number;
  startPercent: number; // 0 to 100 relative to 24-hour day
  widthPercent: number; // 0 to 100 width
  startClockText: string; // e.g. "00:00" or "02:15 PM"
  endClockText: string;   // e.g. "02:15 PM" or "24:00"
  durationHoursText: string;
  isMainForDay: boolean;
}

export interface ThithiDayTimeline {
  date: Date;
  selectedDateString: string;
  currentActiveThithi: ThithiSpan;
  previousThithi: ThithiSpan;
  nextThithi: ThithiSpan;
  daySegments: DayThithiSegment[];
  hasTransitionToday: boolean;
  transitionTime?: Date;
  transitionFormatted?: string;
  transitionFormattedIst?: string;
  transitionTextEn?: string;
  transitionTextTa?: string;
  isToday: boolean;
  currentElapsedPercent?: number; // 0 to 100
  currentRemainingTimeText?: string;
  currentElapsedTimeText?: string;
  liveCurrentTimeFormatted?: string;
  dayProgressPercent?: number; // 0 to 100 relative to 24-hour day
  // Location-specific information
  cityName: string;
  cityNameTa?: string;
  lat: number;
  lng: number;
  timezoneOffsetMinutes: number;
  tzLabel: string;
  isOtherThanIst: boolean;
  timeDisplayMode: 'local' | 'ist';
  // Udaya Tithi (Tithi at local sunrise)
  udayaTithi: ThithiSpan;
  udayaSunriseFormatted: string;
  sunrisePercentOnBar: number;
  sunsetPercentOnBar: number;
  sunriseClockText: string;
  sunsetClockText: string;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * High-precision Topocentric astronomical calculation of elongation (Moon - Sun angle)
 * Corrects for observer latitude, longitude, and lunar parallax (Drik Ganitha).
 */
export function calculateTopocentricElongation(
  utcDate: Date,
  lat: number = 13.0827,
  lng: number = 80.2707
): number {
  const jd = utcDate.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0; // days since J2000.0

  // 1. Sun geocentric position (parallax is negligible, < 8.8 arcseconds)
  const L_sun = (280.4665 + 0.98564736 * d) % 360;
  const M_sun = (357.5291 + 0.98560028 * d) % 360;
  const C_sun =
    1.9148 * Math.sin(toRad(M_sun)) + 0.02 * Math.sin(toRad(2 * M_sun));
  const sunTrueLong = (L_sun + C_sun + 360) % 360;

  // Obliquity of ecliptic
  const eps = 23.439291 - 0.000130042 * (d / 365.25);
  const epsRad = toRad(eps);

  // 2. Moon geocentric position
  const L_moon = (218.3165 + 13.17639648 * d) % 360;
  const M_moon = (134.9634 + 13.06499295 * d) % 360;
  const D_moon = (297.8502 + 12.19074912 * d) % 360; // mean elongation
  const F_moon = (93.2721 + 13.22935026 * d) % 360;  // argument of latitude

  // Moon true longitude with leading lunar perturbations
  const moonLongCorr =
    6.2886 * Math.sin(toRad(M_moon)) +
    1.274 * Math.sin(toRad(2 * D_moon - M_moon)) +
    0.6583 * Math.sin(toRad(2 * D_moon)) +
    0.2136 * Math.sin(toRad(2 * M_moon)) -
    0.1851 * Math.sin(toRad(M_sun)) -
    0.1143 * Math.sin(toRad(2 * (L_moon - sunTrueLong)));

  const moonGeoLong = (L_moon + moonLongCorr + 360) % 360;

  // Moon geocentric latitude
  const moonGeoLat =
    5.128 * Math.sin(toRad(F_moon)) +
    0.2806 * Math.sin(toRad(M_moon + F_moon)) +
    0.2777 * Math.sin(toRad(M_moon - F_moon)) +
    0.1732 * Math.sin(toRad(2 * D_moon - F_moon));

  // Moon distance in Earth radii (mean ~60.27)
  const distEarthRadii =
    60.27 -
    3.29 * Math.cos(toRad(M_moon)) -
    0.64 * Math.cos(toRad(2 * D_moon - M_moon)) -
    0.44 * Math.cos(toRad(2 * D_moon));

  const pi0 = Math.asin(1 / distEarthRadii); // horizontal parallax in radians (~57 arcmin)

  // 3. Convert Moon geocentric ecliptic (long, lat) to equatorial (RA, Dec)
  const lRad = toRad(moonGeoLong);
  const bRad = toRad(moonGeoLat);

  const sinDec = Math.sin(bRad) * Math.cos(epsRad) + Math.cos(bRad) * Math.sin(epsRad) * Math.sin(lRad);
  const decRad = Math.asin(sinDec);
  const cosDec = Math.cos(decRad);

  const yRA = Math.cos(bRad) * Math.cos(epsRad) * Math.sin(lRad) - Math.sin(bRad) * Math.sin(epsRad);
  const xRA = Math.cos(bRad) * Math.cos(lRad);
  const raRad = Math.atan2(yRA, xRA);
  const raDeg = (toDeg(raRad) + 360) % 360;

  // 4. Local Sidereal Time (LST) at observer longitude
  const gmst = (280.46061837 + 360.98564736629 * d) % 360;
  const lstDeg = (gmst + lng + 360) % 360;
  const haRad = toRad(lstDeg - raDeg);

  // Observer geocentric latitude & distance factor
  const phiRad = toRad(lat);
  const rhoSinPhi = 0.996647 * Math.sin(phiRad);
  const rhoCosPhi = Math.cos(phiRad);

  // 5. Apply Topocentric Parallax Corrections in Equatorial Coordinates
  const deltaRA = Math.atan2(
    -rhoCosPhi * Math.sin(pi0) * Math.sin(haRad),
    cosDec - rhoCosPhi * Math.sin(pi0) * Math.cos(haRad)
  );
  const topoRA = raRad + deltaRA;

  const topoDec = Math.atan2(
    (Math.sin(decRad) - rhoSinPhi * Math.sin(pi0)) * Math.cos(deltaRA),
    cosDec - rhoCosPhi * Math.sin(pi0) * Math.cos(haRad)
  );

  // 6. Convert Topocentric Equatorial back to Topocentric Ecliptic Longitude
  const sinTopoB = Math.sin(topoDec) * Math.cos(epsRad) - Math.cos(topoDec) * Math.sin(epsRad) * Math.sin(topoRA);
  const cosTopoB = Math.cos(Math.asin(sinTopoB));

  const yTopoLong = Math.cos(topoDec) * Math.cos(epsRad) * Math.sin(topoRA) + Math.sin(topoDec) * Math.sin(epsRad);
  const xTopoLong = Math.cos(topoDec) * Math.cos(topoRA);
  const topoLongRad = Math.atan2(yTopoLong, xTopoLong);
  const moonTopoLong = (toDeg(topoLongRad) + 360) % 360;

  // 7. Topocentric Elongation
  let elongation = (moonTopoLong - sunTrueLong + 360) % 360;
  if (elongation < 0) elongation += 360;
  return elongation;
}

/**
 * Returns signed angular difference in [-180, 180]
 */
function signedAngleDiff(angle: number, target: number): number {
  let diff = (angle - target) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return diff;
}

/**
 * Finds exact topocentric transition timestamp using bisection root-finding
 */
function findExactTransition(
  targetAngle: number,
  startTime: Date,
  endTime: Date,
  lat: number,
  lng: number
): Date {
  let low = startTime.getTime();
  let high = endTime.getTime();

  for (let iter = 0; iter < 24; iter++) {
    const mid = (low + high) / 2;
    const midDate = new Date(mid);
    const elong = calculateTopocentricElongation(midDate, lat, lng);
    const diff = signedAngleDiff(elong, targetAngle);

    if (diff <= 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return new Date((low + high) / 2);
}

/**
 * Formats a Date in the target location's local time (using timezone offset in minutes)
 */
export function formatLocationTime(
  utcDate: Date,
  offsetMinutes: number,
  hour12: boolean = true
): string {
  const locMs = utcDate.getTime() + offsetMinutes * 60000;
  const locDate = new Date(locMs);
  const hours = locDate.getUTCHours();
  const minutes = locDate.getUTCMinutes();

  if (!hour12) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function formatLocationDateTime(
  utcDate: Date,
  offsetMinutes: number,
  language: string = 'en'
): string {
  const locMs = utcDate.getTime() + offsetMinutes * 60000;
  const locDate = new Date(locMs);
  const day = locDate.getUTCDate();
  const monthIdx = locDate.getUTCMonth();
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesTa = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
  const monthStr = language === 'ta' ? monthNamesTa[monthIdx] : monthNamesEn[monthIdx];
  const timeStr = formatLocationTime(utcDate, offsetMinutes, true);
  return `${day} ${monthStr}, ${timeStr}`;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function createThithiSpan(
  tithiIndex: number,
  startTime: Date,
  endTime: Date,
  offsetMinutes: number
): ThithiSpan {
  const normIndex = ((tithiIndex % 30) + 30) % 30;
  const paksha: PakshaType = normIndex < 15 ? 'valarpirai' : 'theipirai';
  const tithiNumber = (normIndex % 15) + 1;
  const nameTanglish = TITHI_NAMES_TANGLISH[normIndex] || 'Prathamai';
  const nameTa = TITHI_NAMES_TA[normIndex] || 'பிரதமை';
  const durationMs = Math.max(0, endTime.getTime() - startTime.getTime());
  const meta = TITHI_SIGNIFICANCE[normIndex];

  return {
    tithiIndex: normIndex,
    tithiNumber,
    paksha,
    nameTanglish,
    nameTa,
    startTime,
    endTime,
    durationMs,
    durationHoursText: formatDuration(durationMs),
    startFormatted: formatLocationDateTime(startTime, offsetMinutes, 'en'),
    endFormatted: formatLocationDateTime(endTime, offsetMinutes, 'en'),
    startShortTime: formatLocationTime(startTime, offsetMinutes, true),
    endShortTime: formatLocationTime(endTime, offsetMinutes, true),
    startFormattedIst: formatLocationDateTime(startTime, 330, 'en'),
    endFormattedIst: formatLocationDateTime(endTime, 330, 'en'),
    isSpecialAuspicious: !!meta,
    specialSignificance: meta?.significanceEn,
    specialSignificanceTa: meta?.significanceTa,
    deity: meta?.deity,
    deityTa: meta?.deityTa,
  };
}

/**
 * Computes location-based Thithi timeline, transitions, and 24-hour visual day segments.
 * Fully location-aware: uses observer coordinates for topocentric elongation,
 * local timezone offsets for clock times, and local sunrise for Udaya Tithi.
 */
export function getThithiDayTimeline(
  inputDate: Date,
  options?: LocationThithiOptions
): ThithiDayTimeline {
  const lat = options?.lat ?? 13.0827; // Default Chennai
  const lng = options?.lng ?? 80.2707;
  const offsetMinutes = options?.timezoneOffsetMinutes ?? 330; // Default IST (+5:30)
  const cityName = options?.cityName || 'Chennai';
  const cityNameTa = options?.cityNameTa;
  const timeDisplayMode = options?.timeDisplayMode || 'local';
  const isOtherThanIst = offsetMinutes !== 330;

  // Format Timezone Label: e.g. "GMT+05:30", "GMT+08:00", "GMT-05:00"
  const tzSign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const tzH = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const tzM = String(absOffset % 60).padStart(2, '0');
  const tzLabel = `GMT${tzSign}${tzH}:${tzM}`;

  // Find Gregorian Year, Month, Day of the selected date in the observer's local timezone
  // Shift inputDate by offsetMinutes to obtain local calendar day
  const locInputMs = inputDate.getTime() + offsetMinutes * 60000;
  const locInputDate = new Date(locInputMs);
  const year = locInputDate.getUTCFullYear();
  const month = locInputDate.getUTCMonth();
  const dateNum = locInputDate.getUTCDate();

  // Local midnight (00:00:00) in UTC milliseconds
  const dayStartMs = Date.UTC(year, month, dateNum, 0, 0, 0, 0) - offsetMinutes * 60000;
  const dayEndMs = Date.UTC(year, month, dateNum, 23, 59, 59, 999) - offsetMinutes * 60000;
  const noonMs = Date.UTC(year, month, dateNum, 12, 0, 0, 0) - offsetMinutes * 60000;
  const totalDayMs = 24 * 60 * 60 * 1000;

  const noonTime = new Date(noonMs);

  // Compute local Sunrise & Sunset times for this location on this day
  const solarTimes = calculateSolarTimes(lat, lng, noonTime, offsetMinutes);
  const sunriseStr = options?.sunriseTime || solarTimes.sunrise || '06:00';
  const sunsetStr = options?.sunsetTime || solarTimes.sunset || '18:00';

  const [srH, srM] = sunriseStr.split(':').map(Number);
  const [ssH, ssM] = sunsetStr.split(':').map(Number);
  const sunriseDayMs = ((srH || 6) * 60 + (srM || 0)) * 60 * 1000;
  const sunsetDayMs = ((ssH || 18) * 60 + (ssM || 0)) * 60 * 1000;

  const sunriseUtcMs = dayStartMs + sunriseDayMs;
  const sunrisePercentOnBar = Math.round((sunriseDayMs / totalDayMs) * 100);
  const sunsetPercentOnBar = Math.round((sunsetDayMs / totalDayMs) * 100);

  // Search window from 36 hours before dayStart to 36 hours after dayEnd
  const searchStart = new Date(dayStartMs - 36 * 60 * 60 * 1000);
  const searchEnd = new Date(dayEndMs + 36 * 60 * 60 * 1000);

  // Sample in 30-minute intervals to find transition boundaries
  const stepMs = 30 * 60 * 1000;
  const transitions: { time: Date; fromIndex: number; toIndex: number }[] = [];

  let prevTime = searchStart;
  let prevElong = calculateTopocentricElongation(prevTime, lat, lng);
  let prevIndex = Math.floor(prevElong / 12) % 30;

  for (let t = searchStart.getTime() + stepMs; t <= searchEnd.getTime(); t += stepMs) {
    const curTime = new Date(t);
    const curElong = calculateTopocentricElongation(curTime, lat, lng);
    const curIndex = Math.floor(curElong / 12) % 30;

    if (curIndex !== prevIndex) {
      const targetAngle = (curIndex * 12) % 360;
      const exactTime = findExactTransition(targetAngle, prevTime, curTime, lat, lng);
      transitions.push({
        time: exactTime,
        fromIndex: prevIndex,
        toIndex: curIndex,
      });
      prevIndex = curIndex;
      prevTime = exactTime;
      prevElong = curElong;
    } else {
      prevTime = curTime;
      prevElong = curElong;
    }
  }

  // Anchor around local noon (12:00 PM) of the location
  const noonElong = calculateTopocentricElongation(noonTime, lat, lng);
  const noonIndex = Math.floor(noonElong / 12) % 30;

  // Find start and end transition for noonIndex
  let activeStart = new Date(dayStartMs - 12 * 60 * 60 * 1000);
  for (let i = 0; i < transitions.length; i++) {
    if (
      transitions[i].toIndex === noonIndex &&
      transitions[i].time.getTime() <= noonTime.getTime()
    ) {
      activeStart = transitions[i].time;
    }
  }

  let activeEnd = new Date(dayEndMs + 12 * 60 * 60 * 1000);
  for (let i = 0; i < transitions.length; i++) {
    if (
      transitions[i].fromIndex === noonIndex &&
      transitions[i].time.getTime() > noonTime.getTime()
    ) {
      activeEnd = transitions[i].time;
      break;
    }
  }

  const currentActiveThithi = createThithiSpan(noonIndex, activeStart, activeEnd, offsetMinutes);

  // Previous Thithi
  const prevIndexVal = (noonIndex - 1 + 30) % 30;
  let prevStart = new Date(activeStart.getTime() - 23.5 * 60 * 60 * 1000);
  for (let i = 0; i < transitions.length; i++) {
    if (
      transitions[i].toIndex === prevIndexVal &&
      transitions[i].time.getTime() < activeStart.getTime()
    ) {
      prevStart = transitions[i].time;
    }
  }
  const previousThithi = createThithiSpan(prevIndexVal, prevStart, activeStart, offsetMinutes);

  // Next Thithi
  const nextIndexVal = (noonIndex + 1) % 30;
  let nextEnd = new Date(activeEnd.getTime() + 23.5 * 60 * 60 * 1000);
  for (let i = 0; i < transitions.length; i++) {
    if (
      transitions[i].fromIndex === nextIndexVal &&
      transitions[i].time.getTime() > activeEnd.getTime()
    ) {
      nextEnd = transitions[i].time;
      break;
    }
  }
  const nextThithi = createThithiSpan(nextIndexVal, activeEnd, nextEnd, offsetMinutes);

  // Calculate UDAYA TITHI (Tithi prevailing at local Sunrise at this specific location)
  const sunriseDate = new Date(sunriseUtcMs);
  const sunriseElong = calculateTopocentricElongation(sunriseDate, lat, lng);
  const udayaIndex = Math.floor(sunriseElong / 12) % 30;

  let udayaSpan: ThithiSpan;
  if (udayaIndex === noonIndex) {
    udayaSpan = currentActiveThithi;
  } else if (udayaIndex === prevIndexVal) {
    udayaSpan = previousThithi;
  } else {
    // Determine bounds for udayaIndex
    let uStart = new Date(sunriseUtcMs - 12 * 3600000);
    let uEnd = new Date(sunriseUtcMs + 12 * 3600000);
    for (let i = 0; i < transitions.length; i++) {
      if (transitions[i].toIndex === udayaIndex && transitions[i].time.getTime() <= sunriseUtcMs) {
        uStart = transitions[i].time;
      }
      if (transitions[i].fromIndex === udayaIndex && transitions[i].time.getTime() > sunriseUtcMs) {
        uEnd = transitions[i].time;
      }
    }
    udayaSpan = createThithiSpan(udayaIndex, uStart, uEnd, offsetMinutes);
  }

  // Transitions within the location's 24 hours (dayStartMs to dayEndMs)
  const todayTransitions = transitions.filter(
    (tr) => tr.time.getTime() >= dayStartMs && tr.time.getTime() <= dayEndMs
  );

  const daySegments: DayThithiSegment[] = [];

  if (todayTransitions.length === 0) {
    daySegments.push({
      tithi: currentActiveThithi,
      segmentStartMs: dayStartMs,
      segmentEndMs: dayEndMs,
      startPercent: 0,
      widthPercent: 100,
      startClockText: '00:00',
      endClockText: '24:00',
      durationHoursText: '24h',
      isMainForDay: true,
    });
  } else {
    let currentSegmentStart = dayStartMs;

    for (let idx = 0; idx < todayTransitions.length; idx++) {
      const tr = todayTransitions[idx];
      const trTimeMs = tr.time.getTime();

      const segmentTithi =
        tr.fromIndex === noonIndex
          ? currentActiveThithi
          : tr.fromIndex === prevIndexVal
          ? previousThithi
          : createThithiSpan(
              tr.fromIndex,
              new Date(trTimeMs - 23.5 * 3600000),
              tr.time,
              offsetMinutes
            );

      const widthPct = Math.max(1, ((trTimeMs - currentSegmentStart) / totalDayMs) * 100);
      const startPct = ((currentSegmentStart - dayStartMs) / totalDayMs) * 100;

      daySegments.push({
        tithi: segmentTithi,
        segmentStartMs: currentSegmentStart,
        segmentEndMs: trTimeMs,
        startPercent: Math.round(startPct * 10) / 10,
        widthPercent: Math.round(widthPct * 10) / 10,
        startClockText:
          currentSegmentStart === dayStartMs
            ? '00:00'
            : formatLocationTime(new Date(currentSegmentStart), offsetMinutes, true),
        endClockText: formatLocationTime(tr.time, offsetMinutes, true),
        durationHoursText: formatDuration(trTimeMs - currentSegmentStart),
        isMainForDay: tr.fromIndex === noonIndex,
      });

      currentSegmentStart = trTimeMs;
    }

    const lastTr = todayTransitions[todayTransitions.length - 1];
    const finalSegmentTithi =
      lastTr.toIndex === noonIndex
        ? currentActiveThithi
        : lastTr.toIndex === nextIndexVal
        ? nextThithi
        : createThithiSpan(
            lastTr.toIndex,
            lastTr.time,
            new Date(lastTr.time.getTime() + 23.5 * 3600000),
            offsetMinutes
          );

    const finalWidthPct = Math.max(1, ((dayEndMs - currentSegmentStart) / totalDayMs) * 100);
    const finalStartPct = ((currentSegmentStart - dayStartMs) / totalDayMs) * 100;

    daySegments.push({
      tithi: finalSegmentTithi,
      segmentStartMs: currentSegmentStart,
      segmentEndMs: dayEndMs,
      startPercent: Math.round(finalStartPct * 10) / 10,
      widthPercent: Math.round(finalWidthPct * 10) / 10,
      startClockText: formatLocationTime(new Date(currentSegmentStart), offsetMinutes, true),
      endClockText: '24:00',
      durationHoursText: formatDuration(dayEndMs - currentSegmentStart),
      isMainForDay: lastTr.toIndex === noonIndex,
    });
  }

  // Live progress details in this location's time
  const now = new Date();
  const locNowMs = now.getTime() + offsetMinutes * 60000;
  const locNowDate = new Date(locNowMs);

  const isToday =
    year === locNowDate.getUTCFullYear() &&
    month === locNowDate.getUTCMonth() &&
    dateNum === locNowDate.getUTCDate();

  let currentElapsedPercent: number | undefined;
  let currentRemainingTimeText: string | undefined;
  let currentElapsedTimeText: string | undefined;
  let liveCurrentTimeFormatted: string | undefined;
  let dayProgressPercent: number | undefined;

  if (isToday) {
    liveCurrentTimeFormatted = formatLocationTime(now, offsetMinutes, true);
    const nowMs = now.getTime();
    const activeStartMs = currentActiveThithi.startTime.getTime();
    const activeEndMs = currentActiveThithi.endTime.getTime();
    const elapsed = Math.max(0, nowMs - activeStartMs);
    const remaining = Math.max(0, activeEndMs - nowMs);

    currentElapsedTimeText = formatDuration(elapsed);
    currentRemainingTimeText = formatDuration(remaining);

    if (currentActiveThithi.durationMs > 0) {
      currentElapsedPercent = Math.min(
        100,
        Math.max(0, Math.round((elapsed / currentActiveThithi.durationMs) * 100))
      );
    }

    const dayElapsed = Math.max(0, Math.min(totalDayMs, nowMs - dayStartMs));
    dayProgressPercent = Math.min(
      100,
      Math.max(0, Math.round((dayElapsed / totalDayMs) * 100))
    );
  }

  const hasTransitionToday = todayTransitions.length > 0;
  const primaryTransition = todayTransitions[0];

  let transitionFormatted: string | undefined;
  let transitionFormattedIst: string | undefined;
  let transitionTextEn: string | undefined;
  let transitionTextTa: string | undefined;

  if (primaryTransition) {
    transitionFormatted = formatLocationTime(primaryTransition.time, offsetMinutes, true);
    transitionFormattedIst = formatLocationTime(primaryTransition.time, 330, true);

    const fromTanglish = TITHI_NAMES_TANGLISH[primaryTransition.fromIndex];
    const toTanglish = TITHI_NAMES_TANGLISH[primaryTransition.toIndex];
    const fromTa = TITHI_NAMES_TA[primaryTransition.fromIndex];
    const toTa = TITHI_NAMES_TA[primaryTransition.toIndex];

    const timeWithIstNote = isOtherThanIst
      ? `${transitionFormatted} (${transitionFormattedIst} IST)`
      : transitionFormatted;

    transitionTextEn = `${fromTanglish} ends at ${timeWithIstNote}, then ${toTanglish} begins`;
    transitionTextTa = `${fromTa} (${fromTanglish}) ${timeWithIstNote} வரை; பிறகு ${toTa} (${toTanglish})`;
  }

  const selectedDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;

  const sunriseClockText = formatLocationTime(new Date(sunriseUtcMs), offsetMinutes, true);
  const sunsetUtcMs = dayStartMs + sunsetDayMs;
  const sunsetClockText = formatLocationTime(new Date(sunsetUtcMs), offsetMinutes, true);

  const udayaSunriseFormatted = `${udayaSpan.nameTanglish} (${udayaSpan.nameTa}) at ${sunriseClockText}`;

  return {
    date: new Date(dayStartMs),
    selectedDateString,
    currentActiveThithi,
    previousThithi,
    nextThithi,
    daySegments,
    hasTransitionToday,
    transitionTime: primaryTransition?.time,
    transitionFormatted,
    transitionFormattedIst,
    transitionTextEn,
    transitionTextTa,
    isToday,
    currentElapsedPercent,
    currentRemainingTimeText,
    currentElapsedTimeText,
    liveCurrentTimeFormatted,
    dayProgressPercent,
    cityName,
    cityNameTa,
    lat,
    lng,
    timezoneOffsetMinutes: offsetMinutes,
    tzLabel,
    isOtherThanIst,
    timeDisplayMode,
    udayaTithi: udayaSpan,
    udayaSunriseFormatted,
    sunrisePercentOnBar,
    sunsetPercentOnBar,
    sunriseClockText,
    sunsetClockText,
  };
}
