/* jshint esnext: true */

import GeneralStore from "../client/general-store";
import { createTranscriptFunction } from "./support";
import { factory } from "../client/general-store";

describe("General store", function() {

  it("should start with an empty object state", function() {
    var store = GeneralStore({});
    expect(store.state).toEqual({});
  });

  it("should use result from evolver/reducer as new state", function(){
    var store = GeneralStore();
    store.advance(function(){ return {type: "new state"}; });
    expect(store.state).toEqual({type: "new state"});
  });

  it("should pass initial state to evolver", function(){
    var evolver = createTranscriptFunction();
    var store = GeneralStore({type: "initial state"});
    store.advance(evolver);
    expect(evolver.transcript[0]).toEqual([{type: "initial state"}]);
  });

  xit("other", function(){
    // For the time being a bit unnecessarily advanced.
    var Store = factory({a: function aye(state, x){ console.log(x, state); return state + x; }});
    var store = Store(0);
    console.log("initial", Store.advance);
    store.a(2);
    console.log("after", store.state);
    store.a(-1);
    console.log("after", store.state);
  });

});
