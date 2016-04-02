/* jshint esnext: true */

import { pointsInTrackingGraph } from './config';

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
    return 'Connection made to live Lob "' + projection.uplinkChannelName +'".<br> Waiting for device to stream its position in real time';
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

function GraphDisplay($root) {
  if ( !(this instanceof GraphDisplay) ) { return new GraphDisplay($root); }

  var canvas = $root.querySelector('canvas');
  var canvasContext = canvas.getContext("2d");

  // DEBT data can come from $root dataset
  var data = {
    labels: [],
    datasets: [{
      label: "Magnitude",
      strokeColor: "#FFCC00",
      data: []
    }]
  };

  var i = 0.0;
  // add point
  // clear
  var chartOptions = {
    animation: false,
    pointDot : false,
    datasetFill: false,
    showToolTips: false,
    scaleOverride: true,
    scaleStartValue: 0,
    scaleSteps: 9,
    scaleStepWidth: 10,
    scaleLabel: "    <%=value%>"
  };

  var myLineChart = new Chart(canvasContext).Line(data, chartOptions);
  window.myLineChart = myLineChart
  this.addPoint = function(point){
    window.requestAnimationFrame(function(){
      var date = new Date(point.timestamp)
      // TODO plot only some legends
      if (i % 1 === 0) {
        myLineChart.addData([point.magnitude], date.getSeconds() + 's');
      } else {
        myLineChart.addData([point.magnitude], '');
      }
      // DEBT make length part of config
      if (myLineChart.datasets[0].points.length > pointsInTrackingGraph) {
        myLineChart.removeData();
      }
      i = i + 0.25;
    })
  }
  this.clear = function(){
    myLineChart.destroy();
    // i = 0.0;
    data.labels = [];
    myLineChart = new Chart(canvasContext).Line(data, chartOptions);
  }
  this.setPoints = function(points){
    // DEBT remove use of this
    var self = this;
    window.requestAnimationFrame(function(){
      self.clear();
      points.forEach(function(point){
        self.addPoint(point);
      })
    })
  }
}

ready(function(){
  var $root = document.documentElement;
  var $uplinkStatusMessage = queryDisplay('uplink-status-message', $root);
  var $trackerHoldingSnapshot = queryDisplay('tracker-holding-snapshot', $root);
  var $trackerFollowingLive = queryDisplay('tracker-following-live', $root);
  var $trackerFollowingFlight = queryDisplay('tracker-following-flight', $root);
  var $graphAndPhone = queryDisplay('graph-and-phone', $root);
  var $preloader = queryDisplay('connecting-loader', $root);
  var $alert = queryDisplay('alert', $root);
  var alertDisplay = AlertDisplay($alert);
  var graphDisplay;

  function setupGraphDisplay() {
    var $graphDisplay = queryDisplay('tracker-graph', $root);
    window.graphDisplay = graphDisplay = GraphDisplay($graphDisplay);
  }

  var phone = new Phone();

  var mainView = {
    render: function(projection){
      $uplinkStatusMessage.innerHTML = uplinkStatusMessageFromProjection(projection);

      if (projection.uplinkStatus === 'STREAMING') {
        $graphAndPhone.style.display = 'block';
        $preloader.style.display = 'none';
        if (!graphDisplay) {
          setupGraphDisplay();
        }
      } else {
        $graphAndPhone.style.display = 'none';
        $preloader.style.display = 'block';
      }

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
      var alertMessage = projection.alert;
      if (alertMessage) {
        alertDisplay.message = alertMessage;
        alertDisplay.active = true;
      } else {
        alertDisplay.active = false;
      }
      // graphDisplay.setPoints(projection.flightSnapshot || projection.liveFlight);
      // console.log(projection.flightSnapshot || projection.liveFlight);
    },

    addReading(newReading){
      graphDisplay.addPoint(newReading);
    },

    setReadings(readings){
      graphDisplay.setPoints(readings);
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

