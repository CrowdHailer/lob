import { Config } from '../config';

export default function GraphDisplay(trackDivId) {
  if ( !(this instanceof GraphDisplay) ) { return new GraphDisplay(trackDivId); }

  var chart,
      context,
      data = [],
      lineDataTemplate = function() { return {
        labels: [],
        datasets: [
          {
            title: "Magnitude",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor : "rgba(220,220,220,1)",
            pointstrokeColor : "yellow",
            data: [],
            xPos: [],
            axis: 1
          },
          {
            title: "Throw",
            type: "Line",
            fill: true,
            fillColor: "rgba(220,0,0,0.6)",
            strokeColor: "rgba(220,0,0,1)",
            pointColor : "rgba(220,220,220,1)",
            pointstrokeColor : "yellow",
            data: [],
            xPos: [],
            axis: 2
          }
        ]
      }; },
      chartOptions = {
        datasetFill: true,
        animation: false,
        pointDot : false,
        datasetFill: false,
        showToolTips: false,
        scaleOverride: true,
        scaleStartValue: -10,
        scaleSteps: 8,
        scaleStepWidth: 10,
        scaleLabel: "<%=value%>",
        responsive: true,
        maintainAspectRatio: true,
        yAxisLabel: "LobForce™",
        showXLabels: 5,
        scaleXGridLinesStep: 5,
        fmtXLabel : "fmttime ss",
        extrapolateMissingData: false,
        inGraphDataShow: true,
        inGraphDataTmpl: "<%=((v1 == 'Throw') && (v3 > 0) ? 'Lob ' + Math.round(v3*100)/100 + 'm' : '')%>",
        inGraphDataAlign: "left",
        inGraphDataVAlign: "bottom",
        inGraphDataPaddingX: 20,
        inGraphDataPaddingY: -15,
        inGraphDataFontColor: "rgba(220,0,0,1)"
      };

  function initialize(lineData) {
    var canvas = $('#tracker-graph canvas');
    context = canvas[0].getContext("2d");
    chart = new Chart(context).Line(lineData, chartOptions);
  }

  function maxTimestampFromData() {
    return Math.max.apply(null, data.map(function(elem) { return elem.date; }));
  }

  /*
    Sort data, then delete old data, cut off point of Config.trackingGraphTimePeriod
  */
  function prepareAndTruncateData() {
    var minDateOnGraph = maxTimestampFromData() - Config.trackingGraphTimePeriod,
        lineData = lineDataTemplate();

    data = data.filter(function(point) {
      return point.date > minDateOnGraph;
    }).sort(function(a,b) {
      return a.date - b.date;
    });

    lineData.labels = data.map(function(point) {
      return point.date;
    });

    var magnitudeData = data.filter(function(point) { return !isNaN(parseInt(point.value)) });
    lineData.datasets[0].data = magnitudeData.map(function(point) {
      return point.value;
    });
    lineData.datasets[0].xPos = magnitudeData.map(function(point) {
      return point.date;
    });

    var flightData = data.filter(function(point) { return isNaN(parseInt(point.value)) });
    lineData.datasets[1].data = flightData.map(function(point) {
      return point.altitude;
    });
    lineData.datasets[1].xPos = flightData.map(function(point) {
      return point.date;
    });
    if (!lineData.datasets[1].xPos.length) {
      delete lineData.datasets[1].xPos;
    }

    if (!chart) {
      initialize(lineData);
    } else {
      updateChart(context, lineData, chartOptions);
    }
  }

  this.addPoint = function(point) {
    var lobForce = Math.round((point.magnitude - Config.gravityMagnitudeConstant) * 100) / 100; /* LobForce is stationery at 0 */
    data.push({
      date: new Date(point.timestamp),
      value: lobForce
    });
    prepareAndTruncateData();
  }

  this.addFlight = function(flightData) {
    var start = flightData.peakInfo[0].timestampStart;
    var end = flightData.peakInfo[flightData.peakInfo.length-1].timestampEnd;
    var altitude = flightData.altitude;
    var midpointDate = (start + end) / 2;

    data.push({
      date: new Date(start - 10),
      altitude: undefined
    });
    data.push({
      date: new Date(start),
      altitude: 0
    });
    data.push({
      date: new Date(midpointDate),
      altitude: altitude
    });
    data.push({
      date: new Date(end),
      altitude: 0
    });
    data.push({
      date: new Date(end + 10),
      altitude: undefined
    });

    prepareAndTruncateData();
  }
}
