import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BirdId, ActivityType, RelationshipType, PakshaType, DayOfWeek } from '../types';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  getBirdName: (birdId: BirdId) => string;
  getActivityName: (act: ActivityType) => string;
  getActivityAction: (act: ActivityType) => string;
  getPakshaName: (paksha: PakshaType) => string;
  getDayName: (day: DayOfWeek) => string;
  getDayShortName: (day: DayOfWeek) => string;
  getRelationshipName: (rel: RelationshipType) => string;
  getElementName: (birdId: BirdId) => string;
  getPlanetName: (birdId: BirdId) => string;
  getDirectionName: (birdId: BirdId) => string;
  getActivityStatus: (act: ActivityType) => string;
  getActivityDescription: (act: ActivityType) => string;
  getActivityRecommendation: (act: ActivityType) => string;
  getBirdDescription: (birdId: BirdId) => string;
}

const BIRD_NAMES: Record<Language, Record<BirdId, string>> = {
  en: {
    vulture: 'Vulture',
    owl: 'Owl',
    crow: 'Crow',
    cock: 'Cock',
    peacock: 'Peacock',
  },
  ta: {
    vulture: 'கழுகு',
    owl: 'ஆந்தை',
    crow: 'காகம்',
    cock: 'சேவல்',
    peacock: 'மயில்',
  },
};

const BIRD_DESCRIPTIONS: Record<Language, Record<BirdId, string>> = {
  en: {
    vulture: 'Represents high vision, endurance, and decisive authority during sunrise to sunset.',
    owl: 'Highly potent in nocturnal cycles. Represents deep intuition and nocturnal wisdom.',
    crow: 'Represents vigilance, endurance, survival intelligence, and nocturnal supremacy.',
    cock: 'The roaring herald of dawn. Represents courage, awakening, sharp instinct, and rapid movement.',
    peacock: 'The royal bird of beauty and poise. Represents royalty, grace, high vibration, and expansion.',
  },
  ta: {
    vulture: 'பகலில் அதிக ஆற்றல், கூர்மையான பார்வை, ஆளுமை மற்றும் தலைமைத்துவத்தைக் குறிக்கும் பட்சி.',
    owl: 'இரவில் அதிக ஆற்றல், ஆழ்ந்த உள்ளுணர்வு மற்றும் அமைதியான ஞானத்தைக் குறிக்கும் பட்சி.',
    crow: 'இரவு அரச பட்சி. விழிப்புணர்வு, விடாமுயற்சி மற்றும் நுண்ணறிவைக் குறிக்கும் பட்சி.',
    cock: 'விடியலின் தூதுவன். வீரம், சுறுசுறுப்பு, துணிவு மற்றும் உடனடி செயல்பாட்டைக் குறிக்கும் பட்சி.',
    peacock: 'அழகு, கம்பீரம், கௌரவம், தெய்வீக ஆற்றல் மற்றும் வெற்றியைத் தரும் ராஜ பட்சி.',
  },
};

const ACTIVITY_NAMES: Record<Language, Record<ActivityType, string>> = {
  en: {
    Rule: 'Rule',
    Eat: 'Eat',
    Walk: 'Walk',
    Sleep: 'Sleep',
    Die: 'Die',
  },
  ta: {
    Rule: 'அரசு',
    Eat: 'ஊண்',
    Walk: 'நடை',
    Sleep: 'துயில்',
    Die: 'சாதல்',
  },
};

const ACTIVITY_ACTIONS: Record<Language, Record<ActivityType, string>> = {
  en: {
    Rule: 'Ruling',
    Eat: 'Eating',
    Walk: 'Walking',
    Sleep: 'Sleeping',
    Die: 'Dying',
  },
  ta: {
    Rule: 'அரசு',
    Eat: 'ஊண்',
    Walk: 'நடை',
    Sleep: 'துயில்',
    Die: 'சாதல்',
  },
};

const PAKSHA_NAMES: Record<Language, Record<PakshaType, string>> = {
  en: {
    valarpirai: 'Valarpirai',
    theipirai: 'Theipirai',
  },
  ta: {
    valarpirai: 'வளர்பிறை',
    theipirai: 'தேய்பிறை',
  },
};

const DAY_NAMES: Record<Language, Record<DayOfWeek, string>> = {
  en: {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  },
  ta: {
    sunday: 'ஞாயிறு',
    monday: 'திங்கள்',
    tuesday: 'செவ்வாய்',
    wednesday: 'புதன்',
    thursday: 'வியாழன்',
    friday: 'வெள்ளி',
    saturday: 'சனி',
  },
};

const DAY_SHORT_NAMES: Record<Language, Record<DayOfWeek, string>> = {
  en: {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
  },
  ta: {
    sunday: 'ஞாயிறு',
    monday: 'திங்கள்',
    tuesday: 'செவ்வாய்',
    wednesday: 'புதன்',
    thursday: 'வியாழன்',
    friday: 'வெள்ளி',
    saturday: 'சனி',
  },
};

const RELATIONSHIP_NAMES: Record<Language, Record<RelationshipType, string>> = {
  en: {
    friend: 'Friend',
    enemy: 'Enemy',
    neutral: 'Neutral',
    self: 'Self',
  },
  ta: {
    friend: 'நட்பு',
    enemy: 'பகை',
    neutral: 'சமம்',
    self: 'சுயம்',
  },
};

