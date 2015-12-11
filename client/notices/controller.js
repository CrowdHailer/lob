/* jshint esnext: true */

import Events from "../vendor/gator.js";

export default function Controller($root, app){
  var events = Events($root);
  events.on("click", function(evt){
    app.closeNotices();
  });
}
