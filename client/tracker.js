import * as URI from "./uri";
var uri = URI.parseLocation(window.location);

var State = {
  fromUri: function(uri){
    return {
      token: uri.query["token"],
      channelName: uri.query["channel"]
    }
  }
}

function Tracker(){
  var state;
  var tracker = this;
  function render(projection){
    tracker.display.render(projection);
  }
  this.applyState = function(newState){
    state = newState;
    render(state);
  }
}

function ConsoleDisplay(logger){
  function wrap(projection){
    return "listening on: " + projection.channelName 
  }

  this.render = function(projection){
    logger.info(wrap(projection));
  }
}

var tracker = new Tracker();
tracker.display = new ConsoleDisplay(window.console);
tracker.applyState(State.fromUri(uri));
