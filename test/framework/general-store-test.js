/* jshint esnext: true */

import * as GeneralStore from "../../client/framework/general-store";
import { createTranscriptFunction } from "../support";

describe("General store", function() {

  it("should start with the initial state", function() {
    var state = {type: "initial state"};
    var store = GeneralStore.start(state);
    expect(store.state).toEqual(state);
  });

  it("should use result from evolver/reducer as new state", function(){
    var store = GeneralStore.start();
    store.advance(function(){ return {type: "new state"}; });
    expect(store.state).toEqual({type: "new state"});
  });

  it("should pass initial state to evolver", function(){
    var evolver = createTranscriptFunction();
    var store = GeneralStore.start({type: "initial state"});
    store.advance(evolver);
    expect(evolver.transcript[0]).toEqual([{type: "initial state"}]);
  });

  it("should be extensible with custom handlers", function(){
    var Store = GeneralStore.enhance({
      append: function(state, update1, update2){
        return state + update1 + update2;
      }
    });
    var store = Store.start("A");
    store.append("B", "C");
    expect(store.state).toEqual("ABC");
  });

});
