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

function Dispatcher(handlers, world={info: function(...a){ null; }}){
  this.dispatch = function(){
    var args = Array.prototype.slice.call(arguments);
    handlers.forEach(function(h){
      try {
        h.apply({}, args);
      } catch(e) {

      }
    });
    world.info.apply({}, args);
  };
  this.register = function(handler){
    return new Dispatcher(handlers.concat(handler));
  };
};

describe("Dispatcher", function(){
  it("should pass the minutiae (precise details) to a registered listener", function(){
    var handler = createTranscriptFunction();
    var dispatcher = new Dispatcher([handler]);
    dispatcher.dispatch("some data");
    dispatcher.dispatch(1, 2);
    expect(handler.transcript[0]).toEqual(["some data"]);
    expect(handler.transcript[1]).toEqual([1, 2]);
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
    var logger = {info: createTranscriptFunction()};
    var dispatcher = new Dispatcher([], logger);
    dispatcher.dispatch("some data");
    expect(logger.info.transcript[0]).toEqual(["some data"]);
  });
});
