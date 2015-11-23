/* jshint esnext: true*/

import typescript from 'rollup-plugin-typescript';

export default {
  entry: 'assets/scripts/boot.ts',
  format: "iife",
  moduleName: "Lob",
  dest: "public/lob.js",
  // sourceMap: true,
  // sourceMapFile: 'public/lob.js.map',

  plugins: [
    typescript({
      sourceMap: true
    })
  ]
};