const ELEMENTS: Record<Language, Record<BirdId, string>> = {
  en: {
    vulture: 'Earth',
    owl: 'Water',
    crow: 'Fire',
    cock: 'Air',
    peacock: 'Ether / Space',
  },
  ta: {
    vulture: 'நிலம் (பிருத்வி)',
    owl: 'நீர் (அப்பு)',
    crow: 'நெருப்பு (தேயு)',
    cock: 'காற்று (வாயு)',
    peacock: 'ஆகாயம்',
  },
};

const PLANETS: Record<Language, Record<BirdId, string>> = {
  en: {
    vulture: 'Jupiter',
    owl: 'Moon',
    crow: 'Saturn',
    cock: 'Mars',
    peacock: 'Venus / Mercury',
  },
  ta: {
    vulture: 'குரு',
    owl: 'சந்திரன்',
    crow: 'சனி',
    cock: 'செவ்வாய்',
    peacock: 'சுக்கிரன் / புதன்',
  },
};

const DIRECTIONS: Record<Language, Record<BirdId, string>> = {
  en: {
    vulture: 'South',
    owl: 'West',
    crow: 'North',
    cock: 'East',
    peacock: 'Center',
  },
  ta: {
    vulture: 'தெற்கு',
    owl: 'மேற்கு',
    crow: 'வடக்கு',
    cock: 'கிழக்கு',
    peacock: 'மையம்',
  },
};

const ACTIVITY_STATUS: Record<Language, Record<ActivityType, string>> = {
  en: {
    Rule: 'Supreme',
    Eat: 'Favorable',
    Walk: 'Moderate',
    Sleep: 'Inauspicious',
    Die: 'Critical',
  },
  ta: {
    Rule: 'மிகச் சிறந்தது',
    Eat: 'நற்பலன்',
    Walk: 'நடுத்தரம்',
    Sleep: 'சுபமற்றது',
    Die: 'தவிர்க்கவும்',
  },
};

const ACTIVITY_DESCRIPTIONS: Record<Language, Record<ActivityType, string>> = {
  en: {
    Rule: 'Supreme King state. Maximum vitality and influence.',
    Eat: 'Nourishment and replenishment. High positive energy.',
    Walk: 'Ordinary motion and neutral energy.',
    Sleep: 'Dormant and passive phase. Low energy.',
    Die: 'Vulnerable and drained state. Minimum energy.',
  },
  ta: {
    Rule: 'அரசாட்சி நிலை. முழு ஆற்றல், தலைமைத்துவம் மற்றும் மகத்தான வெற்றி தரும் காலம்.',
    Eat: 'உணவு உண்ணும் நிலை. உற்சாகம், நற்பலன் மற்றும் சாதகமான ஆற்றல் கொண்ட காலம்.',
    Walk: 'உலாவுதல் நிலை. பொதுவான நகர்வு மற்றும் நடுத்தர பலன் தரும் காலம்.',
    Sleep: 'உறங்கும் நிலை. மந்தமான ஆற்றல்; முக்கிய முடிவுகளைத் தவிர்க்கவும்.',
    Die: 'ஆற்றல் இழந்த நிலை. மிகக் குறைந்த சக்தி; புதிய முயற்சிகளை கண்டிப்பாக தவிர்க்கவும்.',
  },
};

const ACTIVITY_RECOMMENDATIONS: Record<Language, Record<ActivityType, string>> = {
  en: {
    Rule: 'Best time for vital decisions, signing contracts, launching projects, meetings, purchases.',
    Eat: 'Highly favorable for study, travel, social discussions, medical treatments, and agreements.',
    Walk: 'Good for daily routine chores, travel, short tasks; avoid major life milestones.',
    Sleep: 'Unsuitable for starting new actions or signing deals. Best for meditation, rest, and routine work.',
    Die: 'Strictly avoid important beginnings, arguments, monetary risk, or critical ventures.',
  },
  ta: {
    Rule: 'முக்கிய முடிவுகள் எடுக்கவும், ஒப்பந்தங்கள் கையெழுத்திடவும், புதிய திட்டங்களைத் தொடங்கவும் உகந்த நேரம்.',
    Eat: 'கல்வி, பயணம், பேச்சுவார்த்தை, சிகிச்சை, மற்றும் சுப காரியங்களுக்கு மிகவும் ஏற்ற நேரம்.',
    Walk: 'தினசரி பணிகள், சாதாரண பயணங்களுக்கு ஏற்றது; பெரிய முக்கிய காரியங்களைத் தவிர்க்கவும்.',
    Sleep: 'புதிய காரியங்கள் தொடங்க உகந்ததல்ல. தியானம், ஓய்வு மற்றும் வழக்கமான பணிகளுக்கு மட்டும் ஏற்றது.',
    Die: 'முக்கிய முயற்சிகள், பணப் பரிவர்த்தனைகள், விவாதங்கள் மற்றும் புதிய தொடக்கங்களை முற்றிலும் தவிர்க்கவும்.',
  },
};

