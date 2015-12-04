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
