import { computeStreak, growthVelocity, habitScore, predictionHistory, weekKey, type DayLog } from '../tracking';
import { engine } from './helpers';

const day = (d: string, done: number, categories: DayLog['categories'] = []): DayLog => ({ day: d, done, categories });

describe('streaks', () => {
  it('counts consecutive days with ≥ 3 items', () => {
    const logs = [day('2026-10-12', 3), day('2026-10-13', 4), day('2026-10-14', 5)];
    expect(computeStreak(logs, '2026-10-14').current).toBe(3);
  });
  it('does not break on today while today is in progress', () => {
    const logs = [day('2026-10-13', 3), day('2026-10-14', 3), day('2026-10-15', 1)];
    expect(computeStreak(logs, '2026-10-15').current).toBe(2);
  });
  it('covers one missed day per week with the automatic rest day', () => {
    // Mon 12 done, Tue 13 missed (rest), Wed 14 done, Thu 15 missed (breaks), Fri 16 done.
    const logs = [day('2026-10-12', 3), day('2026-10-13', 0), day('2026-10-14', 3), day('2026-10-16', 3)];
    const r = computeStreak(logs, '2026-10-16');
    expect(r.restDays).toEqual(['2026-10-13']);
    expect(r.current).toBe(1);
    expect(r.best).toBe(2);
  });
  it('keeps the best streak ever', () => {
    expect(computeStreak([day('2026-10-16', 3)], '2026-10-16', 30).best).toBe(30);
  });
  it('uses Monday-based weeks', () => {
    expect(weekKey('2026-10-18')).toBe('2026-10-12'); // Sunday → Monday
    expect(weekKey('2026-10-12')).toBe('2026-10-12');
  });
});

describe('Growth Habits Score', () => {
  it('weights sleep 35, activity 30, nutrition 25, consistency 10', () => {
    const all: DayLog['categories'] = ['sleep', 'activity', 'nutrition'];
    const logs = Array.from({ length: 7 }, (_, i) => day(`2026-10-${String(10 + i)}`, 3, all));
    expect(habitScore(logs, '2026-10-16').score).toBe(100);
    const sleepOnly = Array.from({ length: 7 }, (_, i) => day(`2026-10-${String(10 + i)}`, 1, ['sleep']));
    const s = habitScore(sleepOnly, '2026-10-16');
    expect(s.score).toBe(35);
    expect(s.weakest).toBe('activity');
  });
  it('one missed day does not drop the score to zero', () => {
    const all: DayLog['categories'] = ['sleep', 'activity', 'nutrition'];
    const logs = Array.from({ length: 6 }, (_, i) => day(`2026-10-${String(10 + i)}`, 3, all));
    expect(habitScore(logs, '2026-10-16').score).toBeGreaterThan(80);
  });
  it('leaves rest days out of the denominator', () => {
    const all: DayLog['categories'] = ['sleep', 'activity', 'nutrition'];
    const logs = Array.from({ length: 6 }, (_, i) => day(`2026-10-${String(10 + i)}`, 3, all));
    expect(habitScore(logs, '2026-10-16', ['2026-10-16']).score).toBe(100);
  });
});

describe('velocity', () => {
  const birth = '2013-05-15';
  it('needs two measurements at least 3 months apart', () => {
    expect(growthVelocity(engine, [{ date: '2026-01-01', heightCm: 150, weightKg: null }], birth, 'male', 'cdc')).toBeNull();
    expect(
      growthVelocity(engine, [
        { date: '2026-01-01', heightCm: 150, weightKg: null },
        { date: '2026-02-01', heightCm: 151, weightKg: null },
      ], birth, 'male', 'cdc'),
    ).toBeNull();
  });
  it('reports cm/yr against the reference median slope', () => {
    const v = growthVelocity(engine, [
      { date: '2025-10-16', heightCm: 146, weightKg: null },
      { date: '2026-10-16', heightCm: 152, weightKg: null },
    ], birth, 'male', 'cdc')!;
    expect(v.cmPerYear).toBeCloseTo(6, 1);
    expect(v.typicalCmPerYear).toBeGreaterThan(4);
    expect(v.status).toBe('typical');
  });
  it('flags a growth spurt and unusually slow growth', () => {
    const fast = growthVelocity(engine, [
      { date: '2025-10-16', heightCm: 146, weightKg: null },
      { date: '2026-10-16', heightCm: 158, weightKg: null },
    ], birth, 'male', 'cdc')!;
    expect(fast.status).toBe('fast');
    const slow = growthVelocity(engine, [
      { date: '2025-10-16', heightCm: 150, weightKg: null },
      { date: '2026-10-16', heightCm: 151, weightKg: null },
    ], birth, 'male', 'cdc')!;
    expect(slow.status).toBe('slow');
  });
});

describe('prediction history', () => {
  it('recomputes the headline at each measurement, carrying weight forward', () => {
    const h = predictionHistory(
      engine,
      { sex: 'male', birthDate: '2013-05-15', motherHeightCm: 163, fatherHeightCm: 178 },
      [
        { date: '2026-04-16', heightCm: 149, weightKg: 40 },
        { date: '2026-10-16', heightCm: 152, weightKg: null },
      ],
      { reference: 'cdc', unknownParentMode: 'populationAverage' },
    );
    expect(h).toHaveLength(2);
    expect(h[1]!.highCm - h[1]!.estimateCm).toBeCloseTo(5.3, 6); // KR ran with the carried weight
  });
});
