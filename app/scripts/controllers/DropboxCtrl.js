(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('ShowCtrl', ['$scope', '$routeParams',
            function($scope, $routeParams) {

                $scope.message = "Test";

                $scope.nomaConfig = {

                };

                $scope.loadedData = 'cars';
                $scope.nomaConfig.SVGAspectRatio = 1.4;
                $scope.onlyNumbers = /^\d+$/;


                $scope.nomaRound = true;
                $scope.nomaBorder = false;
                $scope.nomaShapeRendering = 'auto';
                $scope.nomaConfig.isGather = 'scatter';
                $scope.nomaConfig.relativeModes = [false, true];
                $scope.nomaConfig.relativeMode = 'absolute';
                $scope.nomaConfig.binSize = 10;
                $scope.nomaConfig.matrixMode = false;
                $scope.nomaConfig.xDim;
                $scope.nomaConfig.yDim;
                $scope.nomaConfig.isInteractiveAxis = false;
                $scope.isScatter = false;
                $scope.nomaConfig.lens = "noLens";

                $scope.$watch(function() {
                    return $scope.nomaConfig.isGather;
                }, function(newVals, oldVals) {
                    // debugger;
                    if (newVals == 'scatter') {

                        $scope.isScatter = true;
                    } else {

                        $scope.isScatter = false;
                    }
                }, true);

                $scope.changeActiveDataCars = function() {

                    $scope.activeData = 'Cars Data';

                    d3.csv('data/articlesForGatherplot.csv', function(error, tdata) {
                        var count = 0;

                        tdata.map(function(d) {
                            d.id = count;
                            count += 1;
                        });

                        $scope.nomaData = tdata;
                        $scope.nomaConfig.dims = d3.keys(tdata[0]);

                        var index = $scope.nomaConfig.dims.indexOf('id');
                        $scope.nomaConfig.dims.splice(index, 1);

                        $scope.nomaConfig.xDim = '';
                        $scope.nomaConfig.yDim = '';
                        $scope.nomaConfig.colorDim = '';

                        $scope.nomaConfig.isGather = 'gather';
                        $scope.isCarsOpen = true;
                        $scope.nomaConfig.relativeMode = 'absolute';

                        $scope.dataset = $routeParams.dataset;
                        $scope.nomaConfig.xDim = $routeParams.xDim;
                        $scope.nomaConfig.yDim = $routeParams.yDim;
                        $scope.nomaConfig.colorDim = $routeParams.colorDim;
                        $scope.nomaConfig.relativeMode = $routeParams.relativeMode;

                        $scope.$apply();

                    });



                };


                $scope.changeActiveDataCars()




            }
        ]);

}());
