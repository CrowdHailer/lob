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
  function updateProjection(state){
    tracker.projection.update(state);
  }
  this.applyState = function(newState){
    state = newState;
    updateProjection(state);
  }
}

function ConsoleView(logger){
  function wrap(projection){
    return "listening on: " + projection.channel + " with token: " + projection.token
    // returns presentation
  }

  this.render = function(projection){
    logger.info(wrap(projection));
  }
}

function Projection(){
  // Could be past console
  var views = [];
  var projection;
  this.update = function(state){
    // return projection
    projection = {
      channel: state.channelName,
      token: state.token.slice(0, 4) + "..."
    }
  }
  this.watch = function(view){
    view(projection);
    views.push(view);
  }
}

var tracker = new Tracker();
tracker.projection = new Projection();
tracker.applyState(State.fromUri(uri));

var consoleView = new ConsoleView(window.console);
tracker.projection.watch(consoleView.render)