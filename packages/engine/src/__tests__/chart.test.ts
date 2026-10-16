import { buildGrowthChart } from '../chart';
import { engine } from './helpers';

describe('growth chart data', () => {
  const summary = engine.predict(
    { sex: 'male', birthDate: '2013-05-15', measuredOn: '2026-10-16', heightCm: 152, weightKg: 42, motherHeightCm: 163, fatherHeightCm: 178 },
    { reference: 'cdc', unknownParentMode: 'populationAverage' },
  );
  const data = buildGrowthChart({
    engine,
    sex: 'male',
    birthDate: '2013-05-15',
    reference: 'cdc',
    measurements: [
      { date: '2026-04-16', heightCm: 148 },
      { date: '2026-10-16', heightCm: 152 },
    ],
    summary,
  })!;

  it('draws 7 percentile curves and the child points', () => {
    expect(data.percentiles.map((p) => p.p)).toEqual([3, 10, 25, 50, 75, 90, 97]);
    expect(data.measurements).toHaveLength(2);
    expect(data.measurements[1]!.percentile).toBeCloseTo(summary.today!.percentile, 6);
  });
  it('ends the projection at the predicted adult height', () => {
    const end = data.projection[data.projection.length - 1]!;
    expect(end[0]).toBeCloseTo(data.xMax, 6);
    expect(end[1]).toBeCloseTo(summary.estimateCm, 1);
    expect(data.projection[0]![1]).toBeCloseTo(152, 6);
    expect(data.bandUpper.length).toBe(data.projection.length);
  });
  it('picks round axis ticks that contain the data', () => {
    expect(data.yMin).toBeLessThanOrEqual(148);
    expect(data.yMax).toBeGreaterThanOrEqual(summary.highCm);
    expect(data.yTicks[0]).toBe(data.yMin);
  });
});
