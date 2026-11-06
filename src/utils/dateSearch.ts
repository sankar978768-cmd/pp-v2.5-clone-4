import { PakshaType, DayOfWeek } from '../types';
import { getLunarDayInfo } from './lunarCalendar';
import { getTamilDateInfo, getTamilMonthStartDate, TAMIL_MONTHS } from './tamilCalendar';

export interface DateSearchResult {
  id: string;
  titleEn: string;
  titleTa: string;
  subtitleEn: string;
  subtitleTa: string;
  date: Date;
  dateString: string; // YYYY-MM-DD
  paksha: PakshaType;
  dayOfWeek: DayOfWeek;
  tithiNameTanglish: string;
  tithiNameTa: string;
  tamilMonthNameTa: string;
  tamilMonthNameEn: string;
  tamilDate: number;
  isThaniyaNaal: boolean;
  category: 'historical' | 'festival' | 'tamil' | 'lunar' | 'custom' | 'relative';
  badgeText?: string;
}

const MONTH_NAMES_EN = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_SHORT_EN = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

// Well-known festivals and historical dates with known Gregorian mapping
interface FamousDatePreset {
  keywords: string[];
  titleEn: string;
  titleTa: string;
  category: 'historical' | 'festival';
  // If static year (historical event)
  staticYear?: number;
  staticMonth?: number; // 0-11
  staticDay?: number;
  // Year-specific dates for lunar festivals (2020-2030)
  multiYearDates?: Record<number, { m: number; d: number }>;
  // Annual fixed solar date (month 0-11, day 1-31)
  fixedSolarDate?: { m: number; d: number };
}

