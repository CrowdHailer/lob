export default function Phone() {
  if ( !(this instanceof Phone) ) { return new Phone($root); }
  var $phone = document.documentElement.querySelector('#tridiv .scene');
  var prefixes = ["-webkit-", "-moz-", "-ms-", ""];

  this.setOrientation = function(position) {
    /* Don't rotate on Y axis so that phone rotates on X & Y axis in front of user */
    var xRotation = (90 - position.beta) + 270,
        zRotation = position.gamma;

    var cssText = '';

    for (var prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
      var prefix = prefixes[prefixIndex];
      cssText += prefix + 'transform: rotateX(' + xRotation + 'deg) rotateY(0deg) rotateZ(' + zRotation + 'deg);';
    }

    $phone.style.cssText = cssText;
  }
}
