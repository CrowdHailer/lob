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

var NullLogger = {info: function(...a){ null; }, error: function(...a){ null; }};

function Dispatcher(handlers, world=NullLogger){
  this.dispatch = function(minutiae){
    handlers.forEach(function(handler){
      try {
        handler.call({}, minutiae);
      } catch(e) {
        world.error(e);
      }
    });
    world.info(minutiae);
  };
  this.register = function(handler){
    return new Dispatcher(handlers.concat(handler), world);
  };
};

describe("Dispatcher", function(){
  it("should pass the minutiae (precise details) to a registered listener", function(){
    var handler = createTranscriptFunction();
    var dispatcher = new Dispatcher([handler]);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should be possible to register new handlers", function(){
    var handler = createTranscriptFunction();
    var dispatcher = new Dispatcher([]);
    dispatcher = dispatcher.register(handler);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should dispatch to all handlers after error", function(){
    var badHandler = function(){ throw new Error("bad handler"); };
    var handler = createTranscriptFunction();
    var dispatcher = new Dispatcher([]);
    dispatcher = dispatcher.register(badHandler).register(handler);
    dispatcher.dispatch("some data");
    expect(handler.transcript[0]).toEqual(["some data"]);
  });

  it("should log as info each dispatched action", function(){
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var dispatcher = new Dispatcher([], logger);
    dispatcher.dispatch("some data");
    expect(logger.info.transcript[0]).toEqual(["some data"]);
  });

  it("should log as an error if a dispatch fails", function(){
    var badHandler = function(){ throw new Error("bad handler"); };
    var logger = {info: createTranscriptFunction(), error: createTranscriptFunction()};
    var dispatcher = new Dispatcher([], logger);
    dispatcher = dispatcher.register(badHandler);
    dispatcher.dispatch("some data");
    expect(logger.error.transcript[0]).toEqual([new Error("bad handler")]);
  });
});
