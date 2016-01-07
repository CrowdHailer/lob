/* jshint esnext: true */

import * as QString from "query-string";

// Pass in window not location in case state is needed
// Router should always return some value of state it does not have the knowledge to regard it as invalid
export default function Router(window){
  if ( !(this instanceof Router) ) { return new Router(window); }
  var router = this;
  router.location = window.location;

  function getState(){
    var query = QString.parse(router.location.search);
    return {
      token: query.token,
      channel: query.channel
    };
  }

  Object.defineProperty(router, 'state', {
    get: getState
  });
}
