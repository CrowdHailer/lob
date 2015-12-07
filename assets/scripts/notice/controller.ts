import Events from "../gator.js";

export default function Controller($root, app){
  var events = Events($root, null);
  events.on("click", function (evt: Event) {
    app.closeNotice();
  });
}
