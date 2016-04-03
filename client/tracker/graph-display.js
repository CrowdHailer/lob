import { Config } from '../config';

export default function GraphDisplay(trackDivId) {
  if ( !(this instanceof GraphDisplay) ) { return new GraphDisplay(trackDivId); }

  var chart;

  function initialize() {
    var chartOptions = {
      "type": "serial",
      "theme": "light",
      "borderColor": "#FFFFFF",
      "dataProvider": [],
      "marginTop": 10,
      "marginRight": 0,
      "marginLeft": 0,
      "marginBottom": 0,
      "zoomOutButtonAlpha": 1,
      "zoomOutText": "",
      "valueAxes": [{
        "id": "forceaxis",
        "autoGridCount": true,
        "axisAlpha": 0.2,
        "dashLength": 1,
        "position": "left",
        "maximum": 100,
        "minimum": -10,
        "strictMinMax": true,
        "title": "LobForce™",
        "axisTitleOffset": 5
      },{
        "id": "altitudeaxis",
        "baseValue": 0,
        "axisColor": "#00FF00",
        "position": "right",
        "axisAlpha": 1,
        "gridAlpha": 0,
        "axisThickness": 2,
        "unit": "m",
        "title": "Altitude in metres",
        "axisTitleOffset": 5
      }],
      "mouseWheelZoomEnabled": true,
      "graphs": [{
        "id": "force",
        "balloonText": "LobForce™ [[value]]",
        "title": "LobForce™",
        "valueField": "value",
        "valueAxis": "forceaxis",
        "lineColor": "#d1655d",
        "lineThickness": 2,
        "negativeLineColor": "#637bb6",
        "type": "smoothedLine",
        "balloon":{
          "drop": true
        }
      }, {
        "id": "altitude",
        "balloonText": "Altitude [[value]]m",
        "title": "Altitude (m)",
        "stackType": "regular",
        "valueField": "altitude",
        "valueAxis": "altitudeaxis",
        "lineColor": "#00FF00",
        "lineThickness": 2,
        "type": "smoothedLine",
        "fillAlphas": 0.6,
        "lineAlpha": 0.4,
        "balloon":{
          "drop": true
        }
      }],
      "chartCursor": {
         "categoryBalloonFunction": function(valueText) {
          var date = new Date(Number(valueText));
          return AmCharts.formatDate(date, "HH:NN:SS.QQQ");
        }
      },
      "categoryField": "date",
      "categoryAxis": {
        "parseDates": false,
        "axisColor": "#DADADA",
        "dashLength": 1,
        "minorGridEnabled": false,
        "labelFunction": function(valueText, data, categoryAxis) {
          var date = new Date(Number(valueText));
          return date.getSeconds().toString() + '.' + Math.round(date.getMilliseconds() / 100).toString();
        }
      },
      "export": {
        "enabled": false
      }
    }

    chart = AmCharts.makeChart(trackDivId, chartOptions);
    chart.addListener("dataUpdated", zoomChart);

    chart.addListener( "init", function() {
      chart.categoryAxis.addListener( "rollOverItem", function( event ) {
          event.target.setAttr( "cursor", "default" );
          event.chart.balloon.followCursor( true );
          event.chart.balloon.showBalloon( event.serialDataItem.dataContext.key + " - " + event.serialDataItem.dataContext.value );
      });
      chart.categoryAxis.addListener( "rollOutItem", function( event ) {
          event.chart.balloon.hide();
      });
    })
  }

  function maxTimestampFromData() {
    return Math.max.apply(null, chart.dataProvider.map(function(elem) { return elem.date; }));
  }

  function zoomChart() {
    var maxTimestampInData,
        minTimestampInData,
        minAllowedTimestamp,
        data = chart.dataProvider;

    maxTimestampInData = maxTimestampFromData();
    minAllowedTimestamp = maxTimestampInData - Config.trackingGraphTimePeriod;
    minTimestampInData = Math.min.apply(null, data.map(function(elem) {
      return elem.date;
    }).filter(function(date) {
      return date >= minAllowedTimestamp;
    }));

    if (maxTimestampInData && minTimestampInData) {
      chart.zoomToCategoryValues(minTimestampInData.toString(), maxTimestampInData.toString());
    }
  }

  this.addPoint = function(point) {
    chart.dataProvider.push({
      date: point.timestamp,
      value: Math.round((point.magnitude - 10) * 100) / 100 /* LobForce is stationery at 0 */
    });
    this.prepareAndTruncateData();
  }

  this.addFlight = function(flightData) {
    var start = flightData.peakInfo[0].timestampStart;
    var end = flightData.peakInfo[flightData.peakInfo.length-1].timestampEnd;
    var altitude = flightData.altitude;
    var midpointDate = (start + end) / 2;
    var guide = new AmCharts.Guide();

    chart.dataProvider.push({
      date: start,
      altitude: 0
    });
    chart.dataProvider.push({
      date: midpointDate,
      altitude: altitude
    });
    chart.dataProvider.push({
      date: end,
      altitude: 0
    });

    guide.label = "Lob " + Math.round(altitude * 100)/100 + "m, airborne " + Math.round(flightData.flightTime * 100)/100 + "s";
    guide.labelRotation = 90;
    guide.position = "top";
    guide.inside = true;
    guide.color = "black";
    guide.lineThickness = 2;
    guide.lineAlpha = 1;
    guide.category = midpointDate;
    chart.categoryAxis.addGuide(guide);

    this.prepareAndTruncateData();
  }

  /* Sort data, then delete old data, but not exactly on the cut off in case there are curves
     that span the cut off point of Config.trackingGraphTimePeriod */
  this.prepareAndTruncateData = function() {
    var data = chart.dataProvider,
        minDateOnGraph = maxTimestampFromData() - Config.trackingGraphTimePeriod * 2;

    chart.dataProvider = data.filter(function(point) {
      return point.date > minDateOnGraph;
    }).sort(function(a,b) {
      return a.date - b.date;
    });

    chart.guides = chart.guides.filter(function(guide) {
      return guide.category > minDateOnGraph;
    });

    chart.validateData();
  }

  initialize();
}
