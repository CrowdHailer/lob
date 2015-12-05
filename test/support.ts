export function createTranscriptFunction(){
  var transcript = [];
  var func: { (...a): void; transcript: any[]; };
  var f: any = function(...a){
    transcript.push(a);
  };
  f.transcript = transcript;
  func = f;
  return func;
};

export function createTranscriptLogger(){
  return {
    info: createTranscriptFunction(),
    warn: createTranscriptFunction(),
    error: createTranscriptFunction()
  };
}

export function freefallReading(timestamp=10000){
  return {
    acceleration: {x: 0, y: 0, z: -1},
    timestamp: timestamp
  };
};
export function stationaryReading(timestamp=10000){
  return {
    acceleration: {x: 0, y: 0, z: -10},
    timestamp: timestamp
  };
};
