/*jshint esnext: true */

import { streak } from "../assets/scripts/lob/util.js";

describe("Collection streak function", function() {

  it("it should return an empty list from an empty source", function() {
    var output = streak(function(){ return true; }, []);
    expect(output).toEqual([]);
  });

  it("it should return an empty list for collection with none passing predicate", function() {
    var output = streak(function(){ return false; }, [2, 3]);
    expect(output).toEqual([]);
  });

  it("it should return single streak for passing collection", function () {
    var output = streak(function(){ return true; }, [1, 2, 3]);
    expect(output).toEqual([[1, 2, 3]]);
  });

  it("it should stop when predicate no longer true", function () {
    var output = streak(function(i){ return i < 3; }, [1, 2, 3]);
    expect(output).toEqual([[1, 2]]);
  });

  it("it should pass multiple streaks", function () {
    var output = streak(function(i){ return i < 3; }, [1, 2, 3, 1, 2, 3]);
    expect(output).toEqual([[1, 2], [1, 2]]);
  });

});
