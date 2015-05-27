(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('LoadCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$location', 'FBURL', '$routeParams', 'fbutil', 'Chart', 'simpleLogin', '$q',

            function($scope, $firebaseObject, $firebaseArray, $location, FBURL, $routeParams, fbutil, Chart, simpleLogin, $q) {


                $scope.chartId = $routeParams.csvKey;

                var sessionID;

                $scope.isCommentShowing = true;

                simpleLogin.auth.$onAuth(function(authData) {

                    $scope.user = authData;
                    $scope.signedIn = !!authData;

                    if (authData) {
                        loadProfile(authData)
                    }
                });

                var handleCommentsURL = function() {

                    var commentsArray = Chart.comments($routeParams.csvKey);

                    commentsArray.$loaded().then(function() {

                        $scope.comments = commentsArray;

                        var locationSearch = $location.search();

                        if (locationSearch.comment) {

                            console.log(locationSearch.comment);

                            var pos = commentsArray.map(function(d) {
                                return d.$id;
                            }).indexOf(locationSearch.comment);

                            $scope.loadComment(commentsArray[pos]);

                        }


                    }, function(error) {
                        console.log("Error:", error);
                        $scope.mesage = error;
                    }).then(function() {


                    });


                };

                var handleSession = function() {

                    var locationSearch = $location.search();

                    if (locationSearch.session) {


                        var sessionObj = $firebaseObject(new Firebase(FBURL + '/sessions/' + locationSearch.session));

                        sessionObj.$bindTo($scope, 'dimsum');

                        sessionID = locationSearch.session;

                    }



                };




                var profile;

                // loadProfile(simpleLogin.user);

                $scope.loadComment = function(comment) {

                    // comment.config.comment = true;


                    $scope.nomaConfig = comment.config;
                    $scope.context = comment.context;
                    $scope.dimsum = comment.dimsum;

                    $scope.isComment = true;
                    $scope.loadedCommentText = comment.text;
                    $scope.loadedCommentTextCreatorName = comment.creator;
                    $scope.loadedCommentTextCreatorUID = comment.creatorUID;
                    $location.search({
                        comment: comment.$id
                    });


                    // $scope.$apply();

                };



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

                    var comment = {
                        text: $scope.commentText,
                        creator: profile.name,
                        creatorUID: $scope.user.uid,
                        config: context,
                        context: $scope.context,
                        chartId: $routeParams.csvKey,
                        dimsum: $scope.dimsum
                    };

                    $scope.comments.$add(comment);

                    $scope.commentText = '';

                };

                $scope.launchSession = function(handler) {

                    if (!sessionID) {

                        var promise = createSession();

                        promise.then(function(newSessionID) {

                                handler(newSessionID);
                            },
                            function(reason) {

                                alert('Failed' + reason);
                            });
                    } else {

                        handler(sessionID);

                    }


                };

                $scope.openNewWindow = function(sessionID) {

                    var url = '#' + $location.path();
                    url = url + '?session=';
                    url = url + sessionID;

                    window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=800, left=500, width=800, height=600");

                };

                $scope.openNewInspector = function(sessionID) {

                    var url = '#/inspect/' + $routeParams.csvKey;
                    url = url + '?session=';
                    url = url + sessionID;

                    window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=800, height=800");

                };

                $scope.openNewMatrix = function(sessionID) {

                    var url = '#/matrix/' + $routeParams.csvKey;
                    url = url + '?session=';
                    url = url + sessionID;

                    window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400");

                };

                $scope.openNewQR = function(sessionID) {

                    var url = $location.absUrl();

                    $scope.qrcodeURL = url;
                    $scope.isQRcodeVisible = true;

                };

                function createSession() {

                    return $q(function(resolve, reject) {

                        var ref = new Firebase(FBURL + '/sessions/');
                        var sync = $firebaseArray(ref);

                        sync.$add($scope.dimsum).then(function(newChildRef) {
                            console.log("added record with id " + newChildRef.key());

                            // var ref = $firebase(newChildRef);
                            var obj = $firebaseObject(newChildRef);
                            obj.$bindTo($scope, "dimsum");

                            $location.search({
                                session: newChildRef.key()
                            });

                            sessionID = newChildRef.key();

                            resolve(newChildRef.key());

                        }, function(reason) {

                            reject(reason);
                        });

                    });

                };

                $scope.nomaConfig = {

                };
                $scope.loadedCommentText = '';
                $scope.loadedData = 'cars';
                $scope.nomaConfig.SVGAspectRatio = 1.4;
                $scope.onlyNumbers = /^\d+$/;

                $scope.isComment = true;

                $scope.nomaRound = true;
                $scope.nomaBorder = false;
                $scope.nomaConfig.comment = false;
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

                $scope.user = simpleLogin.user;
                $scope.signedIn = !!simpleLogin.user;
                $scope.context = {};
                $scope.context.translate = [0, 0];
                $scope.context.scale = 1;
                $scope.dimsumData = {};
                $scope.dimsum = {};
                $scope.dimsum.dummy = 1;
                $scope.dimsum.selectionSpace = [-1];

                $scope.$watch(function() {
                    return $scope.nomaConfig.isGather;
                }, function(newVals, oldVals) {
                    // debugger;
                    if (newVals === 'scatter') {

                        $scope.isScatter = true;
                    } else {

                        $scope.isScatter = false;
                    }
                }, true);

                $scope.init = function() {



                    $scope.isURLInput = false;
                    $scope.getUrlFromKey($routeParams.csvKey);
                    $scope.dimsum = {};
                    $scope.dimsum.selectionSpace = [];
                    $scope.dimsum.dummy = 1;
                    $scope.dimsum.selectionSpace = [-1];


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

                        var locationSearch = $location.search();

                        var ref = new Firebase(FBURL + '/users/' + obj.uploader);

                        var uploader = $firebaseObject(ref);

                        uploader.$loaded().then(function() {

                            $scope.uploader = uploader.name;

                        });

                        if (locationSearch.comment) {

                            console.log(locationSearch.comment);

                        }
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


                            // index = $scope.nomaConfig.dims.indexOf('Name');
                            // $scope.nomaConfig.dims.splice(index, 1);


                            $scope.nomaConfig.xDim = null;
                            $scope.nomaConfig.yDim = null;
                            $scope.nomaConfig.colorDim = null;

                            $scope.nomaConfig.isGather = 'gather';
                            $scope.nomaConfig.relativeMode = 'absolute';

                        }

                        handleCommentsURL();
                        handleSession();
                        $scope.$apply();
                    }).on("progress", function(event) {
                        //update progress bar
                        if (d3.event.lengthComputable) {
                            $scope.percentComplete = Math.round(d3.event.loaded * 100 / d3.event.total);
                            $scope.$apply();
                            // console.log($scope.percentComplete);
                        }
                    });



                };


                $scope.init();

            }


        ]);

}());
