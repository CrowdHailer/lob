"use strict";
import Struct from "./carbide/struct";
import * as QString from "query-string";

var URI_DEFAULTS = {
  path: [],
  query: {},
};

function URI(raw){
  if ( !(this instanceof URI) ) { return new URI(raw); }

  return Struct.call(this, URI_DEFAULTS, raw);
}

URI.prototype = Object.create(Struct.prototype);
URI.prototype.constructor = URI;

export function parseLocation(location){
  var query = QString.parse(location.search);
  var path = location.pathname.substring(1).split("/");
  return new URI({path: path, query: query});
}