// UI Text Dictionary
const UI_TEXT: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'Pancha Pakshi Calculator',
    appSubtitle: '14-Day Astrological Calculation & Anthardasa System',
    selectYourBird: 'Select Your Bird',
    selectYourBirdDesc: 'Choose your birth or query bird to view all 10 Jamas calculations & sub-period timings',
    customTime: 'Custom Time',
    timeLookup: 'Time Lookup',
    valarpirai: 'Valarpirai',
    theipirai: 'Theipirai',
    valarpiraiFull: 'Valarpirai (Waxing Moon)',
    theipiraiFull: 'Theipirai (Waning Moon)',
    dayCalculationsHeader: '14 Pancha Pakshi Day Calculations',
    readyCount: 'Ready',
    selectDayPrompt: 'Select Day of the Week:',
    fullCalculationActive: 'Full Calculation Active',
    awaitingData: 'Awaiting balance calculation data',
    activeBadge: 'Active',
    pendingBadge: 'Pending User Upload',
    dayRulerBadge: 'Day Ruler (Jama 1 to 5):',
    nightRulerBadge: 'Night Ruler (Jama 6 to 10):',
    dyingBirdBadge: 'Dying Bird (Jama 1 to 10):',
    dayRulerShort: 'Day Ruler (1-5)',
    nightRulerShort: 'Night Ruler (6-10)',
    dyingShort: 'Dying (1-10)',
    dayDyingShort: 'Day Dying',
    nightDyingShort: 'Night Dying',
    valarpiraiChartBtn: 'Valarpirai Chart',
    theipiraiChartBtn: 'Theipirai Chart',
    chartModalTitle: 'Pancha Pakshi Ruling & Dying Bird Chart',
    chartModalSubtitle: 'Master 7-day reference for Ruling and Dying birds across cycles',
    dayCol: 'Day',
    dayRulerCol: 'Day Ruler (Jama 1 to 5)',
    nightRulerCol: 'Night Ruler (Jama 6 to 10)',
    dyingBirdCol: 'Dying Bird (Jama 1 to 10)',
    actionCol: 'Action',
    selectThisDay: 'Select',
    currentBadge: 'Current',
    closeBtn: 'Close',
    liveNow: 'LIVE NOW',
    customTimeBadge: 'CUSTOM TIME',
    dayJama: 'Day Jama',
    nightJama: 'Night Jama',
    scrubTime: 'Scrub Time:',
    resetLive: 'Reset Live',
    jamaPhase: 'Jama Phase',
    activeSubPeriod: 'Active Sub-Period',
    starStrength: 'Star Strength',
    timeRemaining: 'Time Remaining',
    minLeft: 'min left',
    guidanceFor: 'Guidance for',
    elementLabel: 'Element:',
    planetLabel: 'Planet:',
    directionLabel: 'Direction:',
    tabJamas: '10 Jamas Calculations',
    tabSummary: '24H Activity Analysis',
    tabChart: '24H Activity Chart',
    tabOccurrences: 'All Active Sub-Periods',
    tabMaster: 'Master 5-Bird Matrix',
    tabRelationships: 'Friends & Enemies',
    filterAllJamas: 'All 10 Jamas',
    filterDayJamas: 'Day Jamas (1–5)',
    filterNightJamas: 'Night Jamas (6–10)',
    showingJamasFor: 'Showing Jamas calculated for',
    expandCollapseHint: 'Click any Jama to expand/collapse sub-periods',
    runningJamaExpandedOnly: 'Running Jama expanded • Others contracted',
    expandRunningOnlyBtn: 'Running Jama Only',
    expandAllBtn: 'Expand All',
    contractAllBtn: 'Contract All',
    dayPeriod: 'Day Period',
    nightPeriod: 'Night Period',
    minutesSuffix: 'Minutes',
    stateLabel: 'State',
    columnSubPeriods: 'Sub-Periods Sequence',
    showOnlyMyBird: 'Show Only My Bird',
    compareAll5Birds: 'Compare All 5 Birds in this Jama',
    thNumber: '#',
    thSubBird: 'Sub-Bird',
    thActivity: 'Activity',
    thStarRating: 'Star Rating',
    thStartTime: 'Start Time',
    thDuration: 'Duration',
    thEndTime: 'End Time',
    footerShastra: 'Pancha Pakshi Shastra • 14-Day System',
    footerCurrentActive: 'Current Active Calculation:',
    locationSearchLabel: 'Search Location for Sunrise & Sunset:',
    searchLocationPlaceholder: 'Type city, town, or district (e.g. Madurai, Salem, London)...',
    searchButtonText: 'Search',
    searchingText: 'Searching location...',
    noLocationsFound: 'No locations found. Try checking the spelling.',
    recentSearchesTitle: 'Recent Searches (Last 5):',
    noRecentSearchesText: 'No recent searches yet. Search a location above.',
    clearRecentSearchesBtn: 'Clear',
    standardSunTimeBtn: 'Standard (06:00 - 18:00)',
    gpsLocationBtn: 'Use Device GPS',
    sunriseLabel: 'Sunrise',
    sunsetLabel: 'Sunset',
    nextSunriseLabel: 'Next Sunrise',
    customScheduleLabel: 'Custom Schedule',
    defaultScheduleLabel: 'Default Shastra Schedule',
    adjustTimingsBtn: 'Adjust Sunrise / Sunset Timings',
    applyScheduleBtn: 'Apply Schedule',
    resetScheduleBtn: 'Reset to Default',
    cityPresetsLabel: 'City Presets',
    totalDayLength: 'Total Day Length',
    totalNightLength: 'Total Night Length',
    jamaDurationLabel: 'Jama Duration',
    lookupModalTitle: 'Time & Jama Lookup Calculator',
    lookupModalSubtitle: 'Enter any time to immediately reveal which Jama and sub-period are active',
    timeInputLabel: 'Lookup Time',
    birdSelectLabel: 'Bird to Inspect',
    activeJamaResult: 'Active Jama',
    activeSubPeriodResult: 'Active Sub-Period',
    activityResult: 'Activity',
    allIntervalsFound: 'intervals found',
    filterAll: 'All',
    filterBest: 'Rule & Eat (Best)',
    filterCaution: 'Die & Sleep (Caution)',
    ruleEatFilter: 'Rule & Eat',
    friendshipCompatibilityTitle: 'Bird Friendship & Enemy Compatibility',
    friendshipCompatibilitySubtitle: 'Shastra relationship guidelines determining allies and adversaries for each bird',
    piraiSpecific: 'Paksha-Specific',
    relationshipSummary: 'Relationship Summary for',
    friendsCount: 'Friends',
    enemiesCount: 'Enemies',
    neutralsCount: 'Neutrals',
    pairCompatibilityTester: 'Pair Compatibility Tester',
    compatibilityInspectorTitle: 'Pair Compatibility Inspector',
    friendCardDesc: 'Friendly ally. Amplifies auspicious outcomes, harmony, and power in sub-periods.',
    enemyCardDesc: 'Adversary bird. Diminishes vitality; demands heightened caution during sub-periods.',
    neutralCardDesc: 'Balanced relationship. Delivers standard, moderate effects without alliance or friction.',
    selfCardDesc: 'Own bird energy. Baseline self strength in sub-periods.',
    calculationAnalysis: 'Calculation Analysis',
    analysisDesc: '24-hour breakdown of activities, golden hours, and caution timings.',
    goldenHours: 'Golden Hours (Rule & Eat)',
    cautionHours: 'Caution Hours (Die & Sleep)',
    totalHours: 'Total Hours',
    copySummaryBtn: 'Copy Summary',
    copiedText: 'Copied!',
    dayRulesTitle: 'Day Rules (Sunrise to Sunset - 720 mins total):',
    nightRulesTitle: 'Night Rules (Sunset to Sunrise - 720 mins total):',
    completeMasterMatrix: 'Complete 10-Jama Master Matrix',
    activeHighlight: 'Active Highlight:',
    realtimeCalendar: 'Real-Time Calendar',
    realtimeCalendarDesc: 'Select running Pirai (Paksha) and day of the week from live astronomical calendar',
    realtimeCalendarHoverHintDesktop: 'Hover for live astronomical preview • Click for full calendar',
    realtimeCalendarHoverHintMobile: 'Tap for today’s live astronomical peek',
    todayAstronomicalPreview: 'Today’s Live Astronomical Peek',
    mobileQuickLookup: 'Quick Time Lookup',
    quickPresetsLabel: 'Quick Presets',
    nowPreset: 'Now',
    plus30m: '+30m',
    plus1h: '+1h',
    noonPreset: '12:00 PM',
    eveningPreset: '06:00 PM',
    openFullLookup: 'Open Full Calculator',
    touchToClose: 'Close',
    liveTodayBadge: 'TODAY REAL-TIME',
    applyTodayBtn: 'Sync with Today',
    openCalendarBtn: 'Real-Time Calendar',
    calendarTitle: 'Pancha Pakshi Real-Time Calendar',
    calendarSubtitle: 'Select any date to instantly apply running Pirai (Paksha) & Day of Week',
    selectDatePrompt: 'Pick a date to set running Pirai and Day:',
    waxingMoon: 'Valarpirai (Waxing Moon)',
    waningMoon: 'Theipirai (Waning Moon)',
    tithiLabel: 'Tithi',
    moonPhaseLabel: 'Moon Phase',
    illuminationLabel: 'Illumination',
    appliedNotice: 'Applied to Pancha Pakshi Calculator!',
    selectThisDateBtn: 'Apply This Date',
    todayButton: 'Today',
    prevMonth: 'Previous Month',
    nextMonth: 'Next Month',
    datePickerLabel: 'Or Jump to Date:',
    runningPiraiLabel: 'Running Pirai',
    dayOfWeekLabel: 'Day of Week',
    jumpToMonthYear: 'Jump to Month/Year',
    currentMoment: 'Current Moment',
    chartTitle: '24-Hour Pancha Pakshi Activity Curve Analysis',
    chartSubtitle: 'Visual comparative curve analysis of bird activities and star ratings across 24 hours',
    methodWorkTitle: 'Method 1: Activity / Work State',
    methodStarTitle: 'Method 2: Star Ratings (1–10)',
    resolutionMain: 'Main Jama (10 Cycles)',
    resolutionSub: 'Sub-Periods (50 Anthardasas)',
    invertWorkOrderLabel: 'Invert Work Order',
    invertStarOrderLabel: 'Invert Star Ratings',
    workOrderNormalDesc: 'Die (Top) → Sleep → Walk → Eat → Rule (Bottom)',
    workOrderInvertedDesc: 'Rule (Top) → Eat → Walk → Sleep → Die (Bottom)',
    starOrderNormalDesc: '1 Star (Top) → 10 Stars (Bottom)',
    starOrderInvertedDesc: '10 Stars (Top) → 1 Star (Bottom)',
    compareBirdsPrompt: 'Toggle Birds to Compare:',
    presetMyBird: 'Active Bird Only',
    presetRulers: 'Day & Night Rulers',
    presetAll: 'All 5 Birds',
    dayCycleLabel: 'Day Period (Jamas 1–5)',
    nightCycleLabel: 'Night Period (Jamas 6–10)',
    currentTimeLabel: 'Current Time (Now)',
    clickToPinNotice: 'Hover or tap points along the curve for detailed sub-period metrics',
    curveTypeSmooth: 'Smooth Curve',
    curveTypeStraight: 'Straight Lines',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset 100%',
    zoomLabel: 'Zoom',
    swipeYAxis: 'Swipe Y-Axis',
    swipeYHelp: 'Swipe / drag Y-axis vertically to adjust height; drag horizontally to pan 24-hr timeline',
    ownSubPeriodNote: 'Star rating strictly from own sub-period under main bird Jama (not other birds)',
    themeDark: 'Dark',
    themeBright: 'Bright',
    themeToggle: 'Toggle Theme',
  },
  ta: {
    appTitle: 'பஞ்ச பட்சி கணக்கீடு',
    appSubtitle: '14 நாட்கள் சாஸ்திர கணக்கீடு மற்றும் அந்தர்தசை அமைப்பு',
    selectYourBird: 'உங்கள் பட்சியை தேர்வு செய்க',
    selectYourBirdDesc: '10 சாமங்கள் மற்றும் அந்தர்தசை நேரங்களை காண உங்கள் ஜென்ம அல்லது பிரசன்ன பட்சியை தேர்வு செய்க',
    customTime: 'தனிப்பயன் நேரம்',
    timeLookup: 'நேர ஆய்வு',
    valarpirai: 'வளர்பிறை',
    theipirai: 'தேய்பிறை',
    valarpiraiFull: 'வளர்பிறை',
    theipiraiFull: 'தேய்பிறை',
    dayCalculationsHeader: '14 பஞ்ச பட்சி நாள் கணக்கீடுகள்',
    readyCount: 'தயார்',
    selectDayPrompt: 'கிழமையை தேர்வு செய்க:',
    fullCalculationActive: 'முழு கணக்கீடு செயல்பாட்டில் உள்ளது',
    awaitingData: 'கணக்கீடு தகவல் எதிர்பார்க்கப்படுகிறது',
    activeBadge: 'செயலில் உள்ளது',
    pendingBadge: 'பதிவேற்றம் நிலுவையில் உள்ளது',
    dayRulerBadge: 'பகல் அரசு (சாமம் 1 முதல் 5):',
    nightRulerBadge: 'இரவு அரசு (சாமம் 6 முதல் 10):',
    dyingBirdBadge: 'சாதல் பட்சி (சாமம் 1 முதல் 10):',
    dayRulerShort: 'பகல் அரசு (1-5)',
    nightRulerShort: 'இரவு அரசு (6-10)',
    dyingShort: 'சாதல் (1-10)',
    dayDyingShort: 'பகல் சாதல்',
    nightDyingShort: 'இரவு சாதல்',
    valarpiraiChartBtn: 'வளர்பிறை அட்டவணை',
    theipiraiChartBtn: 'தேய்பிறை அட்டவணை',
    chartModalTitle: 'பஞ்ச பட்சி அரசு மற்றும் சாதல் அட்டவணை',
    chartModalSubtitle: '7 நாட்களுக்கான அரசு மற்றும் சாதல் பட்சிகளின் சாஸ்திர வழிகாட்டி',
    dayCol: 'கிழமை',
    dayRulerCol: 'பகல் அரசு (சாமம் 1 முதல் 5)',
    nightRulerCol: 'இரவு அரசு (சாமம் 6 முதல் 10)',
    dyingBirdCol: 'சாதல் பட்சி (சாமம் 1 முதல் 10)',
    actionCol: 'தேர்வு',
    selectThisDay: 'தேர்வு செய்',
    currentBadge: 'தற்போதைய',
    closeBtn: 'மூடுக',
    liveNow: 'நேரலை',
    customTimeBadge: 'தனிப்பயன் நேரம்',
    dayJama: 'பகல் சாமம்',
    nightJama: 'இரவு சாமம்',
    scrubTime: 'நேரத்தை மாற்றுக:',
    resetLive: 'நேரலைக்கு மீட்டமை',
    jamaPhase: 'சாம தொழில்',
    activeSubPeriod: 'தற்போதைய அந்தர்தசை',
    starStrength: 'நட்சத்திர பலம்',
    timeRemaining: 'மீதமுள்ள நேரம்',
    minLeft: 'நிமிடம் மீதம்',
    guidanceFor: 'வழிகாட்டுதல்:',
    elementLabel: 'பூதம்:',
    planetLabel: 'கிரகம்:',
    directionLabel: 'திசை:',
    tabJamas: '10 சாமங்கள் கணக்கீடு',
    tabSummary: '24 மணி நேர தொழில் பகுப்பாய்வு',
    tabChart: '24 மணி நேர வரைபடம் (Chart)',
    tabOccurrences: 'அனைத்து அந்தர்தசை காலங்கள்',
    tabMaster: '5 பட்சிகள் முதன்மை அட்டவணை',
    tabRelationships: 'நட்பு & பகை பட்சிகள்',
    filterAllJamas: 'அனைத்து 10 சாமங்கள்',
    filterDayJamas: 'பகல் சாமங்கள் (1–5)',
    filterNightJamas: 'இரவு சாமங்கள் (6–10)',
    showingJamasFor: 'கணக்கிடப்பட்ட சாமங்கள்:',
    expandCollapseHint: 'அந்தர்தசை நேரங்களை விரித்து காண சாமத்தை கிளிக் செய்யவும்',
    runningJamaExpandedOnly: 'நடப்பு சாமம் மட்டும் விரிந்தது • மற்றவை சுருங்கியது',
    expandRunningOnlyBtn: 'நடப்பு சாமம் மட்டும்',
    expandAllBtn: 'அனைத்தும் விரி',
    contractAllBtn: 'அனைத்தும் சுருக்கு',
    dayPeriod: 'பகல் காலம்',
    nightPeriod: 'இரவு காலம்',
    minutesSuffix: 'நிமிடங்கள்',
    stateLabel: 'நிலை',
    columnSubPeriods: 'அந்தர்தசை வரிசை',
    showOnlyMyBird: 'என் பட்சியை மட்டும் காட்டுக',
    compareAll5Birds: 'இந்த சாமத்தில் 5 பட்சிகளையும் ஒப்பிடுக',
    thNumber: '#',
    thSubBird: 'அந்தர்தசை பட்சி',
    thActivity: 'தொழில்',
    thStarRating: 'நட்சத்திர பலம்',
    thStartTime: 'தொடக்க நேரம்',
    thDuration: 'கால அளவு',
    thEndTime: 'முடிவு நேரம்',
    footerShastra: 'பஞ்ச பட்சி சாஸ்திரம் • 14 நாட்கள் முறை',
    footerCurrentActive: 'தற்போதைய கணக்கீடு:',
    locationSearchLabel: 'சூரியோதயம் மற்றும் அஸ்தமனத்திற்கான இடம் தேடல்:',
    searchLocationPlaceholder: 'ஊர், நகரம் அல்லது மாவட்டம் (எ.கா: மதுரை, சேலம், சென்னை)...',
    searchButtonText: 'தேடு',
    searchingText: 'இடம் தேடப்படுகிறது...',
    noLocationsFound: 'இடம் எதுவும் கிடைக்கவில்லை. எழுத்துப் பிழையை சரிபார்க்கவும்.',
    recentSearchesTitle: 'சமீபத்திய தேடல்கள் (கடைசி 5):',
    noRecentSearchesText: 'சமீபத்திய தேடல்கள் எதுவும் இல்லை. மேலே உள்ள ஊரை தேடுங்கள்.',
    clearRecentSearchesBtn: 'அழிக்க',
    standardSunTimeBtn: 'நிலையான நேரம் (06:00 - 18:00)',
    gpsLocationBtn: 'எனது ஜிபிஎஸ் இடம்',
    sunriseLabel: 'சூரியோதயம்',
    sunsetLabel: 'சூரிய அஸ்தமனம்',
    nextSunriseLabel: 'அடுத்த சூரியோதயம்',
    customScheduleLabel: 'தனிப்பயன் அட்டவணை',
    defaultScheduleLabel: 'நிலையான சாஸ்திர அட்டவணை',
    adjustTimingsBtn: 'சூரியோதயம் / அஸ்தமனம் நேரத்தை மாற்றுக',
    applyScheduleBtn: 'அட்டவணையை செயல்படுத்து',
    resetScheduleBtn: 'இயல்புநிலைக்கு மீட்டமை',
    cityPresetsLabel: 'முக்கிய நகரங்கள்',
    totalDayLength: 'பகல் கால அளவு',
    totalNightLength: 'இரவு கால அளவு',
    jamaDurationLabel: 'சாம கால அளவு',
    lookupModalTitle: 'நேரம் & சாம கண்டறியும் கருவி',
    lookupModalSubtitle: 'எந்த நேரத்தையும் உள்ளிட்டு சாமம் மற்றும் அந்தர்தசையை உடனடியாக கண்டறியுங்கள்',
    timeInputLabel: 'ஆராய வேண்டிய நேரம்',
    birdSelectLabel: 'ஆராய வேண்டிய பட்சி',
    activeJamaResult: 'தற்போதைய சாமம்',
    activeSubPeriodResult: 'தற்போதைய அந்தர்தசை',
    activityResult: 'தொழில்',
    allIntervalsFound: 'நேரங்கள் கண்டறியப்பட்டன',
    filterAll: 'அனைத்தும்',
    filterBest: 'அரசு & ஊண் (சுபம்)',
    filterCaution: 'சாதல் & துயில் (எச்சரிக்கை)',
    ruleEatFilter: 'அரசு & ஊண்',
    friendshipCompatibilityTitle: 'பட்சிகளின் நட்பு & பகை பொருத்தம்',
    friendshipCompatibilitySubtitle: 'வளர்பிறை மற்றும் தேய்பிறைக்கான நட்பு மற்றும் பகை பட்சிகளின் சாஸ்திர வழிகாட்டி',
    piraiSpecific: 'பிறை சார்ந்தது',
    relationshipSummary: 'பொருத்த விவரம்:',
    friendsCount: 'நட்பு',
    enemiesCount: 'பகை',
    neutralsCount: 'சமம்',
    pairCompatibilityTester: 'இரண்டு பட்சிகள் பொருத்தம்',
    compatibilityInspectorTitle: 'இரண்டு பட்சிகள் பொருத்தம்',
    friendCardDesc: 'நட்பு பட்சி. சுப காரியங்களுக்கும் அந்தர்தசைக்கும் கூடுதல் நற்பலன்கள் தரும்.',
    enemyCardDesc: 'பகை பட்சி. ஆற்றல் குறையும்; இந்த பட்சியின் அந்தர்தசையில் மிகுந்த எச்சரிக்கை தேவை.',
    neutralCardDesc: 'சம பட்சி. நடுநிலையான நடுத்தர பலன்களைத் தரும்.',
    selfCardDesc: 'சொந்த பட்சியின் மூல ஆற்றல்.',
    calculationAnalysis: 'கணக்கீட்டு பகுப்பாய்வு',
    analysisDesc: '24 மணி நேர தொழில்கள், சுப நேரங்கள் மற்றும் எச்சரிக்கை நேரங்களின் தொகுப்பு.',
    goldenHours: 'சுப பொன்னான நேரங்கள் (அரசு & ஊண்)',
    cautionHours: 'எச்சரிக்கை நேரங்கள் (சாதல் & துயில்)',
    totalHours: 'மொத்த நேரம்',
    copySummaryBtn: 'பகுப்பாய்வை நகலெடு',
    copiedText: 'நகலெடுக்கப்பட்டது!',
    dayRulesTitle: 'பகல் சாஸ்திர விதிகள் (சூரியோதயம் முதல் அஸ்தமனம் வரை - 720 நிமிடங்கள்):',
    nightRulesTitle: 'இரவு சாஸ்திர விதிகள் (அஸ்தமனம் முதல் மறு சூரியோதயம் வரை - 720 நிமிடங்கள்):',
    completeMasterMatrix: 'முழுமையான 10 சாமங்கள் முதன்மை அட்டவணை',
    activeHighlight: 'தேர்ந்தெடுக்கப்பட்ட பட்சி:',
    realtimeCalendar: 'நிகழ்நேர நாள்காட்டி',
    realtimeCalendarDesc: 'வானியல் கணக்கீட்டின்படி நடப்பு பிறை மற்றும் கிழமையை நிகழ்நேரத்தில் தேர்வு செய்க',
    realtimeCalendarHoverHintDesktop: 'நேரடி வானியல் விவரங்களுக்கு கர்சரை நகர்த்தவும் • காலண்டருக்கு கிளிக் செய்க',
    realtimeCalendarHoverHintMobile: 'இன்றைய நேரடி வானியல் விவரங்களை அறிய தட்டவும்',
    todayAstronomicalPreview: 'இன்றைய நேரடி வானியல் பார்வை',
    mobileQuickLookup: 'விரைவு நேர தேடல்',
    quickPresetsLabel: 'விரைவு நேரங்கள்',
    nowPreset: 'இப்போது',
    plus30m: '+30நி',
    plus1h: '+1மணி',
    noonPreset: '12:00 மதியம்',
    eveningPreset: '06:00 மாலை',
    openFullLookup: 'முழு கணிப்பான் திறக்க',
    touchToClose: 'மூடுக',
    liveTodayBadge: 'இன்றைய நிகழ்நேரம்',
    applyTodayBtn: 'இன்றைய தினத்திற்கு மாற்று',
    openCalendarBtn: 'நிகழ்நேர நாள்காட்டி',
    calendarTitle: 'பஞ்ச பட்சி நிகழ்நேர நாள்காட்டி',
    calendarSubtitle: 'தேதியைத் தேர்ந்தெடுத்து அதற்கான நடப்பு பிறை மற்றும் கிழமையைப் பெறுக',
    selectDatePrompt: 'பிறை மற்றும் கிழமையை அமைக்க தேதியைத் தேர்ந்தெடுக்கவும்:',
    waxingMoon: 'வளர்பிறை (சுக்ல பக்ஷம்)',
    waningMoon: 'தேய்பிறை (கிருஷ்ண பக்ஷம்)',
    tithiLabel: 'திதி',
    moonPhaseLabel: 'சந்திர பிறை நிலை',
    illuminationLabel: 'ஒளி அளவு',
    appliedNotice: 'பஞ்ச பட்சி கணக்கீட்டில் பயன்படுத்தப்பட்டது!',
    selectThisDateBtn: 'இத்தேதியைத் தேர்வு செய்',
    todayButton: 'இன்று',
    prevMonth: 'முந்தைய மாதம்',
    nextMonth: 'அடுத்த மாதம்',
    datePickerLabel: 'அல்லது குறிப்பிட்ட தேதிக்குச் செல்:',
    runningPiraiLabel: 'நடப்பு பிறை',
    dayOfWeekLabel: 'கிழமை',
    jumpToMonthYear: 'மாதம் / ஆண்டிற்குச் செல்',
    currentMoment: 'தற்போதைய நேரம்',
    chartTitle: '24 மணி நேர பஞ்ச பட்சி தொழில் வளைகோட்டு வரைபடம்',
    chartSubtitle: '24 மணி நேர சுழற்சியில் பட்சிகளின் தொழில் நிலைகள் மற்றும் நட்சத்திர மதிப்பீடுகளின் ஒப்பீடு',
    methodWorkTitle: 'முறை 1: தொழில் நிலை (Work State)',
    methodStarTitle: 'முறை 2: நட்சத்திர மதிப்பீடு (Star Ratings 1–10)',
    resolutionMain: 'முதன்மை சாமங்கள் (10 சாமங்கள்)',
    resolutionSub: 'உட்பிரிவு அந்தர்தசைகள் (50 உட்பிரிவுகள்)',
    invertWorkOrderLabel: 'தொழில் வரிசையை மாற்று',
    invertStarOrderLabel: 'நட்சத்திர வரிசையை மாற்று',
    workOrderNormalDesc: 'சாவு (மேல்) → துயில் → நடை → ஊண் → அரசு (கீழ்)',
    workOrderInvertedDesc: 'அரசு (மேல்) → ஊண் → நடை → துயில் → சாவு (கீழ்)',
    starOrderNormalDesc: '1 நட்சத்திரம் (மேல்) → 10 நட்சத்திரங்கள் (கீழ்)',
    starOrderInvertedDesc: '10 நட்சத்திரங்கள் (மேல்) → 1 நட்சத்திரம் (கீழ்)',
    compareBirdsPrompt: 'ஒப்பிட பட்சிகளைத் தேர்வு செய்க:',
    presetMyBird: 'சொந்த பட்சி மட்டும்',
    presetRulers: 'பகல் & இரவு அரசு பட்சிகள்',
    presetAll: 'அனைத்து 5 பட்சிகள்',
    dayCycleLabel: 'பகல் சுழற்சி (சாமங்கள் 1–5)',
    nightCycleLabel: 'இரவு சுழற்சி (சாமங்கள் 6–10)',
    currentTimeLabel: 'தற்போதைய நேரம் (Now)',
    clickToPinNotice: 'விவரங்களை அறிய வளைகோட்டுப் புள்ளிகளில் தொடவும் அல்லது கர்சரை நகர்த்தவும்',
    curveTypeSmooth: 'வளைகோடு (Curve)',
    curveTypeStraight: 'நேர்கோடு (Straight)',
    zoomIn: 'பெரிதாக்கு',
    zoomOut: 'சிறிதாக்கு',
    resetZoom: 'இயல்பு நிலை (100%)',
    zoomLabel: 'பெரிதாக்கம்',
    swipeYAxis: 'Y-அச்சை நகர்த்துக',
    swipeYHelp: 'செங்குத்து அச்சை (Y-axis) மேலும் கீழும் நகர்த்தலாம்; கிடைமட்டமாக 24 மணி நேரத்தை நகர்த்தலாம்',
    ownSubPeriodNote: 'முதன்மையான பட்சியின் சொந்த அந்தர்தசையின் நட்சத்திர மதிப்பீடு மட்டுமே (பிற பட்சிகள் அல்ல)',
    themeDark: 'இருள்',
    themeBright: 'வெளிச்சம்',
    themeToggle: 'தோற்றம் மாற்று',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pancha_language');
    if (saved === 'en' || saved === 'ta') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pancha_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const t = (key: string): string => {
    return UI_TEXT[language]?.[key] || UI_TEXT.en[key] || key;
  };

  const getBirdName = (birdId: BirdId): string => {
    return BIRD_NAMES[language]?.[birdId] || BIRD_NAMES.en[birdId];
  };

  const getActivityName = (act: ActivityType): string => {
    return ACTIVITY_NAMES[language]?.[act] || ACTIVITY_NAMES.en[act];
  };

  const getActivityAction = (act: ActivityType): string => {
    return ACTIVITY_ACTIONS[language]?.[act] || ACTIVITY_ACTIONS.en[act];
  };

  const getPakshaName = (paksha: PakshaType): string => {
    return PAKSHA_NAMES[language]?.[paksha] || PAKSHA_NAMES.en[paksha];
  };

  const getDayName = (day: DayOfWeek): string => {
    return DAY_NAMES[language]?.[day] || DAY_NAMES.en[day];
  };

  const getDayShortName = (day: DayOfWeek): string => {
    return DAY_SHORT_NAMES[language]?.[day] || DAY_SHORT_NAMES.en[day];
  };

  const getRelationshipName = (rel: RelationshipType): string => {
    return RELATIONSHIP_NAMES[language]?.[rel] || RELATIONSHIP_NAMES.en[rel];
  };

  const getElementName = (birdId: BirdId): string => {
    return ELEMENTS[language]?.[birdId] || ELEMENTS.en[birdId];
  };

  const getPlanetName = (birdId: BirdId): string => {
    return PLANETS[language]?.[birdId] || PLANETS.en[birdId];
  };

  const getDirectionName = (birdId: BirdId): string => {
    return DIRECTIONS[language]?.[birdId] || DIRECTIONS.en[birdId];
  };

  const getActivityStatus = (act: ActivityType): string => {
    return ACTIVITY_STATUS[language]?.[act] || ACTIVITY_STATUS.en[act];
  };

  const getActivityDescription = (act: ActivityType): string => {
    return ACTIVITY_DESCRIPTIONS[language]?.[act] || ACTIVITY_DESCRIPTIONS.en[act];
  };

  const getActivityRecommendation = (act: ActivityType): string => {
    return ACTIVITY_RECOMMENDATIONS[language]?.[act] || ACTIVITY_RECOMMENDATIONS.en[act];
  };

  const getBirdDescription = (birdId: BirdId): string => {
    return BIRD_DESCRIPTIONS[language]?.[birdId] || BIRD_DESCRIPTIONS.en[birdId];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getBirdName,
        getActivityName,
        getActivityAction,
        getPakshaName,
        getDayName,
        getDayShortName,
        getRelationshipName,
        getElementName,
        getPlanetName,
        getDirectionName,
        getActivityStatus,
        getActivityDescription,
        getActivityRecommendation,
        getBirdDescription,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
