/* jshint esnext: true */

import GeneralStore from "../client/general-store";
import { createTranscriptFunction } from "./support";

describe("General store", function() {

  it("should start with an empty object state", function() {
    var store = GeneralStore();
    expect(store.state).toEqual({});
  });

  it("should use result from evolver/reducer as new state", function(){
    var store = GeneralStore();
    store.advance(function(){ return {type: "new state"}; });
    expect(store.state).toEqual({type: "new state"});
  });

  it("should pass initial state to evolver", function(){
    var evolver = createTranscriptFunction();
    var store = GeneralStore();
    store.advance(evolver);
    expect(evolver.transcript[0]).toEqual([{}]);
  });

});
