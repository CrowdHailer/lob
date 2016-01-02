/* jshint esnext: true */

export default function Display($root){
  var $message = $root.querySelector("[data-display~=message]");
  return Object.create({}, {
    active: {
      set: function(active){
        var ACTIVE = "active";
        if (active) {
          $root.classList.add(ACTIVE);
        } else {
          $root.classList.remove(ACTIVE);
        }
      },
      enumerable: true
    },
    message: {
      set: function(message){
        console.log(message);
        $message.innerHTML = message;
      }
    }
  });
}
