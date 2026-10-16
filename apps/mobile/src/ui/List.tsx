import { Children, Fragment, isValidElement, memo, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space, useTheme } from '@/theme';
import { Icon, IconTile, type IconName, type TileTone } from './Icon';
import { Text } from './Text';

/** Inset grouped section: uppercase footnote header, white cells, footnote footer (brief §13.1). */
export function Section({
  header,
  headerRight,
  footer,
  children,
  style,
  inset = true,
  separatorInset,
}: {
  separatorInset?: number;
  header?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  inset?: boolean;
}) {
  const { c } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.section, style]}>
      {header || headerRight ? (
        <View style={styles.headerRow} accessibilityRole="header">
          {header ? (
            <Text variant="footnote" color="label2" uppercase style={styles.headerText}>
              {header}
            </Text>
          ) : (
            <View />
          )}
          {typeof headerRight === 'string' ? (
            <Text variant="footnote" color="label2" uppercase>
              {headerRight}
            </Text>
          ) : (
            headerRight
          )}
        </View>
      ) : null}
      {items.length > 0 ? (
        <View style={[styles.group, inset && styles.inset, { backgroundColor: c.card }]}>
          {items.map((child, i) => (
            <Fragment key={child.key ?? i}>
              {i > 0 ? (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: c.separator, marginLeft: separatorInset ?? ((child.props as { icon?: unknown }).icon ? 60 : 16) },
                  ]}
                />
              ) : null}
              {child}
            </Fragment>
          ))}
        </View>
      ) : null}
      {footer ? (
        typeof footer === 'string' ? (
          <Text variant="footnote" color="label2" style={styles.footer}>
            {footer}
          </Text>
        ) : (
          <View style={styles.footer}>{footer}</View>
        )
      ) : null}
    </View>
  );
}

export type Accessory = 'chevron' | 'check' | 'lock' | 'none' | 'external';

export interface RowProps {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  iconTone?: TileTone;
  accessory?: Accessory;
  /** Selected state for checkmark rows. */
  checked?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  centered?: boolean;
  tint?: boolean;
  /** Custom trailing content (e.g. a button). */
  trailing?: ReactNode;
  /** Switch row. */
  switchValue?: boolean;
  onSwitch?: (v: boolean) => void;
  disabled?: boolean;
  dimTitle?: boolean;
  accessibilityRole?: 'button' | 'radio' | 'checkbox' | 'switch' | 'link' | 'text' | 'adjustable';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  numberOfLines?: number;
}

export const Row = memo(function Row({
  title,
  subtitle,
  value,
  icon,
  iconTone = 'tint',
  accessory = 'none',
  checked,
  onPress,
  destructive,
  centered,
  tint,
  trailing,
  switchValue,
  onSwitch,
  disabled,
  dimTitle,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  testID,
  numberOfLines,
}: RowProps) {
  const { c } = useTheme();
  const isSwitch = onSwitch != null;
  const titleColor = destructive ? c.red : tint ? c.tint : dimTitle ? c.label2 : c.label;

  const content = (
    <View style={[styles.row, centered && styles.centered]}>
      {icon ? <IconTile name={icon} tone={iconTone} /> : null}
      <View style={[styles.texts, centered && { alignItems: 'center' }]}>
        <Text variant="body" style={{ color: titleColor }} align={centered ? 'center' : undefined} numberOfLines={numberOfLines}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subhead" color="label2">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" color="label2" tabular style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {isSwitch ? (
        <Switch
          value={!!switchValue}
          onValueChange={onSwitch}
          disabled={disabled}
          trackColor={{ true: c.tint, false: Platform.OS === 'ios' ? undefined : c.fill }}
          thumbColor={Platform.OS === 'android' ? (switchValue ? c.onTint : '#FFFFFF') : undefined}
          ios_backgroundColor={c.fill}
          accessibilityLabel={accessibilityLabel ?? title}
        />
      ) : null}
      {accessory === 'chevron' ? <Icon name="chevronRight" size={14} color={c.label3} weight="semibold" /> : null}
      {accessory === 'external' ? <Icon name="external" size={14} color={c.label3} weight="semibold" /> : null}
      {accessory === 'lock' ? <Icon name="lock" size={15} color={c.label2} /> : null}
      {accessory === 'check' ? (
        <View style={styles.checkSlot}>{checked ? <Icon name="check" size={17} color={c.tint} weight="semibold" /> : null}</View>
      ) : null}
    </View>
  );

  if (!onPress || isSwitch) {
    return (
      <View
        testID={testID}
        accessible={isSwitch ? false : !!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        style={{ opacity: disabled && !isSwitch ? 0.5 : 1 }}
      >
        {content}
      </View>
    );
  }

  const role = accessibilityRole ?? (accessory === 'check' ? 'radio' : 'button');
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? [title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      accessibilityState={
        role === 'radio' || role === 'checkbox' ? { checked: !!checked, disabled: !!disabled } : { disabled: !!disabled }
      }
      android_ripple={{ color: c.fill }}
      style={({ pressed }) => [pressed && Platform.OS !== 'android' && { backgroundColor: c.fill }, disabled && { opacity: 0.5 }]}
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  section: { marginTop: space.sectionGap },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: space.margin * 2,
    paddingBottom: 7,
  },
  headerText: { flexShrink: 1 },
  group: { overflow: 'hidden' },
  inset: { marginHorizontal: space.margin, borderRadius: radius.list, borderCurve: 'continuous' },
  separator: { height: StyleSheet.hairlineWidth },
  footer: { paddingHorizontal: space.margin * 2, paddingTop: 7 },
  row: {
    minHeight: space.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.margin,
    paddingVertical: 11,
    gap: 14,
  },
  centered: { justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  value: { flexShrink: 0, maxWidth: '50%' },
  checkSlot: { width: 20, alignItems: 'center' },
});
