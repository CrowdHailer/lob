import UI from "./interface.ts";
import Display from "./display.ts";

function Avionics($root, world){
  if ($root == void 0) { return; } // Use double equal comparison to catch null and undefined;

  world.getAccelerometer().start();

  var ui = UI($root, world.actions);

  var display = Display($root);
  world.store.register(display.update);

  return {
    display: display,
    ui: ui
  };
};

export default Avionics;
