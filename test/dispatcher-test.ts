function createTranscriptFunction(){
  var transcript = [];
  var func: { (...a): void; transcript: any[]; };
  var f: any = function(...a){
    transcript.push(a);
  };
  f.transcript = transcript;
  func = f;
  return func;
};
import * as Dispatcher from "../assets/scripts/dispatcher.ts";

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

  it("should dispatch to all handlers after error", function(){
    var badHandler = function(){ throw new Error("bad handler"); };
    var handler = createTranscriptFunction();
    var dispatcher = Dispatcher.create().register(handler);
    dispatcher = dispatcher.register(badHandler).register(handler);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should log as info each dispatched action", function(){
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var dispatcher = Dispatcher.create(logger);
    dispatcher.dispatch("some data");
    expect(logger.info.transcript[0]).toEqual(["some data"]);
  });

  it("should log as an error if a dispatch fails", function(){
    var badHandler = function(){ throw new Error("bad handler"); };
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var dispatcher = Dispatcher.create(logger).register(badHandler);
    dispatcher.dispatch("some data");
    expect(logger.error.transcript[0]).toEqual([new Error("bad handler")]);
  });
});
