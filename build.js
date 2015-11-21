var rollup = require('rollup');
var typescript = require('rollup-plugin-typescript');

rollup.rollup({
  entry: 'assets/scripts/boot.ts',
  plugins: [
    typescript({
      sourceMap: true
    })
  ]
}).then(function (bundle) {
  bundle.write({
    format: "iife",
    moduleName: "Lob",
    dest: "public/lob.js"
  });
});
