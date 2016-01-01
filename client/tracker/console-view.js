/* jshint esnext: true */

export default function ConsoleView(logger){
  function wrap(projection){
    return projection;
    return "listening on: " + projection.channel + " with token: " + projection.token;
    // returns presentation
  }

  this.render = function(projection){
    logger.info(wrap(projection));
  };
}
