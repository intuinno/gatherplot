(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('LoadCtrl', ['$scope', '$firebase', '$location', 'FBURL', '$routeParams', 'fbutil', 'Chart', 'simpleLogin',
            function($scope, $firebase, $location, FBURL, $routeParams, fbutil, Chart, simpleLogin) {

                $scope.comments = Chart.comments($routeParams.csvKey);

                simpleLogin.auth.$onAuth(function(authData) {

                    $scope.user = authData;
                    $scope.signedIn = !!authData;

                    if (authData) {
                        loadProfile(authData)
                    }
                });

                $scope.user = simpleLogin.user;
                $scope.signedIn = !!simpleLogin.user;
                $scope.context = {};
                $scope.context.translate = [0,0];
                $scope.context.scale = 1;
                $scope.dimsum = {};
                $scope.dimsum.selectionSpace=[];

                var profile;

                // loadProfile(simpleLogin.user);

                function loadProfile(user) {
                    if (profile) {
                        profile.$destroy();
                    }
                    profile = fbutil.syncObject('users/' + user.uid);
                    profile.$bindTo($scope, 'profile');
                }

                $scope.addComment = function() {

                    if (!$scope.commentText || $scope.commentText === '') {
                        return;
                    }

                    var context = angular.copy($scope.nomaConfig);
                    context.dimSetting = [];

                    var comment = {
                        text: $scope.commentText,
                        creator: profile.name,
                        creatorUID: $scope.user.uid,
                        config: context,
                        context: $scope.context,
                        chartId: $routeParams.csvKey,
                        dimsum: dimsumData
                    };

                    $scope.comments.$add(comment);

                    $scope.commentText = '';




                };

                $scope.message = "Test";

                $scope.nomaConfig = {

                };

                $scope.loadedData = 'cars';
                $scope.nomaConfig.SVGAspectRatio = 1.4;
                $scope.onlyNumbers = /^\d+$/;

                $scope.nomaConfig.translate = [];
                $scope.nomaConfig.scale = 1;


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
                $scope.isURLInput = false;

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

                    var obj = Chart.get(key);

                    obj.$loaded().then(function() {

                        $scope.loadDataFromCSVURL(obj.url);
                        $scope.activeData = obj.name;
                    }, function(error) {
                        console.log("Error:", error);
                        $scope.mesage = error;
                        $scope.isURLInput = true;
                    }).then(function() {

                        var uploader = $firebase(new Firebase(FBURL + '/users/' + obj.uploader)).$asObject();

                        uploader.$loaded().then(function() {

                            $scope.uploader = uploader.name;

                        });
                    });

                };


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
