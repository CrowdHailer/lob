/* jshint esnext: true */

import { createTranscriptFunction, createTranscriptLogger } from "./support";

import * as Action from "../client/action";


describe("Action", function(){
  var identityFn = function(a) { return a; };

  it("should pass minutiae to dispatcher", function(){
    var action = Action.create(identityFn);
    var handler = createTranscriptFunction();
    action.register(handler);
    action("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should dispatcher event with no details", function(){
    var action = Action.create(function(){  });
    var handler = createTranscriptFunction();
    action.register(handler);
    action();
    expect(handler.transcript[0]).toEqual([]);
  });

  it("should pass details through filter", function(){
    var action = Action.create(function(_string){ return "some extended data"; });
    var handler = createTranscriptFunction();
    action.register(handler);
    action("some data");
    expect(handler.transcript[0]).toEqual(["some extended data"]);
  });

  it("should log error if filter raises exception", function(){
    var logger = createTranscriptLogger();
    var action = Action.create(function (any){ throw new Error("bad filter"); }, logger);
    action("any string");
    expect(logger.error.transcript[0]).toEqual([new Error("bad filter")]);
  });

  it("should log as info each dispatched action", function(){
    var logger = createTranscriptLogger();
    var handler = createTranscriptFunction();
    var action = Action.create(identityFn, logger);
    action.register(handler);
    action("some data");
    expect(logger.info.transcript[0]).toEqual(["some data"]);
  });
});