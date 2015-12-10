/* jshint esnext: true */

import { createTranscriptFunction, createTranscriptLogger } from "../support";

import * as Event from "../../client/framework/event";


describe("Event", function(){
  var identityFn = function(a) { return a; };

  it("should pass minutiae to dispatcher", function(){
    var action = Event.create();
    var handler = createTranscriptFunction();
    action.register(handler);
    action("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should pass multiple minutiae to dispatcher", function(){
    var action = Event.create();
    var handler = createTranscriptFunction();
    action.register(handler);
    action(1, 2);
    expect(handler.transcript[0]).toEqual([1, 2]);
  });

  it("should dispatch event with no details", function(){
    var action = Event.create();
    var handler = createTranscriptFunction();
    action.register(handler);
    action();
    expect(handler.transcript[0]).toEqual([]);
  });

});
