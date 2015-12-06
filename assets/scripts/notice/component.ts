import Events from "../gator.js";

function Interface($root, app){
  var events = Events($root, null);
  events.on("click", function (evt: Event) {
    app.closeNotice();
  });
}

function Component($root, world){
  if ($root == void 0) { return; } // Use double equal comparison to catch null and undefined;

  var ui = Interface($root, world.actions);
  var display = Display($root);

  world.noticeStore.register(display.update);
}

function Display($root){
  var $display = $root.querySelector("[data-display~=notice]");
  return {
    update: function(store){
      var message = store.getState();
      if(message){
        $display.innerHTML = message;
        $root.classList.add("active");
      } else {
        $root.classList.remove("active");
        // $display.innerHTML = "";
      }
    }
  };
}

export default Component