const FAMOUS_PRESETS: FamousDatePreset[] = [
  {
    keywords: ['independence day', 'august 15 1947', '15 aug 1947', 'indian independence', '1947', 'சுதந்திர தினம்'],
    titleEn: 'Indian Independence Day (15 Aug 1947)',
    titleTa: 'இந்திய சுதந்திர தினம் (15 ஆகஸ்ட் 1947)',
    category: 'historical',
    staticYear: 1947,
    staticMonth: 7, // August
    staticDay: 15,
  },
  {
    keywords: ['republic day', '26 jan 1950', 'republic day 1950', '1950', 'குடியரசு தினம்'],
    titleEn: 'Indian Republic Day (26 Jan 1950)',
    titleTa: 'இந்திய குடியரசு தினம் (26 ஜனவரி 1950)',
    category: 'historical',
    staticYear: 1950,
    staticMonth: 0, // January
    staticDay: 26,
  },
  {
    keywords: ['gandhi jayanti', 'mahatma gandhi', '2 oct 1869', 'காந்தி ஜெயந்தி'],
    titleEn: 'Mahatma Gandhi Birth (2 Oct 1869)',
    titleTa: 'மகாத்மா காந்தி ஜெயந்தி (2 அக்டோபர் 1869)',
    category: 'historical',
    staticYear: 1869,
    staticMonth: 9, // October
    staticDay: 2,
  },
  {
    keywords: ['tamil new year', 'puthandu', 'chithirai 1', 'chithirai vishu', 'தமிழ்ப் புத்தாண்டு', 'சித்திரை 1'],
    titleEn: 'Tamil New Year / Chithirai 1',
    titleTa: 'தமிழ்ப் புத்தாண்டு (சித்திரை 1)',
    category: 'festival',
    fixedSolarDate: { m: 3, d: 14 }, // April 14
  },
  {
    keywords: ['pongal', 'thai pongal', 'makar sankranti', 'பொங்கல்', 'தைப்பொங்கல்'],
    titleEn: 'Thai Pongal / Makar Sankranti',
    titleTa: 'தைப்பொங்கல் (மகர சங்கராந்தி)',
    category: 'festival',
    fixedSolarDate: { m: 0, d: 15 }, // Jan 15
  },
  {
    keywords: ['mattu pongal', 'மாட்டுப் பொங்கல்'],
    titleEn: 'Mattu Pongal',
    titleTa: 'மாட்டுப் பொங்கல்',
    category: 'festival',
    fixedSolarDate: { m: 0, d: 16 }, // Jan 16
  },
  {
    keywords: ['kaanum pongal', 'காணும் பொங்கல்'],
    titleEn: 'Kaanum Pongal',
    titleTa: 'காணும் பொங்கல்',
    category: 'festival',
    fixedSolarDate: { m: 0, d: 17 }, // Jan 17
  },
  {
    keywords: ['aadi 18', 'aadi perukku', 'ஆடிப்பெருக்கு', 'ஆடி 18'],
    titleEn: 'Aadi Perukku (Aadi 18)',
    titleTa: 'ஆடிப்பெருக்கு (ஆடி 18)',
    category: 'festival',
    fixedSolarDate: { m: 7, d: 3 }, // Aug 3
  },
  {
    keywords: ['deepavali', 'diwali', 'தீபாவளி'],
    titleEn: 'Deepavali / Diwali',
    titleTa: 'தீபாவளி பண்டிகை',
    category: 'festival',
    multiYearDates: {
      2023: { m: 10, d: 12 },
      2024: { m: 9, d: 31 },
      2025: { m: 9, d: 20 },
      2026: { m: 10, d: 8 },
      2027: { m: 9, d: 29 },
      2028: { m: 9, d: 17 },
      2029: { m: 10, d: 5 },
      2030: { m: 9, d: 26 },
    },
    fixedSolarDate: { m: 10, d: 4 },
  },
  {
    keywords: ['karthigai deepam', 'thiruvannamalai deepam', 'கார்த்திகை தீபம்'],
    titleEn: 'Karthigai Deepam',
    titleTa: 'கார்த்திகை தீபம்',
    category: 'festival',
    multiYearDates: {
      2024: { m: 11, d: 13 },
      2025: { m: 11, d: 3 },
      2026: { m: 10, d: 22 },
      2027: { m: 11, d: 12 },
    },
    fixedSolarDate: { m: 11, d: 5 },
  },
  {
    keywords: ['mahashivaratri', 'shivaratri', 'சிவராத்திரி', 'மகா சிவராத்திரி'],
    titleEn: 'Maha Shivaratri',
    titleTa: 'மகா சிவராத்திரி',
    category: 'festival',
    multiYearDates: {
      2024: { m: 2, d: 8 },
      2025: { m: 1, d: 26 },
      2026: { m: 1, d: 15 },
      2027: { m: 2, d: 6 },
    },
    fixedSolarDate: { m: 1, d: 20 },
  },
  {
    keywords: ['vinayagar chaturthi', 'ganesh chaturthi', 'விநாயகர் சதுர்த்தி'],
    titleEn: 'Vinayagar Chaturthi',
    titleTa: 'விநாயகர் சதுர்த்தி',
    category: 'festival',
    multiYearDates: {
      2024: { m: 8, d: 7 },
      2025: { m: 7, d: 27 },
      2026: { m: 8, d: 14 },
      2027: { m: 8, d: 4 },
    },
    fixedSolarDate: { m: 8, d: 10 },
  },
  {
    keywords: ['krishna jayanthi', 'gokulashtami', 'janmashtami', 'கிருஷ்ண ஜெயந்தி'],
    titleEn: 'Krishna Jayanthi / Gokulashtami',
    titleTa: 'கிருஷ்ண ஜெயந்தி',
    category: 'festival',
    multiYearDates: {
      2024: { m: 7, d: 26 },
      2025: { m: 7, d: 16 },
      2026: { m: 8, d: 3 },
      2027: { m: 7, d: 24 },
    },
    fixedSolarDate: { m: 7, d: 20 },
  },
  {
    keywords: ['new year 2000', 'millennium', 'y2k', '2000'],
    titleEn: 'Millennium Day (1 Jan 2000)',
    titleTa: 'மில்லினியம் நாள் (1 ஜனவரி 2000)',
    category: 'historical',
    staticYear: 2000,
    staticMonth: 0,
    staticDay: 1,
  },
  {
    keywords: ['english new year', 'new year', 'புத்தாண்டு'],
    titleEn: 'English New Year',
    titleTa: 'ஆங்கில புத்தாண்டு',
    category: 'festival',
    fixedSolarDate: { m: 0, d: 1 },
  },
  {
    keywords: ['christmas', 'கிறிஸ்துமஸ்'],
    titleEn: 'Christmas',
    titleTa: 'கிறிஸ்துமஸ்',
    category: 'festival',
    fixedSolarDate: { m: 11, d: 25 },
  },
];

