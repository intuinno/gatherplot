'use strict';

/**
 * @ngdoc function
 * @name gatherplotApp.controller:InspectctrlCtrl
 * @description
 * # InspectctrlCtrl
 * Controller of the gatherplotApp
 */
angular.module('myApp.controllers')
    .controller('InspectCtrl', function($scope, $firebaseObject, $firebaseArray, $location, FBURL, $routeParams, fbutil, Chart, simpleLogin, $log, $q, $modal, uiGridConstants) {

        $scope.chartId = $routeParams.csvKey;

        $scope.showAll = false;

        $scope.gridData = {
            showGridFooter: true,
            showColumnFooter: true,
            enableFiltering: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            enableGridMenu: true,
            enableRowSelection: true,
            enableSelectionBatchEvent: false,
            onRegisterApi: function(gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                    handleRowChange(row);
                });
            }
        };

        $scope.addFilter = function() {

            var modalInstance = $modal.open({
                templateUrl: 'addFilter.html',
                controller: 'AddfiltermodalCtrl',
                size: 'sm',
                resolve: {
                    headers: function() {
                        return $scope.headers;
                    }
                }
            });

            modalInstance.result.then(function(settingName) {

                // $log.info(settingName);

                var newSetting = angular.copy($scope.currentCategory);
                newSetting.name = settingName;

                $scope.presetCategory.$add(newSetting);

            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        var handleRowChange = function(row) {
            if (row.isSelected) {
                addToDimsum(row);
            } else {
                removeFromDimsum(row);
            }
        };

        var addToDimsum = function(row) {

            var id = row.entity.id;

            if ($scope.dimsum.source !== 'inspector') {
                $scope.dimsum.selectionSpace = [-1];
                $scope.dimsum.source = 'inspector';
            }

            if ($scope.dimsum.selectionSpace.indexOf(id) === -1) {
                $scope.dimsum.selectionSpace.push(id);
                $scope.dimsum.source = 'inspector';
            }

        };

        var removeFromDimsum = function(row) {

            var id = row.entity.id;
            var space = $scope.dimsum.selectionSpace;

            var loc = space.indexOf(id);

            if (loc !== -1) {
                space.splice(loc, 1);
                $scope.dimsum.source = 'inspector';
            }
        }


        var allData = [];

        var sessionID;

        $scope.$watch(function() {
            return $scope.dimsum;
        }, function(newVals, oldVals) {

            handleDimsumChange(newVals.selectionSpace);

        }, true);

        $scope.$watch(function() {
            return $scope.showAll;
        }, function(newVals, oldVals) {

            handleDimsumChange($scope.dimsum.selectionSpace);

        }, true);

        var handleDimsumChange = function(newSelectionspace) {

            if (!newSelectionspace) {

                return;
            }

            if ($scope.showAll || newSelectionspace.length === 1) {
                $scope.gridData.data = allData;
            } else {
                $scope.gridData.data = allData.filter(function(d, i) {
                    if (newSelectionspace.indexOf(i) === -1) {
                        return false;
                    } else {
                        return true;
                    }
                });
            }

            allData.forEach(function(d, i) {

                if (newSelectionspace.indexOf(i) === -1) {
                    $scope.gridApi.selection.unSelectRow(d);
                } else {
                    $scope.gridApi.selection.selectRow(d);
                }

            });

        };


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

        $scope.loadComment = function(comment) {

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

        $scope.loadedCommentText = '';
        $scope.loadedData = 'cars';
        $scope.onlyNumbers = /^\d+$/;

        $scope.context = {};
        $scope.context.translate = [0, 0];
        $scope.context.scale = 1;

        $scope.init = function() {

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



                    allData = tdata;

                    $scope.headers = d3.keys(tdata[0]);



                    $scope.gridData.columnDefs = $scope.headers.map(function(d) {

                        var temp = {};
                        temp.name = d;
                        temp.displayName = d;
                        temp.enableFiltering = true;
                        temp.width = d.length * 10 +10 ;

                        if (isNaN(tdata[0][d])) {

                            temp.filters = [{
                                term: '',
                                placeholder: 'text search'
                            }];



                        } else {
                            temp.filters = [{
                                condition: uiGridConstants.filter.GREATER_THAN,
                                placeholder: 'greater than'
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN,
                                placeholder: 'less than'
                            }];

                            convertNumDim(tdata, d);
                        }
                        return temp;

                    });
                }

                handleCommentsURL();
                handleSession();
                handleDimsumChange($scope.dimsum.selectionSpace);
                $scope.$apply();
            });

        };
        $scope.init();

        var convertNumDim = function(data, dim) {

        	data.forEach(function(d) {
        		d[dim] = +d[dim];
        	});
        }

    });
