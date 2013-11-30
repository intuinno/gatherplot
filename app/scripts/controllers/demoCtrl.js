(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('DemoCtrl', ['$scope', 'd3Service',
            function($scope, d3Service) {
                $scope.greeting = "NomaRect";
                //controller code here

                $scope.nomaConfig = {



                };
                $scope.nomaConfig.dims = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
                $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];

                $scope.d3Data = [{
                    name: "Greg",
                    score: 98
                }, {
                    name: "Ari",
                    score: 96
                }, {
                    name: 'Q',
                    score: 75
                }, {
                    name: "Loser",
                    score: 48
                }];



                $scope.activeData = 'titanic';


                d3Service.d3().then(function(d3) {
                    d3.tsv("data/Titanic.txt", function(error, tdata) {

                        $scope.nomaData = tdata;
                        $scope.nomaConfig.dims = d3.keys(tdata[0]);
                        $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                        $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                        $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];
                        $scope.$apply();

                    });
                });


                $scope.onClick = function(item) {
                    $scope.$apply(function() {
                        if (!$scope.showDetailPanel)
                            $scope.showDetailPanel = true;
                        $scope.detailItem = item;
                    });
                };



                $scope.groups = [{
                    title: "Dynamic Group Header - 1",
                    content: "Dynamic Group Body - 1"
                }, {
                    title: "Dynamic Group Header - 2",
                    content: "Dynamic Group Body - 2"
                }];

                $scope.items = ['Item 1', 'Item 2', 'Item 3'];

                $scope.addItem = function() {
                    var newItemNo = $scope.items.length + 1;
                    $scope.items.push('Item ' + newItemNo);
                };

                $scope.changeActiveDataTitanic = function() {
                    $scope.activeData = 'Survivor of Titanic';

                    d3Service.d3().then(function(d3) {

                        d3.tsv("data/Titanic.txt", function(error, tdata) {

                            $scope.nomaData = tdata;

                        });
                    });



                };


            }
        ]);



}());