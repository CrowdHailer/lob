import UI from "./interface.ts";
import Display from "./display.ts";

function Avionics($root, world){
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
