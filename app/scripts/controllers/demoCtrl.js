(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('DemoCtrl', ['$scope', 'd3Service',
            function($scope, d3Service) {

                $scope.nomaConfig = {

                    //initial Data



                };

                $scope.loadedData = 'titanic';
                $scope.nomaConfig.optimizeAspect = "true";
                $scope.nomaConfig.fillingDirection = "vertical";
                $scope.nomaConfig.XAlign = 'justify';
                $scope.nomaConfig.YAlign = 'justify';

                $scope.onClick = function(item) {
                    $scope.$apply(function() {
                        if (!$scope.showDetailPanel)
                            $scope.showDetailPanel = true;
                        $scope.detailItem = item;
                    });
                };

                $scope.changeActiveDataTitanic = function() {


                    $scope.activeData = 'Survivor of Titanic';


                    d3Service.d3().then(function(d3) {
                        d3.tsv("data/Titanic.txt", function(error, tdata) {
                            var count = 0;

                            tdata.map(function(d) {
                                d.id = count;
                                count += 1;
                            })

                            $scope.nomaData = tdata;
                            $scope.nomaConfig.dims = d3.keys(tdata[0]);

                            var index = $scope.nomaConfig.dims.indexOf("id");
                            $scope.nomaConfig.dims.splice(index, 1);

                            $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                            $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                            $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];


                            $scope.$apply();



                        });
                    });



                }; //End  $scope.changeActiveDataTitanic()

                $scope.changeActiveDataTitanic();




                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                // change Active Data to the Bayesian Inference-Mammogram;

                $scope.changeActiveDataMammo = function() {

                    //Config settings
                    var numberOfEntity = 5000;
                    var numDiscreteVar = 60;

                    $scope.activeData = 'Bayesian Inference - Mammogram';
                    var data = [];

                    for (var count = 0; count < numberOfEntity; count++) {

                        var temp = new Object();

                        temp.id = count;

                        // temp.continous_variable1 = Math.random();
                        //temp.continous_variable2 = Math.random();
                        // temp.discrete_variable = Math.round(Math.random() * (numDiscreteVar - 1));

                        // if (Math.random() > 0.3) {
                        //     temp.nominal_variable = 'Male';
                        // } else {
                        //     temp.nominal_variable = 'Female';
                        // }

                        if (Math.random() > 0.99) {
                            temp.cancer = 'Cancer';

                            if (Math.random() > 0.8) {
                                temp.mammo = 'Negative Mamo';
                            } else {
                                temp.mammo = 'Positive Mamo';
                            }

                        } else {
                            temp.cancer = 'No Cancer';

                            if (Math.random() > 0.096) {
                                temp.mammo = 'Negative Mamo';
                            } else {
                                temp.mammo = 'Positive Mamo';
                            }
                        }

                        // temp.descriptor = temp.cancer + ", " + temp.mamo;

                        data.push(temp);
                    }

                    $scope.nomaData = data;
                    $scope.nomaConfig.dims = d3.keys(data[0]);

                    var index = $scope.nomaConfig.dims.indexOf("id");
                    $scope.nomaConfig.dims.splice(index, 1);

                    $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                    $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                    $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];

                    // $scope.$apply();


                }; //End  $scope.changeActiveDataMammo()


                $scope.changeConfigMammoProblem = function() {

                    if ($scope.activeData != 'Bayesian Inference - Mammogram') {

                        $scope.changeActiveDataMammo();
                    }


                    $scope.nomaConfig.isXUniformSpacing = true;
                    $scope.nomaConfig.isYUniformSpacing = true;
                    $scope.nomaConfig.xDim = 'cancer';
                    $scope.nomaConfig.yDim = '';
                    $scope.nomaConfig.colorDim = 'mammo';

                };

                $scope.changeConfigMammoAnswer = function() {

                    if ($scope.activeData != 'Bayesian Inference - Mammogram') {

                        $scope.changeActiveDataMammo();
                    }

                    $scope.nomaConfig.isXUniformSpacing = true;
                    $scope.nomaConfig.isYUniformSpacing = true;
                    $scope.nomaConfig.xDim = 'mammo';
                    $scope.nomaConfig.yDim = '';
                    $scope.nomaConfig.colorDim = 'cancer';

                };

                $scope.changeActiveDataContinuous = function() {

                    //Config settings
                    var numberOfEntity = 10000;
                    var numDiscreteVar = 60;

                    $scope.activeData = 'Continuous Variables';
                    var data = [];

                    for (var count = 0; count < numberOfEntity; count++) {

                        var temp = new Object();

                        temp.id = count;


                        if (Math.random() > 0.3) {
                            temp.gender = 'Male';
                        } else {
                            temp.gender = 'Female';
                        }

                        if (Math.random() > 0.99) {
                            temp.cancer = 'Cancer';

                            if (Math.random() > 0.8) {
                                temp.mammo = 'Negative Mamo';
                            } else {
                                temp.mammo = 'Positive Mamo';
                            }

                        } else {
                            temp.cancer = 'No Cancer';

                            if (Math.random() > 0.096) {
                                temp.mammo = 'Negative Mamo';
                            } else {
                                temp.mammo = 'Positive Mamo';
                            }
                        }

                        temp.continous_variable1 = d3.random.normal([0.3, 2]);
                        temp.continous_variable2 = d3.random.normal([0.8, 0.5]);
                        temp.age = Math.round(Math.random() * (numDiscreteVar - 1));

                        data.push(temp);
                    }

                    $scope.nomaData = data;
                    $scope.nomaConfig.dims = d3.keys(data[0]);

                    var index = $scope.nomaConfig.dims.indexOf("id");
                    $scope.nomaConfig.dims.splice(index, 1);

                    $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                    $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                    $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];




                    // $scope.$apply();


                };



                $scope.changeConfigContinuousBinning = function() {

                    if ($scope.activeData != 'Continuous Variables') {

                        $scope.changeActiveDataContinuous();
                    }

                    $scope.nomaConfig.isXUniformSpacing = false;
                    $scope.nomaConfig.isYUniformSpacing = true;

                    $scope.nomaConfig.xDim = 'gender';
                    $scope.nomaConfig.yDim = 'age';
                    $scope.nomaConfig.colorDim = 'mammo';

                    $scope.nomaConfig.XAlign = 'left';
                    $scope.nomaConfig.YAlign = 'justify';

                    $scope.nomaConfig.isYNumber = true;

                };


            }
        ]);



}());