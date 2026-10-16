import {
  currentSeasonalPack,
  focusTargets,
  groceryList,
  habits,
  habitsForDay,
  mealsForWeek,
  meals,
  measureGuide,
  notificationLines,
  pubertyGuide,
  resolveCopy,
  routines,
  seasonalPacks,
  tipForDay,
  tips,
  weekOnePlan,
  ageBandFor,
} from '../index';
import type { AgeBand, Copy, Source } from '../types';

const BANDS: AgeBand[] = ['2-5', '6-8', '9-12', '13-17', '18-21'];
const VARS = { bedtime: '21:30', sleepRange: '8–10 hours', calcium: '1,300 mg', name: 'Sam', count: '5' };
const AUDIENCES = ['parent', 'teen'] as const;

const everything = {
  habits,
  routines,
  meals,
  tips,
  weekOnePlan,
  focusTargets,
  pubertyGuide,
  measureGuide,
  notificationLines,
  seasonalPacks,
};

function collectSources(node: unknown, out: Source[] = []): Source[] {
  if (Array.isArray(node)) node.forEach((n) => collectSources(n, out));
  else if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (typeof o.url === 'string' && typeof o.label === 'string') out.push(o as unknown as Source);
    Object.values(o).forEach((v) => collectSources(v, out));
  }
  return out;
}

