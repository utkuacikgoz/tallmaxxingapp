import { forwardRef, type ComponentRef } from 'react';
import { View } from 'react-native';

import { AppConfig } from '@/config/app-config';
import { AppIcon } from '@/features/brand/AppIcon';
import type { Milestone } from '@/features/retention/model';
import { useT } from '@/i18n';
import { useTheme } from '@/theme';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

/** Shared habit milestones contain only the optional nickname, never growth measurements. */
export const MilestoneCard = forwardRef<ComponentRef<typeof View>, {
  milestone: Milestone;
  nickname: string;
  square: boolean;
}>(function MilestoneCard({ milestone, nickname, square }, ref) {
  const t = useT();
  const { c } = useTheme();
  return (
    <View ref={ref} collapsable={false} testID="milestone-card" accessible accessibilityLabel={[nickname, t(`retention.milestone.${milestone}`), t('retention.cardBody')].filter(Boolean).join('. ')} style={{
      width: 270, height: square ? 270 : 480, padding: square ? 18 : 24, backgroundColor: c.card,
      borderRadius: 20, justifyContent: 'space-between', gap: square ? 8 : 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AppIcon size={square ? 24 : 32} /><Text allowFontScaling={false} variant="headline">{AppConfig.appName}</Text>
      </View>
      <View style={{ gap: square ? 8 : 12 }}>
        <Icon name={milestone === 'checkin' ? 'checkCircle' : 'flame'} size={square ? 28 : 40} color={c.tint} />
        {nickname ? <Text allowFontScaling={false} numberOfLines={1} variant="subhead" color="label2">{nickname}</Text> : null}
        <Text allowFontScaling={false} variant={square ? "title3" : "title1"}>{t(`retention.milestone.${milestone}`)}</Text>
        <Text allowFontScaling={false} variant="footnote" color="label2">{t('retention.cardBody')}</Text>
      </View>
      <Text allowFontScaling={false} variant="caption" color="label2">{t('retention.cardFooter')}</Text>
    </View>
  );
});
