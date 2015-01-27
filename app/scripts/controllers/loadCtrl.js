(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('LoadCtrl', ['$scope', '$firebase', '$location', 'FBURL', '$routeParams',
            function($scope, $firebase, $location, FBURL, $routeParams) {

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
                $scope.isURLInput = true;

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

                $scope.init = function() {


                    if ($routeParams.csvKey == 'new') {

                        $scope.isURLInput = true;
                    } else {
                        $scope.isURLInput = false;
                        $scope.getUrlFromKey($routeParams.csvKey);
                        
                    }

                };

                $scope.getUrlFromKey = function(key) {

                    var obj = $firebase(new Firebase(FBURL + '/csv/' + key)).$asObject();

                    obj.$loaded().then(function() {

                        $scope.loadDataFromCSVURL(obj.url);
                    });

                };

                $scope.changeActiveDataCustomCSV = function(customCSV) {

                    var ref = new Firebase(FBURL + '/csv');
                    var sync = $firebase(ref);


                    sync.$push({
                        url: customCSV
                    }).then(function(ref) {

                        console.log(ref.key());
                        $location.path('/load/' + ref.key()).replace();

                    }, function(error) {
                        console.log("Error:", error);
                    });

                }




                $scope.loadDataFromCSVURL = function(customCSV) {

                    $scope.activeData = 'Custom Data';

                    $scope.isURLInput = false;

                    d3.csv(customCSV, function(error, tdata) {

                        if (error) { //If error is not null, something went wrong.

                            console.log(error); //Log the error.
                            $scope.csvURLError = true;
                            $scope.isURLInput = true;
                            $scope.csvErrorMsg = error;

                        } else {

                            $scope.isURLInput = false;

                            $scope.csvURLError = false;
                            $scope.csvErrorMsg = error;
                            var count = 0;

                            tdata.map(function(d) {
                                d.id = count;
                                count += 1;
                            });

                            $scope.nomaData = tdata;
                            $scope.nomaConfig.dims = d3.keys(tdata[0]);

                            var index = $scope.nomaConfig.dims.indexOf('id');
                            $scope.nomaConfig.dims.splice(index, 1);


                            index = $scope.nomaConfig.dims.indexOf('Name');
                            $scope.nomaConfig.dims.splice(index, 1);


                            $scope.nomaConfig.xDim = null;
                            $scope.nomaConfig.yDim = null;
                            $scope.nomaConfig.colorDim = null;

                            $scope.nomaConfig.isGather = 'gather';
                            $scope.nomaConfig.relativeMode = 'absolute';

                        }
                        $scope.$apply();
                    });



                };

                $scope.init();

            }


        ]);

}());
