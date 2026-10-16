import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { memo, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { displayPercentile, formatHeight, ordinal, type GrowthChartData, type HeightUnit, type XY } from '@tallsoon/engine';

import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { Text } from '@/ui/Text';

const PAD = { left: 34, right: 14, top: 22, bottom: 24 };
const HEIGHT = 260;

/**
 * Height-for-age chart drawn as SVG from the same data the PDF uses (brief §4.4): thin CDC/WHO
 * percentile lines with P50 emphasised, the child's points in apricot, and a dashed projection with
 * the likely-range band. Tap a point for its percentile and z-score.
 */
export const GrowthChart = memo(function GrowthChart({ data, unit }: { data: GrowthChartData; unit: HeightUnit }) {
  const { c } = useTheme();
  const t = useT();
  const [w, setW] = useState(0);
  const [selected, setSelected] = useState<number | null>(data.measurements.length - 1);

  const geo = useMemo(() => {
    const iw = Math.max(1, w - PAD.left - PAD.right);
    const ih = HEIGHT - PAD.top - PAD.bottom;
    const x = (a: number) => PAD.left + ((a - data.xMin) / (data.xMax - data.xMin)) * iw;
    const y = (h: number) => PAD.top + (1 - (h - data.yMin) / (data.yMax - data.yMin)) * ih;
    const ln = d3line<XY>()
      .x((p) => x(p[0]))
      .y((p) => y(p[1]))
      .curve(curveMonotoneX);
    const band =
      data.bandUpper.length && data.bandLower.length
        ? d3area<number>()
            .x((i) => x((data.bandUpper[i] as XY)[0]))
            .y0((i) => y((data.bandLower[i] as XY)[1]))
            .y1((i) => y((data.bandUpper[i] as XY)[1]))
            .curve(curveMonotoneX)(data.bandUpper.map((_, i) => i))
        : null;
    return { x, y, ln, band };
  }, [w, data]);

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const sel = selected != null ? data.measurements[selected] : null;
  const yLabel = (v: number) => (unit === 'cm' ? String(v) : formatHeight(v, 'ftin').replace(/ /g, ''));

  return (
    <View onLayout={onLayout} style={{ height: HEIGHT }} accessible={false}>
      {w > 0 ? (
        <Svg width={w} height={HEIGHT}>
          {data.yTicks.map((v) => (
            <G key={`y${v}`}>
              <Line x1={PAD.left} x2={w - PAD.right} y1={geo.y(v)} y2={geo.y(v)} stroke={c.separator} strokeWidth={0.5} />
              <SvgText x={PAD.left - 6} y={geo.y(v) + 4} fontSize={10} fill={c.label2} textAnchor="end">
                {yLabel(v)}
              </SvgText>
            </G>
          ))}
          {data.xTicks.map((a) => (
            <SvgText key={`x${a}`} x={geo.x(a)} y={HEIGHT - 6} fontSize={10} fill={c.label2} textAnchor="middle">
              {a}
            </SvgText>
          ))}
          {data.percentiles.map((p) => (
            <Path
              key={p.p}
              d={geo.ln(p.points as XY[]) ?? ''}
              stroke={p.p === 50 ? c.label2 : c.label3}
              strokeWidth={p.p === 50 ? 1.4 : 0.8}
              fill="none"
            />
          ))}
          {data.percentiles
            .filter((p) => p.p === 3 || p.p === 50 || p.p === 97)
            .map((p) => {
              const end = p.points[p.points.length - 1];
              return end ? (
                <SvgText key={`l${p.p}`} x={w - PAD.right + 2} y={geo.y(end[1]) + 3} fontSize={8} fill={c.label3}>
                  {p.p}
                </SvgText>
              ) : null;
            })}
          {geo.band ? <Path d={geo.band} fill={c.tintFill} /> : null}
          {data.projection.length ? (
            <Path d={geo.ln(data.projection as XY[]) ?? ''} stroke={c.tint} strokeWidth={2.4} strokeDasharray="6 5" fill="none" />
          ) : null}
          {data.estimateCm != null && data.projection.length ? (
            <SvgText
              x={w - PAD.right - 2}
              y={geo.y((data.bandUpper[data.bandUpper.length - 1] ?? [0, data.estimateCm])[1]) - 6}
              fontSize={12}
              fontWeight="700"
              fill={c.tint}
              textAnchor="end"
            >
              {formatHeight(data.estimateCm, unit)}
            </SvgText>
          ) : null}
          {data.measurements.length > 1 ? (
            <Path
              d={geo.ln(data.measurements.map((m) => [m.ageYears, m.heightCm] as XY)) ?? ''}
              stroke={c.accent}
              strokeWidth={2.4}
              fill="none"
            />
          ) : null}
          {data.measurements.map((m, i) => (
            <G key={m.date + i}>
              <Circle cx={geo.x(m.ageYears)} cy={geo.y(m.heightCm)} r={selected === i ? 7 : 5.5} fill={c.card} stroke={c.accent} strokeWidth={2.6} />
              {/* 44 pt hit target */}
              <Circle
                cx={geo.x(m.ageYears)}
                cy={geo.y(m.heightCm)}
                r={22}
                fill="transparent"
                onPress={() => {
                  haptics.selection();
                  setSelected(i);
                }}
              />
            </G>
          ))}
        </Svg>
      ) : null}
      {sel && sel.percentile != null ? (
        <View style={[styles.tooltip, { backgroundColor: c.cardElevated, borderColor: c.separator }]} pointerEvents="none">
          <Text variant="caption" weight="600">
            {formatHeight(sel.heightCm, unit)} · {t('growth.ageAt', { age: sel.ageYears.toFixed(1) })}
          </Text>
          <Text variant="caption" color="label2">
            {ordinal(displayPercentile(sel.percentile))} percentile · z {sel.z?.toFixed(2)}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    left: PAD.left + 6,
    top: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
