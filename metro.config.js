const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Alias react-native → react-native-web for web platform
const rnwPath = require.resolve('react-native-web');
const rnwDir = path.dirname(rnwPath);

config.resolver = {
  ...config.resolver,
  blockList: [
    /^web\/.*/,
    /web\/node_modules\/.*/,
    /\.git\/.*/,
  ],
  platforms: ['ios', 'android', 'web', 'native'],
  extraNodeModules: {
    'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
  },
};

config.watchFolders = [
  __dirname,
  path.join(__dirname, 'node_modules'),
];

module.exports = config;
