/* jshint esnext: true*/

import typescript from 'rollup-plugin-typescript';

export default {
  entry: 'test/lob-test.ts',
  format: "iife",
  moduleName: "test",
  dest: "tmp/test-bundle.js",
  // sourceMap: true,
  // sourceMapFile: 'public/lob.js.map',

  plugins: [
    typescript({
      sourceMap: true
    })
  ]
};
