import { BirdId, Jama, PakshaType, DayOfWeek, ActivityType } from '../types';
import { BIRDS, ALL_BIRD_IDS, ACTIVITY_DETAILS } from '../data/panchaPakshiData';
import { getBirdRelationship, getRelationshipTag } from '../data/birdRelationships';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExcelExportOptions {
  selectedBird?: BirdId;
  paksha?: PakshaType;
  selectedDay?: DayOfWeek;
  selectedCalendarDate?: Date | null;
  locationName?: string;
  timeDisplayMode?: 'local' | 'ist';
  language?: 'en' | 'ta';
  format?: 'detailed' | 'compact';
}

export interface GeneratedExcelData {
  tsv: string;
  html: string;
  csv: string;
  totalJamas: number;
  totalRows: number;
}

/**
 * Generates TSV, HTML Table, and CSV representations of selected Jamas comparing all 5 birds.
 */
export function generateJamasExcelData(
  jamas: Jama[],
  options: ExcelExportOptions = {}
): GeneratedExcelData {
  const {
    paksha = 'valarpirai',
    selectedDay = 'sunday',
    selectedCalendarDate = new Date(),
    locationName = 'Chennai',
    timeDisplayMode = 'local',
    language = 'en',
    format = 'detailed',
  } = options;

  const sortedJamas = [...jamas].sort((a, b) => a.jamaNumber - b.jamaNumber);
  const birdKeys: BirdId[] = ALL_BIRD_IDS;

  const dateStr = selectedCalendarDate
    ? new Date(selectedCalendarDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const pakshaLabel =
    paksha === 'valarpirai'
      ? language === 'ta'
        ? 'வளர்பிறை (Sukla Paksha)'
        : 'Valarpirai (Sukla Paksha)'
      : language === 'ta'
      ? 'தேய்பிறை (Krishna Paksha)'
      : 'Theipirai (Krishna Paksha)';

  const dayLabel = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
  const timeModeLabel = timeDisplayMode === 'ist' ? 'IST (+05:30)' : 'Local Solar Time';

  // Helper translations
  const getBilingualBirdName = (bId: BirdId): string => {
    const b = BIRDS[bId];
    return `${b.name} (${b.tamilName.split(' ')[0]})`;
  };

  const getBilingualActName = (act: string): string => {
    const a = ACTIVITY_DETAILS[act as keyof typeof ACTIVITY_DETAILS];
    return a ? `${a.activity} (${a.tamilName.split(' ')[0]})` : act;
  };

  // --- TSV GENERATION ---
  const tsvLines: string[] = [];

  // Metadata Header Block
  tsvLines.push(`Pancha Pakshi Shastra - 5 Birds Comparison Schedule`);
  tsvLines.push(`Date:\t${dateStr}\tPaksha:\t${pakshaLabel}\tDay:\t${dayLabel}`);
  tsvLines.push(`Location:\t${locationName}\tTime Mode:\t${timeModeLabel}\tSelected Jamas:\t${sortedJamas.length}`);
  tsvLines.push(`Relationship Legend:\tS = Self (சுயம்)\tF = Friend (நட்பு)\tE = Enemy (பகை)`);
  tsvLines.push(``); // Blank line

  if (format === 'compact') {
    // Compact: 1 column per bird with formatted string
    const compactHeaders = [
      'Jama #',
      'Period',
      'Jama Time',
      'Sub #',
      'Sub Time',
      'Duration',
      ...birdKeys.map((bKey) => {
        const firstJama = sortedJamas[0];
        const mainAct = firstJama ? firstJama.columns[bKey].mainActivity : '';
        return `${getBilingualBirdName(bKey)} [Main: ${mainAct}]`;
      }),
    ];
    tsvLines.push(compactHeaders.join('\t'));

    sortedJamas.forEach((jama) => {
      const periodLabel = jama.isDay ? 'Day' : 'Night';
      [0, 1, 2, 3, 4].forEach((subIdx) => {
        const rowCells: string[] = [
          `Jama ${jama.jamaNumber}`,
          periodLabel,
          `${jama.startTime} - ${jama.endTime}`,
          `Sub ${subIdx + 1}`,
          `${jama.columns[birdKeys[0]].subPeriods[subIdx].startTime} - ${jama.columns[birdKeys[0]].subPeriods[subIdx].endTime}`,
          `${jama.columns[birdKeys[0]].subPeriods[subIdx].durationMinutes}m`,
        ];

        birdKeys.forEach((bKey) => {
          const sp = jama.columns[bKey].subPeriods[subIdx];
          const rel = getBirdRelationship(bKey, sp.birdId, paksha);
          const tagInfo = getRelationshipTag(rel);
          const subBirdName = BIRDS[sp.birdId].name;
          rowCells.push(`${subBirdName}-${sp.activity} [${tagInfo.tag}] ${sp.star}★`);
        });

        tsvLines.push(rowCells.join('\t'));
      });
    });
  } else {
    // Detailed: Separate Activity, Tag, Stars columns for each bird
    const detailedHeaders = [
      'Jama #',
      'Jama Title',
      'Period',
      'Jama Time',
      'Sub #',
      'Sub Time',
      'Duration',
      ...birdKeys.flatMap((bKey) => {
        const bName = BIRDS[bKey].name;
        return [`${bName} Sub-Bird & Activity`, `${bName} Tag (S/F/E)`, `${bName} Stars`];
      }),
    ];
    tsvLines.push(detailedHeaders.join('\t'));

    sortedJamas.forEach((jama) => {
      const periodLabel = jama.isDay ? 'Day' : 'Night';
      [0, 1, 2, 3, 4].forEach((subIdx) => {
        const refSp = jama.columns[birdKeys[0]].subPeriods[subIdx];
        const rowCells: string[] = [
          String(jama.jamaNumber),
          jama.title,
          periodLabel,
          `${jama.startTime} - ${jama.endTime}`,
          String(subIdx + 1),
          `${refSp.startTime} - ${refSp.endTime}`,
          `${refSp.durationMinutes}m`,
        ];

        birdKeys.forEach((bKey) => {
          const sp = jama.columns[bKey].subPeriods[subIdx];
          const rel = getBirdRelationship(bKey, sp.birdId, paksha);
          const tagInfo = getRelationshipTag(rel);
          const subBirdName = BIRDS[sp.birdId].name;

          rowCells.push(`${subBirdName} - ${getBilingualActName(sp.activity)}`);
          rowCells.push(tagInfo.tag);
          rowCells.push(`${sp.star}★`);
        });

        tsvLines.push(rowCells.join('\t'));
      });
    });
  }

  const tsv = tsvLines.join('\n');

  // --- CSV GENERATION ---
  // Standard RFC 4180 CSV with quotes
  const csvEscape = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csv = tsvLines
    .map((line) =>
      line
        .split('\t')
        .map(csvEscape)
        .join(',')
    )
    .join('\n');

  // --- HTML TABLE GENERATION (For formatted Excel & Google Sheets pasting) ---
  const htmlParts: string[] = [];

  htmlParts.push(`<!DOCTYPE html><html><head><meta charset="utf-8">`);
  htmlParts.push(`<style>
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1; }
    th { background-color: #1B4332; color: #ffffff; padding: 8px 10px; font-weight: bold; border: 1px solid #94a3b8; text-align: center; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; vertical-align: middle; }
    .jama-header { background-color: #F5EFE4; font-weight: bold; color: #0f172a; border-top: 2px solid #1B4332; }
    .tag-self { background-color: #E0F2FE; color: #0369a1; font-weight: bold; text-align: center; }
    .tag-friend { background-color: #D1FAE5; color: #047857; font-weight: bold; text-align: center; }
    .tag-enemy { background-color: #FFE4E6; color: #be123c; font-weight: bold; text-align: center; }
    .star-cell { color: #d97706; font-weight: bold; text-align: center; font-family: monospace; }
    .meta-box { background-color: #FAF6EF; padding: 12px; border: 1px solid #D9CFBD; margin-bottom: 16px; border-radius: 8px; }
  </style></head><body>`);

  htmlParts.push(`<div class="meta-box">`);
  htmlParts.push(`<h2 style="margin: 0 0 6px 0; color: #1B4332; font-size: 14pt;">Pancha Pakshi Shastra - 5 Birds Comparison Schedule</h2>`);
  htmlParts.push(`<p style="margin: 2px 0; font-size: 10pt; color: #475569;">
    <strong>Date:</strong> ${dateStr} &nbsp;|&nbsp; 
    <strong>Paksha:</strong> ${pakshaLabel} &nbsp;|&nbsp; 
    <strong>Day:</strong> ${dayLabel} &nbsp;|&nbsp; 
    <strong>Location:</strong> ${locationName} (${timeModeLabel})
  </p>`);
  htmlParts.push(`<p style="margin: 4px 0 0 0; font-size: 9.5pt; color: #64748b;">
    <strong>Sub-Period Relationship Legend:</strong> 
    <span style="background-color: #E0F2FE; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">S = Self (சுயம்)</span> &nbsp;
    <span style="background-color: #D1FAE5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: bold;">F = Friend (நட்பு)</span> &nbsp;
    <span style="background-color: #FFE4E6; color: #be123c; padding: 2px 6px; border-radius: 4px; font-weight: bold;">E = Enemy (பகை)</span>
  </p>`);
  htmlParts.push(`</div>`);

  htmlParts.push(`<table border="1"><thead>`);

  // Two-tier header
  htmlParts.push(`<tr>`);
  htmlParts.push(`<th rowspan="2">Jama</th>`);
  htmlParts.push(`<th rowspan="2">Period</th>`);
  htmlParts.push(`<th rowspan="2">Sub #</th>`);
  htmlParts.push(`<th rowspan="2">Sub Period Time</th>`);
  htmlParts.push(`<th rowspan="2">Duration</th>`);

  birdKeys.forEach((bKey) => {
    const b = BIRDS[bKey];
    htmlParts.push(`<th colspan="3" style="background-color: #1B4332; color: #ffffff;">${b.name} (${b.tamilName.split(' ')[0]})</th>`);
  });
  htmlParts.push(`</tr>`);

  // Second header row: Activity, Tag, Stars for each bird
  htmlParts.push(`<tr>`);
  birdKeys.forEach((bKey) => {
    const firstJama = sortedJamas[0];
    const mainAct = firstJama ? firstJama.columns[bKey].mainActivity : '';
    htmlParts.push(`<th style="background-color: #2D6A4F; font-size: 9.5pt;">Sub-Activity [Main: ${mainAct}]</th>`);
    htmlParts.push(`<th style="background-color: #2D6A4F; font-size: 9.5pt;">Tag</th>`);
    htmlParts.push(`<th style="background-color: #2D6A4F; font-size: 9.5pt;">Stars</th>`);
  });
  htmlParts.push(`</tr></thead><tbody>`);

  sortedJamas.forEach((jama, jIdx) => {
    const periodLabel = jama.isDay ? 'Day / பகல்' : 'Night / இரவு';
    const periodBg = jama.isDay ? '#FFFBEB' : '#F1F5F9';

    // Jama separator summary banner
    htmlParts.push(`<tr class="jama-header" style="background-color: ${periodBg};">`);
    htmlParts.push(`<td colspan="${5 + birdKeys.length * 3}" style="padding: 8px 12px; font-size: 11pt; border-top: 2px solid #1B4332;">
      <strong>Jama ${jama.jamaNumber}: ${jama.title}</strong> &nbsp;
      (${jama.startTime} – ${jama.endTime}) &nbsp;
      <span style="font-size: 9.5pt; font-weight: normal; color: #475569;">[${periodLabel}]</span>
    </td>`);
    htmlParts.push(`</tr>`);

    [0, 1, 2, 3, 4].forEach((subIdx) => {
      const refSp = jama.columns[birdKeys[0]].subPeriods[subIdx];
      const rowBg = subIdx % 2 === 0 ? '#FFFFFF' : '#FAF6EF';

      htmlParts.push(`<tr style="background-color: ${rowBg};">`);
      htmlParts.push(`<td style="text-align: center; font-weight: bold;">${jama.jamaNumber}</td>`);
      htmlParts.push(`<td style="text-align: center; font-size: 9.5pt;">${jama.isDay ? 'Day' : 'Night'}</td>`);
      htmlParts.push(`<td style="text-align: center; font-weight: bold;">${subIdx + 1}</td>`);
      htmlParts.push(`<td style="text-align: center; font-family: monospace;">${refSp.startTime} - ${refSp.endTime}</td>`);
      htmlParts.push(`<td style="text-align: center;">${refSp.durationMinutes}m</td>`);

      birdKeys.forEach((bKey) => {
        const sp = jama.columns[bKey].subPeriods[subIdx];
        const rel = getBirdRelationship(bKey, sp.birdId, paksha);
        const tagInfo = getRelationshipTag(rel);
        const subBird = BIRDS[sp.birdId].name;
        const actName = getBilingualActName(sp.activity);

        let tagClass = 'tag-neutral';
        if (tagInfo.tag === 'S') tagClass = 'tag-self';
        else if (tagInfo.tag === 'F') tagClass = 'tag-friend';
        else if (tagInfo.tag === 'E') tagClass = 'tag-enemy';

        htmlParts.push(`<td><strong>${subBird}</strong> - ${actName}</td>`);
        htmlParts.push(`<td class="${tagClass}" style="text-align: center;">${tagInfo.tag}</td>`);
        htmlParts.push(`<td class="star-cell">${sp.star}★</td>`);
      });

      htmlParts.push(`</tr>`);
    });
  });

  htmlParts.push(`</tbody></table></body></html>`);
  const html = htmlParts.join('\n');

  return {
    tsv,
    html,
    csv,
    totalJamas: sortedJamas.length,
    totalRows: sortedJamas.length * 5,
  };
}

/**
 * Copies the 5-birds comparison table for selected Jamas to the user's clipboard.
 * Uses modern ClipboardItem API with HTML and plain text (TSV) mime types,
 * allowing instant formatted paste into Microsoft Excel and Google Sheets.
 * Includes multiple fallbacks for mobile / Android compatibility.
 */
export async function copyJamasToExcelClipboard(
  jamas: Jama[],
  options: ExcelExportOptions = {}
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!jamas || jamas.length === 0) {
    return { success: false, count: 0, error: 'No Jamas selected to copy' };
  }

  const { tsv, html, totalJamas } = generateJamasExcelData(jamas, options);

  try {
    // 1. Primary method: ClipboardItem with text/html and text/plain (best for Excel)
    if (navigator.clipboard && typeof navigator.clipboard.write === 'function' && typeof ClipboardItem !== 'undefined') {
      try {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([tsv], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        });
        await navigator.clipboard.write([item]);
        return { success: true, count: totalJamas };
      } catch (itemErr) {
        // Some browsers disallow text/html or throw; proceed to fallback
        console.warn('ClipboardItem write failed, trying writeText fallback', itemErr);
      }
    }

    // 2. Secondary method: navigator.clipboard.writeText (TSV pastes cleanly into Excel)
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(tsv);
      return { success: true, count: totalJamas };
    }

    // 3. Tertiary fallback for older Android browsers / WebViews: execCommand('copy')
    const textarea = document.createElement('textarea');
    textarea.value = tsv;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      return { success: true, count: totalJamas };
    }

    throw new Error('Clipboard permissions denied or not supported');
  } catch (err: any) {
    console.error('Failed to copy to clipboard', err);
    return {
      success: false,
      count: totalJamas,
      error: err?.message || 'Failed to copy to clipboard',
    };
  }
}

