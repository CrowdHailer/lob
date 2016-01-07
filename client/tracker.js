/* jshint esnext: true */

// IMPORTS
import Tracker from "./tracker/tracker";
import Router from "./router";
import UplinkController from "./tracker/uplink-controller";
import ConsoleView from "./tracker/console-view";
import Showcase from "./tracker/showcase";
import Reading from "./lib/reading";

// GENERAL CONFIGURATION
window.Tracker = Tracker;
window.Tracker.Reading = Reading;

var router = Router(window.location);
console.log('Router:', 'Started with initial state:', router.state);


var tracker = new Tracker();
tracker.logger = window.console;
tracker.showcase = Showcase(window);

var uplinkController = new UplinkController(router.state, tracker);

export default tracker;

import { ready } from "./utils/dom";

function uplinkStatusMessageFromProjection(projection) {
  var message = projection.uplinkStatus;
  if (message === 'AVAILABLE') {
    return 'Connection made to channel "' + projection.uplinkChannelName +'"';
  } else if (message === 'FAILED') {
    return 'Could not connect to Ably service';
  } else {
    return 'Unknown';
  }
}

ready(function(){
  var $uplinkStatusMessage = document.querySelector('[data-display~=uplink-status-message]');
  var $trackerHoldingSnapshot = document.querySelector('[data-display~=tracker-holding-snapshot]');
  var $trackerFollowingLive = document.querySelector('[data-display~=tracker-following-live]');
  var $trackerFollowingFlight = document.querySelector('[data-display~=tracker-following-flight]');
  console.debug('dom is ready', $uplinkStatusMessage);
  var mainView = {
    render: function(projection){
      console.log('Display rendering:', projection);
      $uplinkStatusMessage.innerHTML = uplinkStatusMessageFromProjection(projection);
      if (projection.flightOutputStatus === 'HOLDING_SNAPSHOT') {
        $trackerHoldingSnapshot.style.display = '';
        $trackerFollowingLive.style.display = 'none';
        $trackerFollowingFlight.style.display = 'none';

      } else if (projection.flightOutputStatus === 'FOLLOWING_LIVE') {
        $trackerHoldingSnapshot.style.display = 'none';
        $trackerFollowingLive.style.display = '';
        $trackerFollowingFlight.style.display = 'none';

      } else if (projection.flightOutputStatus === 'FOLLOWING_FLIGHT') {
        $trackerHoldingSnapshot.style.display = 'none';
        $trackerFollowingLive.style.display = 'none';
        $trackerFollowingFlight.style.display = '';

      }
    }
  };
  tracker.showcase.addView(mainView);
});


// Dom views should be initialized with the ready on certain selectors library
