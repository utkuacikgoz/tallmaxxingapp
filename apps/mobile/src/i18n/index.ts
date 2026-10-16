import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { useCallback } from 'react';

import { AppConfig } from '@/config/app-config';
import { useSettings } from '@/state/settings';
import en from './en';

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false, defaultVariables: { app: AppConfig.appName } },
  returnNull: false,
  initAsync: false,
});

export type TOptions = Record<string, unknown>;

/**
 * `t` that picks the teen variant (`key_teen`) automatically on the teen path and falls back to
 * the parent string. Brief §4.6: parent talks about "them", teen talks to "you".
 */
export function useT() {
  const { t } = useTranslation();
  const role = useSettings((s) => s.role);
  return useCallback(
    (key: string, options?: TOptions): string =>
      t(key, { ...(role === 'teen' ? { context: 'teen' } : null), ...options }) as string,
    [t, role],
  );
}

/** Non-hook access for services (notifications, PDF). */
export function tr(key: string, options?: TOptions): string {
  const role = useSettings.getState().role;
  return i18n.t(key, { ...(role === 'teen' ? { context: 'teen' } : null), ...options }) as string;
}

export default i18n;
