import { createTranscriptFunction } from "./support.ts";

import * as Action from "../assets/scripts/action.ts";


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
    var action = Action.create(function(){ null; });
    var handler = createTranscriptFunction();
    action.register(handler);
    action();
    expect(handler.transcript[0]).toEqual([]);
  });

  it("should pass details through filter", function(){
    var action = Action.create(function(_string: string){ return "some extended data"; });
    var handler = createTranscriptFunction();
    action.register(handler);
    action("some data");
    expect(handler.transcript[0]).toEqual(["some extended data"]);
  });

  it("should log error if filter raises exception", function(){
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var action = Action.create(function (any){ throw new Error("bad filter"); }, logger);
    action("any string");
    expect(logger.error.transcript[0]).toEqual([new Error("bad filter")]);
  });

  it("should log as info each dispatched action", function(){
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var action = Action.create(identityFn, logger);
    action("some data");
    expect(logger.info.transcript[0]).toEqual(["some data"]);
  });
});
