function newReading(reading, state){
  var readings = state.readings || [];
  var newReadings = readings.concat(reading);
  return Object.create(state, {
    readings: {
      value: newReadings
    }
  });
}

function startTransmitting(state){
  if (state.isTransmitting === true) { return state; }
  return Object.create(state, {
    isTransmitting: {
      get: function(){
        return true;
      }
    }
  });
}

function Store(){
  var state = {};
  function iterate(iterator){
    newState = iterator(state);
    if (newState != state) {
      state = newState;
    }
  }
}


var MyStore = function(App){
  var store = Store();

  var myStore = Object.create(store, {
    onNewReading: {
      value: function(reading){
        var iterator = newReading(reading);
        this.iterate(iterator);
      }
    }
  });

  listenTo(App.newReading, myStore.onNewReading);
};

var MyConnection = function(App){
  var conn =  {
    onNewReading: function(){
      App.store.isTransmitting;

    }
  };

};

function App(actions){
  var services = {};

  return {
    registerService: function(name, factory){
      // check name
      Object.defineProperty(this, name, {
        get: function(){
          // get instance or start factory with app
        }
      });
    }
  };
}


var app = App();
app.registerService("store", Store);

function pastFold(){

}

state update always comes first.
its not an application if it doesnt have state it is a process.
The question is what are you going to do about that
often what wants to be know is what has changed
looking at a photo is not enough.
If there is a new reading that has happened
If some one clicks start to share that has happened regardless of if any state changed.
The uplink is a service but the state of that service is a component
If I want to publish something I tell the service please do publish and give it an action to take when it has finished
If I want to subscribe I tell the service to please start sending a certain kind or Event
Accelerometer.start
Accelerometer.onNewReading(App.Action.newReading)

App.Connection.publish(details, function(err, resp){
  Action.MessageSent;

  Action.MessageFailed
})
listenTo the actions and query on the state. There is only one state. it comes first we should only have multiple state is COMPLETLY separate
