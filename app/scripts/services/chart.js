'use strict';

/**
 * @ngdoc service
 * @name yearofmooAngularjsSeedRepoApp.chart
 * @description
 * # chart
 * Factory in the yearofmooAngularjsSeedRepoApp.
 */
angular.module('myApp.services')
  .factory('Chart', function ($firebase, FBURL) {
    // Service logic
    // ...
    var ref = new Firebase(FBURL);
    var charts = $firebase(ref.child('csv')).$asArray();

    var Chart = {
      all: charts, 

      create: function(chart) {
        return charts.$add(chart).then(function(chartRef) {
          $firebase(ref.child('user_charts').child(chart.uploader)).$push(chartRef.name());
          return chartRef;
        });
      }, 
      get: function(chartId) {
        return $firebase(ref.child('csv').child(chartId)).$asObject();
      },
      delete: function(chart) {
        return charts.$remove(chart);
      },
      comments: function(chartId) {
        return $firebase(ref.child('comments').child(chartId)).$asArray();
      }
    };
    // Public API here
    return Chart;
  });
