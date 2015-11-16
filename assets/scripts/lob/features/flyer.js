/*jshint esnext: true */

import { querySelector } from "../dom";

export default function Flyer(root) {
  console.log("Starting feature: \"Flyer\"");

  var $startButton = querySelector("#start", root);
  $startButton.addEventListener("click", function (event) {
    console.log("clicked");
  });
}
