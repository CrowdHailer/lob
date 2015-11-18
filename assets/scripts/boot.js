/*jshint esnext: true */

import Actions from "./actions";
import Dispatcher from "./dispatcher";

import Accelerometer from "./accelerometer";
var accelerometer = Accelerometer({}, window);

var dummyStore = {
  dispatch: function (action) {
    console.log(action);
  }
};

var dispatcher = Dispatcher([dummyStore]);

var app = Actions(dispatcher);
console.log("Finished Boot");
export default app;
