(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('DemoCtrl', ['$scope', '$q','$window',
            function($scope, $q, $window) {

                $scope.nomaConfig = {

                };

                $scope.configMatrix = [];

                $scope.customCSV = "";


                $scope.loadedData = 'cars';
                $scope.nomaConfig.SVGAspectRatio = 1.4;
                $scope.onlyNumbers = /^\d+$/;

                $scope.context = {};
                $scope.context.translate = [0,0];
                $scope.context.scale = 1;
                $scope.dimsum = {};
                $scope.dimsum.selectionSpace=[];


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
                $scope.alerts = [];
                $scope.isPlotSelectFocused = false;
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
                            } }, true);

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
                    $scope.isRelativeSelectFocused = false;
                    $scope.isBinSizeFocused = false;
                };

                $scope.d3OnClick = function(item) {

                    $scope.$apply(function() {

                        $scope.nomaConfig.xDim = item.xDim;
                        $scope.nomaConfig.yDim = item.yDim;

                    });
                    // alert(item.name);
                };

                $scope.openGPLOM = function() {
                    $window.open('/gplom.html', '_blank');
                };


                $scope.openLens = function() {
                    $window.open('/lens.html', '_blank');
                };


                $scope.openGPLOMNav = function() {
                    $window.open('/indexmatrixNav.html', '_blank');
                };


                // $scope.$watch()
                $scope.changeGPLOM = function() {

                    loadGPLOM();
                    $scope.$apply();
                }


                $scope.changeActiveDataCustomCSV = function(customCSV) {

                    resetTutMsg();


                    $scope.activeData = 'Cars Data';

                    d3.csv(customCSV, function(error, tdata) {
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

                        $scope.$apply();


                    });




                };

                $scope.changeActiveDataTitanic = function() {

                    resetTutMsg();


                    $scope.activeData = 'Survivors of Titanic';

                    var lowMeanHighSDRandomNumberGenerator = d3.random.normal(30, 5);
                    var highMeanLowSDRandomNumberGenerator = d3.random.normal(50, 10);



                    d3.tsv('data/Titanic.txt', function(error, tdata) {
                        var count = 0;

                        tdata.map(function(d) {
                            d.id = count;
                            count += 1;

                            // if (d.Survived === 'Yes') {

                            //     var a = Math.random();

                            //     if (d.Class === 'First') {



                            //         if (a < 0.202325) {
                            //             d.Port = 'Southhampton';
                            //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

                            //         } else if (a < 0.26496) {
                            //             d.Port = 'Queenstown';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


                            //         } else if (a < 0.61064) {

                            //             d.Port = 'Cherbourg';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         } else {

                            //             d.Port = 'Belfast';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         }
                            //     } else if (d.Class === 'Second') {

                            //         if (a < 0.202325) {
                            //             d.Port = 'Southhampton';
                            //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

                            //         } else if (a < 0.26496) {
                            //             d.Port = 'Queenstown';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


                            //         } else if (a < 0.61064) {

                            //             d.Port = 'Cherbourg';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         } else {

                            //             d.Port = 'Belfast';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         }
                            //     } else if (d.Class === 'Third') {

                            //         if (a < 0.431254) {
                            //             d.Port = 'Southhampton';
                            //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

                            //         } else if (a < 0.51303) {
                            //             d.Port = 'Queenstown';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


                            //         } else if (a < 0.74983) {

                            //             d.Port = 'Cherbourg';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         } else {

                            //             d.Port = 'Belfast';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         }
                            //     } else if (d.Class === 'Crew') {

                            //         if (a < 0.278968) {
                            //             d.Port = 'Southhampton';
                            //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

                            //         } else if (a < 0.50005) {
                            //             d.Port = 'Queenstown';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


                            //         } else if (a < 0.75641) {

                            //             d.Port = 'Cherbourg';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         } else {

                            //             d.Port = 'Belfast';
                            //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //         }
                            //     }


                            // } else {
                            //     if (Math.random() > 0.5) {
                            //         d.Port = 'Southhampton';
                            //         d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

                            //     } else if (Math.random() > 0.4) {
                            //         d.Port = 'Queenstown';
                            //         d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


                            //     } else if (Math.random() > 0.5) {

                            //         d.Port = 'Cherbourg';
                            //         d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                            //     } else {

                            //         d.Port = 'Belfast';
                            //         d.AgeInNumbers = Math.round((lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator()) * 0.7);

                            //     }

                            // }

                            // d.AgeInNumbers = Math.round((lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator()) * 0.7);


                        });



                        $scope.nomaData = tdata;
                        $scope.nomaConfig.dims = d3.keys(tdata[0]);

                        var index = $scope.nomaConfig.dims.indexOf('id');
                        $scope.nomaConfig.dims.splice(index, 1);

                        $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                        $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                        $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];
                        loadGPLOM();

                        $scope.$apply();

                    });


                }; //End  $scope.changeActiveDataTitanic()



                $scope.settingForTitanicLoadAll = function() {

                    resetTutMsg();


                    if ($scope.activeData !== 'Survivors of Titanic') {

                        $scope.changeActiveDataTitanic();
                    }



                    $scope.nomaConfig.xDim = null;
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = null;

                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';


                    $scope.addAlert('info', 'Here X and Y axes are not defined. Gatherplots make it easy to have an undefined axis.  Check scatterplots and jittering when there is undefined axis.');
                    $scope.focusElement("isPlotSelectFocused");

                };

                $scope.settingForTitanicLoadAllSurvived = function() {

                    resetTutMsg();


                    if ($scope.activeData !== 'Survivors of Titanic') {

                        $scope.changeActiveDataTitanic();
                    }



                    $scope.nomaConfig.xDim = null;
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = 'Survived';

                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';



                };


                $scope.settingForTitanicGenderSurvived = function() {

                    resetTutMsg();


                    if ($scope.activeData !== 'Survivors of Titanic') {

                        $scope.changeActiveDataTitanic();
                    }



                    $scope.nomaConfig.xDim = 'Sex';
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = 'Survived';

                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';

                    $scope.addAlert('info', 'It looks like woman had survived more likely. Is this pattern clear in jittered scatterplots?');
                    $scope.focusElement("isPlotSelectFocused");



                };

                $scope.settingForTitanicClassGenderSurvived = function() {

                    resetTutMsg();


                    if ($scope.activeData !== 'Survivors of Titanic') {

                        $scope.changeActiveDataTitanic();
                    }



                    $scope.nomaConfig.xDim = 'Class';
                    $scope.nomaConfig.yDim = 'Sex';
                    $scope.nomaConfig.colorDim = 'Survived';

                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';

                    $scope.addAlert('info', 'The different number of elements in the group makes it difficult to compare the percentage directly. Especially male groups of Second, Third and Crew looks similar.');

                };

                $scope.settingForTitanicClassGenderSurvivedRelative = function() {

                    resetTutMsg();


                    if ($scope.activeData !== 'Survivors of Titanic') {

                        $scope.changeActiveDataTitanic();
                    }



                    $scope.nomaConfig.xDim = 'Class';
                    $scope.nomaConfig.yDim = 'Sex';
                    $scope.nomaConfig.colorDim = 'Survived';

                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = true;

                    $scope.addAlert('info', 'The size of nodes changes to make the entire group size same in order to make comparison between groups easier.  Now we can see that "male Crew" has better survival rate than "male 2nd" or "male 3rd.  Try abolute and relative mode yourself and please leave a feedback about your experience.');
                    $scope.focusElement("isRelativeSelectFocused");




                };




                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                // change Active Data to the Bayesian Inference-Mammogram;

                $scope.changeActiveDataMammo = function() {
                    resetTutMsg();

                    //Config settings
                    var numberOfEntity = 3000;
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
                            temp.cancer = 'No cancer';

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

                    $scope.nomaConfig.xDim = null;
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = null;

                    $scope.nomaConfig.relativeMode = 'absolute';

                    loadGPLOM();

                    // $scope.$apply();


                }; //End  $scope.changeActiveDataMammo()


                $scope.changeConfigMammoProblem = function() {

                    resetTutMsg();



                    if ($scope.activeData !== 'Bayesian Inference - Mammogram') {

                        $scope.changeActiveDataMammo();
                    }



                    $scope.nomaConfig.xDim = 'cancer';
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = 'mammo';

                    $scope.nomaConfig.relativeMode = 'absolute';
                    $scope.nomaConfig.isGather = 'gather';

                };

                $scope.changeConfigMammoAnswer = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Bayesian Inference - Mammogram') {

                        $scope.changeActiveDataMammo();
                    }


                    $scope.nomaConfig.xDim = 'mammo';
                    $scope.nomaConfig.yDim = null;
                    $scope.nomaConfig.colorDim = 'cancer';

                    $scope.nomaConfig.relativeMode = 'absolute';
                    $scope.nomaConfig.isGather = 'gather';

                };

                $scope.changeActiveDataContinuous = function() {

                    resetTutMsg();

                    //Config settings
                    var numberOfEntity = 5000;
                    var numDiscreteVar = 60;

                    $scope.activeData = 'Continuous Variables';
                    var data = [];

                    var lowMeanHighSDRandomNumberGenerator = d3.random.normal(1, 2);
                    var highMeanLowSDRandomNumberGenerator = d3.random.normal(4, 2);

                    for (var count = 0; count < numberOfEntity; count++) {

                        var temp = {};

                        temp.id = count;


                        if (Math.random() > 0.7) {
                            temp.nominal = 'A';
                            temp.continuous1 = highMeanLowSDRandomNumberGenerator();

                        } else if (Math.random() > 0.5) {
                            temp.nominal = 'B';
                            temp.continuous1 = lowMeanHighSDRandomNumberGenerator();


                        } else {

                            temp.nominal = 'C';
                            temp.continuous1 = lowMeanHighSDRandomNumberGenerator() + highMeanLowSDRandomNumberGenerator();

                        }



                        temp.continuous2 = (Math.random() * (numDiscreteVar - 1));

                        temp.continuous3 = Math.random();

                        data.push(temp);
                    }

                    $scope.nomaData = data;
                    $scope.nomaConfig.dims = d3.keys(data[0]);

                    var index = $scope.nomaConfig.dims.indexOf('id');
                    $scope.nomaConfig.dims.splice(index, 1);

                    $scope.nomaConfig.xDim = 'continuous1';
                    $scope.nomaConfig.yDim = 'continuous2';
                    $scope.nomaConfig.colorDim = 'nominal';
                    $scope.nomaConfig.relativeMode = 'absolute';
                    $scope.nomaConfig.isGather = 'scatter';

                    loadGPLOM();

                    resetTutMsg();

                };

                $scope.settingForContinuousScatter = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Continuous Variables') {

                        $scope.changeActiveDataContinuous();
                    }

                    // $scope.nomaRound = 'absolute';

                    $scope.nomaConfig.xDim = 'continuous1';
                    $scope.nomaConfig.yDim = 'continuous2';
                    $scope.nomaConfig.colorDim = 'nominal';
                    $scope.nomaConfig.relativeMode = 'absolute';
                    $scope.nomaConfig.isGather = 'scatter';

                    $scope.addAlert('info', 'There is a severe overplotting over the range where X value is near 4.');

                };

                $scope.settingForContinuousGather = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Continuous Variables') {

                        $scope.changeActiveDataContinuous();
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'continuous1';
                    $scope.nomaConfig.yDim = 'continuous2';
                    $scope.nomaConfig.colorDim = 'nominal';
                    $scope.nomaConfig.relativeMode = 'absolute';
                    $scope.nomaConfig.isGather = 'gather';

                    $scope.addAlert('info', 'The trend over the region where overplotting was severe is now clear. However the other regions where there were only small number of nodes were is barely visible. ');

                };

                var updateBinSize = function(binSize) {

                    $scope.nomaConfig.binSize = binSize;
                    return 'success intuinno';
                };

                var updateBinSizeDefer = function(binSize) {



                    var deferred = $q.defer();

                    setTimeout(function() {
                        // since this fn executes async in a future turn of the event loop, we need to wrap
                        // our code into an $apply call so that the model changes are properly observed.
                        $scope.$apply(function() {
                            deferred.notify('About to greet ' + binSize + '.');

                            if (updateBinSize(binSize)) {
                                deferred.resolve('Success!');
                            } else {
                                deferred.reject('Failure');
                            }
                        });
                    }, 1000);

                    return deferred.promise;

                };


                $scope.settingForContinuousGatherWithBinSize = function() {


                    resetTutMsg();

                    if ($scope.activeData !== 'Continuous Variables') {

                        $scope.changeActiveDataContinuous;
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'continuous1';
                    $scope.nomaConfig.yDim = 'continuous2';
                    $scope.nomaConfig.colorDim = 'nominal';
                    $scope.nomaConfig.relativeMode = 'absolute';
                    $scope.nomaConfig.isGather = 'gather';

                    var promise = updateBinSizeDefer(7);

                    promise.then(function(greeting) {
                        console.log('Success: ' + greeting);


                    }, function(reason) {
                        alert('Failed: ' + reason);
                    }, function(update) {
                        // alert('Got notification: ' + update);
                        $scope.isAdvancedOptionOpen = true;
                        $scope.addAlert('info', 'You can try different bin size at advanced options menu below.');
                        $scope.focusElement("isBinSizeFocused");


                    });
                    $scope.isAdvancedOptionOpen = true;

                };

                $scope.settingForContinuousGatherWithBinSizeRelative = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Continuous Variables') {

                        $scope.changeActiveDataContinuous();
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'continuous1';
                    $scope.nomaConfig.yDim = 'continuous2';
                    $scope.nomaConfig.colorDim = 'nominal';
                    $scope.nomaConfig.relativeMode = true;
                    $scope.nomaConfig.isGather = 'gather';


                    $scope.addAlert('info', 'Here you can see that the distributions of sparse regions are more visible. It makes spotting outliers much easier. Compare absolute and relative mode to feel this change. Can you tell what is the underlying distribution of these random variables?');
                    $scope.focusElement("isRelativeSelectFocused");

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


                        index = $scope.nomaConfig.dims.indexOf('Name');
                        $scope.nomaConfig.dims.splice(index, 1);


                        $scope.nomaConfig.xDim = 'Cylinders';
                        $scope.nomaConfig.yDim = 'MPG';
                        $scope.nomaConfig.colorDim = 'Origin';

                        $scope.nomaConfig.isGather = 'gather';
                        $scope.isCarsOpen = true;
                        $scope.nomaConfig.relativeMode = 'absolute';

                        loadGPLOM();

                        $scope.$apply();

                    });

                };

                var loadGPLOM = function() {

                    $scope.configMatrix = [];

                    for (var xIndex in $scope.nomaConfig.dims) {

                        var xTemp = [];

                        for (var yIndex in $scope.nomaConfig.dims) {

                            var temp = {};

                            temp.SVGAspectRatio = 1;
                            temp.colorDim = '';
                            temp.isGather = 'gather';
                            temp.isInteractiveAxis = false;
                            temp.relativeMode = 'absolute';
                            temp.dims = $scope.nomaConfig.dims;
                            temp.xDim = $scope.nomaConfig.dims[xIndex];
                            temp.yDim = $scope.nomaConfig.dims[yIndex];
                            temp.matrixMode = true;

                            xTemp.push(temp);

                        }

                        $scope.configMatrix.push(xTemp);

                    }
                };


                $scope.changeConfigCarsScatterplots = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'Horsepower';
                    $scope.nomaConfig.yDim = 'MPG';
                    $scope.nomaConfig.colorDim = 'Origin';
                    $scope.nomaConfig.isGather = 'scatter';
                    $scope.nomaConfig.relativeMode = 'absolute';


                };

                $scope.changeConfigCarsScatterOneNominal = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'Cylinders';
                    $scope.nomaConfig.yDim = 'MPG';
                    $scope.nomaConfig.colorDim = null;
                    $scope.nomaConfig.isGather = 'scatter';
                    $scope.nomaConfig.relativeMode = 'absolute';

                };

                $scope.changeConfigCarsJitterOneNominal = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = 'absolute';

                    $scope.nomaConfig.xDim = 'Cylinders';
                    $scope.nomaConfig.yDim = 'MPG';
                    $scope.nomaConfig.colorDim = null;
                    $scope.nomaConfig.isGather = 'jitter';
                    $scope.nomaConfig.relativeMode = 'absolute';

                };

                $scope.changeConfigCarsJitterOneNominalWithColor = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = 'absolute';

                    $scope.nomaConfig.xDim = 'Cylinders';
                    $scope.nomaConfig.yDim = 'MPG';
                    $scope.nomaConfig.colorDim = 'Origin';
                    $scope.nomaConfig.isGather = 'jitter';
                    $scope.nomaConfig.relativeMode = 'absolute';

                };

                $scope.changeConfigCarsGatherOneNominalWithColor = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'Cylinders';
                    $scope.nomaConfig.yDim = 'MPG';
                    $scope.nomaConfig.colorDim = 'Origin';
                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';

                };

                $scope.changeConfigCarsGatherTwoNominalWithColor = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = absolute;

                    $scope.nomaConfig.xDim = 'Cylinders';
                    $scope.nomaConfig.yDim = 'Origin';
                    $scope.nomaConfig.colorDim = 'Origin';
                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';

                    $scope.addAlert('info', 'Here Cylinders and Origin are both nominal variables. Try what happens with scatterplots or jittering.');
                    $scope.focusElement("isPlotSelectFocused");

                };

                $scope.changeConfigCarsGatherTwoNominalWithContinuousColor = function() {

                    resetTutMsg();

                    if ($scope.activeData !== 'Cars Data') {

                        $scope.changeActiveDataCars();
                    }

                    // $scope.nomaRound = 'absolute';

                    $scope.nomaConfig.xDim = 'Cylinders';
                    $scope.nomaConfig.yDim = 'Origin';
                    $scope.nomaConfig.colorDim = 'Weight';
                    $scope.nomaConfig.isGather = 'gather';
                    $scope.nomaConfig.relativeMode = 'absolute';

                    $scope.addAlert('info', 'Here the color of nodes represent a weight, which is continuous. Having ordered arrangement makes it easier to discern minute changes in colors.  Compare with scatterplots or jittering.');
                    $scope.focusElement("isPlotSelectFocused");



                };

                $scope.changeActiveDataEHR = function() {

                    resetTutMsg();


                    $scope.activeData = 'Electronic Health Records (EHR)';

                    d3.csv('data/trauma.csv', function(error, tdata) {
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

                        $scope.$apply();

                    });

                };

                $scope.changeActiveDataComments = function() {

                    resetTutMsg();


                    $scope.activeData = 'CommentIQ - Comments Data';

                    d3.csv('data/gatherplotFeatures.csv', function(error, tdata) {
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

                        $scope.$apply();

                    });

                };

                $scope.changeActiveDataArticles = function() {

                    resetTutMsg();


                    $scope.activeData = 'CommentIQ - Articles Data';

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

                        $scope.$apply();

                    });

                };

                $scope.changeActiveDataCars();


            }
        ]);




}());