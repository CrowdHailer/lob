/* jshint esnext: true */

export default function(app){
  return {
    startTransmission: function(){
      app.logger.debug("Started Transmission");
    }
  };
}
