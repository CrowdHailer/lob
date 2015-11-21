console.log("Starting boot ...");

import Events from "./gator.js";
var events = Events(document, null);

events.on("click", function (evt: any) {
  console.log(evt);
});

export default {};
