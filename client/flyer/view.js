import Presenter from "./view/presenter";
import Display from "./view/display";
import AlertDisplay from "../alert/display";
import Phone from "../lib/phone";
import Guage from "../lib/guage";

import { readingPublishLimit } from '../config';
import { throttle } from "../utils/fn";

export default function FlyerView() {
  var memoized = {};

  var getDisplay = function() {
    if (!memoized.display) {
      var $avionics = document.querySelector("[data-interface~=avionics]");
      memoized.display = new Display($avionics);
    }
    return memoized.display;
  }

  var getAlertDisplay = function() {
    if (!memoized.alertDisplay) {
      var $alertDisplay = document.querySelector("[data-display~=alert]");
      memoized.alertDisplay = AlertDisplay($alertDisplay);
    }
    return memoized.alertDisplay;
  }

  var getPhone = function() {
    if (!memoized.phone) {
      memoized.phone = new Phone();
    }
    return memoized.phone;
  }

  var getGuage = function() {
    if (!memoized.guage) {
      memoized.guage = new Guage();
    }
    return memoized.guage;
  }

  var renderPhoneMovement = function(projection) {
    getGuage().setMomentum(projection)
  }

  var renderPhoneOrientation = function(position) {
    getPhone().setOrientation(position);
  }

  this.render = function(projection) {
    var presentation = Presenter(projection);
    var display = getDisplay();
    var alertDisplay = getAlertDisplay();

    for (var attribute in display) {
      if (display.hasOwnProperty(attribute)) {
        display[attribute] = presentation[attribute];
      }
    }

    var alertMessage = projection.alert;
    if (alertMessage) {
      alertDisplay.message = alertMessage;
      alertDisplay.active = true;
    } else {
      alertDisplay.active = false;
    }
  }

  this.renderPhoneMovement = throttle(renderPhoneMovement.bind(this), readingPublishLimit);
  this.renderPhoneOrientation = throttle(renderPhoneOrientation.bind(this), readingPublishLimit);
}
