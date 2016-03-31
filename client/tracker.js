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
    return 'Connection made to channel "' + projection.uplinkChannelName +'"';
  } else if (message === 'FAILED') {
    return 'Could not connect to Ably service';
  } else {
    return 'Unknown';
  }
}

function GraphDisplay($root){
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
      if (myLineChart.datasets[0].points.length > 20) {
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

function Phone() {
  if ( !(this instanceof Phone) ) { return new Phone($root); }
  var $phone = document.documentElement.querySelector('#tridiv .scene');
  var prefixes = ["-webkit-", "-moz-", "-ms-", ""];

  this.setOrientation = function(position) {
    /* Don't rotate on Y axis so that phone rotates on X & Y axis in front of user */
    var xRotation = (90 - position.beta) + 270,
        zRotation = position.gamma;

    var cssText = '';

    for (var prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
      var prefix = prefixes[prefixIndex];
      cssText += prefix + 'transform: rotateX(' + xRotation + 'deg) rotateY(0deg) rotateZ(' + zRotation + 'deg);';
    }

    $phone.style.cssText = cssText;
    console.log($phone.style.cssText, position, xDegrees, yDegrees, zDegrees);
  }
}

ready(function(){
  var $root = document.documentElement;
  var $uplinkStatusMessage = queryDisplay('uplink-status-message', $root);
  var $trackerHoldingSnapshot = queryDisplay('tracker-holding-snapshot', $root);
  var $trackerFollowingLive = queryDisplay('tracker-following-live', $root);
  var $trackerFollowingFlight = queryDisplay('tracker-following-flight', $root);
  var $alert = queryDisplay('alert', $root);
  var alertDisplay = AlertDisplay($alert);

  var $graphDisplay = queryDisplay('tracker-graph', $root);
  var graphDisplay = GraphDisplay($graphDisplay);
  window.graphDisplay = graphDisplay;
  console.debug('dom is ready', $uplinkStatusMessage);

  var phone = new Phone();

  var mainView = {
    render: function(projection){
      // console.debug('Display rendering:', projection);
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

