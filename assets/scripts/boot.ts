console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  badReading: Action.create(function(reading: any){ return reading; }, Logger.create("Bad Reading")),

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
actions.closeNotice.register(noticeStore.closeNotice);


var App = {
  actions: actions,
  store: store,
  noticeStore: noticeStore,
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
});
export default App;
