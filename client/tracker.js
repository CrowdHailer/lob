/* jshint esnext: true */

import * as URI from "./uri";
var uri = URI.parseLocation(window.location);

var State = {
  fromUri: function(uri){
    return {
      token: uri.query["token"],
      channelName: uri.query["channel"],

    };
  }
};

// An app could act as a wrapper around an events object
function Tracker(){
  var state;
  var tracker = this;
  function updateProjection(state){
    tracker.projection.update(state);
  }
  this.watchProjection = function(view){
    tracker.projection.watch(view);
  };
  // this.someAction = function(update){
  //   try {
  //     state = new SomeAction(state, update, world);
  //   } catch (e) {
  //     // no update
  //   }
  // }
  this.uplinkAvailable = function(){
    console.log("uplink available");
  };
  this.receivedNewReaded = function(reading){
    console.log(reading);
  };
  this.receivedResetReadings = function(){
    console.log("reset reading");
  };
  this.applyState = function(newState){
    state = newState;
    updateProjection(state);
  };

}

function ConsoleView(logger){
  function wrap(projection){
    return "listening on: " + projection.channel + " with token: " + projection.token;
    // returns presentation
  }

  this.render = function(projection){
    logger.info(wrap(projection));
  };
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
    };
  };
  this.watch = function(view){
    view(projection);
    views.push(view);
  };
}

var tracker = new Tracker();
tracker.projection = new Projection();
tracker.applyState(State.fromUri(uri));
// tracker.init()

var consoleView = new ConsoleView(window.console);
tracker.watchProjection(consoleView.render);
// Dom views should be initialized with the ready on certain selectors library

import UplinkController from "./tracker/uplink-controller";

var uplinkController = new UplinkController({
  token: uri.query.token,
  channel: uri.query.channel
}, tracker);
