import * as AvionicsPresenter from "./presenter.ts";

function Display($root){
  var $flightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  function render(presentation){
    $flightTime.innerHTML = presentation.maxFlightTime + "s";
    $maxAltitude.innerHTML = presentation.maxAltitude + "m";
  };
  return {
    update: function(store){
      var state = store.getState();
      var presenter = AvionicsPresenter.create(state);
      render(presenter);
    }
  };
}

export function create($root){ Display($root); }

export default Display
