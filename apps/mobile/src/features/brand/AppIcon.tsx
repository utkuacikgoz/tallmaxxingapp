import { memo } from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** The leaf mark on a sage-teal tile (brief §7: app icon), drawn as vector so it is sharp everywhere. */
export const AppIcon = memo(function AppIcon({ size = 76 }: { size?: number }) {
  const r = size * 0.225;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id="tile" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#3D9A86" />
          <Stop offset="1" stopColor="#25685A" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" rx={(r / size) * 100} fill="url(#tile)" />
      <Path
        d="M30 70c0-24 13.3-37.3 40-40-2.7 26.7-16 40-40 40Z M30 70 51.3 48.7"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={6.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
