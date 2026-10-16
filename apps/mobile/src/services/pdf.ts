import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getLocales } from 'expo-localization';
import { area as d3area, curveMonotoneX, line as d3line } from 'd3-shape';
import { Platform } from 'react-native';

import {
  addDays,
  ageInYears,
  buildGrowthChart,
  computeStreak,
  habitScore,
  type DayLog,
  CITATIONS,
  displayPercentile,
  formatHeight,
  formatHeightRange,
  formatPlusMinus,
  formatWeight,
  ordinal,
  toIsoDate,
  type GrowthChartData,
  type HeightUnit,
  type XY,
} from '@tallsoon/engine';

import { AppConfig } from '@/config/app-config';
import { habitsRepo } from '@/db/repo';
import type { ChildModel } from '@/features/child/useChild';
import { tr } from '@/i18n';
import { engine } from '@/lib/engine';
import { formatMonthYear, formatShortDate } from '@/lib/time';
import { moveToTemp } from '@/services/files';
import { useSettings } from '@/state/settings';
import { habits as allHabits } from '@tallsoon/content';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Same chart data as the app, rendered as a vector SVG string so it prints sharp (brief §5.5). */
export function chartSvg(data: GrowthChartData, unit: HeightUnit, width = 520, height = 260): string {
  const pad = { l: 36, r: 16, t: 14, b: 24 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const x = (a: number) => pad.l + ((a - data.xMin) / (data.xMax - data.xMin)) * iw;
  const y = (h: number) => pad.t + (1 - (h - data.yMin) / (data.yMax - data.yMin)) * ih;
  const ln = d3line<XY>()
    .x((p) => x(p[0]))
    .y((p) => y(p[1]))
    .curve(curveMonotoneX);
  const parts: string[] = [];
  for (const v of data.yTicks) {
    const label = unit === 'cm' ? String(v) : formatHeight(v, 'ftin');
    parts.push(`<line x1="${pad.l}" x2="${width - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="#ddd" stroke-width="0.5"/>`);
    parts.push(`<text x="${pad.l - 5}" y="${y(v) + 3}" font-size="9" fill="#666" text-anchor="end">${esc(label)}</text>`);
  }
  for (const a of data.xTicks) parts.push(`<text x="${x(a)}" y="${height - 6}" font-size="9" fill="#666" text-anchor="middle">${a}</text>`);
  for (const p of data.percentiles) {
    parts.push(`<path d="${ln(p.points as XY[])}" fill="none" stroke="${p.p === 50 ? '#888' : '#c8c8c8'}" stroke-width="${p.p === 50 ? 1.2 : 0.7}"/>`);
    const end = p.points[p.points.length - 1];
    if (end && (p.p === 3 || p.p === 50 || p.p === 97)) parts.push(`<text x="${width - pad.r + 2}" y="${y(end[1]) + 3}" font-size="7" fill="#999">P${p.p}</text>`);
  }
  if (data.bandUpper.length) {
    const band = d3area<number>()
      .x((i) => x((data.bandUpper[i] as XY)[0]))
      .y0((i) => y((data.bandLower[i] as XY)[1]))
      .y1((i) => y((data.bandUpper[i] as XY)[1]))
      .curve(curveMonotoneX)(data.bandUpper.map((_, i) => i));
    parts.push(`<path d="${band}" fill="rgba(47,125,109,0.14)"/>`);
    parts.push(`<path d="${ln(data.projection as XY[])}" fill="none" stroke="#2F7D6D" stroke-width="2" stroke-dasharray="5 4"/>`);
  }
  if (data.measurements.length > 1) {
    parts.push(`<path d="${ln(data.measurements.map((m) => [m.ageYears, m.heightCm] as XY))}" fill="none" stroke="#E08C3A" stroke-width="2"/>`);
  }
  for (const m of data.measurements) {
    parts.push(`<circle cx="${x(m.ageYears)}" cy="${y(m.heightCm)}" r="3.5" fill="#fff" stroke="#E08C3A" stroke-width="2"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}

function paper(): { width: number; height: number; name: 'letter' | 'a4' } {
  const region = getLocales()[0]?.regionCode ?? 'US';
  return ['US', 'CA', 'MX', 'PH', 'CL', 'CO', 'VE'].includes(region)
    ? { width: 612, height: 792, name: 'letter' }
    : { width: 595, height: 842, name: 'a4' };
}

const categoryOf = new Map(allHabits.map((h) => [h.key, h.category]));

export async function buildReportHtml(model: ChildModel): Promise<string> {
  const unit = useSettings.getState().heightUnit;
  const wUnit = useSettings.getState().weightUnit;
  const reference = useSettings.getState().reference;
  const { child, summary } = model;
  const today = toIsoDate(new Date());
  const chart = buildGrowthChart({ engine, sex: child.sexAtBirth, birthDate: child.birthDate, reference, measurements: model.measurements, summary });

  // Habits summary for the last 4 weeks (Pro context; no upsell in the PDF).
  const checks = await habitsRepo.since(child.id, addDays(today, -28));
  const byDay = new Map<string, Set<string>>();
  for (const r of checks) if (r.done) (byDay.get(r.day) ?? byDay.set(r.day, new Set()).get(r.day)!).add(r.habitKey);
  const logs: DayLog[] = [...byDay.entries()].map(([day, keys]) => ({
    day,
    done: keys.size,
    categories: [...keys].map((k) => categoryOf.get(k)).filter((c): c is DayLog['categories'][number] => !!c),
  }));
  const streak = computeStreak(logs, today, useSettings.getState().bestStreak[child.id] ?? 0);
  const score = habitScore(logs, today, streak.restDays);

  const name = child.nickname || tr('family.unnamed');
  const rows = model.measurements
    .map((m) => {
      const pct = chart?.measurements.find((p) => p.date === m.date)?.percentile;
      return `<tr><td>${esc(formatShortDate(m.date))}</td><td>${ageInYears(child.birthDate, m.date).toFixed(1)}</td><td>${esc(formatHeight(m.heightCm, unit))}${unit === 'ftin' ? ` (${Math.round(m.heightCm)} cm)` : ''}</td><td>${m.weightKg != null ? esc(formatWeight(m.weightKg, wUnit)) : '–'}</td><td>${pct != null ? ordinal(displayPercentile(pct)) : '–'}</td></tr>`;
    })
    .join('');
  const methodLabel = (m: string) => (m === 'khamisRoche' ? 'Khamis–Roche (1994)' : m === 'midParental' ? 'Mid-parental height (Tanner 1970)' : `Percentile projection (${reference.toUpperCase()})`);
  const methods = (summary?.predictions ?? [])
    .map(
      (p) =>
        `<tr><td>${esc(methodLabel(p.method))}${p === summary?.lead ? ' <b>· lead</b>' : ''}</td><td>${esc(formatHeight(p.estimateCm, unit))}</td><td>${esc(formatHeightRange(p.lowCm, p.highCm, unit))} (${esc(formatPlusMinus(p.plusMinusCm, unit))})</td></tr>`,
    )
    .join('');
  const mph = summary?.predictions.find((p) => p.method === 'midParental');

  const est = summary?.estimatedParent;
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
  @page { margin: 36px; }
  body { font-family: -apple-system, 'Helvetica Neue', Roboto, Arial, sans-serif; color: #111; font-size: 11px; line-height: 1.4; }
  h1 { font-size: 20px; margin: 0; } h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: #555; margin: 16px 0 6px; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #2F7D6D; padding-bottom: 8px; }
  .muted { color: #666; } .big { font-size: 26px; font-weight: 700; color: #2F7D6D; }
  table { width: 100%; border-collapse: collapse; } td, th { text-align: left; padding: 4px 6px; border-bottom: 0.5px solid #ddd; } th { color: #555; font-weight: 600; }
  .grid { display: flex; gap: 24px; } .grid > div { flex: 1; }
  footer { margin-top: 18px; padding-top: 8px; border-top: 0.5px solid #ccc; font-size: 9px; color: #666; }
  </style></head><body>
  <div class="head"><div><h1>${esc(tr('pdf.title'))}: ${esc(name)}</h1><div class="muted">${esc(tr('pdf.preparedBy', { date: formatShortDate(today) }))}</div></div><div class="muted">${esc(AppConfig.appName)}</div></div>
  <div class="grid"><div>
    <h2>${esc(tr('pdf.child'))}</h2>
    <div>${esc(tr('pdf.born'))}: ${esc(formatMonthYear(child.birthDate))} · ${esc(tr('pdf.sex'))}: ${esc(tr(child.sexAtBirth === 'male' ? 'pdf.male' : 'pdf.female'))}</div>
    <div>${esc(tr('pdf.parents', { mother: child.motherHeightCm != null ? formatHeight(child.motherHeightCm, unit) : '?', father: child.fatherHeightCm != null ? formatHeight(child.fatherHeightCm, unit) : '?' }))}</div>
  </div><div>
    <h2>${esc(tr('pdf.predictionHeader'))}</h2>
    ${summary ? `<div class="big">${esc(formatHeight(summary.estimateCm, unit))}</div><div>${esc(tr('result.heroSub', { alt: unit === 'cm' ? formatHeight(summary.estimateCm, 'ftin') : formatHeight(summary.estimateCm, 'cm'), range: formatHeightRange(summary.lowCm, summary.highCm, unit) }))}</div>` : ''}
  </div></div>
  <h2>${esc(tr('pdf.chartHeader', { ref: reference.toUpperCase() }))}</h2>
  ${chart ? chartSvg(chart, unit) : ''}
  <h2>${esc(tr('pdf.methodCol'))}</h2>
  <table><tr><th>${esc(tr('pdf.methodCol'))}</th><th>${esc(tr('pdf.estimateCol'))}</th><th>${esc(tr('pdf.rangeCol'))}</th></tr>${methods}</table>
  ${mph ? `<div class="muted" style="margin-top:4px">${esc(tr('pdf.targetHeader'))}: ${esc(formatHeightRange(mph.lowCm, mph.highCm, unit))}</div>` : ''}
  ${est ? `<div class="muted">${esc(tr('pdf.estimatedParent', { parent: est }))}</div>` : ''}
  ${model.velocity ? `<div style="margin-top:4px">${esc(tr('pdf.velocity', { value: model.velocity.cmPerYear.toFixed(1), date: formatShortDate(model.velocity.fromDate) }))}</div>` : ''}
  <h2>${esc(tr('pdf.measurementsHeader'))}</h2>
  <table><tr><th>${esc(tr('growth.tableDate'))}</th><th>${esc(tr('growth.tableAge'))}</th><th>${esc(tr('growth.tableHeight'))}</th><th>${esc(tr('result.inWeight'))}</th><th>${esc(tr('growth.tablePercentile'))}</th></tr>${rows}</table>
  ${logs.length ? `<h2>${esc(tr('pdf.habitsHeader'))}</h2><div>${esc(tr('pdf.habits', { score: score.score, streak: streak.best }))}</div>` : ''}
  <footer>${esc(tr('legal.disclaimer'))}<br/>${esc(CITATIONS.khamisRoche)} ${esc(CITATIONS.midParental)} ${esc(reference === 'cdc' ? CITATIONS.cdc : CITATIONS.who)}</footer>
  </body></html>`;
}

/** Generates the report on device and opens the share sheet (brief §5.5). No upsell inside. */
export async function exportPdf(model: ChildModel): Promise<void> {
  const html = await buildReportHtml(model);
  const size = paper();
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html, width: size.width, height: size.height });
  const name = `${AppConfig.appName}-growth-report-${toIsoDate(new Date())}.pdf`;
  const file = moveToTemp(uri, name);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: tr('pdf.title') });
  }
}
