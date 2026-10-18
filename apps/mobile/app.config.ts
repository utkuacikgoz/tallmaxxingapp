import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_NAME = 'TallSoon'; // keep in sync with src/config/app-config.ts (AppConfig.appName)
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const bundleId = IS_DEV ? 'app.tallsoon.dev' : IS_PREVIEW ? 'app.tallsoon.preview' : 'app.tallsoon';
const iosBundleId = IS_DEV || IS_PREVIEW ? bundleId : 'com.belevate.tallsoon';

function validateProductionRevenueCatKey() {
  if (process.env.APP_VARIANT !== 'production' || process.env.EAS_BUILD !== 'true') return;

  const platform = process.env.EAS_BUILD_PLATFORM;
  const keyName = platform === 'ios' ? 'EXPO_PUBLIC_RC_IOS_KEY' : platform === 'android' ? 'EXPO_PUBLIC_RC_ANDROID_KEY' : null;
  if (!keyName) {
    throw new Error(`Production EAS builds require EAS_BUILD_PLATFORM to be "ios" or "android" (received ${platform ?? 'unset'}).`);
  }
  if (!process.env[keyName]?.trim()) {
    throw new Error(`Production EAS ${platform} builds require ${keyName}; refusing to build with the mock entitlement service.`);
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  validateProductionRevenueCatKey();
  return {
    ...config,
    name: IS_DEV ? `${APP_NAME} Dev` : IS_PREVIEW ? `${APP_NAME} Preview` : APP_NAME,
    slug: 'tallsoon',
    scheme: 'tallsoon',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: iosBundleId,
      appleTeamId: '9D78WTZAD8',
      supportsTablet: false,
      config: { usesNonExemptEncryption: false },
      infoPlist: {
        NSPhotoLibraryAddUsageDescription: 'Save your result card to Photos so you can share it.',
        ITSAppUsesNonExemptEncryption: false,
      },
      // Required-reason APIs used by Expo modules and MMKV; no tracking (brief §6.1).
      privacyManifests: {
        NSPrivacyTracking: false,
        NSPrivacyTrackingDomains: [],
        NSPrivacyCollectedDataTypes: [
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePurchaseHistory',
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              'NSPrivacyCollectedDataTypePurposeAppFunctionality',
              'NSPrivacyCollectedDataTypePurposeAnalytics',
            ],
          },
        ],
        NSPrivacyAccessedAPITypes: [
          { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
          { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
          { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1'] },
          { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
        ],
      },
    },
    android: {
      package: bundleId,
      adaptiveIcon: {
        backgroundColor: '#2F7D6D',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: true,
      permissions: ['android.permission.POST_NOTIFICATIONS'],
      // No ad ID, no exact alarms (brief §6.2b).
      blockedPermissions: [
        'com.google.android.gms.permission.AD_ID',
        'android.permission.SCHEDULE_EXACT_ALARM',
        'android.permission.USE_EXACT_ALARM',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
      ],
      allowBackup: true,
    },
    web: { output: 'single', favicon: './assets/images/favicon.png', bundler: 'metro' },
    plugins: [
      'expo-router',
      ['expo-splash-screen', { backgroundColor: '#F2F2F7', dark: { backgroundColor: '#000000' }, image: './assets/images/splash-icon.png', imageWidth: 88 }],
      'expo-sqlite',
      'expo-localization',
      'expo-sharing',
      ['expo-notifications', { color: '#2F7D6D', defaultChannel: 'reminders', enableRemoteNotifications: false }],
      ['expo-media-library', { photosPermission: false, savePhotosPermission: 'Save your result card to Photos so you can share it.', granularPermissions: ['photo'] }],
      ['expo-build-properties', { android: { targetSdkVersion: 36, compileSdkVersion: 37 }, ios: { deploymentTarget: '16.4' } }],
    ],
    experiments: { typedRoutes: false, reactCompiler: true },
    extra: { eas: { projectId: process.env.EAS_PROJECT_ID ?? '830cb434-572b-47bf-a88f-6e909f4141ff' } },
    owner: process.env.EAS_OWNER ?? 'utkuacikgoz',
  };
};
