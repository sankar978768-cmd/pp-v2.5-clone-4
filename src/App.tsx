import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BirdId, Jama, PakshaType, DayOfWeek, DayCalculationMeta } from './types';
import { BIRDS } from './data/panchaPakshiData';
import { recalculateJamas } from './utils/calculator';
import { getBaseJamasForDay, PANCHA_PAKSHI_DAYS } from './data/panchaPakshiRegistry';
import { OFFLINE_CITIES } from './utils/locationService';
import {
  getLocationTimezoneInfo,
  getTargetLocationCurrentMoment,
  getTzAbbreviation,
  getTimeDifferenceFromIstText,
  convertTimeToIst,
  convertJamasToIst,
} from './utils/timezoneService';
import { calculateSolarTimes } from './utils/solarCalculator';
import { FixedTopHeader } from './components/FixedTopHeader';
import { FixedBottomNav, BottomNavTab } from './components/FixedBottomNav';
import { SideNavigationDrawer, DrawerCategory } from './components/SideNavigationDrawer';
import { AnalyticsModal } from './components/AnalyticsModal';
import { TimeLookupModal } from './components/TimeLookupModal';
import { RealTimeCalendarModal } from './components/RealTimeCalendarModal';
import { BirdSelectModal } from './components/BirdSelectModal';
import { JamasScreen } from './screens/JamasScreen';
import { BirdScreen } from './screens/BirdScreen';
import { LocationScreen } from './screens/LocationScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { getLunarDayInfo } from './utils/lunarCalendar';
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';

