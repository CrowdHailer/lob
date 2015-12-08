/* jshint esnext: true */

export default function(app){
  var uplink = {
    startTransmission: function(){
    }
  };

  app.actions.startTransmitting.register(uplink.startTransmission);

  return uplink;
}
