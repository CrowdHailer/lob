/*jshint esnext: true */

import { querySelector } from "../dom";

export default function Flyer($root) {
  console.log("Starting feature: \"Tracker\"");

  var ctx = $root.querySelector("#myChart").getContext("2d");
  var myNewChart = new Chart(ctx);
  var data = {
    labels: [],
    datasets: [{
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0)",
      strokeColor: "limegreen",
      pointColor: "limegreen",
      data: []
    }, {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0)",
      strokeColor: "green",
      pointColor: "green",
      data: []
    }, {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0)",
      strokeColor: "teal",
      pointColor: "teal",
      data: []
    }, {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0)",
      strokeColor: "orange",
      pointColor: "orange",
      data: []
    }]
  };
  var myLineChart = new Chart(ctx).Line(data, {animation: false, animationSteps: 4, pointDot : false});

  var i = 0.0;

  return {
    accelerationEvent: function (message) {
      var x = message.data.x;
      var y = message.data.y;
      var z = message.data.z;
      console.log(message.data.t);
      var m = Math.sqrt(x*x + y*y + z*z);
      myLineChart.addData([x, y, z, m], i);
      i = i + 0.25;
    }
  };
}
