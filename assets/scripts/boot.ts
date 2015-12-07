console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  badReading: Action.create(function(reading: any){ return reading; }, Logger.create("Bad Reading")),

  uplinkAvailable: Action.create(function(){ null; }, Logger.create("Uplink Available")),
  startStreaming: Action.create(function(){ null; }, Logger.create("Start Streaming")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),

  closeNotice: Action.create(function(reading: any){ return reading; }, Logger.create("Notice Closed")),
};


import Store from "./store.ts";

var store = Store();
actions.resetReadings.register(store.resetReadings);
actions.newReading.register(store.newReading);


import Accelerometer from "./accelerometer.ts";
var accelerometer = Accelerometer(actions);

import * as Dispatcher from "./dispatcher.ts";
import * as State from "./state.ts";
import { DefaultLogger } from "./logger.ts";
function NoticeStore(logger=DefaultLogger){
  var BAD_READING = "Could not read the data from this device. Please try again on a mobile with working accelerometer.";
  var FAILED_CONNECTION = "Could not start a connection. Please refresh the page to try again.";
  var state, store;
  var dispatcher = Dispatcher.create(logger);

  function dispatch(store){
    dispatcher.dispatch(store);
  }
  function notify(message){
    state = message;
    dispatch(store);
  }
  function closeNotice(){
    state = null;
    dispatch(store);
  }
  store = {
    badReading: notify.bind({}, BAD_READING),
    failedConnection: notify.bind({}, FAILED_CONNECTION),
    closeNotice: closeNotice,
    getState: function(){
      return state;
    },
    register: function(callback){
      dispatcher = dispatcher.register(callback);
      dispatch(store);
      return store;
    }
  };
  store.closeNotice();
  return store;
}
var noticeStore = NoticeStore();
actions.badReading.register(noticeStore.badReading);
actions.failedConnection.register(noticeStore.failedConnection);
actions.closeNotice.register(noticeStore.closeNotice);











import Uplink from "./uplink.ts";
import { getParameterByName } from "./utils.ts";
declare var Ably: any;

function StreamingStore(actions, logger=DefaultLogger){
  var token = getParameterByName("token");
  var channelName = getParameterByName("channel");
  var channel;
  var realtime = new Ably.Realtime({ token: token });
  var state = {status: null, share: false};
  state.status = realtime.connection.state;
  realtime.connection.on("connected", function(err) {
    actions.uplinkAvailable();
  });
  realtime.connection.on("failed", function(err) {
    actions.failedConnection(err.reason);
    state.status = realtime.connection.state;
  });
  var dispatcher = Dispatcher.create(logger);

  function dispatch(store){
    dispatcher.dispatch(store);
  }
  var store = {
    startSharing: function(){
      if (state.status === "connected") {
        state.share = true;
      }
      dispatch(store);
      return store;
    },
    uplinkAvailable: function(){
      state.status = realtime.connection.state;
      channel = realtime.channels.get(channelName);
      dispatch(store);
      return store;
    },
    failedConnection: function(){
      state.status = realtime.connection.state;
      dispatch(store);
      return store;
    },
    newReading: function(reading){
      if (state.share){
        channel.publish("new Reading", reading, function(err) {
          if(err) {
            console.warn("Unable to publish message; err = " + err.message);
          } else {
            console.info("Message successfully sent");
          }
        });
      }
    },
    getState: function(){
      return state;
    },
    register: function(callback){
      dispatcher = dispatcher.register(callback);
      dispatch(store);
      return store;
    }
  };
  return store;
}
var streamingStore = StreamingStore(actions);
actions.startStreaming.register(streamingStore.startSharing);
actions.uplinkAvailable.register(streamingStore.uplinkAvailable);
actions.newReading.register(streamingStore.newReading);
actions.failedConnection.register(streamingStore.failedConnection);
import Events from "./gator.js";

function StreamController($root, actions){
  var events = Events($root, null);
  events.on("click", function (evt: Event) {
    actions.startStreaming();
  });

}

function StreamView($root){
  var $status = $root.querySelector("[data-display~=status]");
  return {
    update: function(store){
      var state = store.getState();
      if (state.status == "failed") {
        $status.innerHTML = "Could not establish connection";
      } else if (state.status == "connected"){
        if (state.share) {
          $status.innerHTML = "Sharing on channel";
        } else {
          $status.innerHTML = "Click to stream flight";
        }
      }
      console.log(state);
    }
  };
}
function StreamComponent($root, world){
  if ($root == void 0) { return; }

  var controller = StreamController($root, world.actions);

  var view = StreamView($root);
  world.streamingStore.register(view.update);
}

var _uplink;
var App = {
  actions: actions,
  store: store,
  noticeStore: noticeStore,
  streamingStore: streamingStore,
  getAccelerometer: function(){
    return accelerometer;
  }
};


import Avionics from "./avionics/component.ts";
import Notice from "./notice/component.ts";
import { ready } from "./dom.ts";

ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionics = Avionics($avionics, App);

  var $notice = document.querySelector("[data-component~=notice]");
  var notice = Notice($notice, App);

  var $stream = document.querySelector("[data-command~=stream]");
  var stream = StreamComponent($stream, App);
});
export default App;
