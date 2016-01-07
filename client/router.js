/* jshint esnext: true */

import * as QString from "query-string";

// Router makes use of current location
// Router should always return some value of state it does not have the knowledge to regard it as invalid
// Router is currently untested
// Router does not follow modifications to the application location.
// Router is generic for tracker and flyer at the moment
// location is a size cause and might make sense to be lazily applied
export default function Router(location){
  if ( !(this instanceof Router) ) { return new Router(location); }
  var router = this;
  router.location = location;

  function getState(){
    var query = QString.parse(router.location.search);
    return {
      token: query.token,
      channelName: query['channel-name']
    };
  }

  Object.defineProperty(router, 'state', {
    get: getState
  });
}