describe('keys', () => {
  it('habit keys are unique', () => {
    const keys = habits.map((h) => h.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('routine keys are unique', () => {
    const keys = routines.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('meal and tip keys are unique', () => {
    const allTips = [...tips, ...seasonalPacks.flatMap((p) => p.tips)].map((t) => t.key);
    expect(new Set(allTips).size).toBe(allTips.length);
    const mk = meals.map((m) => m.key);
    expect(new Set(mk).size).toBe(mk.length);
  });
  it('every routineKey exists', () => {
    const keys = new Set(routines.map((r) => r.key));
    for (const h of habits) if (h.routineKey) expect(keys.has(h.routineKey)).toBe(true);
    for (const h of habits.filter((x) => x.slot === 'move')) expect(h.routineKey).toBeTruthy();
  });
});

describe('counts', () => {
  const count = (slot: string) => habits.filter((h) => h.slot === slot).length;
  it('has enough variety', () => {
    expect(count('move')).toBeGreaterThanOrEqual(7);
    expect(count('sleep')).toBeGreaterThanOrEqual(3);
    expect(count('food')).toBeGreaterThanOrEqual(5);
    expect(count('outside')).toBeGreaterThanOrEqual(3);
    expect(count('water')).toBeGreaterThanOrEqual(2);
    expect(routines.length).toBeGreaterThanOrEqual(7);
    expect(meals.length).toBeGreaterThanOrEqual(21);
    expect(meals.filter((m) => m.tags.includes('vegetarian')).length).toBeGreaterThanOrEqual(8);
    expect(meals.filter((m) => m.tags.includes('dairyFree')).length).toBeGreaterThanOrEqual(6);
    expect(tips.length).toBeGreaterThanOrEqual(14);
    expect(weekOnePlan).toHaveLength(7);
  });
  it('routines are 5–10 minutes with 4–7 steps', () => {
    for (const r of routines) {
      expect(r.minutes).toBeGreaterThanOrEqual(5);
      expect(r.minutes).toBeLessThanOrEqual(10);
      expect(r.steps.length).toBeGreaterThanOrEqual(4);
      expect(r.steps.length).toBeLessThanOrEqual(7);
    }
    expect(routines.some((r) => r.focus === 'family' && r.minutes === 10)).toBe(true);
  });
  it('every slot has habits for every band', () => {
    for (const band of BANDS)
      for (const slot of ['move', 'sleep', 'food', 'outside', 'water'])
        expect(habits.some((h) => h.slot === slot && h.bands.includes(band))).toBe(true);
  });
});

describe('helpers', () => {
  it('ageBandFor', () => {
    expect(ageBandFor(2)).toBe('2-5');
    expect(ageBandFor(5.9)).toBe('2-5');
    expect(ageBandFor(6)).toBe('6-8');
    expect(ageBandFor(12)).toBe('9-12');
    expect(ageBandFor(13)).toBe('13-17');
    expect(ageBandFor(21)).toBe('18-21');
  });
  it('habitsForDay returns 5 in slot order for every band and is deterministic', () => {
    for (const band of BANDS) {
      for (let d = 1; d <= 30; d++) {
        const date = `2026-03-${String(d).padStart(2, '0')}`;
        const list = habitsForDay(band, date);
        expect(list).toHaveLength(5);
        expect(list.map((h) => h.slot)).toEqual(['move', 'sleep', 'food', 'outside', 'water']);
        for (const h of list) expect(h.bands).toContain(band);
        expect(habitsForDay(band, date)).toEqual(list);
      }
    }
  });
  it('move habit rotates across days', () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 14; d++) seen.add(habitsForDay('9-12', `2026-04-${String(d).padStart(2, '0')}`)[0]!.key);
    expect(seen.size).toBeGreaterThan(3);
  });
  it('resolveCopy fills placeholders and picks audience', () => {
    expect(resolveCopy('Lights out by {bedtime}', 'teen', VARS)).toBe('Lights out by 21:30');
    expect(resolveCopy({ parent: 'Their {x}', teen: 'Your {x}' }, 'teen', { x: 'day' })).toBe('Your day');
    expect(resolveCopy({ parent: 'Their {x}', teen: 'Your {x}' }, 'parent')).toBe('Their {x}');
  });
  it('mealsForWeek returns 7 breakfasts and 7 dinners and respects filters', () => {
    const combos = [{}, { vegetarian: true }, { dairyFree: true }, { vegetarian: true, dairyFree: true }];
    for (const f of combos) {
      const list = mealsForWeek('9-12', '2026-03-02', f);
      expect(list.filter((m) => m.slot === 'breakfast')).toHaveLength(7);
      expect(list.filter((m) => m.slot === 'dinner')).toHaveLength(7);
      expect(mealsForWeek('9-12', '2026-03-02', f)).toEqual(list);
      for (const m of list) {
        if ((f as { vegetarian?: boolean }).vegetarian) expect(m.tags).toContain('vegetarian');
        if ((f as { dairyFree?: boolean }).dairyFree) expect(m.tags).toContain('dairyFree');
      }
    }
  });
  it('groceryList merges duplicates and orders aisles', () => {
    const list = groceryList(mealsForWeek('9-12', '2026-03-02', {}));
    const names = list.flatMap((a) => a.items.map((i) => i.item.toLowerCase()));
    expect(new Set(names).size).toBe(names.length);
    const order = ['produce', 'bakery', 'dairy', 'protein', 'frozen', 'pantry'];
    const idx = list.map((a) => order.indexOf(a.aisle));
    expect(idx).toEqual([...idx].sort((a, b) => a - b));
    const eggs = meals.filter((m) => m.ingredients.some((i) => i.item === 'Eggs'));
    const merged = groceryList([eggs[0]!, eggs[1]!]);
    const eggItem = merged.flatMap((a) => a.items).find((i) => i.item === 'Eggs');
    expect(eggItem?.count).toBe(2);
  });
  it('seasonal pack and daily tip', () => {
    expect(currentSeasonalPack('2026-01-15')?.id).toBe('winter');
    expect(currentSeasonalPack('2026-08-20')?.id).toBe('back-to-school');
    expect(currentSeasonalPack('2026-07-01')?.id).toBe('summer');
    expect(currentSeasonalPack('2026-05-05')?.id).toBe('exam-season');
    expect(currentSeasonalPack('2026-10-16')).toBeNull();
    expect(tipForDay('2026-10-16')).toEqual(tipForDay('2026-10-16'));
    expect(seasonalPacks.every((p) => p.tips.length === 3)).toBe(true);
  });
});

describe('copy limits', () => {
  it('habit titles ≤ 32 and subtitles ≤ 44 after resolving', () => {
    for (const h of habits)
      for (const aud of AUDIENCES) {
        expect(resolveCopy(h.title, aud, VARS).length).toBeLessThanOrEqual(32);
        expect(resolveCopy(h.subtitle, aud, VARS).length).toBeLessThanOrEqual(44);
      }
  });
  it('plan tasks ≤ 60 and exactly 3 per day', () => {
    weekOnePlan.forEach((d, i) => {
      expect(d.day).toBe(i + 1);
      expect(d.tasks).toHaveLength(3);
      for (const t of d.tasks)
        for (const aud of AUDIENCES) expect(resolveCopy(t, aud, VARS).length).toBeLessThanOrEqual(60);
    });
  });
  it('copy with two audiences has no unresolved placeholders for known vars', () => {
    const all: Copy[] = [...Object.values(notificationLines).flat(), ...habits.flatMap((h) => [h.title, h.subtitle, h.why])];
    for (const c of all)
      for (const aud of AUDIENCES) expect(resolveCopy(c, aud, VARS)).not.toMatch(/\{\w+\}/);
  });
  it('emoji and exclamation marks are sparing', () => {
    const strings: string[] = [];
    JSON.stringify(everything, (_k, v) => {
      if (typeof v === 'string') strings.push(v);
      return v;
    });
    for (const s of strings) {
      expect((s.match(/!/g) ?? []).length).toBeLessThanOrEqual(2);
      expect((s.match(/\p{Extended_Pictographic}/gu) ?? []).length).toBeLessThanOrEqual(1);
    }
  });
});

describe('sources', () => {
  it('every source url starts with https://', () => {
    const sources = collectSources(everything);
    expect(sources.length).toBeGreaterThan(30);
    for (const s of sources) {
      expect(s.url.startsWith('https://')).toBe(true);
      expect(s.label.length).toBeGreaterThan(0);
    }
  });
  it('every habit, routine and tip has a source', () => {
    for (const x of [...habits, ...routines, ...tips]) expect(x.source.url).toMatch(/^https:\/\//);
  });
});

describe('banned phrases', () => {
  const text = JSON.stringify(everything);
  const banned: RegExp[] = [
    /journey/i, /unlock your potential/i, /unleash/i, /elevate/i, /empower/i, /seamless/i, /dive into/i,
    /game-changer/i, /supercharge/i, /holistic/i, /optimal/i, /harness/i, /embark/i, /delve/i,
    /transformative/i, /revolutioniz/i, /cutting-edge/i, /in today's/i, /it's important to note/i,
    /remember that/i, /tapestry/i, /thrive/i, /crucial/i, /vital role/i, /myriad/i,
    /grow \d/i, /\+\s?\d+(\.\d+)?\s?(cm|in|inch)/i, /add height/i, /increase (your |their )?height/i,
    /taller than genetics/i, /\balpha\b/i, /\btaller\b/i, /\bshort(er)? (kid|child|teen|height|person|people|boy|girl)/i, /too short/i, /attractive/i, /dating/i, /get taller/i, /—/,
  ];
  it.each(banned.map((b) => [String(b), b] as const))('has no %s', (_n, re) => {
    expect(text).not.toMatch(re);
  });
});
