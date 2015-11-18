/*jshint esnext: true */

import Actions from "./actions";
import Dispatcher from "./dispatcher";

import Accelerometer from "./accelerometer";

var dummyStore = {
  dispatch: function (action) {
    if (action.error) {
      console.warn(action);
    } else {
      console.info(action);
    }
  }
};

var stores = [dummyStore];
var dispatcher = Dispatcher(stores);

var app = Actions(dispatcher);

var accelerometer = Accelerometer(app, window);
stores.push(accelerometer);
console.log(stores);

console.log("Finished Boot");
export default app;
