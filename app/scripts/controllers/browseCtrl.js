(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('BrowseCtrl', ['$scope', '$location', 'Chart', 'simpleLogin',
            function($scope, $location, Chart, simpleLogin) {
             
                $scope.charts = Chart.all;

                console.log('Hey, browser', $scope.charts)

                $scope.user = simpleLogin.user;

                $scope.deleteChart = function(chart) {
                    Chart.delete(chart);
                };

            }


        ]);

}());
