import { createTranscriptFunction, createTranscriptLogger } from "./support.ts";

import * as Dispatcher from "../assets/scripts/dispatcher.ts";

import { NullLogger } from "../assets/scripts/logger.ts";

describe("Dispatcher", function(){
  it("should pass the minutiae (precise details) to a registered listener", function(){
    var handler = createTranscriptFunction();
    var dispatcher = Dispatcher.create().register(handler);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should be possible to register new handlers", function(){
    var handler = createTranscriptFunction();
    var dispatcher = Dispatcher.create().register(handler);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should dispatch to all handlers after error NOTE assuming Logger silent", function(){
    var badHandler = function(){ throw new Error("bad handler"); };
    var handler = createTranscriptFunction();
    var dispatcher = Dispatcher.create(NullLogger).register(handler);
    dispatcher = dispatcher.register(badHandler).register(handler);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should log as info each dispatched action", function(){
    var logger = createTranscriptLogger();
    var handler = createTranscriptFunction();
    var dispatcher = Dispatcher.create(logger).register(handler);
    dispatcher.dispatch("some data");
    expect(logger.info.transcript[0]).toEqual(["some data"]);
  });

  it("should log as warning each dispatched action if no listeners", function(){
    var logger = createTranscriptLogger();
    var dispatcher = Dispatcher.create(logger);
    dispatcher.dispatch("some data");
    expect(logger.warn.transcript[0]).toEqual(["some data"]);
  });

  it("should log event as info each dispatched action, when no data", function(){
    var logger = createTranscriptLogger();
    var handler = createTranscriptFunction();
    var dispatcher = Dispatcher.create(logger).register(handler);
    dispatcher.dispatch();
    expect(logger.info.transcript[0]).toEqual([]);
  });

  it("should log as an error if a dispatch fails", function(){
    var badHandler = function(){ throw new Error("bad handler"); };
    var logger = createTranscriptLogger();
    var dispatcher = Dispatcher.create(logger).register(badHandler);
    dispatcher.dispatch("some data");
    expect(logger.error.transcript[0]).toEqual([new Error("bad handler")]);
  });
});
