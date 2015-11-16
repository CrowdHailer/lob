/*jshint esnext: true */

import { querySelector } from "../dom";

export default function Flyer($root) {
  console.log("Starting feature: \"Tracker\"");
  return {
    accelerationEvent: function (x) {
      console.log(x);
    }
  };
}
