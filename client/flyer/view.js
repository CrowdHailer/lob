import Presenter from "./view/presenter";
import Display from "./view/display";
import AlertDisplay from "../alert/display";

export default function FlyerView(){
  this.render = function render(projection){
    var presentation = Presenter(projection);
    var $avionics = document.querySelector("[data-interface~=avionics]");
    var $alert = document.querySelector("[data-display~=alert]");
    var display = new Display($avionics);
    for (var attribute in display) {
      if (display.hasOwnProperty(attribute)) {
        display[attribute] = presentation[attribute];
      }
    }
    var alertDisplay = AlertDisplay($alert);
    var alertMessage = projection.alert;
    if (alertMessage) {
      alertDisplay.message = alertMessage;
      alertDisplay.active = true;
    } else {
      alertDisplay.active = false;
    }
  }
}
