const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// npm workspaces symlink support
config.resolver.unstable_enableSymlinks = true;

// Watch entire workspace so Metro can resolve shared package via symlink
config.watchFolders = [projectRoot];

// Resolve node_modules from workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Allow Metro to transform TypeScript files from symlinked packages
// (shared/package.json points to src/index.ts which is TypeScript)
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'ts', 'tsx', 'mjs', 'cjs'];

module.exports = config;
