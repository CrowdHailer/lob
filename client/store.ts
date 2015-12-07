
// Abstract store
function AStore(){
  var state = {};
  return {
    advance: function(evolver){
      console.log("advance");
      state = evolver(state);
    },
    getState: function(){
      return state;
    }
  };
};
var m: number;
var o: any;
o = Object;
function newReading(state){
  console.log(state);
  var i = state.i || 0;
  return o.assign({}, state, {i: i+1});
};

function startStreaming(state){
  if (state.isTransmitting) { return state; }
  return o.assign({}, state, {isTransmitting: true});
}

function MyStore(){
  var myStore = this;
  this.newReading = function(){
    myStore.advance(newReading);
  };
  this.startStreaming = function(){
    myStore.advance(startStreaming);
  };
}


var a = AStore();
MyStore.prototype = a;

export default function(){
  return new MyStore();
}
