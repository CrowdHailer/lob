export default function View($root){
  var $display = $root.querySelector("[data-display~=notice]");
  return {
    update: function(store){
      var message = store.getState();
      if(message){
        $display.innerHTML = message;
        $root.classList.add("active");
      } else {
        $root.classList.remove("active");
      }
    }
  };
}
