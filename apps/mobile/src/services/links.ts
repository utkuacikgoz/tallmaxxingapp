import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

import { AppConfig } from '@/config/app-config';

/** External links open in an in-app browser (SFSafariViewController / Custom Tabs), brief §6.2. */
export async function openUrl(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      dismissButtonStyle: 'done',
    });
  } catch {
    await Linking.openURL(url);
  }
}

export function openLegal(doc: 'terms' | 'privacy') {
  // Apple's standard EULA applies unless a custom one is published at termsUrl.
  void openUrl(doc === 'terms' ? AppConfig.termsUrl : AppConfig.privacyUrl);
}

export function mailSupport(subject: string) {
  const url = `mailto:${AppConfig.supportEmail}?subject=${encodeURIComponent(subject)}`;
  void Linking.openURL(url);
}

export function openSystemSettings() {
  if (Platform.OS === 'web') return;
  void Linking.openSettings();
}