const DAYS_MAP: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export default function App() {
  const {
    language,
    setLanguage,
    getPakshaName,
    getDayName,
  } = useLanguage();

  const { theme, setTheme } = useTheme();

  // Active Screen / Tab in View Switching Model
  const [activeTab, setActiveTab] = useState<BottomNavTab>(() => {
    const saved = localStorage.getItem('pancha_active_tab');
    if (saved === 'jamas' || saved === 'bird' || saved === 'location' || saved === 'calendar') {
      return saved as BottomNavTab;
    }
    return 'jamas';
  });

  // Track scroll position per tab so switching screens remembers where last scrolled
  const tabScrollPositions = useRef<Record<BottomNavTab, number>>({
    jamas: 0,
    bird: 0,
    location: 0,
    calendar: 0,
  });

  // Keep active tab's scroll position updated on scroll
  useEffect(() => {
    const handleScroll = () => {
      tabScrollPositions.current[activeTab] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleSelectTab = (tab: BottomNavTab) => {
    if (tab === activeTab) return;
    // 1. Save current tab's scroll position
    tabScrollPositions.current[activeTab] = window.scrollY;

    // 2. Switch tab
    setActiveTab(tab);
    localStorage.setItem('pancha_active_tab', tab);

    // 3. Restore target tab's last scrolled position
    const targetY = tabScrollPositions.current[tab] ?? 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: 'instant' });
    });
  };

  const [selectedBird, setSelectedBird] = useState<BirdId>(() => {
    const saved = localStorage.getItem('pancha_selected_bird');
    if (saved && saved in BIRDS) return saved as BirdId;
    return 'vulture';
  });

  // Custom schedule state with localStorage persistence
  const [sunriseTime, setSunriseTime] = useState<string>(() => {
    return localStorage.getItem('pancha_sunrise') || '06:00';
  });
  const [sunsetTime, setSunsetTime] = useState<string>(() => {
    return localStorage.getItem('pancha_sunset') || '18:00';
  });
  const [nextSunriseTime, setNextSunriseTime] = useState<string>(() => {
    return localStorage.getItem('pancha_next_sunrise') || '06:00';
  });
  const [locationName, setLocationName] = useState<string>(() => {
    return localStorage.getItem('pancha_location_name') || '';
  });
  const [locationLat, setLocationLat] = useState<number | null>(() => {
    const val = localStorage.getItem('pancha_location_lat');
    return val ? parseFloat(val) : null;
  });
  const [locationLng, setLocationLng] = useState<number | null>(() => {
    const val = localStorage.getItem('pancha_location_lng');
    return val ? parseFloat(val) : null;
  });
  const [locationTimezone, setLocationTimezone] = useState<string>(() => {
    return localStorage.getItem('pancha_location_tz') || 'Asia/Kolkata';
  });
  const [locationTimezoneOffset, setLocationTimezoneOffset] = useState<number>(() => {
    const val = localStorage.getItem('pancha_location_tz_offset');
    if (val !== null) return parseInt(val, 10);
    const loc = localStorage.getItem('pancha_location_name');
    if (loc) {
      const match = OFFLINE_CITIES.find(
        (c) =>
          c.name.toLowerCase() === loc.toLowerCase() || (c.tamilName && c.tamilName === loc)
      );
      if (match) {
        const tzInfo = getLocationTimezoneInfo(match);
        return tzInfo.offsetMinutes;
      }
    }
    return 330; // default IST (+5:30)
  });
  const [isCustomSchedule, setIsCustomSchedule] = useState<boolean>(() => {
    return localStorage.getItem('pancha_is_custom') === 'true';
  });

  // Time Display Mode: 'local' (target location solar time) or 'ist' (Indian Standard Time +05:30)
  const [timeDisplayMode, setTimeDisplayMode] = useState<'local' | 'ist'>(() => {
    const saved = localStorage.getItem('pancha_time_display_mode');
    return saved === 'ist' ? 'ist' : 'local';
  });

  // Active Paksha and Day state
  const [selectedPaksha, setSelectedPaksha] = useState<PakshaType>(() => {
    const saved = localStorage.getItem('pancha_selected_paksha');
    if (saved === 'valarpirai' || saved === 'theipirai') return saved as PakshaType;
    return getLunarDayInfo(new Date()).paksha;
  });
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const saved = localStorage.getItem('pancha_selected_day');
    if (saved) return saved as DayOfWeek;
    return getLunarDayInfo(new Date()).dayOfWeek;
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('pancha_selected_calendar_date');
    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Modal and Drawer States
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<DrawerCategory>('all');
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [analyticsInitialTab, setAnalyticsInitialTab] = useState<'chart' | 'master' | 'relationships'>('chart');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isBirdSelectModalOpen, setIsBirdSelectModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  const [customDaysVersion, setCustomDaysVersion] = useState<number>(0);

  // Detect whether current custom location is outside Indian Standard Time (+05:30)
  const isOtherLocation = useMemo(() => {
    return Boolean(isCustomSchedule && Math.abs(locationTimezoneOffset - 330) > 1);
  }, [isCustomSchedule, locationTimezoneOffset]);

  // Standard timezone abbreviation for target location
  const tzAbbreviation = useMemo(() => {
    return getTzAbbreviation(locationTimezone, locationTimezoneOffset, selectedCalendarDate || new Date());
  }, [locationTimezone, locationTimezoneOffset, selectedCalendarDate]);

  // Time difference relative to IST text
  const timeDifferenceText = useMemo(() => {
    return getTimeDifferenceFromIstText(locationTimezoneOffset, language);
  }, [locationTimezoneOffset, language]);

  // Save selections to localStorage
  useEffect(() => {
    localStorage.setItem('pancha_selected_bird', selectedBird);
  }, [selectedBird]);

  useEffect(() => {
    localStorage.setItem('pancha_selected_paksha', selectedPaksha);
  }, [selectedPaksha]);

  useEffect(() => {
    localStorage.setItem('pancha_selected_day', selectedDay);
  }, [selectedDay]);

  // Active Day Configuration lookup
  const activeDayId = `${selectedPaksha}_${selectedDay}`;
  const dayMeta = PANCHA_PAKSHI_DAYS.find((d: DayCalculationMeta) => d.id === activeDayId);

  // Base Jamas for current day
  const baseJamasResult = useMemo(() => {
    return getBaseJamasForDay(activeDayId);
  }, [activeDayId, customDaysVersion]);

  // If user hasn't explicitly set custom schedule, sync with day default sunrise/sunset
  useEffect(() => {
    if (!isCustomSchedule && baseJamasResult.defaultSunset) {
      setSunriseTime(baseJamasResult.defaultSunrise || '06:00');
      setSunsetTime(baseJamasResult.defaultSunset || '18:00');
      setNextSunriseTime(baseJamasResult.defaultNextSunrise || '06:00');
    }
  }, [
    activeDayId,
    isCustomSchedule,
    baseJamasResult.defaultSunrise,
    baseJamasResult.defaultSunset,
    baseJamasResult.defaultNextSunrise,
  ]);

  // Recalculate solar times if user browses to a different calendar date
  useEffect(() => {
    if (isCustomSchedule && locationLat !== null && locationLng !== null && selectedCalendarDate) {
      const solar = calculateSolarTimes(locationLat, locationLng, selectedCalendarDate, locationTimezoneOffset);
      setSunriseTime(solar.sunrise);
      setSunsetTime(solar.sunset);
      setNextSunriseTime(solar.nextSunrise);
    }
  }, [selectedCalendarDate, isCustomSchedule, locationLat, locationLng, locationTimezoneOffset]);

  // Recalculated Jamas in that location's local solar time
  const localJamasList: Jama[] = useMemo(() => {
    if (isCustomSchedule) {
      return recalculateJamas(sunriseTime, sunsetTime, nextSunriseTime, baseJamasResult.jamas);
    }
    return baseJamasResult.jamas;
  }, [isCustomSchedule, sunriseTime, sunsetTime, nextSunriseTime, baseJamasResult.jamas]);

  // Display Jamas: If IST mode is active, convert clock times into IST (+05:30)
  const displayJamasList: Jama[] = useMemo(() => {
    if (timeDisplayMode === 'ist') {
      return convertJamasToIst(localJamasList, locationTimezoneOffset);
    }
    return localJamasList;
  }, [timeDisplayMode, localJamasList, locationTimezoneOffset]);

  // Display Sunrise, Sunset, and Next Sunrise
  const displaySunrise = useMemo(() => {
    if (timeDisplayMode === 'ist') {
      return convertTimeToIst(sunriseTime, locationTimezoneOffset, true);
    }
    return sunriseTime;
  }, [timeDisplayMode, sunriseTime, locationTimezoneOffset]);

  const displaySunset = useMemo(() => {
    if (timeDisplayMode === 'ist') {
      return convertTimeToIst(sunsetTime, locationTimezoneOffset, true);
    }
    return sunsetTime;
  }, [timeDisplayMode, sunsetTime, locationTimezoneOffset]);

  const displayNextSunrise = useMemo(() => {
    if (timeDisplayMode === 'ist') {
      return convertTimeToIst(nextSunriseTime, locationTimezoneOffset, true);
    }
    return nextSunriseTime;
  }, [timeDisplayMode, nextSunriseTime, locationTimezoneOffset]);

  // Live real-time clock ticker updated every 15s
  const [currentUtcMillis, setCurrentUtcMillis] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUtcMillis(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute live current clock minutes in target local time and in IST
  const liveClocks = useMemo(() => {
    const ref = new Date(currentUtcMillis);
    const utcMinutes = ref.getUTCHours() * 60 + ref.getUTCMinutes() + ref.getUTCSeconds() / 60;

    let targetLocalMin = (utcMinutes + locationTimezoneOffset) % 1440;
    if (targetLocalMin < 0) targetLocalMin += 1440;

    let istMin = (utcMinutes + 330) % 1440;
    if (istMin < 0) istMin += 1440;

    const targetMoment = getTargetLocationCurrentMoment(locationTimezoneOffset, ref);

    return {
      targetLocalMinutes: Math.floor(targetLocalMin),
      istMinutes: Math.floor(istMin),
      targetMoment,
    };
  }, [currentUtcMillis, locationTimezoneOffset]);

  // Active clock minute matching the current display mode
  const activeCurrentMinutes = useMemo(() => {
    if (timeDisplayMode === 'ist') {
      return liveClocks.istMinutes;
    }
    return liveClocks.targetLocalMinutes;
  }, [timeDisplayMode, liveClocks]);

  // Find running Jama based on current time
  const runningJamaNumber = useMemo(() => {
    if (!displayJamasList || displayJamasList.length === 0) return 1;
    const cycleStartMin = displayJamasList[0]?.startMinutesFromMidnight ?? 360;
    const effectiveMinutes = activeCurrentMinutes < cycleStartMin ? activeCurrentMinutes + 1440 : activeCurrentMinutes;

    for (const j of displayJamasList) {
      if (effectiveMinutes >= j.startMinutesFromMidnight && effectiveMinutes < j.endMinutesFromMidnight) {
        return j.jamaNumber;
      }
    }
    return displayJamasList[0]?.jamaNumber ?? 1;
  }, [displayJamasList, activeCurrentMinutes]);

  // Multi-Expanded Jamas State: Opening another Jama keeps previously opened viewing Jamas open!
  const [expandedJamas, setExpandedJamas] = useState<number[]>(() => [1]);

  useEffect(() => {
    setExpandedJamas((prev) => {
      if (!prev.includes(runningJamaNumber)) {
        return [...prev, runningJamaNumber];
      }
      return prev;
    });
  }, [runningJamaNumber, activeDayId]);

  // Toggle single Jama without closing other currently open Jamas
  const handleToggleJama = (jamaNumber: number) => {
    setExpandedJamas((prev) => {
      if (prev.includes(jamaNumber)) {
        return prev.filter((id) => id !== jamaNumber);
      } else {
        return [...prev, jamaNumber];
      }
    });
  };

  // Apply location or custom sunrise/sunset
  const handleApplySunriseSunset = (
    sRise: string,
    sSet: string,
    nRise: string,
    locName?: string,
    lat?: number,
    lng?: number,
    timezone?: string,
    timezoneOffsetMinutes?: number
  ) => {
    let finalOffset = timezoneOffsetMinutes;
    let finalTz = timezone;
    let finalLat = lat;
    let finalLng = lng;

    if (typeof finalOffset !== 'number' && locName) {
      const foundCity = OFFLINE_CITIES.find(
        (c) =>
          c.name.toLowerCase() === locName.toLowerCase() || (c.tamilName && c.tamilName === locName)
      );
      if (foundCity) {
        finalLat = foundCity.lat;
        finalLng = foundCity.lng;
        const tzInfo = getLocationTimezoneInfo(foundCity);
        finalOffset = tzInfo.offsetMinutes;
        finalTz = tzInfo.timezoneName;
      }
    }

    if (typeof finalOffset !== 'number' && finalLat !== undefined && finalLng !== undefined) {
      const tzInfo = getLocationTimezoneInfo({ lat: finalLat, lng: finalLng, timezone });
      finalOffset = tzInfo.offsetMinutes;
      finalTz = tzInfo.timezoneName;
    }

    if (typeof finalOffset !== 'number') {
      finalOffset = 330;
    }

    setLocationTimezoneOffset(finalOffset);
    if (finalTz) setLocationTimezone(finalTz);
    if (finalLat !== undefined) setLocationLat(finalLat);
    if (finalLng !== undefined) setLocationLng(finalLng);

    localStorage.setItem('pancha_location_tz_offset', String(finalOffset));
    if (finalTz) localStorage.setItem('pancha_location_tz', finalTz);
    if (finalLat !== undefined) localStorage.setItem('pancha_location_lat', String(finalLat));
    if (finalLng !== undefined) localStorage.setItem('pancha_location_lng', String(finalLng));

    const targetMoment = getTargetLocationCurrentMoment(finalOffset, new Date());
    const localDay = DAYS_MAP[targetMoment.dayOfWeek];
    const localLunar = getLunarDayInfo(targetMoment.localDate);
    const localPaksha = localLunar.paksha;

    setSelectedDay(localDay);
    setSelectedPaksha(localPaksha);
    setSelectedCalendarDate(targetMoment.localDate);

    localStorage.setItem('pancha_selected_day', localDay);
    localStorage.setItem('pancha_selected_paksha', localPaksha);
    localStorage.setItem('pancha_selected_calendar_date', targetMoment.localDate.toISOString());

    let effectiveSRise = sRise;
    let effectiveSSet = sSet;
    let effectiveNRise = nRise;

    if (finalLat !== undefined && finalLng !== undefined) {
      const solar = calculateSolarTimes(finalLat, finalLng, targetMoment.localDate, finalOffset);
      effectiveSRise = solar.sunrise;
      effectiveSSet = solar.sunset;
      effectiveNRise = solar.nextSunrise;
    }

    setSunriseTime(effectiveSRise);
    setSunsetTime(effectiveSSet);
    setNextSunriseTime(effectiveNRise);
    setLocationName(locName || '');
    setIsCustomSchedule(true);

    localStorage.setItem('pancha_sunrise', effectiveSRise);
    localStorage.setItem('pancha_sunset', effectiveSSet);
    localStorage.setItem('pancha_next_sunrise', effectiveNRise);
    localStorage.setItem('pancha_location_name', locName || '');
    localStorage.setItem('pancha_is_custom', 'true');
  };

  const handleResetSchedule = () => {
    const defaultSR = baseJamasResult.defaultSunrise || '06:00';
    const defaultSS = baseJamasResult.defaultSunset || '18:00';
    const defaultNSR = baseJamasResult.defaultNextSunrise || '06:00';
    setSunriseTime(defaultSR);
    setSunsetTime(defaultSS);
    setNextSunriseTime(defaultNSR);
    setLocationName('');
    setLocationLat(null);
    setLocationLng(null);
    setLocationTimezone('Asia/Kolkata');
    setLocationTimezoneOffset(330);
    setTimeDisplayMode('local');
    setIsCustomSchedule(false);

    localStorage.removeItem('pancha_sunrise');
    localStorage.removeItem('pancha_sunset');
    localStorage.removeItem('pancha_next_sunrise');
    localStorage.removeItem('pancha_location_name');
    localStorage.removeItem('pancha_location_lat');
    localStorage.removeItem('pancha_location_lng');
    localStorage.removeItem('pancha_location_tz');
    localStorage.removeItem('pancha_location_tz_offset');
    localStorage.removeItem('pancha_time_display_mode');
    localStorage.removeItem('pancha_is_custom');
  };

  const handleToggleTimeDisplayMode = (mode: 'local' | 'ist') => {
    setTimeDisplayMode(mode);
    localStorage.setItem('pancha_time_display_mode', mode);
  };

  const handleSelectPakshaAndDay = (paksha: PakshaType, day: DayOfWeek, date?: Date) => {
    setSelectedPaksha(paksha);
    setSelectedDay(day);
    if (date) {
      setSelectedCalendarDate(date);
      localStorage.setItem('pancha_selected_calendar_date', date.toISOString());
    }
  };

  const handleCustomDayUploaded = (_dayId: string, _jamas: Jama[]) => {
    setCustomDaysVersion((v) => v + 1);
  };

  const openAnalyticsTab = (tab: 'chart' | 'master' | 'relationships') => {
    setAnalyticsInitialTab(tab);
    setIsAnalyticsModalOpen(true);
  };

  const openDrawerWithCategory = (cat: DrawerCategory) => {
    setDrawerCategory(cat);
    setIsSideMenuOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#EFE9DE] dark:bg-slate-950 text-[#23201C] dark:text-slate-100 flex flex-col font-sans selection:bg-[#1B4332] selection:text-white transition-colors duration-150">
      {/* Fixed Top Header */}
      <FixedTopHeader
        onOpenSideMenu={() => openDrawerWithCategory('all')}
        selectedPaksha={selectedPaksha}
        selectedDay={selectedDay}
        selectedCalendarDate={selectedCalendarDate}
        locationName={locationName}
        selectedBird={selectedBird}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        timeDisplayMode={timeDisplayMode}
        onToggleTimeDisplayMode={handleToggleTimeDisplayMode}
        tzAbbreviation={tzAbbreviation}
        dayMeta={dayMeta}
        runningJamaNumber={runningJamaNumber}
        onOpenCalendar={() => {
          if (activeTab !== 'calendar') {
            handleSelectTab('calendar');
          } else {
            setIsCalendarModalOpen(true);
          }
        }}
      />

      {/* Main View Area with Dedicated Independent Screen Components */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-5 lg:px-6 pt-16 pb-16">
        {/* Screen 1: 10 Jamas Screen */}
        {activeTab === 'jamas' && (
          <JamasScreen
            selectedBird={selectedBird}
            selectedPaksha={selectedPaksha}
            selectedDay={selectedDay}
            locationName={locationName}
            runningJamaNumber={runningJamaNumber}
            timeDisplayMode={timeDisplayMode}
            displayJamasList={displayJamasList}
            activeCurrentMinutes={activeCurrentMinutes}
            expandedJamas={expandedJamas}
            onToggleJama={handleToggleJama}
            onExpandRunningOnly={() => setExpandedJamas([runningJamaNumber])}
            onToggleExpandAll={() => {
              if (expandedJamas.length === 10) {
                setExpandedJamas([runningJamaNumber]);
              } else {
                setExpandedJamas([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
              }
            }}
            onNavigateToTab={(tab) => handleSelectTab(tab)}
            selectedCalendarDate={selectedCalendarDate}
            dayMeta={dayMeta}
            onSelectBird={(id) => setSelectedBird(id)}
          />
        )}

        {/* Screen 2: Dedicated Bird Selection & Relationships Screen */}
        {activeTab === 'bird' && (
          <BirdScreen
            selectedBird={selectedBird}
            onSelectBird={(id) => setSelectedBird(id)}
            dayMeta={dayMeta}
            paksha={selectedPaksha}
            customJamas={displayJamasList}
            currentMinutes={activeCurrentMinutes}
            isOtherLocation={isOtherLocation}
            timeDisplayMode={timeDisplayMode}
            tzAbbreviation={tzAbbreviation}
            locationName={locationName}
          />
        )}

        {/* Screen 3: Dedicated Location & Solar Timings Screen */}
        {activeTab === 'location' && (
          <LocationScreen
            sunriseTime={sunriseTime}
            sunsetTime={sunsetTime}
            nextSunriseTime={nextSunriseTime}
            displaySunrise={displaySunrise}
            displaySunset={displaySunset}
            displayNextSunrise={displayNextSunrise}
            isCustomSchedule={isCustomSchedule}
            onApplySunriseSunset={handleApplySunriseSunset}
            onResetSchedule={handleResetSchedule}
            locationName={locationName}
            baseJamas={baseJamasResult.jamas}
            isOtherLocation={isOtherLocation}
            timeDisplayMode={timeDisplayMode}
            onToggleTimeDisplayMode={handleToggleTimeDisplayMode}
            tzAbbreviation={tzAbbreviation}
            timeDifferenceText={timeDifferenceText}
            localDayName={liveClocks.targetMoment.dayName}
            localDateText={liveClocks.targetMoment.dateString}
            localPakshaText={getPakshaName(selectedPaksha)}
            localTimeText={liveClocks.targetMoment.timeString}
          />
        )}

        {/* Screen 4: Dedicated Date, Paksha & Calendar Screen */}
        {activeTab === 'calendar' && (
          <CalendarScreen
            selectedPaksha={selectedPaksha}
            selectedDay={selectedDay}
            onSelectPakshaAndDay={handleSelectPakshaAndDay}
            onCustomDayUploaded={handleCustomDayUploaded}
            onOpenCalendar={() => setIsCalendarModalOpen(true)}
            selectedDate={selectedCalendarDate}
            locationLat={locationLat}
            locationLng={locationLng}
            locationName={locationName}
            locationTimezoneOffset={locationTimezoneOffset}
            timeDisplayMode={timeDisplayMode}
            sunriseTime={displaySunrise}
            sunsetTime={displaySunset}
            nextSunriseTime={displayNextSunrise}
          />
        )}
      </main>

      {/* Side Navigation Drawer */}
      <SideNavigationDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        initialCategory={drawerCategory}
        selectedPaksha={selectedPaksha}
        selectedDay={selectedDay}
        selectedCalendarDate={selectedCalendarDate}
        onSelectPakshaAndDay={handleSelectPakshaAndDay}
        onCustomDayUploaded={handleCustomDayUploaded}
        onOpenCalendarModal={() => {
          setIsCalendarModalOpen(true);
        }}
        sunriseTime={sunriseTime}
        sunsetTime={sunsetTime}
        nextSunriseTime={nextSunriseTime}
        displaySunrise={displaySunrise}
        displaySunset={displaySunset}
        displayNextSunrise={displayNextSunrise}
        isCustomSchedule={isCustomSchedule}
        onApplySunriseSunset={handleApplySunriseSunset}
        onResetSchedule={handleResetSchedule}
        locationName={locationName}
        baseJamas={baseJamasResult.jamas}
        isOtherLocation={isOtherLocation}
        timeDisplayMode={timeDisplayMode}
        onToggleTimeDisplayMode={handleToggleTimeDisplayMode}
        tzAbbreviation={tzAbbreviation}
        timeDifferenceText={timeDifferenceText}
        localDayName={liveClocks.targetMoment.dayName}
        localDateText={liveClocks.targetMoment.dateString}
        localPakshaText={getPakshaName(selectedPaksha)}
        localTimeText={liveClocks.targetMoment.timeString}
        selectedBird={selectedBird}
        onSelectBird={(birdId: BirdId) => setSelectedBird(birdId)}
        dayMeta={dayMeta}
        onOpenAnalyticsModal={(tab) => {
          openAnalyticsTab(tab);
        }}
        onOpenLookupModal={() => {
          setIsLookupModalOpen(true);
        }}
      />

      {/* Full-Screen / Modal Analytics (Chart, Master Table, Bird Relationships) */}
      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        initialTab={analyticsInitialTab}
        selectedBird={selectedBird}
        onSelectBird={(birdId: BirdId) => setSelectedBird(birdId)}
        displayJamasList={displayJamasList}
        displaySunrise={displaySunrise}
        displaySunset={displaySunset}
        displayNextSunrise={displayNextSunrise}
        selectedPaksha={selectedPaksha}
      />

      {/* Time Lookup Modal */}
      <TimeLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        selectedBird={selectedBird}
        customJamas={displayJamasList}
        onApplySunriseSunset={handleApplySunriseSunset}
        currentSunrise={sunriseTime}
        currentSunset={sunsetTime}
        currentNextSunrise={nextSunriseTime}
        isCustomSchedule={isCustomSchedule}
        onResetSchedule={handleResetSchedule}
        locationName={locationName}
      />

      {/* Real-Time Astronomical & Panchang Calendar Modal */}
      <RealTimeCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        currentPaksha={selectedPaksha}
        currentDay={selectedDay}
        onSelectPakshaAndDay={handleSelectPakshaAndDay}
        selectedDate={selectedCalendarDate}
        locationLat={locationLat}
        locationLng={locationLng}
        locationName={locationName}
        locationTimezoneOffset={locationTimezoneOffset}
        timeDisplayMode={timeDisplayMode}
        sunriseTime={displaySunrise}
        sunsetTime={displaySunset}
        nextSunriseTime={displayNextSunrise}
      />

      {/* Quick Bird Selection Modal */}
      <BirdSelectModal
        isOpen={isBirdSelectModalOpen}
        onClose={() => setIsBirdSelectModalOpen(false)}
        selectedBird={selectedBird}
        onSelectBird={(id: BirdId) => setSelectedBird(id)}
      />

      {/* Fixed Native-Style Bottom Navigation Bar: Independent View Switching */}
      <FixedBottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        selectedBird={selectedBird}
        locationName={locationName}
        selectedCalendarDate={selectedCalendarDate}
        selectedPaksha={selectedPaksha}
        selectedDay={selectedDay}
      />
    </div>
  );
}
