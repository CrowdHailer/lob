console.log("starting client");

import actions from "./actions.ts";
import App from "./app.ts";
var app = App(actions);

import Accelerometer from "../assets/scripts/accelerometer.ts";
app.registerService("accelerometer", Accelerometer);
import Connection from "./connection.ts";
app.registerService("connection", Connection);

// import Store from "./store.ts";
// app.store = Store();

app.getService("accelerometer").start();
export default app;

app.registerComponent("uplink", function($root, app){
  console.log($root);
  app.getService("connection").start();

  app.actions.newReading.register(function(r){
    console.log(app.store.getState());
    console.log("uplink");
  });
});

app.getComponent("uplink", "dummy element");

// store.newReading();
// store.newReading();

// store.newReading();
app.actions.startStreaming();
app.actions.newReading();
