(function() {
    'use strict';

    angular.module('gatherLensApp.directives')
        .directive('gatherLens',
            function() {
                return {
                    restrict: 'EA',
                    scope: {
                        data: "=",
                        config: "=",
                        round: "=",
                        xdim: "@",
                        ydim: "@",
                        shapeRenderingMode: "=",
                        onClick: '&'
                    },

                    link: function(scope, iElement, iAttrs) {

                        //Constants and Setting Environment variables 

                        var margin = 80;


                        var maxDotSize = 5;

                        if (scope.config.matrixMode === true) {
                            margin = 5;
                            maxDotSize = 5;
                        }

                        var width = 1040;
                        var height = 820;
                        var outerWidth = width + 2 * margin;
                        var outerHeight = height + 2 * margin;
                        var colorNominal = d3.scale.category10();
                        var color;
                        var colorScaleForHeatMap = d3.scale.linear()
                            .range(["#98c8fd", "08306b"])
                            .interpolate(d3.interpolateHsl);
                        var renderData;

                        var xValue, yValue; //Function for getting value of X,Y position 
                        var xOriginalValue, yOriginalValue;
                        var xScale, yScale;
                        var xMap, yMap;
                        var nest = {};

                        var defaultBinSize = 10;

                        var marginForBorderOfAxis = 0.5; //Margin for Border Of Axis


                        var marginClusterRatio = 0.1; //Ratio of margin in the cluster 

                        scope.config.dimSetting = {};

                        var svg, svgGroup, nodeGroup, xAxisNodes, yAxisNodes;
                        var tooltip;
                        var clusterControlBox;

                        var labelDiv;

                        scope.config.binSiz = defaultBinSize;


                        var initializeSVG = function() {

                            svg = d3.select(iElement[0])
                                .append("svg:svg");

                            labelDiv = d3.select(iElement[0])
                                .append("div");


                            svgGroup = svg.append("g")
                                .attr("transform", "translate(" + margin + "," + margin + ")")
                                .attr("class", "svgGroup");

                            nodeGroup = svg.append("g")
                                .attr("transform", "translate(" + margin + "," + margin + ")")
                                .attr("class", "nodes");

                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + height + ")");

                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis");

                            tooltip = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

                            clusterControlBox = d3.select("body").append("div")
                                .attr("class", "clusterControlBox")
                                .style("opacity", 0);

                        };

                        initializeSVG();

                        // on window resize, re-render d3 canvas
                        window.onresize = function() {
                            return scope.$apply();
                        };

                        scope.$watch(function() {
                            return angular.element(window)[0].innerWidth;
                        }, function() {
                            return scope.handleConfigChange(renderData, scope.config);
                        });

                        // watch for data changes and re-render
                        scope.$watch('data', function(newVals, oldVals) {
                            return scope.renderDataChange(newVals, scope.config);

                        }, false);

                        // watch for Config changes and re-render

                        scope.$watch('config', function(newVals, oldVals) {
                            // debugger;
                            return scope.handleConfigChange(renderData, newVals);
                        }, true);

                        scope.$watch(function() {
                            return scope.xdim;
                        }, function(newVals, oldVals) {
                            // debugger;
                            return scope.handleXDimChange(newVals, oldVals);
                        }, true);

                        scope.$watch(function() {
                            return scope.ydim;
                        }, function(newVals, oldVals) {
                            // debugger;
                            return scope.handleYDimChange(newVals, oldVals);
                        }, true);

                        scope.$watch('config.binSize', function(newVals, oldVals) {
                            // debugger;
                            return scope.renderDataChange(scope.data, scope.config);
                        }, true);

                        scope.$watch(function() {
                            return scope.border;
                        }, function(newVals, oldVals) {
                            return scope.renderBorderChange(newVals);
                        }, false);

                        scope.$watch(function() {
                            return scope.round;
                        }, function(newVals, oldVals) {
                            return scope.renderRoundChange(newVals);
                        }, false);

                        scope.$watch(function() {
                            return scope.shapeRenderingMode;
                        }, function(newVals, oldVals) {
                            return scope.renderShapeRenderingChange(newVals);
                        }, true);


                        scope.renderBorderChange = function(isBorder) {

                            svgGroup.selectAll(".dot")
                                .style("stroke", function(d) {
                                    return isBorder ? 'black' : 'none';
                                });

                        };

                        scope.handleXDimChange = function(newVals, oldVals) {

                            if (!newVals) {


                            } else {

                                // scope.xdim = newVals;
                                scope.handleConfigChange(renderData, scope.config);

                            }

                        };

                        scope.handleYDimChange = function(newVals, oldVals) {

                            if (!newVals) {


                            } else {

                                // scope.ydim = newVals;
                                scope.handleConfigChange(renderData, scope.config);

                            }

                        };


                        scope.renderRoundChange = function(isRound) {

                            svgGroup.selectAll(".dot")
                                .transition()
                                .duration(500)
                                .attr("rx", function(d) {
                                    return isRound ? +d.nodeWidth / 2 : 0;
                                })
                                .attr("ry", function(d) {
                                    return isRound ? +d.nodeWidth / 2 : 0;
                                });

                        };

                        scope.renderShapeRenderingChange = function(newShapeRendering) {

                            svgGroup.selectAll(".dot")
                                .style("shape-rendering", newShapeRendering);

                        };

                        var reloadDataToSVG = function() {

                            svgGroup.selectAll("*").remove();
                            nodeGroup.selectAll(".dot").remove();

                            if (scope.config.matrixMode === false) {

                                nodeGroup.selectAll(".dot")
                                    .data(scope.data)
                                    .enter().append("rect")
                                    .attr("class", "dot")
                                    .on("mouseover", function(d) {
                                        tooltip.transition()
                                            .duration(200)
                                            .style("opacity", 0.9);


                                        tooltip.html(d.Name + "<br/>" + scope.xdim + ":" + xOriginalValue(d) + "<br/> " + scope.ydim + ":" + yOriginalValue(d) + "</br>" + scope.config.colorDim + ":" + colorOriginalValue(d))
                                            .style("left", (d3.event.pageX + 5) + "px")
                                            .style("top", (d3.event.pageY - 28) + "px");
                                

                              
                                });



                            } else {

                                nodeGroup.selectAll(".dot")
                                    .data(scope.data)
                                    .enter().append("rect")
                                    .attr("class", "dot");

                                svg.on("mouseover", function(d) {
                                        tooltip.transition()
                                            .duration(200)
                                            .style("opacity", 0.9);


                                        tooltip.html("<h3>" + scope.xdim + " vs " + scope.ydim + "</h3>")
                                            .style("left", (d3.event.pageX + 5) + "px")
                                            .style("top", (d3.event.pageY - 28) + "px");
                                    })
                                    .on("mouseout", function(d) {
                                        tooltip.transition()
                                            .duration(500)
                                            .style("opacity", 0);
                                    })
                                    .on("click", function(d) {

                                        return scope.onClick({
                                            item: {
                                                xDim: scope.xdim,
                                                yDim: scope.ydim
                                            }
                                        });
                                    });


                            }


                            scope.config.dimSetting = {};


                        };

                        var identifyAndUpdateDimDataType = function() {

                            for (var i = 0; i < scope.config.dims.length; i++) {

                                var dim = scope.config.dims[i];
                                scope.config.dimSetting[dim] = {};
                                scope.config.dimSetting[dim].dimType = identifyDimDataType(dim);
                                prepareDimSettingKeys(dim);

                            }

                        };

                        var prepareDimSettingKeys = function(dim) {

                            var currentDimSetting = scope.config.dimSetting[dim];

                            if (currentDimSetting.dimType === 'ordinal') {

                                //doBinningAndSetKeys(dim);
                                currentDimSetting.isBinned = true;


                            } else {

                                setKeysFromOriginalData(dim);
                                currentDimSetting.isBinned = false;

                            }


                        };


                        var doBinningAndSetKeys = function(dimName, numBin) {

                            var currentDimSetting = scope.config.dimSetting[dimName];

                            currentDimSetting.binnedData = scope.data.map(binningFunc(dimName, numBin));

                        };

                        var binningFunc = function(dimName, numBin) {

                            var minValue = d3.min(scope.data, function(d) {
                                return +d[dimName];
                            });
                            var maxValue = d3.max(scope.data, function(d) {
                                return +d[dimName];
                            });

                            var encodingBinScale = d3.scale.linear()
                                .range([0, numBin - 1])
                                .domain([minValue, maxValue]);

                            var decodingBinScale = d3.scale.linear()
                                .domain([0, numBin - 1])
                                .range([minValue, maxValue]);

                            var binKeys = d3.range(0, numBin, 1);

                            binKeys = binKeys.map(function(d) {
                                return decodingBinScale(d + 0.5);
                            });


                            scope.config.dimSetting[dimName].halfOfBinDistance = (decodingBinScale(1) - decodingBinScale(0)) / 2;

                            scope.config.dimSetting[dimName].keyValue = initializeKeyValueObject(binKeys);

                            return function(d) {

                                return decodingBinScale(Math.floor(encodingBinScale(d[dimName])) + 0.5);
                            };

                        };

                        var setKeysFromOriginalData = function(dim) {

                            if (!dim) {

                                return '';

                            }

                            var nest = d3.nest()
                                .key(function(d) {
                                    return d[dim];
                                })
                                .entries(scope.data);

                            var keyValue = nest.map(function(d) {
                                return d.key;
                            });

                            if (scope.config.dimSetting[dim].dimType === 'semiOrdinal') {

                                keyValue.sort();
                            }

                            scope.config.dimSetting[dim].keyValue = initializeKeyValueObject(keyValue);


                        };

                        var initializeKeyValueObject = function(keyValue) {

                            var keyObject = {};

                            keyValue.forEach(function(d, i) {
                                keyObject[d] = {};
                                keyObject[d].keyValue = d;
                                keyObject[d].sortedID = i;
                                keyObject[d].isMinimized = false;
                                keyObject[d].isMaximized = false;
                                keyObject[d].calculatedPosition = i;
                            });

                            return keyObject;

                        };


                        var identifyDimDataType = function(dim) {

                            if (isFirstSampleNumber(dim)) {

                                return identifyOrdinalDimDataType(dim);
                            } else {

                                return "nominal";
                            }

                        };

                        var identifyOrdinalDimDataType = function(dim) {

                            if (isSemiOrdinalDim(dim)) {

                                return "semiOrdinal";
                            } else {

                                return "ordinal";
                            }

                        };

                        var isSemiOrdinalDim = function(dim) {

                            if (getRawNumberOfKeys(dim) < 60) {
                                return true;
                            } else {
                                return false;
                            }


                        };

                        var getRawNumberOfKeys = function(dim) {

                            if (!dim) {

                                return 1;
                            }

                            var nest = d3.nest()
                                .key(function(d) {
                                    return d[dim];
                                })
                                .entries(scope.data);

                            var keyValue = nest.map(function(d) {
                                return d.key;
                            });

                            return keyValue.length;

                        };

                        var getKeys = function(dim) {

                            if (!dim) {

                                return [''];
                            }


                            return d3.map(scope.config.dimSetting[dim].keyValue).keys();
                        };


                        var isFirstSampleNumber = function(dim) {

                            return !isNaN(scope.data[0][dim]);

                        };

                        scope.renderDataChange = function(data, config) {

                            if (!data) {
                                return;
                            }

                            renderData = data;


                            reloadDataToSVG();

                            identifyAndUpdateDimDataType();

                            scope.handleConfigChange(data, config);

                        }; //End Data change renderer



                        // define render function
                        scope.handleConfigChange = function(data, config) {

                            if (!data) {
                                return;
                            }

                            renderConfigChange(data, config);

                        };

                        var updateSizeSVG = function(config) {
                            // XPadding = 60;
                            // YPadding = 30;
                            //Update size of SVG

                            if (scope.config.matrixMode === false) {
                                outerWidth = d3.select(iElement[0]).node().offsetWidth;
                            } else {
                                outerWidth = d3.select(".matrixGroup").node().offsetWidth;

                                outerWidth = outerWidth / (scope.config.dims.length) - 10;

                            }
                            // calculate the height
                            outerHeight = outerWidth / config.SVGAspectRatio;

                            svg.attr('height', outerHeight)
                                .attr('width', outerWidth);

                            width = outerWidth - 2 * margin;
                            height = outerHeight - 2 * margin;

                        };

                        var renderConfigChange = function(data, config) {


                            updateSizeSVG(config);

                            //Call separate render for the rendering

                            handleLensConfig(config);

                            drawPlot();

                        };

                        var handleLensConfig = function(config) {

                            var drag = d3.behavior.drag()
                                        .on("drag",dragmove);

                            var initialLensSize = 100;

                            function dragmove() {

                                var xPos, yPos;

                                d3.select(this)
                                    .attr("x", xPos = Math.max(initialLensSize, Math.min(width-initialLensSize, d3.event.x)))
                                    .attr("y", yPos = Math.max(initialLensSize, Math.min(height-initialLensSize, d3.event.y)));

                                labelDiv.text(xPos);
                                    
                            }

                            if (config.lens === "noLens") {

                                nodeGroup.selectAll(".lens").remove();


                            } else if (config.lens === "rectLens") {

                                nodeGroup.selectAll(".lens").remove();

                                nodeGroup.append("rect")
                                    .attr("class", "lens")
                                    .attr("x", width/2)
                                    .attr("y", height/2)
                                    .attr("width", initialLensSize)
                                    .attr("height", initialLensSize)
                                    .call(drag);


                            } else if (config.lens === "pieLens") {

                                nodeGroup.selectAll(".lens").remove();

                                nodeGroup.append("circle")
                                    .attr("class", "lens")
                                    .attr("cx", width/2)
                                    .attr("cy", height/2)
                                    .attr("r", initialLensSize/2)
                                    .call(drag);


                            }


                        };

                        var drawPlot = function() {

                            drawNodes();

                            drawAxesAndLegends();

                        };

                        var drawAxesAndLegends = function() {

                            if (scope.config.matrixMode === false) {

                                drawAxes();

                                drawLegends();

                            } else {

                                // drawAxes();

                                drawBoundaryForMatrix();
                            }
                        }


                        var drawBoundaryForMatrix = function() {

                            svgGroup.selectAll(".matrixFrame").remove();

                            svgGroup.append("rect")
                                .attr("class", "matrixFrame")
                                .attr("x", -margin)
                                .attr("y", -margin)
                                .attr("width", width + 2 * margin - 2)
                                .attr("height", height + 2 * margin - 2);


                        };



                        var drawNodesForSameOrdDimGather = function() {

                            prepareScaleForSameOrdDimGather();

                            calculateParametersOfNodesForSameOrdDimGather();

                            drawNodesInSVGForSameOrdDimGather();

                        };

                        var isSameOrdDimGather = function() {

                            if (scope.config.isGather === 'gather' &&
                                scope.xdim === scope.ydim &&
                                getDimType(scope.xdim) === 'ordinal') {

                                return true;

                            } else {

                                return false;
                            }
                        };

                        var drawNodes = function() {

                            if (isSameOrdDimGather()) {

                                drawNodesForSameOrdDimGather();

                            } else {

                                drawNodesForDifferentDim();
                            }


                        };

                        var drawNodesForDifferentDim = function() {

                            prepareScale();

                            calculateParametersOfNodes();

                            drawNodesInSVG();

                        }

                        var calculateParametersOfNodes = function() {

                            calculatePositionOfNodes();
                            calculateOffsetOfNodes();

                        };

                        var calculateParametersOfNodesForSameOrdDimGather = function() {

                            calculatePositionOfNodesForSameOrdDimGather();
                            calculateOffsetOfNodesForSameOrdDimGather();

                        };

                        var getKeyValue = function(dim) {

                            if (!dim) {
                                return [''];
                            }

                            return scope.config.dimSetting[dim].keyValue;
                        };

                        var getCalculatedPositions = function(dim) {

                            var keyValue = getKeyValue(dim);

                            var calculatedPosition = d3.map(keyValue)
                                .entries()
                                .map(function(d) {
                                    return +d.value.calculatedPosition;
                                });

                            if (isDimTypeNumerical(getDimType(dim))) {

                                calculatedPosition.sort(function(a, b) {
                                    return a - b;
                                });

                            }

                            return calculatedPosition;


                        };



                        var getSortedIDs = function(dim) {

                            var keyValue = getKeyValue(dim);

                            var calculatedPosition = d3.map(keyValue)
                                .entries()
                                .map(function(d) {
                                    return +d.value.sortedID;
                                });

                            return calculatedPosition;

                        };

                        //Returns Extents of dimension 
                        //              Scatter         Jitter      Gather
                        // ordinal      orig            orig        calculatedPoints
                        // semiordinal  SortedID        SortedID    calculatedPoints
                        // nominal      calculatedP     calculatedP calculatedPoints
                        var getExtent = function(dim) {

                            if (!dim) {

                                return [-0.5, 0.5];
                            }

                            if (scope.config.isGather === 'gather') {

                                if (scope.config.dimSetting[dim].dimType === 'ordinal') {

                                    return getExtentFromOriginalExtent(dim);

                                } else {

                                    return getExtentFromCalculatedPoints(dim);

                                }
                            } else if (scope.config.dimSetting[dim].dimType === 'ordinal') {

                                return getExtentFromOriginalExtent(dim);

                            } else if (scope.config.dimSetting[dim].dimType === 'semiOrdinal') {

                                return getExtentFromSortedID(dim);

                            } else {

                                return getExtentFromSortedID(dim);
                            }

                        };

                        var getDimType = function(dim) {

                            if (!dim) {
                                return 'nominal';
                            } else {

                                return scope.config.dimSetting[dim].dimType;
                            }
                        };

                        var getExtentFromSortedID = function(dim) {

                            var sortedID = getSortedIDs(dim);

                            var extent = d3.extent(sortedID);

                            return [extent[0] - marginForBorderOfAxis, extent[1] + marginForBorderOfAxis];

                        };


                        var getExtentFromCalculatedPoints = function(dim) {

                            calculatePositionOfCluster(dim);

                            var calculatedPoints = getCalculatedPositions(dim);

                            var max = calculatedPoints[calculatedPoints.length - 1];



                            var maxPadding = getLastIncrement(dim);

                            max = max + maxPadding;

                            return [0, max];




                        };

                        var getExtentFromCalculatedPointsForBinnedGather = function(dim) {

                            calculatePositionOfClusterForBinnedGather(dim);

                            var calculatedPoints = getCalculatedPositions(dim);

                            var max = calculatedPoints[calculatedPoints.length - 1];

                            return [0 - 0.5, max + 0.5];




                        };

                        var getLastIncrement = function(dim) {

                            if (!dim) {

                                return;
                            }

                            var keyValue = scope.config.dimSetting[dim].keyValue;
                            var increment;
                            var keyLength = d3.map(scope.config.dimSetting[dim].keyValue).values().length;

                            var key = getKeyFromIndex(dim, keyLength - 1);

                            if (keyValue[key].isMinimized === true) {

                                increment = marginClusterRatio;

                            } else {

                                increment = 0.5;

                            }

                            return increment;

                        };

                        var getExtentFromOriginalExtent = function(dim) {

                            var originalValues = scope.data.map(function(d) {
                                return +d[dim];
                            });

                            var extent = d3.extent(originalValues);

                            return [extent[0] - marginForBorderOfAxis, extent[1] + marginForBorderOfAxis];
                        };

                        var getExtentConsideringXY = function(xdim, ydim) {

                            var range = {};

                            var typeOfXYDim = findTypeOfXYDim();

                            var xRange, yRange;

                            if (typeOfXYDim === 'OrdOrd' && scope.config.isGather === 'gather') {

                                doBinningAndSetKeys(xdim, scope.config.binSize);
                                doBinningAndSetKeys(ydim, scope.config.binSize);

                                xRange = getExtentFromCalculatedPoints(xdim);
                                yRange = getExtentFromCalculatedPoints(ydim);


                            } else {

                                xRange = getExtent(xdim);
                                yRange = getExtent(ydim);

                            }
                            range.xRange = xRange;
                            range.yRange = yRange;

                            return range;

                        };

                        var prepareScale = function() {

                            var range = getExtentConsideringXY(scope.xdim, scope.ydim);

                            var xRange = range.xRange;
                            var yRange = range.yRange;



                            xScale = d3.scale.linear().range([0, width]);
                            xScale.domain(xRange);

                            xMap = function(d) {
                                return xScale(xValue(d));
                            };

                            yScale = d3.scale.linear().range([height, 0]);
                            yScale.domain(yRange);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        var restoreXYScaleForSameOrdDimGather = function() {

                            var xRange = getExtent(scope.xdim);
                            var yRange = getExtent(scope.ydim);

                            xScale = d3.scale.linear().range([0, width]);
                            xScale.domain(xRange);

                            xMap = function(d) {
                                return xScale(xValue(d));
                            };

                            yScale = d3.scale.linear().range([height, 0]);
                            yScale.domain(yRange);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        var prepareScaleForSameOrdDimGather = function() {

                            var longAxisLength, shortAxisLength;

                            if (height < width) {

                                longAxisLength = width;
                                shortAxisLength = height;
                            } else {

                                longAxisLength = height;
                                shortAxisLength = width;
                            }

                            var virtualAxisLength = Math.sqrt(Math.pow(longAxisLength, 2) + Math.pow(shortAxisLength, 2));



                            var xRange = [0, 1];
                            var yRange = getExtent(scope.ydim);

                            xScale = d3.scale.linear().range([0, shortAxisLength]);
                            xScale.domain(xRange);

                            xMap = function(d) {
                                return xScale(xValue(d));
                            };

                            yScale = d3.scale.linear().range([height, height - virtualAxisLength]);
                            yScale.domain(yRange);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        xOriginalValue = function(d) {

                            return d[scope.xdim];

                        };


                        yOriginalValue = function(d) {

                            return d[scope.ydim];
                        };



                        var dimOriginalValueConsideringBinning = function(dim) {

                            if (!dim) {

                                return function(d) {
                                    return '';
                                };
                            }

                            if (scope.config.dimSetting[dim].isBinned) {

                                return function(d) {

                                    return +scope.config.dimSetting[dim].binnedData[d.id];
                                };


                            } else {
                                return function(d) {

                                    return d[dim];
                                };
                            }
                        };



                        var colorOriginalValue = function(d) {

                            return d[scope.config.colorDim];
                        };



                        var calculatePositionOfNodes = function() {
                            //debugger;

                            if (scope.config.isGather === 'gather') {

                                calculatePositionOfNodesForGather();

                            }

                            xValue = getPositionValueFunc(scope.xdim);
                            yValue = getPositionValueFunc(scope.ydim);


                        };

                        var calculatePositionOfNodesForSameOrdDimGather = function() {
                            //debugger;

                            var clusterSize = getClusterBox();
                            var range, height;


                            range = yScale.range();
                            height = range[0] - range[1];
                            getOptimalBinSize(scope.ydim, '', clusterSize.widthOfBox, height);

                            updateYScaleForSameOrdDimGather();
                            // calculatePositionOfCluster(scope.xdim);

                            xValue = getPositionValueFunc('');
                            yValue = getPositionValueFunc(scope.ydim);


                        };

                        var calculatePositionOfNodesForGather = function() {

                            var typeOfXYDim = findTypeOfXYDim();

                            if (typeOfXYDim === 'NomNom') {

                                calculatePositionOfNodesForNomNomGather();

                            } else if (typeOfXYDim === 'OrdOrd') {

                                calculatePositionOfNodesForOrdOrdGather();

                            } else {
                                //Only one of them are ordinal -> binned gatherplot 

                                calculatePositionOfNodesForBinnedGather();

                            }
                        };

                        var calculatePositionOfNodesForOrdOrdGather = function() {

                            var typeOfXYDim = findTypeOfXYDim();
                            var clusterSize = getClusterBox();
                            var range, height;

                            range = xScale.range();

                            calculatePositionOfCluster(scope.xdim);
                            calculatePositionOfCluster(scope.ydim);

                        };

                        var calculatePositionOfNodesForBinnedGather = function() {

                            var typeOfXYDim = findTypeOfXYDim();
                            var clusterSize = getClusterBox();
                            var range, height;

                            if (typeOfXYDim === 'XNomYOrd') {
                                range = yScale.range();
                                height = range[0] - range[1];
                                getOptimalBinSize(scope.ydim, scope.xdim, clusterSize.widthOfBox, height);

                                updateYScale();
                                calculatePositionOfCluster(scope.xdim);
                            } else if (typeOfXYDim === 'XOrdYNom') {
                                range = xScale.range();
                                height = range[1] - range[0];
                                getOptimalBinSize(scope.xdim, scope.ydim, clusterSize.heightOfBox, height);

                                updateXScale();
                                calculatePositionOfCluster(scope.ydim);
                            } else {


                                calculatePositionOfCluster(scope.xdim);

                                calculatePositionOfCluster(scope.ydim);


                            }

                        };



                        var updateYScale = function() {

                            var yRange = getExtentFromCalculatedPointsForBinnedGather(scope.ydim);

                            yScale = d3.scale.linear().range([height, 0]);
                            yScale.domain(yRange);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        var updateYScaleForSameOrdDimGather = function() {

                            var yRange = getExtentFromCalculatedPointsForBinnedGather(scope.ydim);

                            yScale.domain(yRange);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        var updateXScale = function() {

                            var xRange = getExtentFromCalculatedPointsForBinnedGather(scope.xdim);

                            xScale = d3.scale.linear().range([0, width]);
                            xScale.domain(xRange);
                            xMap = function(d) {
                                return xScale(xValue(d));
                            };

                        };

                        var getOptimalBinSize = function(ordDim, nomDim, norDimLength, ordDimLength) {

                            var numBin = Math.floor(ordDimLength / maxDotSize);

                            var dotSize = maxDotSize;

                            var maxCrowdedBinCount = getMaxCrowdedBinCount(ordDim, nomDim, numBin);

                            while (maxCrowdedBinCount * dotSize > norDimLength) {

                                numBin = numBin + 1;

                                maxCrowdedBinCount = getMaxCrowdedBinCount(ordDim, nomDim, numBin);

                                dotSize = ordDimLength / numBin;
                            }

                            doBinningAndSetKeys(ordDim, numBin);

                        };

                        var getMaxCrowdedBinCount = function(ordDim, nomDim, binCount) {

                            var values = scope.data.map(function(d) {
                                return +d[ordDim];
                            });

                            var ordinalScaleForGather = d3.scale.linear().domain(d3.extent(values));


                            var nestedData = d3.nest()
                                .key(function(d) {
                                    return d[nomDim];
                                })
                                .entries(scope.data);

                            var maxValues = nestedData.map(function(d) {

                                var values = d.values.map(function(d) {
                                    return +d[ordDim];
                                });

                                var data = d3.layout.histogram()
                                    .bins(ordinalScaleForGather.ticks(binCount))
                                    (values);

                                return d3.max(data, function(d) {
                                    return +d.y;
                                });
                            });

                            return d3.max(maxValues);




                            // var data = d3.layout.histogram()
                            //     .bins(binCount)
                            //     (values);

                            // var maxCount = d3.max(data, function(d) {
                            //     return +d.y;
                            // });

                            // return maxCount;
                        }

                        var findTypeOfXYDim = function() {

                            var xDimType = getDimType(scope.xdim);
                            var yDimType = getDimType(scope.ydim);

                            if (xDimType === 'ordinal' && yDimType === 'ordinal') {

                                if (scope.xdim === scope.ydim) {
                                    return 'SameOrd';
                                } else {
                                    return 'OrdOrd';
                                }
                            } else if (xDimType !== 'ordinal' && yDimType !== 'ordinal') {
                                return 'NomNom';
                            } else if (xDimType === 'ordinal' && yDimType !== 'ordinal') {
                                return 'XOrdYNom';
                            } else if (xDimType !== 'ordinal' && yDimType === 'ordinal') {
                                return 'XNomYOrd';
                            }

                        };

                        var calculatePositionOfNodesForNomNomGather = function() {

                            calculatePositionOfCluster(scope.xdim);
                            calculatePositionOfCluster(scope.ydim);

                        }

                        var calculatePositionOfCluster = function(dim) {

                            if (!dim) {

                                return;
                            }

                            var keyValue = scope.config.dimSetting[dim].keyValue;
                            var increment;
                            var previousIncrement;



                            d3.map(keyValue).entries().forEach(function(d, i, all) {


                                if (i === 0) {
                                    if (d.value.isMinimized === true) {

                                        d.value.calculatedPosition = marginClusterRatio;

                                    } else {

                                        d.value.calculatedPosition = 0.5;

                                    }

                                    d.value.calculatedPosition = d.value.calculatedPosition;

                                    return;
                                }

                                if (all[i - 1].value.isMinimized === true) {

                                    previousIncrement = marginClusterRatio;

                                } else {

                                    previousIncrement = 0.5;

                                }


                                if (d.value.isMinimized === true) {

                                    increment = marginClusterRatio;

                                } else {

                                    increment = 0.5;

                                }

                                d.value.calculatedPosition = all[i - 1].value.calculatedPosition + increment + previousIncrement;

                            });

                        };

                        var calculatePositionOfClusterForBinnedGather = function(dim) {


                            var keyValue = scope.config.dimSetting[dim].keyValue;

                            var keys = Object.keys(keyValue);

                            keys.sort(function(a, b) {
                                return a - b;
                            });

                            for (var i = 0; i < keys.length; i++) {

                                keyValue[keys[i]].value = {};

                                keyValue[keys[i]].value.calculatedPosition = i + 0.5;
                            }

                        };


                        var getPositionValueFunc = function(dimName) {

                            if (!dimName) {

                                return function(d) {
                                    return 0;
                                };
                            }

                            var dimType = scope.config.dimSetting[dimName].dimType;
                            var dimNameClosure = dimName;

                            // Follow the dimValue branch logic
                            //                  Scatter         Jitter       Gather
                            // nominal           sortedID      sortedID       calculatedID
                            // SemiOrdi         sortedID       sortedID       calculatedID
                            // ordinal           orig          orig           calculatedIDFromBin

                            var calculatedPositionValueFunc = function(d) {
                                return scope.config.dimSetting[dimNameClosure].keyValue[d[dimNameClosure]].calculatedPosition;
                            };

                            var origValueFunc = function(d) {

                                return +d[dimNameClosure];
                            };

                            var calculatedPositionWithBinValueFunc = function(d) {
                                var binKey = +scope.config.dimSetting[dimNameClosure].binnedData[d.id];
                                if (!scope.config.dimSetting[dimNameClosure].keyValue[binKey]) {

                                    console.log(binKey);
                                }

                                var positionWithBinKey = scope.config.dimSetting[dimNameClosure].keyValue[binKey].calculatedPosition;

                                return +positionWithBinKey;
                            };

                            var sortedPositionValueFunc = function(d) {
                                return scope.config.dimSetting[dimNameClosure].keyValue[d[dimNameClosure]].sortedID;
                            };

                            if (dimType === 'nominal') {

                                if (scope.config.isGather === 'gather') {

                                    return calculatedPositionValueFunc;
                                } else {

                                    return sortedPositionValueFunc;
                                }

                            } else if (dimType === 'semiOrdinal') {

                                if (scope.config.isGather === 'gather') {

                                    return calculatedPositionValueFunc;

                                } else {

                                    return sortedPositionValueFunc;
                                }

                            } else if (dimType === 'ordinal') {


                                if (scope.config.isGather === 'gather') {
                                    return calculatedPositionWithBinValueFunc;

                                } else {
                                    return origValueFunc;
                                }

                            } else {

                                console.log("Unsupported DimName in getDimValueFunc");
                            }

                        };



                        var calculateOffsetOfNodes = function() {

                            if (scope.config.isGather === 'scatter') {

                                setOffsetOfNodesForScatter();

                            } else if (scope.config.isGather === 'jitter') {

                                setOffsetOfNodesForJitter();

                            } else if (scope.config.isGather === 'gather') {


                                setOffsetOfNodesForGather();

                            }

                        };

                        var calculateOffsetOfNodesForSameOrdDimGather = function() {


                            setOffsetOfNodesForGatherForSameOrdDimGather();


                        };

                        var setOffsetOfNodesForScatter = function() {

                            scope.data.forEach(function(d) {

                                d.XOffset = 0;
                                d.YOffset = 0;

                            });

                            assignSizeOfNodesForScatterAndJitter();

                        };

                        var assignSizeOfNodesForScatterAndJitter = function() {



                            scope.data.forEach(function(d) {

                                d.nodeWidth = maxDotSize;
                                d.nodeHeight = maxDotSize;

                            });
                        };

                        var setOffsetOfNodesForJitter = function() {


                            var SDforJitter = getSDforJitter();

                            var xNormalGenerator = d3.random.normal(0, SDforJitter.xSD);
                            var yNormalGenerator = d3.random.normal(0, SDforJitter.ySD);

                            scope.data.forEach(function(d) {


                                d.XOffset = xNormalGenerator();
                                d.YOffset = yNormalGenerator();

                            });

                            assignSizeOfNodesForScatterAndJitter();

                        };

                        var setOffsetOfNodesForGather = function() {

                            makeNestedData();

                            assignClusterIDOfNodes();
                            updateClusterSizeInNestedData();
                            getNodesSizeAndOffsetPosition();
                            // assignOffsetForGather();

                        };

                        var setOffsetOfNodesForGatherForSameOrdDimGather = function() {

                            makeNestedDataForSameOrdDimGather();

                            assignClusterIDOfNodes();
                            updateClusterSizeInNestedData();
                            getNodesSizeAndOffsetPosition();
                            // assignOffsetForGather();

                        };

                        var makeNestedData = function() {


                            // debugger;

                            var xOriginalValueWithBinning = dimOriginalValueConsideringBinning(scope.xdim);

                            var yOriginalValueWithBinning = dimOriginalValueConsideringBinning(scope.ydim);

                            nest = d3.nest()
                                .key(xOriginalValueWithBinning)
                                .key(yOriginalValueWithBinning)
                                .sortValues(sortFuncByColorDimension())
                                .entries(scope.data);


                        };

                        var makeNestedDataForSameOrdDimGather = function() {


                            // debugger;

                            var xOriginalValueWithBinning = dimOriginalValueConsideringBinning('');

                            var yOriginalValueWithBinning = dimOriginalValueConsideringBinning(scope.ydim);

                            nest = d3.nest()
                                .key(xOriginalValueWithBinning)
                                .key(yOriginalValueWithBinning)
                                .sortValues(sortFuncByColorDimension())
                                .entries(scope.data);


                        };

                        var assignClusterIDOfNodes = function() {

                            nest.forEach(function(d, i, j) {

                                d.values.forEach(function(d, i, j) {

                                    d.values.forEach(function(d, i, j) {

                                        d.clusterID = i;

                                    });

                                });

                            });


                        };

                        var updateClusterSizeInNestedData = function() {

                            nest.forEach(function(d, i, j) {

                                d.values.forEach(function(d, i, j) {

                                    d.numOfElement = d.values.length;

                                });

                            });


                        };

                        var sortFuncByColorDimension = function() {

                            var colorDim = scope.config.colorDim;

                            if (!colorDim) {
                                return function(a, b) {
                                    return a;
                                };
                            } else {

                                // debugger;

                                if (isDimTypeNumerical(scope.config.dimSetting[colorDim].dimType)) {

                                    return numericalDimSortFunc(colorDim);

                                } else {

                                    return nominalDimSortFunc(colorDim);

                                }


                            }

                        };

                        var nominalDimSortFunc = function(dim) {

                            var dimSetting = scope.config.dimSetting[dim];

                            return function(a, b) {
                                var myDim = dim;
                                return dimSetting.keyValue[a[myDim]].sortedID - dimSetting.keyValue[b[myDim]].sortedID;
                            };

                        };

                        var numericalDimSortFunc = function(dim) {

                            return function(a, b) {
                                return a[dim] - b[dim];
                            };
                        };

                        var isDimTypeNumerical = function(dimType) {

                            if (dimType === 'nominal') {

                                return false;

                            } else if (dimType === 'ordinal' || dimType === 'semiOrdinal') {

                                return true;
                            } else {

                                alert("Unidentified dimension type");
                            }
                        };

                        var getClusterBox = function() {

                            var Xmargin, Ymargin;
                            var typeOfXYDim = findTypeOfXYDim();

                            if (typeOfXYDim === 'NomNom') {

                                Xmargin = marginClusterRatio;
                                Ymargin = marginClusterRatio;
                            } else if (typeOfXYDim === 'XNomYOrd') {

                                Xmargin = marginClusterRatio;
                                Ymargin = 0;
                            } else if (typeOfXYDim === 'XOrdYNom') {

                                Xmargin = 0;
                                Ymargin = marginClusterRatio;
                            } else if (typeOfXYDim === 'OrdOrd') {

                                Xmargin = marginClusterRatio;
                                Ymargin = marginClusterRatio;

                            } else {

                                Xmargin = 0;
                                Ymargin = 0;
                            }


                            return {
                                widthOfBox: xScale(1 - 2 * Xmargin) - xScale(0),
                                heightOfBox: yScale(0) - yScale(1 - 2 * Ymargin)
                            };

                        };


                        var getNodesSizeForAbsolute = function() {

                            var maxNumElementInCluster = getClusterWithMaximumPopulation();
                            var box = getClusterBox();
                            var size = calculateNodesSizeForAbsolute(box, maxNumElementInCluster);

                            return size;

                        };


                        var getNodesSizeAndOffsetPosition = function() {

                            nest.forEach(function(d, i, j) {

                                var xKey = d.key;

                                d.values.forEach(function(d, i, j) {

                                    var yKey = d.key;

                                    assignNodesOffsetByCluster(d.values, xKey, yKey);

                                });

                            });


                        };


                        var assignNodesOffsetByCluster = function(cluster, xKey, yKey) {

                            var box = getClusterBox();

                            if (box.widthOfBox > box.heightOfBox) {

                                assignNodesOffsetHorizontallyByCluster(cluster, box);

                            } else {

                                assignNodesOffsetVerticallyByCluster(cluster, box);
                            }

                            updateNodesOffsetForMinimized(cluster, xKey, yKey);
                            updateNodesSizeForMinimized(cluster, xKey, yKey);

                        };

                        var updateNodesSizeForMinimized = function(cluster, xKey, yKey) {

                            if (isMinimized(scope.xdim, xKey)) {

                                makeAbsoluteSize(cluster, 'nodeWidth');
                            }

                            if (isMinimized(scope.ydim, yKey)) {

                                makeAbsoluteSize(cluster, 'nodeHeight');
                            }

                        };

                        var updateNodesOffsetForMinimized = function(cluster, xKey, yKey) {

                            if (isMinimized(scope.xdim, xKey)) {

                                makeZeroOffset(cluster, 'XOffset');

                            }

                            if (isMinimized(scope.ydim, yKey)) {

                                makeZeroOffset(cluster, 'YOffset');
                            }



                        };

                        var isMinimized = function(dim, key) {

                            if (!dim) {

                                return false;
                            }

                            if (!key) {

                                return false;
                            }

                            return (scope.config.dimSetting[dim].keyValue[key].isMinimized);
                        };

                        var makeZeroOffset = function(cluster, offset) {

                            cluster.forEach(function(d) {

                                d[offset] = 0;

                            });
                        };
                        var makeAbsoluteSize = function(cluster, nodeSize) {

                            var absoulteSize = getNodesSizeForAbsolute();

                            cluster.forEach(function(d) {

                                d[nodeSize] = absoulteSize;

                            });
                        };




                        var assignNodesOffsetLongShortEdge = function(longEdge, shortEdge, cluster) {

                            var numElement = getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, cluster.length);
                            if (isThemeRiverCondition(longEdge, shortEdge, numElement)) {

                                numElement = getNumOfElementForThemeRiver(longEdge, shortEdge, cluster.length);
                            }
                            var nodeSize = getNodeSizeAbsoluteOrRelative(longEdge, shortEdge, numElement.numElementInLongEdge, numElement.numElementInShortEdge);
                            var offsetForCenterPosition = calculateOffsetForCenterPosition(nodeSize.lengthInLongEdge, nodeSize.lengthInShortEdge, numElement.numElementInLongEdge, numElement.numElementInShortEdge);


                            return {
                                numElement: numElement,
                                nodeSize: nodeSize,
                                offsetForCenterPosition: offsetForCenterPosition
                            };


                        };

                        var isThemeRiverCondition = function(longEdge, shortEdge, numElement) {

                            if (longEdge / shortEdge > 3) {

                                return true;
                            } else {

                                return false;
                            }
                        };

                        var getNumOfElementForThemeRiver = function(longEdge, shortEdge, numElement) {

                            var numElementInShortEdge = Math.ceil(shortEdge / getNodesSizeForAbsolute());
                            var numElementInLongEdge = Math.ceil(numElement / numElementInShortEdge);

                            return {
                                numElementInShortEdge: numElementInShortEdge,
                                numElementInLongEdge: numElementInLongEdge
                            };


                        };

                        var getNodeSizeAbsoluteOrRelative = function(longEdge, shortEdge, numElementInLongEdge, numElementInShortEdge) {

                            var lengthInLongEdge, lengthInShortEdge;

                            if (scope.config.relativeMode === "absolute") {

                                lengthInLongEdge = getNodesSizeForAbsolute();
                                lengthInShortEdge = lengthInLongEdge;

                            } else {
                                lengthInLongEdge = longEdge / numElementInLongEdge;
                                lengthInShortEdge = shortEdge / numElementInShortEdge;
                            }

                            return {
                                lengthInLongEdge: lengthInLongEdge,
                                lengthInShortEdge: lengthInShortEdge
                            };

                        };

                        var assignNodesOffsetHorizontallyByCluster = function(cluster, box) {

                            var offsetAndSizeInfo = assignNodesOffsetLongShortEdge(box.widthOfBox, box.heightOfBox, cluster);

                            var nodeHeight = offsetAndSizeInfo.nodeSize.lengthInShortEdge;
                            var nodeWidth = offsetAndSizeInfo.nodeSize.lengthInLongEdge;
                            var numElementInShortEdge = offsetAndSizeInfo.numElement.numElementInShortEdge;
                            var numElementInLongEdge = offsetAndSizeInfo.numElement.numElementInLongEdge;
                            var offsetInShortEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInShortEdge;
                            var offsetInLongEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInLongEdge;

                            cluster.forEach(function(d, i, j) {

                                d.nodeWidth = nodeWidth;
                                d.nodeHeight = nodeHeight;




                                d.YOffset = (d.clusterID % numElementInShortEdge) * nodeHeight - offsetInShortEdge + nodeHeight;
                                d.XOffset = Math.floor(d.clusterID / numElementInShortEdge) * nodeWidth - offsetInLongEdge;

                            });

                        };

                        var assignNodesOffsetVerticallyByCluster = function(cluster, box) {

                            var offsetAndSizeInfo = assignNodesOffsetLongShortEdge(box.heightOfBox, box.widthOfBox, cluster);

                            var nodeHeight = offsetAndSizeInfo.nodeSize.lengthInLongEdge;
                            var nodeWidth = offsetAndSizeInfo.nodeSize.lengthInShortEdge;
                            var numElementInShortEdge = offsetAndSizeInfo.numElement.numElementInShortEdge;
                            var numElementInLongEdge = offsetAndSizeInfo.numElement.numElementInLongEdge;
                            var offsetInShortEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInShortEdge;
                            var offsetInLongEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInLongEdge;

                            cluster.forEach(function(d, i, j) {

                                d.nodeHeight = nodeHeight;
                                d.nodeWidth = nodeWidth;

                                d.XOffset = (d.clusterID % numElementInShortEdge) * nodeWidth - offsetInShortEdge;
                                d.YOffset = Math.floor(d.clusterID / numElementInShortEdge) * nodeHeight - offsetInLongEdge + nodeHeight;

                            });

                        };

                        var calculateOffsetForCenterPosition = function(nodeLengthInLongEdge, nodeLengthInShortEdge, numElementInLongEdge, numElementInShortEdge) {

                            var offsetInShortEdgeForCenterPosition;
                            var offsetInLongEdgeForCenterPosition;

                            offsetInShortEdgeForCenterPosition = numElementInShortEdge * nodeLengthInShortEdge / 2;
                            offsetInLongEdgeForCenterPosition = numElementInLongEdge * nodeLengthInLongEdge / 2;

                            return {
                                offsetInShortEdge: offsetInShortEdgeForCenterPosition,
                                offsetInLongEdge: offsetInLongEdgeForCenterPosition
                            };
                        };

                        var getClusterWithMaximumPopulation = function() {

                            return d3.max(nest, function(d) {

                                return d3.max(d.values, function(d) {

                                    return d.numOfElement;
                                });
                            });

                        };

                        var calculateNodesSizeForAbsolute = function(box, maxNumber) {

                            if (box.widthOfBox > box.heightOfBox) {

                                return calculateNodesSizeWithLongAndShortEdges(box.widthOfBox, box.heightOfBox, maxNumber);

                            } else {

                                return calculateNodesSizeWithLongAndShortEdges(box.heightOfBox, box.widthOfBox, maxNumber);
                            }
                        };

                        var calculateNodesSizeWithLongAndShortEdges = function(longEdge, shortEdge, number) {


                            var numElement = getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, number);

                            return shortEdge / numElement.numElementInShortEdge;

                        };

                        var getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping = function(longEdge, shortEdge, number) {

                            var numElementInShortEdge = 0,
                                numElementInLongEdge,
                                sizeNode, lengthCandidate;



                            do {

                                numElementInShortEdge++;
                                sizeNode = shortEdge / numElementInShortEdge;
                                lengthCandidate = sizeNode * number / numElementInShortEdge;

                            } while (lengthCandidate > longEdge);

                            numElementInLongEdge = Math.ceil(number / numElementInShortEdge);

                            return {
                                numElementInShortEdge: numElementInShortEdge,
                                numElementInLongEdge: numElementInLongEdge
                            };


                        };



                        var getSDforJitter = function() {

                            var nominalBox = getClusterBox();
                            var probFactor = 0.15;

                            var xSD = nominalBox.widthOfBox * probFactor;
                            var ySD = nominalBox.heightOfBox * probFactor;

                            return {
                                xSD: xSD,
                                ySD: ySD
                            };

                        };



                        var drawNodesInSVG = function() {

                            getColorOfNodes();
                            getShapeOfNodes();
                            writeNodesInSVG();


                        };

                        var drawNodesInSVGForSameOrdDimGather = function() {

                            getColorOfNodes();
                            getShapeOfNodes();
                            writeNodesInSVGForSameOrdDimGather();


                        };

                        var getColorOfNodes = function() {

                            if (!scope.config.colorDim) {
                                color = colorNominal;
                                return;
                            }




                            if (scope.config.dimSetting[scope.config.colorDim].dimType === 'ordinal') {

                                var colorDomain = d3.extent(scope.data, function(d) {
                                    return +d[scope.config.colorDim];
                                });

                                colorScaleForHeatMap = d3.scale.linear()
                                    .range(["#98c8fd", "08306b"])
                                    .domain(colorDomain)
                                    .interpolate(d3.interpolateHsl);

                                color = colorScaleForHeatMap;
                            } else {

                                color = colorNominal;
                            }

                        };

                        var getShapeOfNodes = function() {

                        };

                        var writeNodesInSVG = function() {
                            // debugger;

                            nodeGroup.attr("transform", "translate(" + margin + "," + margin + ") rotate(0 80 660)");


                            nodeGroup.selectAll(".dot")
                                .data(scope.data, function(d) {
                                    return +d.id;
                                })
                                .style("fill", function(d) {
                                    return color(d[scope.config.colorDim]);
                                })
                                .transition()
                                .duration(1500)
                                .attr("x", xMap)
                                .attr("y", yMap)
                                .attr("width", function(d) {
                                    // console.log(initialSquareLenth);
                                    return +d.nodeWidth;
                                })
                                .attr("height", function(d) {
                                    return +d.nodeHeight;
                                })
                                .attr("rx", function(d) {
                                    return scope.round ? +5 : 0;
                                })
                                .attr("ry", function(d) {
                                    return scope.round ? +5 : 0;
                                })
                                .attr("transform", function(d, i) {

                                    // if (d.cancer== "Cancer") {
                                    //     console.log(height);
                                    // }
                                    return "translate(" + (d.XOffset) + "," + (-(d.YOffset)) + ") ";
                                });

                        };

                        var writeNodesInSVGForSameOrdDimGather = function() {
                            // debugger;



                            nodeGroup.selectAll(".dot")
                                .data(scope.data, function(d) {
                                    return +d.id;
                                })
                                .style("fill", function(d) {
                                    return color(d[scope.config.colorDim]);
                                })
                                .transition()
                                .duration(0)
                                .attr("x", xMap)
                                .attr("y", yMap)
                                .attr("width", function(d) {
                                    // console.log(initialSquareLenth);
                                    return +d.nodeWidth;
                                })
                                .attr("height", function(d) {
                                    return +d.nodeHeight;
                                })
                                .attr("rx", function(d) {
                                    return scope.round ? +5 : 0;
                                })
                                .attr("ry", function(d) {
                                    return scope.round ? +5 : 0;
                                })
                                .attr("transform", function(d, i) {

                                    // if (d.cancer== "Cancer") {
                                    //     console.log(height);
                                    // }
                                    return "translate(" + (d.XOffset) + "," + (-(d.YOffset)) + ") ";
                                });

                            var angleRad = Math.atan(height / width);

                            var angleDeg = 90 - angleRad * 180 / Math.PI;


                            nodeGroup.attr("transform", " translate(" + margin + "," + margin + ")  rotate(" + angleDeg + "," + "0" + "," + yScale.range()[0] + ")");

                        };

                        var labelGenerator = function(dimName) {

                            if (!dimName) {

                                return function(d) {
                                    return '';
                                };
                            } else if ((scope.config.dimSetting[dimName].dimType === 'ordinal')) {

                                return function(d, i) {

                                    return +d;
                                };
                            } else if ((scope.config.dimSetting[dimName].dimType === 'semiOrdinal')) {

                                return function(d, i) {

                                    return d3.map(scope.config.dimSetting[dimName].keyValue).keys()[i];
                                };
                            } else {

                                return function(d) {



                                    return getKeys(dimName)[d];

                                };
                            }


                        };

                        var labelGeneratorForGather = function(dimName) {

                            if (!dimName) {

                                return function(d) {
                                    return '';
                                };
                            } else if (scope.config.dimSetting[dimName].dimType === 'ordinal') {

                                var binDistanceFormatter = d3.format("3,.1f");

                                return function(d, i) {

                                    var binValue = d3.map(scope.config.dimSetting[dimName].keyValue).keys()[i];

                                    return binDistanceFormatter(+binValue) + '\u00B1' + binDistanceFormatter(+scope.config.dimSetting[dimName].halfOfBinDistance);
                                };
                            } else if (scope.config.dimSetting[dimName].dimType === 'semiOrdinal') {

                                return function(d, i) {

                                    return d3.map(scope.config.dimSetting[dimName].keyValue).keys()[i];
                                };
                            } else {

                                return function(d, i) {



                                    return getKeys(dimName)[i];

                                };
                            }


                        };

                        var labelGeneratorForOrdinalGather = function(dim) {

                            var keyValue = scope.config.dimSetting[dim].keyValue;

                            var keys = Object.keys(keyValue)
                                .sort(function(a, b) {
                                    return a - b;
                                });

                            var binDistanceFormatter = d3.format("3,.0f");


                            return function(d, i) {

                                return binDistanceFormatter(+keys[d]);

                            };


                        };

                        var tickGenerator = function(dimName) {

                            if (!dimName) {
                                return 0;
                            } else if (scope.config.dimSetting[dimName].dimType === 'ordinal') {

                                return 8;

                            } else {

                                return getKeys(dimName).length;
                            }
                        };

                        var tickValueGeneratorForGather = function(dimName) {

                            if (!dimName) {
                                return [];

                            }
                            return getCalculatedPositions(dimName);

                        };

                        var tickValueGeneratorForSameOrdGather = function(dimName) {

                            if (!dimName) {
                                return [];

                            }


                            var originalPositions = getCalculatedPositions(dimName);


                            var samplingRate = getSamplingRateForOrdinalGather(dimName);

                            var sampledPositions = originalPositions.filter(function(d, i) {
                                return (i % samplingRate === 0);
                            });



                            sampledPositions = sampledPositions.map(function(d) {
                                return d + Math.floor(samplingRate / 0.5);
                            })

                            sampledPositions.pop();

                            return sampledPositions;

                        };

                        var tickValueGeneratorForOrdinalGather = function(dimName) {

                            if (!dimName) {
                                return [];

                            }


                            var originalPositions = getCalculatedPositions(dimName);


                            var samplingRate = getSamplingRateForOrdinalGather(dimName);

                            var sampledPositions = originalPositions.filter(function(d, i) {
                                return (i % samplingRate === 0);
                            });



                            sampledPositions = sampledPositions.map(function(d) {
                                return d + Math.floor(samplingRate / 2);
                            })

                            sampledPositions.pop();

                            return sampledPositions;

                        };

                        var getSamplingRateForOrdinalGather = function(dimName) {

                            var originalPositions = getCalculatedPositions(dimName);

                            var dimLength = originalPositions.length;

                            return Math.floor(dimLength / 7);

                        }


                        var drawAxes = function() {

                            if (isSameOrdDimGather()) {

                                drawAxesForSameOrdDimGather();
                            } else {

                                drawAxesForDifferentDim();
                            }

                        };

                        var drawAxesForDifferentDim = function() {

                            drawAxesLinesAndTicks();
                            drawAxesLabel();

                        }

                        var drawAxesForSameOrdDimGather = function() {

                            restoreXYScaleForSameOrdDimGather();

                            drawAxesLinesAndTicksForSameOrdDimGather();
                            drawAxesLabel();
                            setStylesForAxesAndTicks();

                        };

                        var drawAxesLinesAndTicks = function() {

                            if (scope.config.isGather === 'gather') {

                                drawAxesLinesAndTicksForGather();

                            } else {

                                drawAxesLinesAndTicksForScatter();
                            }

                            setStylesForAxesAndTicks();


                        };

                        var setStylesForAxesAndTicks = function() {

                            svg.selectAll(".domain")
                                .style("stroke", "black")
                                .style("stroke-width", 1)
                                .style("fill", "none");

                            svg.selectAll(".bracket")
                                .style("stroke", "black")
                                .style("stroke-width", 1)
                                .style("fill", "none");


                        };

                        var drawAxesLinesAndTicksForScatter = function() {

                            svg.selectAll(".axis").remove();

                            drawXAxisLinesAndTicksForScatter();
                            drawYAxisLinesAndTicksForScatter();

                        };

                        var drawAxesLinesAndTicksForSameOrdDimGather = function() {

                            svg.selectAll(".axis").remove();

                            drawXAxisLinesAndTicksForSameOrdDimGather();
                            drawYAxisLinesAndTicksForSameOrdDimGather();
                        }

                        var drawXAxisLinesAndTicksForScatter = function() {

                            var xAxis = d3.svg.axis()
                                .scale(xScale)
                                .ticks(tickGenerator(scope.xdim))
                                .tickFormat(labelGenerator(scope.xdim))
                                .orient("bottom");


                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height) + ")")
                                .call(xAxis);

                            xAxisNodes.selectAll('text')
                                .style("font-size", 12);


                            svg.selectAll(".x .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "black");
                        };

                        var drawYAxisLinesAndTicksForScatter = function() {

                            var yAxis = d3.svg.axis()
                                .scale(yScale)
                                .ticks(tickGenerator(scope.ydim))
                                .tickFormat(labelGenerator(scope.ydim))
                                .orient("left");

                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            yAxisNodes.selectAll('text')
                                .style("font-size", 12);

                            svg.selectAll(".y .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "black");

                        };




                        var drawXAxisLinesAndTicksForOrdinalGather = function() {

                            var ticks = tickValueGeneratorForOrdinalGather(scope.xdim);

                            var xAxis = d3.svg.axis()
                                .scale(xScale)
                                .tickValues(ticks)
                                .tickFormat(labelGeneratorForOrdinalGather(scope.xdim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                                .orient("bottom");

                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height) + ")")
                                .call(xAxis);

                            xAxisNodes.selectAll('text')
                                .style("font-size", 12);

                            svg.selectAll(".x .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "black");

                        };

                        var drawYAxisLinesAndTicksForOrdinalGather = function() {

                            var ticks = tickValueGeneratorForOrdinalGather(scope.ydim);

                            var yAxis = d3.svg.axis()
                                .scale(yScale)
                                .tickValues(ticks)
                                .tickFormat(labelGeneratorForOrdinalGather(scope.ydim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                                .orient("left");

                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            yAxisNodes.selectAll('text')
                                .style("font-size", 12);

                            svg.selectAll(".y .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "black");

                        };

                        var drawXAxisLinesAndTicksForSameOrdDimGather = function() {

                            var ticks = tickValueGeneratorForOrdinalGather(scope.xdim);

                            var calculatedPositions = getCalculatedPositions(scope.xdim);

                            var domain = [calculatedPositions[0], calculatedPositions[calculatedPositions.length - 1]];


                            var xScaleForSameOrdDimGather = d3.scale.linear().domain(domain).range([0, width]);

                            var xAxis = d3.svg.axis()
                                .scale(xScaleForSameOrdDimGather)
                                .tickValues(ticks)
                                .tickFormat(labelGeneratorForOrdinalGather(scope.xdim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                                .orient("bottom");

                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height) + ")")
                                .call(xAxis);

                            xAxisNodes.selectAll('text')
                                .style("font-size", 12);

                            svg.selectAll(".x .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "black");

                        };

                        var drawYAxisLinesAndTicksForSameOrdDimGather = function() {


                            var ticks = tickValueGeneratorForOrdinalGather(scope.ydim);

                            var calculatedPositions = getCalculatedPositions(scope.xdim);

                            var domain = [calculatedPositions[0], calculatedPositions[calculatedPositions.length - 1]];


                            var yScaleForSameOrdDimGather = d3.scale.linear().domain(domain).range([height, 0])

                            var yAxis = d3.svg.axis()
                                .scale(yScaleForSameOrdDimGather)
                                .tickValues(ticks)
                                .tickFormat(labelGeneratorForOrdinalGather(scope.ydim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                                .orient("left");

                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            yAxisNodes.selectAll('text')
                                .style("font-size", 12);

                            svg.selectAll(".y .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "black");


                        };



                        //returns path string d for <path d="This string">
                        //a curly brace between x1,y1 and x2,y2, w pixels wide 
                        //and q factor, .5 is normal, higher q = more expressive bracket 
                        var makeCurlyBrace = function(x1, y1, x2, y2, w, q) {
                            //Calculate unit vector
                            var dx = x1 - x2;
                            var dy = y1 - y2;
                            var len = Math.sqrt(dx * dx + dy * dy);

                            if (len === 0) {
                                dx = 0;
                                dy = 0;
                            } else {
                                dx = dx / len;
                                dy = dy / len;
                            }
                            //Calculate Control Points of path,
                            var qx1 = x1 + q * w * dy;
                            var qy1 = y1 - q * w * dx;
                            var qx2 = (x1 - .25 * len * dx) + (1 - q) * w * dy;
                            var qy2 = (y1 - .25 * len * dy) - (1 - q) * w * dx;
                            var tx1 = (x1 - .5 * len * dx) + w * dy;
                            var ty1 = (y1 - .5 * len * dy) - w * dx;
                            var qx3 = x2 + q * w * dy;
                            var qy3 = y2 - q * w * dx;
                            var qx4 = (x1 - .75 * len * dx) + (1 - q) * w * dy;
                            var qy4 = (y1 - .75 * len * dy) - (1 - q) * w * dx;

                            return ("M " + x1 + " " + y1 +
                                " Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 +
                                " T " + tx1 + " " + ty1 +
                                " M " + x2 + " " + y2 +
                                " Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 +
                                " T " + tx1 + " " + ty1);
                        };

                        var drawAxesLinesAndTicksForGather = function() {

                            svg.selectAll(".axis").remove();

                            drawXAxisLinesAndTicksForGather();
                            drawYAxisLinesAndTicksForGather();

                        };

                        var drawXAxisLinesAndTicksForGather = function() {

                            if (getDimType(scope.xdim) !== 'ordinal' || findTypeOfXYDim() === 'OrdOrd') {

                                drawXAxisLinesAndTicksForNominalGather();
                            } else {

                                drawXAxisLinesAndTicksForOrdinalGather();
                            }

                        };

                        var drawYAxisLinesAndTicksForGather = function() {



                            if (getDimType(scope.ydim) !== 'ordinal' || findTypeOfXYDim() === 'OrdOrd') {

                                drawYAxisLinesAndTicksForNominalGather();
                            } else {

                                drawYAxisLinesAndTicksForOrdinalGather();
                            }


                        };

                        var drawXAxisLinesAndTicksForNominalGather = function() {

                            var xAxis = d3.svg.axis()
                                .scale(xScale)
                                .tickValues(tickValueGeneratorForGather(scope.xdim))
                                .tickFormat(labelGeneratorForGather(scope.xdim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                                .orient("bottom");

                            svg.selectAll(".axis").remove();

                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height) + ")")
                                .call(xAxis);

                            xAxisNodes.selectAll('text')
                                .style("font-size", 10);

                            d3.selectAll(".x .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "white");

                            var xAxisBracketGroup = xAxisNodes.selectAll(".tick")
                                .append("g")
                                .attr("x", xBracketGroup)
                                .attr("y", 0)
                                .attr("class", "x controlButtonBracketGroup")
                                .attr("width", widthBracketGroup)
                                .attr("height", 30)
                                .attr("rx", 5)
                                .attr("ry", 5);

                            if (scope.config.isInteractiveAxis) {



                                xAxisBracketGroup
                                    .on("mouseover", function(d) {
                                        d3.select(this).selectAll("rect")
                                            .style("opacity", 0.7);
                                        d3.select(this).selectAll("text")
                                            .style("opacity", 0.7);
                                    })
                                    .on("mouseout", function(d) {


                                        d3.select(this).selectAll("rect")
                                            .transition()
                                            .duration(1500)
                                            .style("opacity", 0);

                                        d3.select(this).selectAll("text")
                                            .transition()
                                            .duration(1500)
                                            .style("opacity", 0);
                                    });



                                xAxisBracketGroup.append("text")
                                    .style("opacity", 0)
                                    .style("fill", "black")
                                    .attr("x", 0)
                                    .attr("y", 60 - 30)
                                    .attr("class", "x controlButtonBracket")
                                    .attr("width", widthBracketGroup)
                                    .attr("height", 10)
                                    .attr("dy", 10)
                                    .style("text-anchor", "middle")
                                    .text("Minimize");

                                xAxisBracketGroup.append("text")
                                    .style("opacity", 0)
                                    .style("fill", "black")
                                    .attr("x", 0)
                                    .attr("y", 60 - 14)
                                    .attr("class", "x controlButtonBracket")
                                    .attr("width", widthBracketGroup)
                                    .attr("height", 10)
                                    .attr("dy", 10)
                                    .style("text-anchor", "middle")
                                    .text("Maximize");


                                //     });

                                xAxisBracketGroup.append("rect")
                                    .style("opacity", 0)
                                    .style("fill", "gray")
                                    .attr("x", xBracketGroup)
                                    .attr("y", 60 - 32)
                                    .attr("class", "x controlButtonBracket")
                                    .attr("width", widthBracketGroup)
                                    .attr("height", 14)
                                    .attr("rx", 5)
                                    .attr("ry", 5)
                                    .on("mouseover", function(d) {
                                        d3.select(this).style("fill", 'lightsteelblue');
                                    })
                                    .on("mouseout", function(d) {


                                        d3.select(this).style("fill", 'lightgray')

                                    })
                                    .on("click", function(d, i) {

                                        toggleMinimizeCluster(scope.xdim, i);
                                    });

                                xAxisBracketGroup.append("rect")
                                    .style("opacity", 0)
                                    .style("fill", "gray")
                                    .attr("x", xBracketGroup)
                                    .attr("y", 60 - 16)
                                    .attr("class", "x controlButtonBracket")
                                    .attr("width", widthBracketGroup)
                                    .attr("height", 14)
                                    .attr("rx", 5)
                                    .attr("ry", 5)
                                    .on("mouseover", function(d) {
                                        d3.select(this).style("fill", 'green');
                                    })
                                    .on("mouseout", function(d) {


                                        d3.select(this).style("fill", 'lightgray')

                                    })
                                    .on("click", function(d, i) {
                                        console.log(d);
                                        // toggleMinimizeCluster(scope.xdim, i);
                                        toggleMaximizeCluster(scope.xdim, i)
                                    });



                            }




                            xAxisBracketGroup.append("path")
                                .attr("class", "x bracket")
                                .transition()
                                .duration(500)
                                .attr("d", pathXBracket);




                        };


                        var drawYAxisLinesAndTicksForNominalGather = function() {



                            var yAxis = d3.svg.axis()
                                .scale(yScale)
                                .tickValues(tickValueGeneratorForGather(scope.ydim))
                                .tickFormat(labelGeneratorForGather(scope.ydim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                                .orient("left");


                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);


                            yAxisNodes.selectAll('text')
                                .style("font-size", 10);

                            d3.selectAll(".y .tick line")
                                .style("stroke-width", 1)
                                .style("stroke", "white");


                            var yAxisBracketGroup = yAxisNodes.selectAll(".tick")
                                .append("g")
                                .attr("x", 0)
                                .attr("y", yBracketGroup)
                                .attr("class", "y controlButtonBracketGroup")
                                .attr("width", margin)
                                .attr("height", heightBracketGroup)
                                .attr("rx", 5)
                                .attr("ry", 5);



                            if (scope.config.isInteractiveAxis) {

                                yAxisBracketGroup
                                    .on("mouseover", function(d) {
                                        d3.select(this).selectAll("rect")
                                            .style("opacity", 0.9);
                                        d3.select(this).selectAll("text")
                                            .style("opacity", 0.9);
                                    })
                                    .on("mouseout", function(d) {


                                        d3.select(this).selectAll("rect")
                                            .transition()
                                            .duration(2000)
                                            .style("opacity", 0);

                                        d3.select(this).selectAll("text")
                                            .transition()
                                            .duration(2000)
                                            .style("opacity", 0);
                                    });



                                yAxisBracketGroup.append("text")
                                    .style("opacity", 0)
                                    .style("fill", "black")
                                    .attr("x", 20)
                                    .attr("y", 0)
                                    .attr("class", "y controlButtonBracket")
                                    .attr("width", 20)
                                    .attr("height", heightBracketGroup)
                                    .attr("dy", 10)
                                    .style("text-anchor", "left")
                                    .text("Minimize");

                                yAxisBracketGroup.append("text")
                                    .style("opacity", 0)
                                    .style("fill", "black")
                                    .attr("x", 110)
                                    .attr("y", 0)
                                    .attr("class", "y controlButtonBracket")
                                    .attr("width", 10)
                                    .attr("height", heightBracketGroup)
                                    .attr("dy", 10)
                                    .style("text-anchor", "left")
                                    .text("Maximize");


                                //     });

                                yAxisBracketGroup.append("rect")
                                    .style("opacity", 0)
                                    .style("fill", "gray")
                                    .attr("x", 10)
                                    .attr("y", -2)
                                    .attr("class", "y controlButtonBracket")
                                    .attr("width", margin)
                                    .attr("height", 14)
                                    .attr("rx", 5)
                                    .attr("ry", 5)
                                    .on("mouseover", function(d) {
                                        d3.select(this).style("fill", 'lightsteelblue');
                                    })
                                    .on("mouseout", function(d) {


                                        d3.select(this).style("fill", 'lightgray')

                                    })
                                    .on("click", function(d, i) {

                                        toggleMinimizeCluster(scope.ydim, i);
                                    });

                                yAxisBracketGroup.append("rect")
                                    .style("opacity", 0)
                                    .style("fill", "gray")
                                    .attr("x", 100)
                                    .attr("y", -2)
                                    .attr("class", "y controlButtonBracket")
                                    .attr("width", margin)
                                    .attr("height", 14)
                                    .attr("rx", 5)
                                    .attr("ry", 5)
                                    .on("mouseover", function(d) {
                                        d3.select(this).style("fill", 'green');
                                    })
                                    .on("mouseout", function(d) {


                                        d3.select(this).style("fill", 'lightgray')

                                    })
                                    .on("click", function(d, i) {
                                        console.log(d);
                                        // toggleMinimizeCluster(scope.xdim, i);
                                        toggleMaximizeCluster(scope.ydim, i)
                                    });

                            }

                            yAxisNodes.selectAll(".tick")
                                .append("path")
                                .attr("class", "y bracket")
                                .transition()
                                .duration(500)
                                .attr("d", pathYBracket);



                        };

                        var toggleMinimizeCluster = function(dim, i) {


                            var key = d3.map(scope.config.dimSetting[dim].keyValue).values()[i].keyValue;

                            var keyObject = scope.config.dimSetting[dim].keyValue[key];

                            keyObject.isMinimized = !keyObject.isMinimized;

                            drawPlot();

                        };

                        var toggleMaximizeCluster = function(dim, i) {


                            var key = d3.map(scope.config.dimSetting[dim].keyValue).values()[i].keyValue;

                            var keyObject = scope.config.dimSetting[dim].keyValue[key];

                            keyObject.isMaximized = !keyObject.isMaximized;

                            var keyValue = d3.map(scope.config.dimSetting[dim].keyValue).values();


                            if (keyObject.isMaximized === true) {


                                keyValue.forEach(function(d) {

                                    d.isMinimized = true;


                                });

                                keyObject.isMinimized = false;


                            } else {
                                keyValue.forEach(function(d) {

                                    d.isMinimized = false;


                                });

                            }

                            drawPlot();

                        };

                        var pathXBracket = function(d, i) {

                            var dim = scope.xdim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, xScale);

                            if (length === 0) {
                                return ("M 0 0 " +
                                    " L 0 " + 10);
                            } else {

                                return makeCurlyBrace(-length / 2, 2, length / 2, 2, 10, 0.6);
                            }
                        };

                        var pathYBracket = function(d, i) {

                            var dim = scope.ydim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, yScale);

                            if (length === 0) {
                                return ("M 0 0 " +
                                    " L -10 " + 0);
                            } else {

                                return makeCurlyBrace(-2, length / 2, -2, -length / 2, 10, 0.6);
                            }



                        };


                        var xBracket = function(d, i) {

                            var dim = scope.xdim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, xScale);

                            return length / 2 * (-1);

                        };

                        var xBracketGroup = function(d, i) {

                            var dim = scope.xdim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfClusterIncludingMargin(dim, key, xScale);

                            return length / 2 * (-1);

                        };

                        var widthBracket = function(d, i) {

                            var dim = scope.xdim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, xScale);

                            return length;

                        };

                        var widthBracketGroup = function(d, i) {

                            var dim = scope.xdim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfClusterIncludingMargin(dim, key, xScale);

                            return length;

                        };

                        var yBracket = function(d, i) {

                            var dim = scope.ydim;

                            var key = getKeyFromIndex(dim, i);

                            var length = -lengthOfCluster(dim, key, yScale);

                            return length / 2 * (-1);

                        };

                        var yBracketGroup = function(d, i) {

                            var dim = scope.ydim;

                            var key = getKeyFromIndex(dim, i);

                            var length = -lengthOfClusterIncludingMargin(dim, key, yScale);

                            return length / 2 * (-1);

                        };

                        var heightBracket = function(d, i) {

                            var dim = scope.ydim;

                            var key = getKeyFromIndex(dim, i);

                            var length = -lengthOfCluster(dim, key, yScale);

                            return length;

                        };

                        var heightBracketGroup = function(d, i) {

                            var dim = scope.ydim;

                            var key = getKeyFromIndex(dim, i);

                            var length = -lengthOfClusterIncludingMargin(dim, key, yScale);

                            return length;

                        };


                        var lengthOfCluster = function(dim, key, scale) {

                            var keyObject = scope.config.dimSetting[dim].keyValue[key];

                            if (keyObject.isMinimized) {

                                return 0;

                            } else {

                                return scale(1 - 2 * marginClusterRatio) - scale(0);
                            }



                        };

                        var lengthOfClusterIncludingMargin = function(dim, key, scale) {

                            var keyObject = scope.config.dimSetting[dim].keyValue[key];

                            if (keyObject.isMinimized) {

                                return scale(2 * marginClusterRatio) - scale(0);

                            } else {

                                return scale(1) - scale(0);
                            }



                        };



                        var getKeyFromIndex = function(dim, i) {

                            if (!scope.config.dimSetting[dim].keyValue) {

                                debugger;
                                console.log(dim);
                            }
                            if (!d3.map(scope.config.dimSetting[dim].keyValue).values()[i]) {

                                debugger;
                                console.log(dim);
                            }

                            return d3.map(scope.config.dimSetting[dim].keyValue).values()[i].keyValue;

                        };


                        var drawAxesLabel = function() {

                            xAxisNodes
                                .append("text")
                                .attr("class", "axislabel")
                                .attr("x", width / 2)
                                .attr("y", 56)
                                .style("text-anchor", "end")
                                .text(scope.xdim);

                            //Setup Y axis

                            yAxisNodes
                                .append("text")
                                .attr("class", "axislabel")
                                .attr("x", -margin + 10)
                                .attr("y", -margin / 2 + 10)
                                .attr("dy", ".71em")
                                .style("text-anchor", "right")
                                .text(scope.ydim);



                        };

                        var drawLegends = function() {

                            resetLegends();

                            if (!scope.config.colorDim) {

                                return;
                            }

                            var currentDimSetting = scope.config.dimSetting[scope.config.colorDim];

                            if (currentDimSetting.dimType === 'ordinal') {

                                drawHeatMapLegends();
                            } else {

                                drawNominalLegends();
                            }
                        };

                        var resetLegends = function() {

                            var legendGroup = svg.selectAll(".legend").remove();

                        };

                        var drawHeatMapLegends = function() {

                            var colorDomain = d3.extent(scope.data, function(d) {
                                return +d[scope.config.colorDim];
                            });

                            var widthHeatMap = 200;
                            var heightHeatMap = 18;


                            var xScaleForHeatMap = d3.scale.linear()
                                .domain(colorDomain)
                                .rangeRound([width - 100, width + 100]);

                            var values = d3.range(colorDomain[0], colorDomain[1], (colorDomain[1] - colorDomain[0]) / widthHeatMap);

                            var g = svg.append("g")
                                .attr("class", "legend");



                            var heatmap = g.selectAll("rect")
                                .data(values)
                                .enter().append("rect")
                                .attr("x", xScaleForHeatMap)
                                .attr("y", 20)
                                .attr("width", 1)
                                .attr("height", heightHeatMap)
                                .style("fill", colorScaleForHeatMap);

                            g.append("text")
                                .attr("x", width + 12)
                                .attr("y", 10)
                                .attr("dy", ".35em")
                                .style("text-anchor", "middle")
                                .text(scope.config.colorDim);

                            g.append("text")
                                .attr("x", xScaleForHeatMap(values[0]))
                                .attr("y", 50)
                                .attr("dy", ".35em")
                                .style("text-anchor", "middle")
                                .text(d3.round(colorDomain[0], 1));

                            g.append("text")
                                .attr("x", xScaleForHeatMap(values[values.length - 1]))
                                .attr("y", 50)
                                .attr("dy", ".35em")
                                .style("text-anchor", "middle")
                                .text(d3.round(colorDomain[1], 1));

                        };

                        var drawNominalLegends = function() {


                            var legendGroup = svg.selectAll(".legend")
                                .data(getKeys(scope.config.colorDim), function(d) {
                                    return d;
                                });

                            legendGroup.exit().remove();


                            var legend = legendGroup.enter().append("g")
                                .attr("class", "legend")
                                .attr("transform", function(d, i) {
                                    return "translate(0," + (i * 20 + 5) + ")";
                                });

                            legend.append("rect")
                                .attr("x", width - 18)
                                .attr("width", 18)
                                .attr("height", 18)
                                .style("fill", function(d) {
                                    return color(d);
                                });

                            legend.append("text")
                                .attr("x", width + 5)
                                .attr("y", 9)
                                .attr("dy", ".35em")
                                .style("text-anchor", "left")
                                .text(function(d) {
                                    return d;
                                });



                            var g = svg.append("g")
                                .attr("class", "legend");



                            g.append("text")
                                .attr("x", width - 24)
                                .attr("y", 10)
                                .attr("dy", ".35em")
                                .style("text-anchor", "end")
                                .text(scope.config.colorDim);




                        }; //End renderer

                    }

                }; //End return 

            } // End function (d3Service)

        );

    angular.module('myApp.directives')
        .directive('focusMe', function($timeout, $parse) {
            return {
                //scope: true,   // optionally create a child scope
                link: function(scope, element, attrs) {
                    var model = $parse(attrs.focusMe);
                    scope.$watch(model, function(value) {
                        console.log('value=', value);
                        if (value === true) {
                            $timeout(function() {
                                element[0].focus();
                            });
                        }
                    });
                    // to address @blesh's comment, set attribute value to 'false'
                    // on blur event:
                    element.bind('blur', function() {
                        console.log('blur');
                        scope.$apply(model.assign(scope, false));
                    });
                }
            };
        });

}());