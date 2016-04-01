/* jshint esnext: true */

/* This function class contains the logic for the presentation
   messaging in the view based on the state, but is weirdly not a
   view itself as their is a view, a projection, and a presenter? */

function Display($root){
  var $maxFlightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  var $submittedMaxAltitude = $root.querySelector("[data-display~=submitted-max-altitude]");
  var $message = $root.querySelector("[data-display~=message]");
  var $uplinkStatus = $root.querySelector("[data-display~=uplink-status]");
  var $submitFlight = $root.querySelector("[data-display~=submit-flight]");
  var $loader = $root.querySelector("[data-display~=connecting-loader]");
  var $connectionActive = $root.querySelector("[data-display~=connection-active]");

  function setLoading(isLoading) {
    $loader.style.display = isLoading ? 'block' : 'none';
    $connectionActive.style.display = isLoading ? 'none' : 'block';
  }

  function updateUplinkStatus(presentation) {
    switch(presentation.uplinkStatus.toLowerCase()) {
      case "connecting":
        $uplinkStatus.innerHTML = "Hold on, we're establishing a realtime connection to stream your lob.";
        setLoading(true);
        break;
      case "disconnected":
        $uplinkStatus.innerHTML = "Hold on, we've lost the realtime connection. Trying to reconnect now.";
        setLoading(true);
        break;
      case "failed":
        $uplinkStatus.innerHTML = "Oops, we've failed to establish a realtime connection. Try reloading this app.";
        setLoading(true);
        break;
      case "incompatible":
        $uplinkStatus.innerHTML = "Unfortunately no accelerometer was found on this device. Please try again on a different mobile";
        setLoading(true);
        break;
      case "transmitting":
        $uplinkStatus.innerHTML = "Live streaming this with id <b>" + presentation.channelName + "</b>. <a href='/why-stream'>Why?</a>";
        setLoading(false);
        break;
      default:
        console.error('Unknown status', status);
    }
  }

  function renderNoThrows(presentation) {
    $message.innerHTML = "<p>Are you ready?</p><p><b>Lob your phone in the air now.</b></p><p>Good luck!</p>";
    updateUplinkStatus(presentation);
  }

  function renderFirstThrow(presentation) {
    $message.innerHTML = "<p>Great throw!</p>" +
      "<p>You lobbed it <b>" + presentation.lastAltitude + "</b> for <b>" + presentation.lastFlightTime + "</b></p>" +
      "<p>Go on, try again!</p>"
    updateUplinkStatus(presentation);
  }

  function renderMultipleThrows(presentation) {
    if (presentation.lastHigherThanBefore) {
      $message.innerHTML = "<p>Superb, that's your best so far!</p>" +
      "<p>You lobbed it <b>" + presentation.lastAltitude + "</b> for <b>" + presentation.lastFlightTime + "</b></p>" +
      "<p>Your previous best was <b>" + presentation.maxAltitude + "</b> high</p>" +
      "<p>You can do better!</p>"
    } else {
      $message.innerHTML = "<p>Not bad, but that's not your best so far.</p>" +
      "<p>You lobbed it <b>" + presentation.lastAltitude + "</b> for <b>" + presentation.lastFlightTime + "</b></p>" +
      "<p>Your previous best was <b>" + presentation.maxAltitude + "</b> high</p>" +
      "<p>Give it another go!</p>"
    }
    updateUplinkStatus(presentation);
  }

  this.render = function(presentation) {
    if (!presentation.hasThrow) {
      renderNoThrows(presentation);
    } else if (presentation.hasOneThrow) {
      renderFirstThrow(presentation);
    } else {
      renderMultipleThrows(presentation);
    }
  }
}

export function create($root){ Display($root); }

export default Display;
