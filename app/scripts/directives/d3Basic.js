(function() {
    'use strict';

    angular.module('myApp.directives')
        .directive('nomarect',
            function() {
                return {
                    restrict: 'EA',
                    scope: {
                        data: "=",
                        config: "=",
                        border: "=",
                        round: "=",
                        shapeRenderingMode: "=",
                        onClick: '&'
                    },

                    link: function(scope, iElement, iAttrs) {

                        //Constants and Setting Environment variables 

                        var margin = 80;
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
                        var defaultBinSize = 10;
                        var xValue, yValue; //Function for getting value of X,Y position 
                        var xOriginalValue, yOriginalValue;
                        var xScale, yScale;
                        var xMap, yMap;
                        var nest = {};
                        var marginForBorderOfAxis = 0.5; //Margin for Border Of Axis
                        scope.config.binSize = defaultBinSize;

                        var marginClusterRatio = 0.1; //Ratio of margin in the cluster length


                        scope.config.dimSetting = {};

                        var svg, svgGroup, xAxisNodes, yAxisNodes;
                        var tooltip;
                        var clusterControlBox;



                        var initializeSVG = function() {

                            svg = d3.select(iElement[0])
                                .append("svg:svg");

                            svgGroup = svg.append("g")
                                .attr("transform", "translate(" + margin + "," + margin + ")");

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

                            svgGroup.selectAll(".dot")
                                .data(scope.data)
                                .enter().append("rect")
                                .attr("class", "dot")
                                .on("mouseover", function(d) {
                                    tooltip.transition()
                                        .duration(200)
                                        .style("opacity", 0.9);


                                    tooltip.html(d.Name + "<br/>" + scope.config.xDim + ":" + xOriginalValue(d) + "<br/> " + scope.config.yDim + ":" + yOriginalValue(d) + "</br>" + scope.config.colorDim + ":" + colorOriginalValue(d))
                                        .style("left", (d3.event.pageX + 5) + "px")
                                        .style("top", (d3.event.pageY - 28) + "px");
                                })
                                .on("mouseout", function(d) {
                                    tooltip.transition()
                                        .duration(500)
                                        .style("opacity", 0);
                                });


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

                                doBinningAndSetKeys(dim);
                                currentDimSetting.isBinned = true;


                            } else {

                                setKeysFromOriginalData(dim);
                                currentDimSetting.isBinned = false;

                            }


                        };


                        var doBinningAndSetKeys = function(dimName) {

                            var currentDimSetting = scope.config.dimSetting[dimName];

                            currentDimSetting.binnedData = scope.data.map(binningFunc(dimName));

                        };

                        var binningFunc = function(dimName) {

                            var minValue = d3.min(scope.data, function(d) {
                                return +d[dimName];
                            });
                            var maxValue = d3.max(scope.data, function(d) {
                                return +d[dimName];
                            });

                            var encodingBinScale = d3.scale.linear()
                                .range([0, scope.config.binSize - 1])
                                .domain([minValue, maxValue]);

                            var decodingBinScale = d3.scale.linear()
                                .domain([0, scope.config.binSize - 1])
                                .range([minValue, maxValue]);

                            var binKeys = d3.range(0, scope.config.binSize, 1);

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

                            if (getRawNumberOfKeys(dim) < defaultBinSize) {
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
                            outerWidth = d3.select(iElement[0]).node().offsetWidth;
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

                            drawPlot();

                        };

                        var drawPlot = function() {

                            drawNodes();
                            drawAxes();
                            drawLegends();

                        };

                        var drawNodes = function() {
                            prepareScale();

                            calculateParametersOfNodes();

                            drawNodesInSVG();

                        };

                        var calculateParametersOfNodes = function() {

                            calculatePositionOfNodes();
                            calculateOffsetOfNodes();

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
                        // semiordinal  calculatedP     calculatedP calculatedPoints
                        // nominal      calculatedP     calculatedP calculatedPoints
                        var getExtent = function(dim) {

                            if (!dim) {

                                return [-0.5, 0.5];
                            }

                            if (scope.config.isGather === 'gather') {

                                return getExtentFromCalculatedPoints(dim);

                            } else if (scope.config.dimSetting[dim].dimType === 'ordinal') {

                                return getExtentFromOriginalExtent(dim);

                            } else if (scope.config.dimSetting[dim].dimType === 'semiOrdinal') {

                                return getExtentFromSortedID(dim);

                            } else {

                                return getExtentFromCalculatedPoints(dim);
                            }

                        };

                        var getDimType = function(dim) {

                            return scope.config.dimSetting[dim].dimType;
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

                        var prepareScale = function() {

                            var xRange = getExtent(scope.config.xDim);
                            var yRange = getExtent(scope.config.yDim);

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

                        xOriginalValue = function(d) {

                            return d[scope.config.xDim];

                        };


                        yOriginalValue = function(d) {

                            return d[scope.config.yDim];
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

                                calculatePositionOfCluster(scope.config.xDim);
                                calculatePositionOfCluster(scope.config.yDim);

                            }
                            xValue = getPositionValueFunc(scope.config.xDim);
                            yValue = getPositionValueFunc(scope.config.yDim);

                        };

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

                        var setOffsetOfNodesForScatter = function() {

                            scope.data.forEach(function(d) {

                                d.XOffset = 0;
                                d.YOffset = 0;

                            });

                            assignSizeOfNodesForScatterAndJitter();

                        };

                        var assignSizeOfNodesForScatterAndJitter = function() {

                            scope.data.forEach(function(d) {

                                d.nodeWidth = 5;
                                d.nodeHeight = 5;

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

                        var makeNestedData = function() {


                            // debugger;

                            var xOriginalValueWithBinning = dimOriginalValueConsideringBinning(scope.config.xDim);

                            var yOriginalValueWithBinning = dimOriginalValueConsideringBinning(scope.config.yDim);

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


                            return {
                                widthOfBox: xScale(1 - 2 * marginClusterRatio) - xScale(0),
                                heightOfBox: yScale(0) - yScale(1 - 2 * marginClusterRatio)
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

                            if (isMinimized(scope.config.xDim, xKey)) {

                                makeAbsoluteSize(cluster,'nodeWidth');
                            }

                            if (isMinimized(scope.config.yDim, yKey)) {

                                makeAbsoluteSize(cluster, 'nodeHeight');
                            }

                        };

                        var updateNodesOffsetForMinimized = function(cluster, xKey, yKey) {

                            if (isMinimized(scope.config.xDim, xKey)) {

                                makeZeroOffset(cluster, 'XOffset');

                            }

                            if (isMinimized(scope.config.yDim, yKey)) {

                                makeZeroOffset(cluster, 'YOffset');
                            }



                        };

                        var isMinimized = function(dim, key) {

                            if (!dim) {

                                return false;
                            }

                            return (scope.config.dimSetting[dim].keyValue[key].isMinimized);
                        };

                        var makeZeroOffset = function(cluster, offset) {

                            cluster.forEach(function(d) {

                                d[offset] = 0;

                            });
                        };
                        var makeAbsoluteSize = function(cluster , nodeSize) {

                            var absoulteSize = getNodesSizeForAbsolute();

                            cluster.forEach(function(d) {

                                d[nodeSize] = absoulteSize;
                                
                            });
                        };




                        var assignNodesOffsetLongShortEdge = function(longEdge, shortEdge, cluster) {

                            var numElement = getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, cluster.length);
                            if (isThemeRiverCondition(numElement)) {

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

                        var isThemeRiverCondition = function(numElement) {

                            if (numElement.numElementInLongEdge / numElement.numElementInShortEdge > 100) {

                                return true;
                            } else {

                                return false;
                            }
                        };

                        var getNumOfElementForThemeRiver = function(longEdge, shortEdge, numElement) {

                            var numElementInShortEdge = (shortEdge / getNodesSizeForAbsolute());
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



                            svgGroup.selectAll(".dot")
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
                                    return "translate(" + (d.XOffset) + "," + (-(d.YOffset)) + ")";
                                });

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

                                var binDistanceFormatter = d3.format("3,.0f");

                                return function(d, i) {

                                    var binValue = d3.map(scope.config.dimSetting[dimName].keyValue).keys()[i];

                                    return binDistanceFormatter(+binValue) + '±' + binDistanceFormatter(+scope.config.dimSetting[dimName].halfOfBinDistance);
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

                        var tickGenerator = function(dimName) {

                            if (!dimName) {
                                return 0;
                            } else if (isDimTypeNumerical(scope.config.dimSetting[dimName].dimType)) {

                                var numKeys = getKeys(dimName).length;

                                if (numKeys > 10) {

                                    return 10;
                                } else {

                                    return numKeys;
                                }

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


                        var drawAxes = function() {


                            drawAxesLinesAndTicks();
                            drawAxesLabel();

                        };

                        var drawAxesLinesAndTicks = function() {

                            if (scope.config.isGather === 'gather') {

                                drawAxesLinesAndTicksForGather();

                            } else {

                                drawAxesLinesAndTicksForScatter();
                            }


                        };

                        var drawAxesLinesAndTicksForScatter = function() {


                            var xAxis = d3.svg.axis()
                                .scale(xScale)
                                .ticks(tickGenerator(scope.config.xDim))
                                .tickFormat(labelGenerator(scope.config.xDim))
                                .orient("bottom");

                            var yAxis = d3.svg.axis()
                                .scale(yScale)
                                .ticks(tickGenerator(scope.config.yDim))
                                .tickFormat(labelGenerator(scope.config.yDim))
                                .orient("left");

                            svg.selectAll(".axis").remove();

                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height) + ")")
                                .call(xAxis);

                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            xAxisNodes.selectAll('text')
                                .style("font-size", 12);

                            yAxisNodes.selectAll('text')
                                .style("font-size", 12);

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


                            var xAxis = d3.svg.axis()
                                .scale(xScale)
                                .tickValues(tickValueGeneratorForGather(scope.config.xDim))
                                .tickFormat(labelGeneratorForGather(scope.config.xDim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                            .orient("bottom");

                            var yAxis = d3.svg.axis()
                                .scale(yScale)
                                .tickValues(tickValueGeneratorForGather(scope.config.yDim))
                                .tickFormat(labelGeneratorForGather(scope.config.yDim))
                                .tickSize(12, 0) //Provides 0 size ticks at center position for gather
                            .orient("left");

                            svg.selectAll(".axis").remove();

                            xAxisNodes = svgGroup.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height) + ")")
                                .call(xAxis);

                            yAxisNodes = svgGroup.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            xAxisNodes.selectAll('text')
                                .style("font-size", 10);

                            yAxisNodes.selectAll('text')
                                .style("font-size", 10);


                            var xAxisBracketGroup = xAxisNodes.selectAll(".tick")
                                .append("g")
                                .attr("class", "x bracketGroup")
                                .attr("x", xBracketGroup)
                                .attr("y", 0)
                                .attr("class", "x controlButtonBracketGroup")
                                .attr("width", widthBracketGroup)
                                .attr("height", 30)
                                .attr("rx", 5)
                                .attr("ry", 5)
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

                            var box = getClusterBox();

                             xAxisBracketGroup.append("text")
                                .style("opacity", 0)
                                .style("fill", "black")
                                .attr("x", 0)
                                .attr("y", -30)
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
                                .attr("y", -14)
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
                                .attr("y", -32)
                                .attr("class", "x controlButtonBracket")
                                .attr("width", widthBracketGroup)
                                .attr("height", 14)
                                .attr("rx", 5)
                                .attr("ry", 5)
                                .on("mouseover", function(d) {
                                    d3.select(this).style("fill", 'blue');
                                })
                                .on("mouseout", function(d) {


                                    d3.select(this).style("fill", 'gray')

                                })
                                .on("click", function(d, i) {

                                    toggleMinimizeCluster(scope.config.xDim, i);
                                });

                            xAxisBracketGroup.append("rect")
                                .style("opacity", 0)
                                .style("fill", "gray")
                                .attr("x", xBracketGroup)
                                .attr("y", -16)
                                .attr("class", "x controlButtonBracket")
                                .attr("width", widthBracketGroup)
                                .attr("height", 14)
                                .attr("rx", 5)
                                .attr("ry", 5)
                                .on("mouseover", function(d) {
                                    d3.select(this).style("fill", 'green');
                                })
                                .on("mouseout", function(d) {


                                    d3.select(this).style("fill", 'gray')

                                })
                                .on("click", function(d, i) {
                                    console.log(d);
                                    // toggleMinimizeCluster(scope.config.xDim, i);
                                    toggleMaximizeCluster(scope.config.xDim, i)
                                });



                            xAxisBracketGroup.append("path")
                                .attr("class", "x bracket")
                                .transition()
                                .duration(500)
                                .attr("d", pathXBracket);


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

                            var dim = scope.config.xDim;

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

                            var dim = scope.config.yDim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, yScale);



                            return makeCurlyBrace(-2, length / 2, -2, -length / 2, 10, 0.6);
                        };


                        var xBracket = function(d, i) {

                            var dim = scope.config.xDim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, xScale);

                            return length / 2 * (-1);

                        };

                        var xBracketGroup = function(d, i) {

                            var dim = scope.config.xDim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfClusterIncludingMargin(dim, key, xScale);

                            return length / 2 * (-1);

                        };

                        var widthBracket = function(d, i) {

                            var dim = scope.config.xDim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfCluster(dim, key, xScale);

                            return length;

                        };

                        var widthBracketGroup = function(d, i) {

                            var dim = scope.config.xDim;

                            var key = getKeyFromIndex(dim, i);

                            var length = lengthOfClusterIncludingMargin(dim, key, xScale);

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

                            return d3.map(scope.config.dimSetting[dim].keyValue).values()[i].keyValue;

                        };


                        var drawAxesLabel = function() {

                            xAxisNodes
                                .append("text")
                                .attr("class", "axislabel")
                                .attr("x", width / 2)
                                .attr("y", 56)
                                .style("text-anchor", "end")
                                .text(scope.config.xDim);

                            //Setup Y axis

                            yAxisNodes
                                .append("text")
                                .attr("class", "axislabel")
                                .attr("x", -margin + 10)
                                .attr("y", -margin / 2 + 10)
                                .attr("dy", ".71em")
                                .style("text-anchor", "right")
                                .text(scope.config.yDim);



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