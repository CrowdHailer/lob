/* jshint esnext: true */

import Controller from "./controller";
import Display from "./display";

export default function Notice($root, app){
  var display = Display($root);
  var controller = Controller($root, app);

  function update(){
    var message = app.notices[0];
    if (message) {
      display.message = message;
      display.active = true;
    } else {
      display.active = false;
    }
  }

  app.onBadReading(update);
  app.onCloseNotices(update);
  return {
    update: update
  };
}
