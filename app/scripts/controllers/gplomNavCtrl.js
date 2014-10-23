(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('gplomNavCtrl', ['$scope',
            function($scope) {

                $scope.nomaConfig.SVGAspectRatio = 1;
                $scope.nomaConfig.isInteractiveAxis = false;

                $scope.nomaConfig.matrixMode = true;

            }

        ]);


}());