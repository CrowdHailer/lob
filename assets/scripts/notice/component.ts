import Controller from "./controller.ts";
import View from "./view.ts";

function Component($root, world){
  if ($root == void 0) { return; } // Use double equal comparison to catch null and undefined;

  var controller = Controller($root, world.actions);
  var display = View($root);

  world.noticeStore.register(display.update);
}



export default Component
