'use strict';

/**
 * @ngdoc service
 * @name yearofmooAngularjsSeedRepoApp.chart
 * @description
 * # chart
 * Factory in the yearofmooAngularjsSeedRepoApp.
 */
angular.module('myApp.services')
  .factory('Chart', function ($firebaseArray, $firebaseObject, FBURL) {
    // Service logic
    // ...
    var ref = new Firebase(FBURL);
    var charts = $firebaseArray(ref.child('csv'));

    var Chart = {
      all: charts, 

      create: function(chart) {
        return charts.$add(chart).then(function(chartRef) {
          $firebaseArray(ref.child('user_charts').child(chart.uploader)).$add(chartRef.name());
          return chartRef;
        });
      }, 
      get: function(chartId) {
        return $firebaseObject(ref.child('csv').child(chartId));
      },
      delete: function(chart) {
        return charts.$remove(chart);
      },
      comments: function(chartId) {
        return $firebaseArray(ref.child('comments').child(chartId));
      }
    };
    // Public API here
    return Chart;
  });
