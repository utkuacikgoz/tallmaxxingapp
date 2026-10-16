import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { roundedFamily, typeScale, useTheme, type Palette, type TextVariant } from '@/theme';

export type TextColor = 'label' | 'label2' | 'label3' | 'tint' | 'onTint' | 'red' | 'orange' | 'accentText' | 'white';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  rounded?: boolean;
  tabular?: boolean;
  uppercase?: boolean;
}

function colorOf(c: Palette, color: TextColor): string {
  return color === 'white' ? '#FFFFFF' : c[color];
}

/** HIG type scale on iOS, Material 3 mapping on Android. Honours OS font scaling. */
export const Text = memo(function Text({
  variant = 'body',
  color = 'label',
  weight,
  align,
  rounded,
  tabular,
  uppercase,
  style,
  ...rest
}: TextProps) {
  const { c } = useTheme();
  const spec = typeScale[variant];
  return (
    <RNText
      {...rest}
      style={[
        spec,
        { color: colorOf(c, color) },
        weight != null && { fontWeight: weight },
        align != null && { textAlign: align },
        rounded && { fontFamily: roundedFamily },
        tabular && { fontVariant: ['tabular-nums'] },
        uppercase && { textTransform: 'uppercase' },
        style,
      ]}
    />
  );
});
