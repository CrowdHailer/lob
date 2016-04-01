import Reading from "./reading";

export default function Guage() {
  if ( !(this instanceof Guage) ) { return new Guage(); }
  var $guage = document.documentElement.querySelector('.guage-widget .needle');
  var prefixes = ["-webkit-", "-moz-", "-ms-", ""];

  this.setMomentum = function(accelerometerReading) {
    var reading = new Reading(accelerometerReading);
    /* momentum is stationery at 10, less than or greater than represents momentum */
    var normalizedReading = Math.abs(reading.magnitude - 10);
    var boundedReading = Math.min(100, Math.max(0, normalizedReading));
    var angle = (boundedReading - 50) / 100 * 180;
    var cssText = '';

    for (var prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
      var prefix = prefixes[prefixIndex];
      cssText += prefix + 'transform: translateX(-50%) translateY(-50%) rotate(' + angle + 'deg);'
    }

    $guage.style.cssText = cssText;
  }
}
