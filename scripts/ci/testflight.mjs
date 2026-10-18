import { createPrivateKey, sign } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const BUNDLE_ID = 'com.belevate.tallsoon';
export function credentialProblems(env) {
  const problems = [];
  for (const name of ['ASC_KEY_P8', 'ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_APP_ID', 'IOS_DISTRIBUTION_P12_BASE64', 'IOS_DISTRIBUTION_P12_PASSWORD', 'IOS_PROVISIONING_PROFILE_BASE64', 'EXPO_PUBLIC_RC_IOS_KEY']) {
    if (!env[name]?.trim()) problems.push(`Missing ${name}`);
  }
  if (env.ASC_KEY_ID && !/^[A-Z0-9]{10}$/.test(env.ASC_KEY_ID)) problems.push('ASC_KEY_ID must be the ten-character Apple key ID');
  if (env.ASC_ISSUER_ID && !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(env.ASC_ISSUER_ID)) problems.push('ASC_ISSUER_ID must be the Apple issuer UUID');
  if (env.ASC_APP_ID && !/^[1-9]\d*$/.test(env.ASC_APP_ID)) problems.push('ASC_APP_ID must be the numeric App Store Connect Apple ID');
  if (env.ASC_KEY_P8) {
    try {
      const key = createPrivateKey(env.ASC_KEY_P8);
      if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') throw new Error();
    } catch {
      problems.push('ASC_KEY_P8 must contain the complete original P-256 .p8 private key, including PEM headers and real newlines');
    }
  }
  for (const name of ['IOS_DISTRIBUTION_P12_BASE64', 'IOS_PROVISIONING_PROFILE_BASE64']) {
    if (env[name] && (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(env[name].replace(/\s/g, '')) || Buffer.from(env[name], 'base64').length === 0)) problems.push(`${name} must be the base64-encoded original file`);
  }
  if (env.EXPO_PUBLIC_RC_IOS_KEY && !/^appl_\S+$/.test(env.EXPO_PUBLIC_RC_IOS_KEY)) problems.push('EXPO_PUBLIC_RC_IOS_KEY must be the Apple app public SDK key (appl_), not a Test Store or private key');
  return problems;
}

export function appleToken(env, now = Math.floor(Date.now() / 1000)) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'ES256', kid: env.ASC_KEY_ID, typ: 'JWT' })}.${encode({ iss: env.ASC_ISSUER_ID, iat: now, exp: now + 300, aud: 'appstoreconnect-v1' })}`;
  return `${unsigned}.${sign('sha256', Buffer.from(unsigned), { key: env.ASC_KEY_P8, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}

export async function appleGet(path, env, fetcher = fetch) {
  const response = await fetcher(`https://api.appstoreconnect.apple.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${appleToken(env)}` }, signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Apple API returned HTTP ${response.status}. Check the CI key, issuer, App Manager access, and ASC_APP_ID.`);
  return response.json();
}

export async function verifyAppleApp(env, fetcher = fetch) {
  const result = await appleGet(`apps/${env.ASC_APP_ID}?fields[apps]=bundleId,name`, env, fetcher);
  if (result.data?.attributes?.bundleId !== BUNDLE_ID) throw new Error(`ASC_APP_ID does not identify ${BUNDLE_ID}; no build or upload started.`);
  return result.data;
}

function summary(message) {
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
}

async function main() {
  if (process.argv[2] === 'credentials') {
    const problems = credentialProblems(process.env);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `ready=${problems.length === 0}\n`);
    summary(problems.length ? `## No TestFlight build started\n\nConfigure these prerequisites:\n${problems.map((problem) => `- ${problem}`).join('\n')}` : 'CI credential format checks passed. The macOS release job will validate Apple access and signing before archiving with Xcode.');
    return;
  }
  if (process.argv[2] !== 'verify-apple') throw new Error('Use credentials or verify-apple');
  const problems = credentialProblems(process.env);
  if (problems.length) throw new Error(problems.join('; '));
  await verifyAppleApp(process.env);
  summary(`Verified App Store Connect app for ${BUNDLE_ID}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