/**
 * Downloads the 5-birds comparison table as a CSV file with UTF-8 BOM for Microsoft Excel.
 */
export function downloadJamasCsv(
  jamas: Jama[],
  options: ExcelExportOptions = {},
  filename = 'pancha_pakshi_5_birds_jamas.csv'
): boolean {
  if (!jamas || jamas.length === 0) return false;

  const { csv } = generateJamasExcelData(jamas, options);
  // Add UTF-8 BOM (\uFEFF) so Excel opens UTF-8 characters (Tamil etc.) correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Renders an exact replica of the app's 5-birds calculation table
 * with side-by-side bird columns, activity pills, relationship tags,
 * and timings for rasterization via html2canvas and jsPDF.
 */
function createExportDomElement(
  jamas: Jama[],
  options: ExcelExportOptions
): HTMLDivElement {
  const {
    selectedBird = 'vulture',
    paksha = 'valarpirai',
    selectedDay = 'sunday',
    selectedCalendarDate = new Date(),
    locationName = 'Chennai',
    timeDisplayMode = 'local',
    language = 'en',
  } = options;

  const sortedJamas = [...jamas].sort((a, b) => a.jamaNumber - b.jamaNumber);
  const birdKeys: BirdId[] = ALL_BIRD_IDS;

  const dateStr = selectedCalendarDate
    ? new Date(selectedCalendarDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const pakshaLabel =
    paksha === 'valarpirai'
      ? language === 'ta'
        ? 'வளர்பிறை (Sukla Paksha)'
        : 'Valarpirai (Sukla Paksha)'
      : language === 'ta'
      ? 'தேய்பிறை (Krishna Paksha)'
      : 'Theipirai (Krishna Paksha)';

  const dayLabel = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
  const dayTamilMap: Record<string, string> = {
    sunday: 'ஞாயிறு',
    monday: 'திங்கள்',
    tuesday: 'செவ்வாய்',
    wednesday: 'புதன்',
    thursday: 'வியாழன்',
    friday: 'வெள்ளி',
    saturday: 'சனி',
  };
  const dayTamil = dayTamilMap[selectedDay] || '';
  const timeModeLabel = timeDisplayMode === 'ist' ? 'IST (+05:30)' : 'Local Solar Time';

  const minJama = sortedJamas[0]?.jamaNumber ?? 1;
  const maxJama = sortedJamas[sortedJamas.length - 1]?.jamaNumber ?? 1;
  const rangeTitle =
    sortedJamas.length === 1
      ? language === 'ta'
        ? `சாமம் ${minJama}`
        : `Jama ${minJama}`
      : language === 'ta'
      ? `சாமங்கள் ${minJama} முதல் ${maxJama} வரை`
      : `Jamas ${minJama} to ${maxJama}`;

  const activeBirdName = BIRDS[selectedBird]
    ? `${BIRDS[selectedBird].name} (${BIRDS[selectedBird].tamilName.split(' ')[0]})`
    : selectedBird;

  // Helper for activity styling matching the app
  const getActivityStyles = (act: ActivityType | string) => {
    switch (act) {
      case 'Rule':
        return { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7', ta: 'அரசு', en: 'Ruling' };
      case 'Eat':
        return { bg: '#CCFBF1', color: '#115E59', border: '#5EEAD4', ta: 'ஊண்', en: 'Eating' };
      case 'Walk':
        return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', ta: 'நடை', en: 'Walking' };
      case 'Sleep':
        return { bg: '#E0E7FF', color: '#3730A3', border: '#A5B4FC', ta: 'துயில்', en: 'Sleeping' };
      case 'Die':
        return { bg: '#FFE4E6', color: '#9F1239', border: '#FDA4AF', ta: 'சாவு', en: 'Dying' };
      default:
        return { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1', ta: String(act), en: String(act) };
    }
  };

  // Helper for relationship tag styling matching the app
  const getTagStyles = (tag: string) => {
    switch (tag) {
      case 'S':
        return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', labelTa: 'சுயம்', labelEn: 'Self' };
      case 'F':
        return { bg: '#D1FAE5', color: '#047857', border: '#A7F3D0', labelTa: 'நட்பு', labelEn: 'Friend' };
      case 'E':
        return { bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3', labelTa: 'பகை', labelEn: 'Enemy' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', labelTa: 'நடுநிலை', labelEn: 'Neutral' };
    }
  };

  const container = document.createElement('div');
  container.id = 'pancha-pakshi-export-root';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1160px';
  container.style.backgroundColor = '#FAF6EF';
  container.style.color = '#0F172A';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
  container.style.padding = '18px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  let html = '';

  sortedJamas.forEach((jama) => {
    const periodBg = jama.isDay ? '#C29738' : '#133E46';
    const periodLabel = jama.isDay
      ? language === 'ta'
        ? 'பகல் சாமம் (Day)'
        : 'Day Period (பகல்)'
      : language === 'ta'
      ? 'இரவு சாமம் (Night)'
      : 'Night Period (இரவு)';

    html += `
      <div class="export-jama-wrapper" style="background-color: #FAF6EF; padding: 14px; border: 1px solid #D9CFBD; border-radius: 14px; margin-bottom: 22px; box-sizing: border-box; width: 1124px;">
        <!-- Top App-Style Header Card -->
        <div style="background-color: #FAF6EF; border: 1.5px solid #D9CFBD; border-radius: 12px; padding: 12px 18px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background-color: #1B4332;"></span>
              <h2 style="margin: 0; color: #1B4332; font-size: 15px; font-weight: 800; letter-spacing: -0.01em;">
                ${
                  language === 'ta'
                    ? 'பஞ்ச பட்சி சாஸ்திரம் - 5 பட்சிகள் நேரடி ஒப்பீட்டு அட்டவணை'
                    : 'Pancha Pakshi Shastra - 5 Birds Side-by-Side Comparison'
                }
              </h2>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background-color: rgba(27, 67, 50, 0.1); color: #1B4332; border: 1px solid rgba(27, 67, 50, 0.3); font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 9999px;">
                ${language === 'ta' ? 'தேர்வு:' : 'Active Highlight:'} ${activeBirdName}
              </span>
              <span style="background-color: #1B4332; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 6px;">
                ${rangeTitle}
              </span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569; padding-top: 6px; border-top: 1px solid #EFE7DA;">
            <div>
              <strong style="color: #0F172A;">${dateStr}</strong> &nbsp;•&nbsp; 
              <span>${pakshaLabel}</span> &nbsp;•&nbsp; 
              <span>${dayLabel} (${dayTamil})</span> &nbsp;•&nbsp; 
              <span>${locationName} (${timeModeLabel})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 10.5px;">
              <strong style="color: #0F172A;">${language === 'ta' ? 'உறவு:' : 'Tags:'}</strong>
              <span style="background-color: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">S = சுயம் (Self)</span>
              <span style="background-color: #D1FAE5; color: #047857; border: 1px solid #A7F3D0; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">F = நட்பு (Friend)</span>
              <span style="background-color: #FFE4E6; color: #BE123C; border: 1px solid #FECDD3; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">E = பகை (Enemy)</span>
            </div>
          </div>
        </div>

        <!-- Individual Jama Card Container (Exact Replica of App) -->
        <div style="background-color: #FAF6EF; border: 1.5px solid #D9CFBD; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
          <!-- Jama Card Header Banner -->
          <div style="background-color: #EFE7DA; padding: 10px 16px; border-bottom: 1.5px solid #D9CFBD; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${periodBg};"></span>
              <span style="font-size: 13.5px; font-weight: 800; color: #0F172A;">${jama.title}</span>
              <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #475569;">(${jama.startTime} – ${jama.endTime})</span>
            </div>
            <div style="background-color: #FAF6EF; border: 1px solid #D9CFBD; border-radius: 9999px; padding: 2px 10px; font-size: 11px; font-weight: 700; color: #334155;">
              ${periodLabel}
            </div>
          </div>

          <!-- 5 Bird Columns Table -->
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="background-color: #FAF6EF; border-bottom: 1.5px solid #D9CFBD;">
    `;

    birdKeys.forEach((bKey, bIdx) => {
      const col = jama.columns[bKey];
      const bInfo = BIRDS[bKey];
      const isSelected = bKey === selectedBird;
      const actDetail = ACTIVITY_DETAILS[col.mainActivity];
      const actName =
        language === 'ta'
          ? `${actDetail.tamilName.split(' ')[0]} / ${actDetail.activity}`
          : `${actDetail.activity} (${actDetail.tamilName.split(' ')[0]})`;
      const isLastCol = bIdx === birdKeys.length - 1;

      html += `
        <th style="width: 20%; padding: 10px 12px; text-align: left; vertical-align: middle; border-right: ${
          isLastCol ? 'none' : '1px solid #D9CFBD'
        }; ${
          isSelected
            ? 'background-color: rgba(27, 67, 50, 0.08); border-top: 3px solid #1B4332;'
            : ''
        }">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: ${bInfo.color};"></span>
              <span style="font-size: 12.5px; font-weight: 800; color: ${isSelected ? '#1B4332' : '#0F172A'};">
                ${bInfo.name}
              </span>
              <span style="font-size: 11px; font-weight: 600; color: #64748B;">
                (${bInfo.tamilName.split(' ')[0]})
              </span>
            </div>
            ${
              isSelected
                ? `<span style="background-color: #1B4332; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 9999px;">Active</span>`
                : ''
            }
          </div>
          <div style="font-size: 10.5px; font-weight: 600; color: #475569; margin-top: 2px;">
            Main: <strong style="color: #0F172A;">${actName}</strong>
          </div>
        </th>
      `;
    });

    html += `</tr></thead><tbody>`;

    // 5 Sub-period Rows
    [0, 1, 2, 3, 4].forEach((subRowIdx) => {
      const isLastRow = subRowIdx === 4;
      html += `<tr style="border-bottom: ${isLastRow ? 'none' : '1px solid #E2D9C8'};">`;

      birdKeys.forEach((bKey, bIdx) => {
        const sp = jama.columns[bKey].subPeriods[subRowIdx];
        const isSelected = bKey === selectedBird;
        const subBird = BIRDS[sp.birdId];
        const actStyle = getActivityStyles(sp.activity);
        const rel = getBirdRelationship(bKey, sp.birdId, paksha);
        const tagInfo = getRelationshipTag(rel);
        const tagStyle = getTagStyles(tagInfo.tag);
        const isLastCol = bIdx === birdKeys.length - 1;

        const subBirdName =
          language === 'ta'
            ? `${subBird.tamilName.split(' ')[0]} (${subBird.name})`
            : `${subBird.name} (${subBird.tamilName.split(' ')[0]})`;

        const actLabel =
          language === 'ta'
            ? `${actStyle.ta} (${actStyle.en})`
            : `${actStyle.en} (${actStyle.ta})`;

        html += `
          <td style="width: 20%; padding: 8px 10px; vertical-align: top; border-right: ${
            isLastCol ? 'none' : '1px solid #E2D9C8'
          }; ${
            isSelected ? 'background-color: rgba(27, 67, 50, 0.04);' : 'background-color: #FAF6EF;'
          }">
            <!-- Top Line: Sub-bird name + Relationship Tag + Star Rating -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 5px; min-width: 0;">
                <span style="font-size: 11.5px; font-weight: 800; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${subBirdName}
                </span>
                <span title="${tagStyle.labelEn} / ${tagStyle.labelTa}" style="display: inline-block; background-color: ${tagStyle.bg}; color: ${tagStyle.color}; border: 1px solid ${tagStyle.border}; font-size: 8.5px; font-weight: 900; padding: 1px 4px; border-radius: 3px;">
                  ${tagInfo.tag}
                </span>
              </div>
              <span style="color: #C29738; font-family: monospace; font-weight: 800; font-size: 12px; margin-left: 4px;">
                ${sp.star}★
              </span>
            </div>

            <!-- Middle Line: Activity Pill Badge + Duration -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; background-color: ${actStyle.bg}; color: ${actStyle.color}; border: 1px solid ${actStyle.border}; padding: 1px 7px; border-radius: 9999px; font-size: 9.5px; font-weight: 800;">
                ${actLabel}
              </span>
              <span style="font-family: monospace; font-size: 10px; color: #64748B; font-weight: 600;">
                ${sp.durationMinutes}m
              </span>
            </div>

            <!-- Bottom Line: Start and End Time -->
            <div style="font-family: monospace; font-size: 10px; color: #64748B; font-weight: 600;">
              ${sp.startTime} – ${sp.endTime}
            </div>
          </td>
        `;
      });

      html += `</tr>`;
    });

    html += `</tbody></table></div></div>`;
  });

  container.innerHTML = html;
  return container;
}

/**
 * Downloads the 5-birds comparison table as a high-resolution PDF file.
 * Each Jama is rendered onto its own pristine landscape A4 page,
 * exactly matching the app's visual presentation.
 */
export async function downloadJamasAsPdf(
  jamas: Jama[],
  options: ExcelExportOptions = {},
  filename?: string
): Promise<boolean> {
  if (!jamas || jamas.length === 0) return false;

  const sortedJamas = [...jamas].sort((a, b) => a.jamaNumber - b.jamaNumber);
  const minJama = sortedJamas[0].jamaNumber;
  const maxJama = sortedJamas[sortedJamas.length - 1].jamaNumber;
  const defaultFilename =
    sortedJamas.length === 1
      ? `pancha_pakshi_5_birds_jama_${minJama}.pdf`
      : `pancha_pakshi_5_birds_jamas_${minJama}_to_${maxJama}.pdf`;

  const container = createExportDomElement(sortedJamas, options);
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 841.89 pt
    const pageHeight = pdf.internal.pageSize.getHeight(); // 595.28 pt
    const margin = 20;
    const printWidth = pageWidth - margin * 2; // ~801.89 pt

    const jamaCards = container.querySelectorAll<HTMLElement>('.export-jama-wrapper');

    if (jamaCards.length === 0) {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FAF6EF',
      });
      const imgData = canvas.toDataURL('image/png');
      const printHeight = (canvas.height * printWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight);
    } else {
      for (let i = 0; i < jamaCards.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const cardElem = jamaCards[i];
        const canvas = await html2canvas(cardElem, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FAF6EF',
        });
        const imgData = canvas.toDataURL('image/png');
        const printHeight = (canvas.height * printWidth) / canvas.width;
        // Vertically centered or at top margin
        const yPos = printHeight < pageHeight - margin * 2 ? (pageHeight - printHeight) / 2 : margin;
        pdf.addImage(imgData, 'PNG', margin, yPos, printWidth, Math.min(printHeight, pageHeight - margin * 2));
      }
    }

    pdf.save(filename || defaultFilename);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF', err);
    return false;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Downloads the 5-birds comparison table as a high-resolution PNG image file,
 * exactly matching the app's visual presentation.
 */
export async function downloadJamasAsImage(
  jamas: Jama[],
  options: ExcelExportOptions = {},
  filename?: string
): Promise<boolean> {
  if (!jamas || jamas.length === 0) return false;

  const sortedJamas = [...jamas].sort((a, b) => a.jamaNumber - b.jamaNumber);
  const minJama = sortedJamas[0].jamaNumber;
  const maxJama = sortedJamas[sortedJamas.length - 1].jamaNumber;
  const defaultFilename =
    sortedJamas.length === 1
      ? `pancha_pakshi_5_birds_jama_${minJama}.png`
      : `pancha_pakshi_5_birds_jamas_${minJama}_to_${maxJama}.png`;

  const container = createExportDomElement(sortedJamas, options);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FAF6EF',
    });

    const imgUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename || defaultFilename;
    link.href = imgUrl;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to generate Image', err);
    return false;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Formats the 5-bird side-by-side comparison table as clean, human-readable plain text,
 * strictly respecting the user-defined Jama range and including all relationship tags,
 * stars, timings, and activities.
 */
export function formatComparisonAsText(
  jamas: Jama[],
  options: ExcelExportOptions = {}
): string {
  if (!jamas || jamas.length === 0) return '';

  const {
    selectedBird = 'vulture',
    paksha = 'valarpirai',
    selectedDay = 'sunday',
    selectedCalendarDate = new Date(),
    locationName = 'Chennai',
    timeDisplayMode = 'local',
  } = options;

  const sortedJamas = [...jamas].sort((a, b) => a.jamaNumber - b.jamaNumber);
  const birdKeys: BirdId[] = ALL_BIRD_IDS;

  const dateStr = selectedCalendarDate
    ? new Date(selectedCalendarDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const pakshaLabel =
    paksha === 'valarpirai'
      ? 'Valarpirai (Sukla Paksha / வளர்பிறை)'
      : 'Theipirai (Krishna Paksha / தேய்பிறை)';

  const dayLabel = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
  const dayTamilMap: Record<string, string> = {
    sunday: 'ஞாயிறு',
    monday: 'திங்கள்',
    tuesday: 'செவ்வாய்',
    wednesday: 'புதன்',
    thursday: 'வியாழன்',
    friday: 'வெள்ளி',
    saturday: 'சனி',
  };
  const dayTamil = dayTamilMap[selectedDay] || '';
  const timeModeLabel = timeDisplayMode === 'ist' ? 'IST (+05:30)' : 'Local Solar Time';

  const minJama = sortedJamas[0]?.jamaNumber ?? 1;
  const maxJama = sortedJamas[sortedJamas.length - 1]?.jamaNumber ?? 1;
  const rangeTitle =
    sortedJamas.length === 1
      ? `Jama ${minJama}`
      : `Jamas ${minJama} to ${maxJama} (${sortedJamas.length} Jamas)`;

  const activeBirdName = BIRDS[selectedBird]
    ? `${BIRDS[selectedBird].name} (${BIRDS[selectedBird].tamilName.split(' ')[0]})`
    : selectedBird;

  const lines: string[] = [];

  lines.push('========================================================================================');
  lines.push('PANCHA PAKSHI SHASTRA - 5 BIRDS SIDE-BY-SIDE COMPARISON TABLE');
  lines.push(`Date: ${dateStr} | Paksha: ${pakshaLabel} | Day: ${dayLabel} (${dayTamil})`);
  lines.push(`Location: ${locationName} (${timeModeLabel}) | Active Highlight Bird: ${activeBirdName}`);
  lines.push(`Selected Range: ${rangeTitle}`);
  lines.push('Relationship Tags: [S] = Self (சுயம்) | [F] = Friend (நட்பு) | [E] = Enemy (பகை)');
  lines.push('========================================================================================\n');

  sortedJamas.forEach((jama) => {
    const periodLabel = jama.isDay ? 'Day Period (பகல்)' : 'Night Period (இரவு)';
    lines.push('----------------------------------------------------------------------------------------');
    lines.push(`JAMA ${jama.jamaNumber}: ${jama.title} [${periodLabel}] (${jama.startTime} – ${jama.endTime})`);
    lines.push('----------------------------------------------------------------------------------------');

    lines.push('Main Activities of 5 Birds:');
    birdKeys.forEach((bKey) => {
      const col = jama.columns[bKey];
      const bInfo = BIRDS[bKey];
      const actDetail = ACTIVITY_DETAILS[col.mainActivity];
      const isSel = bKey === selectedBird ? ' [ACTIVE SELECTION]' : '';
      lines.push(
        `  • ${bInfo.name.padEnd(8)} (${bInfo.tamilName.split(' ')[0]}) : ${actDetail.activity} (${actDetail.tamilName.split(' ')[0]})${isSel}`
      );
    });
    lines.push('');

    lines.push('Side-by-Side Sub-Period Breakdown:');
    [0, 1, 2, 3, 4].forEach((subIdx) => {
      const refSp = jama.columns[birdKeys[0]].subPeriods[subIdx];
      lines.push(`Sub-Period ${subIdx + 1} [${refSp.startTime} – ${refSp.endTime} | ${refSp.durationMinutes}m]:`);
      birdKeys.forEach((bKey) => {
        const sp = jama.columns[bKey].subPeriods[subIdx];
        const subBird = BIRDS[sp.birdId];
        const actDetail = ACTIVITY_DETAILS[sp.activity];
        const rel = getBirdRelationship(bKey, sp.birdId, paksha);
        const tagInfo = getRelationshipTag(rel);
        const isSel = bKey === selectedBird ? ' [Active Bird]' : '';
        lines.push(
          `  ├─ ${BIRDS[bKey].name.padEnd(7)} : ${subBird.name} (${subBird.tamilName.split(' ')[0]}) - ${actDetail.activity} (${actDetail.tamilName.split(' ')[0]}) [${tagInfo.tag}] ${sp.star}★${isSel}`
        );
      });
      lines.push('');
    });

    lines.push('Table Column View:');
    lines.push(
      `Time Range     Dur  ${BIRDS.vulture.name.padEnd(18)} ${BIRDS.owl.name.padEnd(18)} ${BIRDS.crow.name.padEnd(18)} ${BIRDS.cock.name.padEnd(18)} ${BIRDS.peacock.name.padEnd(18)}`
    );
    lines.push(
      `-------------------------------------------------------------------------------------------------------------------`
    );
    [0, 1, 2, 3, 4].forEach((subIdx) => {
      const refSp = jama.columns[birdKeys[0]].subPeriods[subIdx];
      const timeCol = `${refSp.startTime}–${refSp.endTime}`.padEnd(14);
      const durCol = `${refSp.durationMinutes}m`.padEnd(5);
      const birdCols = birdKeys
        .map((bKey) => {
          const sp = jama.columns[bKey].subPeriods[subIdx];
          const subBird = BIRDS[sp.birdId].name;
          const rel = getBirdRelationship(bKey, sp.birdId, paksha);
          const tagInfo = getRelationshipTag(rel);
          return `${subBird}-${sp.activity} [${tagInfo.tag}] ${sp.star}★`.padEnd(18);
        })
        .join(' ');
      lines.push(`${timeCol} ${durCol} ${birdCols}`);
    });
    lines.push('\n');
  });

  lines.push('========================================================================================');
  lines.push('Rule Durations:');
  lines.push('• Day: Rule 48m | Walk 36m | Eat 30m | Sleep 18m | Die 12m = 144m / Jama (Total 720m)');
  lines.push('• Night: Rule 24m | Eat 30m | Walk 30m | Sleep 24m | Die 36m = 144m / Jama (Total 720m)');
  lines.push('========================================================================================');

  return lines.join('\n');
}

/**
 * Copies the 5-bird side-by-side comparison table formatted as text to the clipboard,
 * respecting the user-defined Jama range.
 */
export async function copyComparisonTextToClipboard(
  jamas: Jama[],
  options: ExcelExportOptions = {}
): Promise<{ success: boolean; count: number; text: string }> {
  if (!jamas || jamas.length === 0) {
    return { success: false, count: 0, text: '' };
  }

  const sortedJamas = [...jamas].sort((a, b) => a.jamaNumber - b.jamaNumber);
  const formattedText = formatComparisonAsText(sortedJamas, options);
  const { html } = generateJamasExcelData(sortedJamas, options);

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      if (typeof ClipboardItem !== 'undefined') {
        try {
          const textBlob = new Blob([formattedText], { type: 'text/plain' });
          const htmlBlob = new Blob([html], { type: 'text/html' });
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': textBlob,
              'text/html': htmlBlob,
            }),
          ]);
          return { success: true, count: sortedJamas.length, text: formattedText };
        } catch {
          // If write with Blob fails in some browsers/iframes, fallback to writeText
          await navigator.clipboard.writeText(formattedText);
          return { success: true, count: sortedJamas.length, text: formattedText };
        }
      }
      await navigator.clipboard.writeText(formattedText);
      return { success: true, count: sortedJamas.length, text: formattedText };
    }

    // Fallback for older environments
    const textarea = document.createElement('textarea');
    textarea.value = formattedText;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: successful, count: sortedJamas.length, text: formattedText };
  } catch (err) {
    console.error('Failed to copy comparison text', err);
    try {
      await navigator.clipboard.writeText(formattedText);
      return { success: true, count: sortedJamas.length, text: formattedText };
    } catch {
      return { success: false, count: 0, text: '' };
    }
  }
}
