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

var identityFn = function(a) { return a; };
var NullLogger = {info: function(...a){ null; }, error: function(...a){ null; }};

function createAction(filter: () => void, logger?): {(): void, register: (handler: ()=> void) => void}
function createAction<A, B>(filter: (a: A) => B, logger?): {(a: A): void, register: (handler: (m: B)=> void) => void}
function createAction(filter, logger=NullLogger){
  var action: any;
  var dispatcher = Dispatcher.create();
  action = function(minutiae){
    try {
      dispatcher.dispatch(filter(minutiae));
    }
    catch (e) {
      logger.error(e);
    }
  };
  action.register = function(handler){
    dispatcher = dispatcher.register(handler);
  };
  return action;
};

describe("Action", function(){
  it("should pass minutiae to dispatcher", function(){
    var action = createAction(identityFn);
    var handler = createTranscriptFunction();
    action.register(handler);
    action("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should pass details through filter", function(){
    var action = createAction(function(_string: string){ return "some extended data"; });
    var handler = createTranscriptFunction();
    action.register(handler);
    action("some data");
    expect(handler.transcript[0]).toEqual(["some extended data"]);
  });

  it("should log error if filter raises exception", function(){
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var action = createAction(function (){ throw new Error("bad filter"); }, logger);
    action();
    expect(logger.error.transcript[0]).toEqual([new Error("bad filter")]);
  });
});

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
