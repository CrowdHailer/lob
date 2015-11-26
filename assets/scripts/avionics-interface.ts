// TODO test
import Events from "./gator.js";

// Interfaces are where user interaction is transformed to domain interactions
// There is only one interface in this application, this one the avionics interface
// It can therefore be set up to run on the document element
class AvionicsInterface {
  private $root;
  private actions;
  constructor ($root, actions) {
    this.$root = $root;
    this.actions = actions;
    var events = Events($root, null);
    events.on("click", "[data-command~=start]", function (evt: Event) {
      actions.startLogging();
    });
    events.on("click", "[data-command~=stop]", function (evt: Event) {
      actions.stopLogging();
    });
    events.on("click", "[data-command~=reset]", function (evt: Event) {
      actions.clearDataLog();
    });
    events.on("submit", "[data-command~=submit]", function (evt: Event) {
      evt.preventDefault();
      var input: any = evt.srcElement.querySelector("input");
      actions.submitFlightLog(input.value);
    });
  }
}

export default AvionicsInterface
