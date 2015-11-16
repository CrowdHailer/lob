/*jshint esnext: true */

import { streak } from "../assets/scripts/lob/util.js";


describe("Collection streak function", function() {

  it("It should return an empty list from an empty source", function() {
    var output = streak([], function(){ return true; });
    expect(output).toEqual([]);
  });

});
