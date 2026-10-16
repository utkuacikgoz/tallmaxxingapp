import { Platform, type TextStyle } from 'react-native';

export type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption';

type Spec = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>;

/** HIG Dynamic Type sizes at the default "Large" setting (brief §13.1). */
const ios: Record<TextVariant, Spec> = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.37 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.36 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.35 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: 0.38 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.41 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: -0.41 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: -0.32 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: -0.08 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0 },
};

/** Material 3 type scale mapping (brief §13.9). */
const android: Record<TextVariant, Spec> = {
  largeTitle: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  title1: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  title2: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  title3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  headline: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0.15 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.5 },
  callout: { fontSize: 15, lineHeight: 22, fontWeight: '400', letterSpacing: 0.25 },
  subhead: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0.25 },
  footnote: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.4 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.4 },
};

export const typeScale = Platform.OS === 'android' ? android : ios;

/** Rounded face for the result number and numeric fields (SF Pro Rounded / Nunito). */
export const roundedFamily = Platform.select({
  ios: 'ui-rounded',
  android: 'Nunito_700Bold',
  default: 'Nunito_700Bold',
}) as string;

export const roundedFamilyRegular = Platform.select({
  ios: 'ui-rounded',
  android: 'Nunito_600SemiBold',
  default: 'Nunito_600SemiBold',
}) as string;

export const monoFamily = Platform.select({ ios: 'Menlo', default: 'monospace' }) as string;
