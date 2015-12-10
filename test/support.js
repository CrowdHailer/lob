/* jshint esnext: true */

export function createTranscriptFunction(fn){
  var transcript = [];
  var func;
  var f = function(){
    transcript.push(Array.prototype.slice.call(arguments));
    if (fn){
      return fn.apply(this, Array.prototype.slice.call(arguments));
    }
  };
  f.transcript = transcript;
  Object.defineProperty(f, "lastCall", {
    get: function(){
      return transcript[0];
    }
  });
  func = f;
  return func;
}

export function createTranscriptLogger(){
  return {
    debug: createTranscriptFunction(),
    info: createTranscriptFunction(),
    warn: createTranscriptFunction(),
    error: createTranscriptFunction()
  };
}

export function freefallReading(timestamp){
  return {
    acceleration: {x: 0, y: 0, z: -1},
    timestamp: timestamp
  };
}
export function stationaryReading(timestamp){
  return {
    acceleration: {x: 0, y: 0, z: -10},
    timestamp: timestamp
  };
}
