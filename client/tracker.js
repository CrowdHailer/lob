/* jshint esnext: true */

// IMPORTS
import "./utils/polyfill";
import Tracker from "./tracker/tracker";
import Router from "./router";
import UplinkController from "./tracker/uplink-controller";
import ConsoleView from "./tracker/console-view";
import Showcase from "./tracker/showcase";
import Reading from "./lib/reading";
import AlertDisplay from "./alert/display";
import Phone from "./lib/phone";
import GraphDisplay from "./tracker/graph-display";
import { ready } from "./utils/dom";

// GENERAL CONFIGURATION
window.Tracker = Tracker;
window.Tracker.Reading = Reading;


var router = Router(window.location);
console.log('Router:', 'Started with initial state:', router.state);


var tracker = new Tracker();
tracker.logger = window.console;
tracker.showcase = Showcase(window);

var uplinkController = new UplinkController(router.state, tracker);

function uplinkStatusMessageFromProjection(projection) {
  var message = projection.uplinkStatus;
  if (message === 'AVAILABLE') {
    return '<p>Connection made to live Lob <b>' + projection.uplinkChannelName + '</b>.</p>' +
      '<p>Waiting for device to stream its position in real time.</p>' +
      '<p>Are you sure the device is publishing with ID <b>' + projection.uplinkChannelName + '?</b>';
  } else if (message === 'STREAMING') {
    return 'Streaming live Lob <b>' + projection.uplinkChannelName + "</b>";
  } else if (message === 'FAILED') {
    return 'Could not connect to live Lob realtime service';
  } else if (message === 'DISCONNECTED') {
    return 'Hold on, we\'re currently disconnected from the live Lob';
  } else {
    return 'Unknown';
  }
}

ready(function(){
  var $root = document.documentElement;
  var $uplinkStatusMessage = queryDisplay('uplink-status-message', $root);
  var $graphAndPhone = queryDisplay('graph-and-phone', $root);
  var $preloader = queryDisplay('connecting-loader', $root);
  var $alert = queryDisplay('alert', $root);
  var alertDisplay = AlertDisplay($alert);
  var graphDisplay;

  var phone = new Phone();

  var mainView = {
    render: function(projection) {
      $uplinkStatusMessage.innerHTML = uplinkStatusMessageFromProjection(projection);

      if (projection.uplinkStatus === 'STREAMING') {
        $graphAndPhone.style.display = 'block';
        $preloader.style.display = 'none';
        if (!graphDisplay) {
          graphDisplay = new GraphDisplay('tracker-graph');
        }
      } else {
        $graphAndPhone.style.display = 'none';
        $preloader.style.display = 'block';
      }

      var alertMessage = projection.alert;
      if (alertMessage) {
        alertDisplay.message = alertMessage;
        alertDisplay.active = true;
      } else {
        alertDisplay.active = false;
      }
    },

    addReading: function(newReading) {
      graphDisplay.addPoint(newReading);
    },

    addFlight: function(newFlightData) {
      graphDisplay.addFlight(newFlightData);
    }
  };
  tracker.showcase.addView(mainView);
  tracker.showcase.addPhone(phone);
});


// Dom views should be initialized with the ready on certain selectors library
function queryDisplay(display, element){
  return element.querySelector('[data-display~=' + display + ']');
}
export default tracker;

