// TODO test
import Events from "./gator.js";

// Interfaces are where user interaction is transformed to domain interactions
// There is only one interface in this application, this one the avionics interface
// It can therefore be set up to run on the document element
class AvionicsInterface {
  private $root;
  private app;
  constructor ($root, app) {
    this.$root = $root;
    this.app = app;
    var events = Events($root, null);
    events.on("click", "[data-command~=reset]", function (evt: Event) {
      app.resetReadings();
    });
  }
}

export default function create($root, app){
  return new AvionicsInterface($root, app);
}

// export default AvionicsInterface