/**
 * Builds a complete DateSearchResult from a given Date object.
 */
export function buildDateSearchResult(
  date: Date,
  category: DateSearchResult['category'] = 'custom',
  customTitleEn?: string,
  customTitleTa?: string,
  badgeText?: string,
  lat = 13.0827,
  lng = 80.2707,
  tzOffset = 330
): DateSearchResult {
  const lunar = getLunarDayInfo(date, lat, lng, tzOffset);
  const tamil = getTamilDateInfo(date);

  const formattedDateEn = date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedDateTa = `${date.getDate()} ${tamil.tamilMonthNameTa} ${date.getFullYear()}`;

  const defaultTitleEn = customTitleEn || formattedDateEn;
  const defaultTitleTa = customTitleTa || `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} (${tamil.tamilMonthNameTa} ${tamil.tamilDate})`;

  const subtitleEn = `${tamil.tamilMonthNameEn} ${tamil.tamilDate} · ${lunar.paksha === 'valarpirai' ? 'Waxing (Sukla)' : 'Waning (Krishna)'} ${lunar.dayOfWeek.toUpperCase()} · ${lunar.tithiNameTanglish} ${lunar.moonEmoji}`;
  const subtitleTa = `${tamil.tamilMonthNameTa} ${tamil.tamilDate} · ${lunar.paksha === 'valarpirai' ? 'வளர்பிறை' : 'தேய்பிறை'} · ${lunar.tithiNameTa} ${lunar.moonEmoji}`;

  return {
    id: `date-res-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    titleEn: defaultTitleEn,
    titleTa: defaultTitleTa,
    subtitleEn,
    subtitleTa,
    date,
    dateString: lunar.dateString,
    paksha: lunar.paksha,
    dayOfWeek: lunar.dayOfWeek,
    tithiNameTanglish: lunar.tithiNameTanglish,
    tithiNameTa: lunar.tithiNameTa,
    tamilMonthNameTa: tamil.tamilMonthNameTa,
    tamilMonthNameEn: tamil.tamilMonthNameEn,
    tamilDate: tamil.tamilDate,
    isThaniyaNaal: tamil.isThaniyaNaal,
    category,
    badgeText,
  };
}

/**
 * Parses user search query for dates (text dates, historical events, Tamil months, relative words).
 */
export function searchDates(
  query: string,
  currentDate: Date = new Date(),
  lat = 13.0827,
  lng = 80.2707,
  tzOffset = 330
): DateSearchResult[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const results: DateSearchResult[] = [];
  const seenDates = new Set<string>();

  const addResult = (res: DateSearchResult) => {
    const key = `${res.date.getFullYear()}-${res.date.getMonth()}-${res.date.getDate()}`;
    if (!seenDates.has(key)) {
      seenDates.add(key);
      results.push(res);
    }
  };

  const currentYear = currentDate.getFullYear();

  // 1. Relative keyword matching
  if (cleanQ === 'today' || cleanQ === 'இன்று') {
    addResult(buildDateSearchResult(currentDate, 'relative', 'Today', 'இன்று', 'Current Day', lat, lng, tzOffset));
  } else if (cleanQ === 'tomorrow' || cleanQ === 'நாளை') {
    const tom = new Date(currentDate);
    tom.setDate(tom.getDate() + 1);
    addResult(buildDateSearchResult(tom, 'relative', 'Tomorrow', 'நாளை', '+1 Day', lat, lng, tzOffset));
  } else if (cleanQ === 'yesterday' || cleanQ === 'நேற்று') {
    const yest = new Date(currentDate);
    yest.setDate(yest.getDate() - 1);
    addResult(buildDateSearchResult(yest, 'relative', 'Yesterday', 'நேற்று', '-1 Day', lat, lng, tzOffset));
  }

  // 2. Famous Preset / Historical Matching
  for (const preset of FAMOUS_PRESETS) {
    const matchesKeyword = preset.keywords.some((kw) => cleanQ.includes(kw) || kw.includes(cleanQ));
    if (matchesKeyword) {
      let targetDate: Date | null = null;

      if (preset.staticYear !== undefined && preset.staticMonth !== undefined && preset.staticDay !== undefined) {
        targetDate = new Date(preset.staticYear, preset.staticMonth, preset.staticDay, 12, 0, 0);
      } else if (preset.multiYearDates && preset.multiYearDates[currentYear]) {
        const { m, d } = preset.multiYearDates[currentYear];
        targetDate = new Date(currentYear, m, d, 12, 0, 0);
      } else if (preset.fixedSolarDate) {
        targetDate = new Date(currentYear, preset.fixedSolarDate.m, preset.fixedSolarDate.d, 12, 0, 0);
      }

      if (targetDate) {
        addResult(
          buildDateSearchResult(
            targetDate,
            preset.category,
            preset.titleEn,
            preset.titleTa,
            preset.category === 'historical' ? 'Historical' : 'Festival',
            lat,
            lng,
            tzOffset
          )
        );
      }
    }
  }

  // 3. Tamil Month & Date matching (e.g., "Chithirai 1", "Aadi 18", "சித்திரை 1", "மார்கழி 1")
  for (const tMonth of TAMIL_MONTHS) {
    const nameTa = tMonth.nameTa.toLowerCase();
    const nameEn = tMonth.nameEn.toLowerCase();

    if (cleanQ.includes(nameTa) || cleanQ.includes(nameEn)) {
      // Look for a number in the query (day 1-32)
      const dayMatch = cleanQ.match(/\b([1-9]|[12][0-9]|3[0-2])\b/);
      const tamilDay = dayMatch ? parseInt(dayMatch[1], 10) : 1;

      // Check if user also specified a year (e.g. "Chithirai 1 2027" or "Aadi 18 1947")
      const yearMatch = cleanQ.match(/\b(18\d\d|19\d\d|20\d\d|21\d\d)\b/);
      const targetYear = yearMatch ? parseInt(yearMatch[1], 10) : currentYear;

      try {
        const monthStart = getTamilMonthStartDate(targetYear, tMonth.index);
        const resolvedDate = new Date(monthStart);
        resolvedDate.setDate(resolvedDate.getDate() + (tamilDay - 1));

        addResult(
          buildDateSearchResult(
            resolvedDate,
            'tamil',
            `${tMonth.nameEn} ${tamilDay} (${targetYear})`,
            `${tMonth.nameTa} ${tamilDay} (${targetYear})`,
            'Tamil Calendar',
            lat,
            lng,
            tzOffset
          )
        );
      } catch (err) {
        // Fallback gracefully
      }
    }
  }

  // 4. Exact standard date formats:
  // e.g. YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY
  const isoMatch = cleanQ.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const dateObj = new Date(y, m, d, 12, 0, 0);
    if (!isNaN(dateObj.getTime())) {
      addResult(buildDateSearchResult(dateObj, 'custom', undefined, undefined, 'Exact Date', lat, lng, tzOffset));
    }
  }

  const dmyMatch = cleanQ.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    const dateObj = new Date(y, m, d, 12, 0, 0);
    if (!isNaN(dateObj.getTime())) {
      addResult(buildDateSearchResult(dateObj, 'custom', undefined, undefined, 'Exact Date', lat, lng, tzOffset));
    }
  }

  // 5. English Month + Day + Year parsing (e.g. "15 Aug 1947", "August 15 1947", "15 August", "Oct 2 1869")
  let matchedMonthIdx = -1;
  MONTH_NAMES_EN.forEach((mName, idx) => {
    if (cleanQ.includes(mName)) matchedMonthIdx = idx;
  });
  if (matchedMonthIdx === -1) {
    MONTH_SHORT_EN.forEach((mShort, idx) => {
      const reg = new RegExp(`\\b${mShort}\\b`, 'i');
      if (reg.test(cleanQ)) matchedMonthIdx = idx;
    });
  }

  if (matchedMonthIdx !== -1) {
    // Extract day
    const dayMatch = cleanQ.match(/\b([1-9]|[12][0-9]|3[01])\b/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;

    // Extract year (4 digits)
    const yearMatch = cleanQ.match(/\b(18\d\d|19\d\d|20\d\d|21\d\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : currentYear;

    const parsedDate = new Date(year, matchedMonthIdx, day, 12, 0, 0);
    if (!isNaN(parsedDate.getTime())) {
      addResult(
        buildDateSearchResult(
          parsedDate,
          'custom',
          `${day} ${MONTH_NAMES_EN[matchedMonthIdx].charAt(0).toUpperCase() + MONTH_NAMES_EN[matchedMonthIdx].slice(1)} ${year}`,
          `${day} ${MONTH_NAMES_EN[matchedMonthIdx]} ${year}`,
          'Date Match',
          lat,
          lng,
          tzOffset
        )
      );
    }
  }

  // 6. Year only search (e.g., "1947", "2030", "1999", "1857")
  const yearOnlyMatch = cleanQ.match(/^\b(18\d\d|19\d\d|20\d\d|21\d\d)\b$/);
  if (yearOnlyMatch) {
    const y = parseInt(yearOnlyMatch[1], 10);
    // Show Jan 1 of that year
    const jan1 = new Date(y, 0, 1, 12, 0, 0);
    addResult(buildDateSearchResult(jan1, 'historical', `1 January ${y}`, `1 ஜனவரி ${y}`, `Year ${y}`, lat, lng, tzOffset));

    // If 1947, also provide 15 Aug 1947
    if (y === 1947) {
      const ind = new Date(1947, 7, 15, 12, 0, 0);
      addResult(buildDateSearchResult(ind, 'historical', '15 August 1947 (Independence)', '15 ஆகஸ்ட் 1947 (சுதந்திரம்)', '1947', lat, lng, tzOffset));
    } else if (y === 1950) {
      const rep = new Date(1950, 0, 26, 12, 0, 0);
      addResult(buildDateSearchResult(rep, 'historical', '26 January 1950 (Republic Day)', '26 ஜனவரி 1950 (குடியரசு நாள்)', '1950', lat, lng, tzOffset));
    }
  }

  // 7. General JS Date parsing fallback (e.g., "Nov 5 2026", "2035/05/12")
  if (results.length === 0) {
    const fallbackParsed = new Date(cleanQ);
    if (!isNaN(fallbackParsed.getTime()) && fallbackParsed.getFullYear() > 1800 && fallbackParsed.getFullYear() < 2200) {
      addResult(buildDateSearchResult(fallbackParsed, 'custom', undefined, undefined, 'Parsed Date', lat, lng, tzOffset));
    }
  }

  return results.slice(0, 6);
}

/**
 * Returns popular quick suggestion pills for the user to click.
 */
export function getQuickDateSuggestions(
  currentDate: Date = new Date(),
  lat = 13.0827,
  lng = 80.2707,
  tzOffset = 330
): DateSearchResult[] {
  const list: DateSearchResult[] = [];

  // Tomorrow
  const tom = new Date(currentDate);
  tom.setDate(tom.getDate() + 1);
  list.push(buildDateSearchResult(tom, 'relative', 'Tomorrow', 'நாளை', '+1 Day', lat, lng, tzOffset));

  // Independence Day 1947
  const ind = new Date(1947, 7, 15, 12, 0, 0);
  list.push(buildDateSearchResult(ind, 'historical', '15 Aug 1947 (Independence)', '15 ஆகஸ்ட் 1947', '🇮🇳 1947', lat, lng, tzOffset));

  // Republic Day 1950
  const rep = new Date(1950, 0, 26, 12, 0, 0);
  list.push(buildDateSearchResult(rep, 'historical', '26 Jan 1950 (Republic Day)', '26 ஜனவரி 1950', '🇮🇳 1950', lat, lng, tzOffset));

  // Tamil New Year
  const tNewYear = new Date(currentDate.getFullYear(), 3, 14, 12, 0, 0);
  list.push(buildDateSearchResult(tNewYear, 'festival', 'Tamil New Year (Chithirai 1)', 'சித்திரை 1', 'தமிழ்ப் புத்தாண்டு', lat, lng, tzOffset));

  // Thai Pongal
  const pongal = new Date(currentDate.getFullYear(), 0, 15, 12, 0, 0);
  list.push(buildDateSearchResult(pongal, 'festival', 'Thai Pongal (Jan 15)', 'தைப்பொங்கல்', 'பொங்கல்', lat, lng, tzOffset));

  // Future Milestone: 2030
  const future2030 = new Date(2030, 0, 1, 12, 0, 0);
  list.push(buildDateSearchResult(future2030, 'historical', '1 Jan 2030 (Future Year)', '1 ஜனவரி 2030', '2030', lat, lng, tzOffset));

  return list;
}
