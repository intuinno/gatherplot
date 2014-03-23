(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('DemoCtrl', ['$scope',
            function($scope) {

                $scope.nomaConfig = {

                };


                $scope.loadedData = 'cars';
                $scope.nomaConfig.SVGAspectRatio = 1.4;

                $scope.nomaRound = true;
                $scope.nomaBorder = false;
                $scope.nomaShapeRendering = 'auto';
                $scope.nomaConfig.isGather = 'scatter';
                $scope.nomaConfig.relativeModes = ['absolute', 'relative'];
                $scope.nomaConfig.relativeMode = 'absolute';
                $scope.nomaConfig.binSize = 10;
                $scope.alerts = [];
                $scope.isPlotSelectFocused = false;

                $scope.addAlert = function(messageType, messageContent) {
                    $scope.alerts.push({
                        msg: messageContent,
                        type: messageType
                    });
                };

                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };

                $scope.focusElement = function(element) {
                    $scope[element] = true;
                };

                var resetTutMsg = function() {
                    $scope.alerts = [];
                    $scope.isPlotSelectFocused = false;
                };




                $scope.changeActiveDataTitanic = function() {

                    resetTutMsg();


                    $scope.activeData = 'Survivor of Titanic';


                    d3.tsv('data/Titanic.txt', function(error, tdata) {
                        var count = 0;

                        tdata.map(function(d) {
                            d.id = count;
                            count += 1;
                        });

                        $scope.nomaData = tdata;
                        $scope.nomaConfig.dims = d3.keys(tdata[0]);

                        var index = $scope.nomaConfig.dims.indexOf('id');
                        $scope.nomaConfig.dims.splice(index, 1);

                        $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                        $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                        $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];

                        $scope.$apply();

                    });


                }; //End  $scope.changeActiveDataTitanic()

               

                $scope.settingForTitanicLoadAll = function() {

                    if ($scope.activeData !== 'Survivor of Titanic') {

                        $scope.changeActiveDataTitanic();
                    }



                    $scope.nomaConfig.xDim = null;
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = null;

                    $scope.addAlert('danger', 'Oh, snap! In scatterplots, everypoints converged over same place.  Check jittering and gathering.');
                    $scope.focusElement("isPlotSelectFocused");

                };





                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                // change Active Data to the Bayesian Inference-Mammogram;

                $scope.changeActiveDataMammo = function() {
                    resetTutMsg();

                    //Config settings
                    var numberOfEntity = 4000;
                    var numDiscreteVar = 60;

                    $scope.activeData = 'Bayesian Inference - Mammogram';
                    var data = [];

                    for (var count = 0; count < numberOfEntity; count++) {

                        var temp = {};

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
                    $scope.nomaConfig.dims = Object.keys(data[0]);

                    var index = $scope.nomaConfig.dims.indexOf('id');
                    $scope.nomaConfig.dims.splice(index, 1);

                    $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                    $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                    $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];

                    // $scope.$apply();


                }; //End  $scope.changeActiveDataMammo()


                $scope.changeConfigMammoProblem = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Bayesian Inference - Mammogram') {

                        $scope.changeActiveDataMammo();
                    }



                    $scope.nomaConfig.xDim = 'cancer';
                    $scope.nomaConfig.yDim = '';
                    $scope.nomaConfig.colorDim = 'mammo';

                };

                $scope.changeConfigMammoAnswer = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Bayesian Inference - Mammogram') {

                        $scope.changeActiveDataMammo();
                    }


                    $scope.nomaConfig.xDim = 'mammo';
                    $scope.nomaConfig.yDim = '';
                    $scope.nomaConfig.colorDim = 'cancer';

                };

                $scope.changeActiveDataContinuous = function() {

                    resetTutMsg();

                    //Config settings
                    var numberOfEntity = 5000;
                    var numDiscreteVar = 60;

                    $scope.activeData = 'Continuous Variables';
                    var data = [];

                    var lowMeanHighSDRandomNumberGenerator = d3.random.normal(0.3, 2);
                    var highMeanLowSDRandomNumberGenerator = d3.random.normal(0.8, 0.5);

                    for (var count = 0; count < numberOfEntity; count++) {

                        var temp = {};

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


                        temp.continous_variable1 = lowMeanHighSDRandomNumberGenerator();
                        temp.continous_variable2 = highMeanLowSDRandomNumberGenerator();
                        temp.age = Math.round(Math.random() * (numDiscreteVar - 1));

                        data.push(temp);
                    }

                    $scope.nomaData = data;
                    $scope.nomaConfig.dims = d3.keys(data[0]);

                    var index = $scope.nomaConfig.dims.indexOf('id');
                    $scope.nomaConfig.dims.splice(index, 1);

                    $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                    $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                    $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];




                    // $scope.$apply();


                };



                $scope.changeConfigContinuousBinning = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Continuous Variables') {

                        $scope.changeActiveDataContinuous();
                    }

                    $scope.nomaConfig.isXUniformSpacing = true;
                    $scope.nomaConfig.isYUniformSpacing = true;

                    $scope.nomaConfig.xDim = 'gender';
                    $scope.nomaConfig.yDim = 'age';
                    $scope.nomaConfig.colorDim = 'mammo';

                    $scope.nomaConfig.XAlign = 'left';
                    $scope.nomaConfig.YAlign = 'left';

                    $scope.nomaConfig.isYNumber = true;

                };

                $scope.changeConfigContinuousBinningNor = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Continuous Variables') {

                        $scope.changeActiveDataContinuous();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.isXUniformSpacing = true;
                    $scope.nomaConfig.isYUniformSpacing = true;

                    $scope.nomaConfig.xDim = 'gender';
                    $scope.nomaConfig.yDim = 'age';
                    $scope.nomaConfig.colorDim = 'mammo';

                    $scope.nomaConfig.XAlign = 'justify';
                    $scope.nomaConfig.YAlign = 'left';

                    $scope.nomaConfig.isYNumber = true;


                };

                $scope.changeActiveDataCars = function() {

                    resetTutMsg();


                    $scope.activeData = 'Cars Data';

                    d3.csv('data/cars.csv', function(error, tdata) {
                        var count = 0;

                        tdata.map(function(d) {
                            d.id = count;
                            count += 1;
                        });

                        $scope.nomaData = tdata;
                        $scope.nomaConfig.dims = d3.keys(tdata[0]);

                        var index = $scope.nomaConfig.dims.indexOf('id');
                        $scope.nomaConfig.dims.splice(index, 1);


                        $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = 'Origin';

                        $scope.nomaConfig.isGather = 'gather';
                        $scope.isCarsOpen = true;
                        $scope.nomaConfig.relativeMode = 'absolute';

                        $scope.$apply();



                    });




                };

                $scope.changeConfigCarsScatterplots = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Horsepower';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = 'Origin';
                        $scope.nomaConfig.isGather = 'scatter';
                        $scope.nomaConfig.relativeMode = 'absolute';


                };

                $scope.changeConfigCarsScatterOneNominal =function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = null;
                        $scope.nomaConfig.isGather = 'scatter';
                        $scope.nomaConfig.relativeMode = 'absolute';

                };

                $scope.changeConfigCarsJitterOneNominal =function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = null;
                        $scope.nomaConfig.isGather = 'jitter';
                        $scope.nomaConfig.relativeMode = 'absolute';

                };

                $scope.changeConfigCarsJitterOneNominalWithColor =function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = 'Origin';
                        $scope.nomaConfig.isGather = 'jitter';
                        $scope.nomaConfig.relativeMode = 'absolute';

                };

                 $scope.changeConfigCarsGatherOneNominalWithColor =function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = 'Origin';
                        $scope.nomaConfig.isGather = 'gather';
                        $scope.nomaConfig.relativeMode = 'absolute';

                };

                 $scope.changeConfigCarsGatherTwoNominalWithColor =function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'Origin';
                        $scope.nomaConfig.colorDim = 'Origin';
                        $scope.nomaConfig.isGather = 'gather';
                        $scope.nomaConfig.relativeMode = 'absolute';

                    $scope.addAlert('danger', 'Here Cylinders and Origin are both nominal variables. Try what happens with scatterplots or jittering.');
                    $scope.focusElement("isPlotSelectFocused");

                };

                  $scope.changeConfigCarsGatherTwoNominalWithContinuousColor =function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = false;

                    $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'Origin';
                        $scope.nomaConfig.colorDim = 'Weight';
                        $scope.nomaConfig.isGather = 'gather';
                        $scope.nomaConfig.relativeMode = 'absolute';

                    
                };


                 $scope.changeActiveDataCars();


            }
        ]);



}());