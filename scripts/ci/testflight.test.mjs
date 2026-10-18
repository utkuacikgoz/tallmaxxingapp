import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import test from 'node:test';
import { BUNDLE_ID, appleToken, credentialProblems, verifyAppleApp } from './testflight.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const env = {
  IOS_DISTRIBUTION_P12_BASE64: 'YWJj', IOS_DISTRIBUTION_P12_PASSWORD: 'test-password', IOS_PROVISIONING_PROFILE_BASE64: 'YWJj', EXPO_PUBLIC_RC_IOS_KEY: 'appl_example', ASC_KEY_ID: 'ABCDEFGHIJ', ASC_ISSUER_ID: '11111111-2222-3333-4444-555555555555', ASC_APP_ID: '1234567890',
  ASC_KEY_P8: privateKey.export({ type: 'pkcs8', format: 'pem' }),
};

test('reports missing credentials and rejects malformed secrets without exposing their contents', () => {
  assert.equal(credentialProblems({}).length, 8);
  assert.deepEqual(credentialProblems(env), []);
  const problems = credentialProblems({ ...env, ASC_KEY_ID: 'bad', ASC_APP_ID: BUNDLE_ID, ASC_KEY_P8: 'private-content-must-not-be-printed' });
  assert.equal(problems.length, 3);
  assert.ok(!problems.join(' ').includes('private-content-must-not-be-printed'));
  const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
  assert.ok(credentialProblems({ ...env, ASC_KEY_P8: rsa }).some((problem) => problem.includes('P-256')));
});

test('signs a short-lived Apple ES256 token using the configured issuer/key', () => {
  const token = appleToken(env, 1000);
  const [header, payload, signature] = token.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), { alg: 'ES256', kid: env.ASC_KEY_ID, typ: 'JWT' });
  assert.deepEqual(JSON.parse(Buffer.from(payload, 'base64url')), { iss: env.ASC_ISSUER_ID, iat: 1000, exp: 1300, aud: 'appstoreconnect-v1' });
  assert.ok(verify('sha256', Buffer.from(`${header}.${payload}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url')));
});

test('validates Apple app identity before any build and refuses inaccessible or wrong apps', async () => {
  const fetcher = async (url, options) => {
    assert.ok(url.startsWith(`https://api.appstoreconnect.apple.com/v1/apps/${env.ASC_APP_ID}?`));
    assert.ok(options.headers.Authorization.startsWith('Bearer '));
    return { ok: true, json: async () => ({ data: { id: env.ASC_APP_ID, attributes: { bundleId: BUNDLE_ID, name: 'TallSoon' } } }) };
  };
  assert.equal((await verifyAppleApp(env, fetcher)).id, env.ASC_APP_ID);
  await assert.rejects(verifyAppleApp(env, async () => ({ ok: true, json: async () => ({ data: { attributes: { bundleId: 'another.app' } } }) })), /no build or upload started/);
  await assert.rejects(verifyAppleApp(env, async () => ({ ok: false, status: 403 })), /HTTP 403/);
});

test('rejects invalid encoded signing files and sandbox SDK keys', () => {
  for (const patch of [{ IOS_DISTRIBUTION_P12_BASE64: 'invalid!' }, { IOS_PROVISIONING_PROFILE_BASE64: '====' }, { EXPO_PUBLIC_RC_IOS_KEY: 'test_example' }, { EXPO_PUBLIC_RC_IOS_KEY: 'sk_secret' }]) {
    assert.ok(credentialProblems({ ...env, ...patch }).length > 0);
  }
});
