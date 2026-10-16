const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Drizzle migrations (.sql) and expo-sqlite's web worker (.wasm).
config.resolver.sourceExts.push('sql');
config.resolver.assetExts.push('wasm');

// expo-sqlite on web needs SharedArrayBuffer, which requires cross-origin isolation.
config.server = config.server ?? {};
const prev = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = prev ? prev(middleware, server) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return base(req, res, next);
  };
};

module.exports = config;
