/*jshint esnext: true */

import Actions from "./actions";
import Dispatcher from "./dispatcher";

import Accelerometer from "./accelerometer";
var accelerometer = Accelerometer();

var dummyStore = {
  dispatch: function (action) {
    console.log(action);
  }
};

var dispatcher = Dispatcher([dummyStore]);

console.log("Finished Boot");
export default Actions(dispatcher);
