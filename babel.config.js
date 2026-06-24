module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@api': './src/api',
            '@types': './src/types',
            '@constants': './src/constants',
            '@utils': './src/utils',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
