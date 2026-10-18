const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const compiled = ts.transpileModule(fs.readFileSync('apps/mobile/app.config.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
function config(env) {
  const output = {};
  vm.runInNewContext(compiled, { exports: output, process: { env } });
  return output.default({ config: {} });
}
for (const platform of ['ios', 'android']) {
  const key = platform === 'ios' ? 'EXPO_PUBLIC_RC_IOS_KEY' : 'EXPO_PUBLIC_RC_ANDROID_KEY';
  const env = { APP_VARIANT: 'production', EAS_BUILD: 'true', EAS_BUILD_PLATFORM: platform };
  assert.throws(() => config(env), new RegExp(key));
  assert.throws(() => config({ ...env, [key]: '   ' }), new RegExp(key));
  assert.equal(config({ ...env, [key]: 'test-public-sdk-key' })[platform][platform === 'ios' ? 'bundleIdentifier' : 'package'], platform === 'ios' ? 'com.belevate.tallsoon' : 'app.tallsoon');
}
assert.throws(() => config({ APP_VARIANT: 'production', EAS_BUILD: 'true' }), /EAS_BUILD_PLATFORM/);
assert.equal(config({ APP_VARIANT: 'preview', EAS_BUILD: 'true' }).ios.bundleIdentifier, 'app.tallsoon.preview');
assert.equal(config({ APP_VARIANT: 'development' }).ios.bundleIdentifier, 'app.tallsoon.dev');
assert.equal(config({}).ios.bundleIdentifier, 'com.belevate.tallsoon');
assert.equal(config({}).ios.appleTeamId, '9D78WTZAD8');
const eas = JSON.parse(fs.readFileSync('apps/mobile/eas.json', 'utf8'));
assert.equal(eas.build.production.env.APP_VARIANT, 'production');
assert.equal(eas.build.development.developmentClient, true);
assert.equal(eas.submit.production.android.track, 'internal');
for (const file of ['icon', 'splash-icon', 'android-icon-foreground', 'android-icon-background', 'android-icon-monochrome']) {
  const bytes = fs.readFileSync(`apps/mobile/assets/images/${file}.png`);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.equal(bytes.readUInt32BE(16), 1024);
  assert.equal(bytes.readUInt32BE(20), 1024);
}
console.log('Release config guards, profiles and asset dimensions passed.');
