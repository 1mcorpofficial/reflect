/* eslint-disable @typescript-eslint/no-require-imports */
const tsConfigPaths = require('tsconfig-paths');
const path = require('path');

const baseUrl = path.resolve(__dirname);
tsConfigPaths.register({
  baseUrl,
  paths: {
    '@/*': ['./src/*'],
  },
});
