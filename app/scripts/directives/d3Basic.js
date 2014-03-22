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
                    },

                    link: function(scope, iElement, iAttrs) {

                        //Constants and Setting Environment variables 

                        var margin = 80;
                        var width = 1040;
                        var height = 820;
                        var outerWidth = width + 2 * margin;
                        var outerHeight = height + 2 * margin;
                        var initialSquareLenth = 10;
                        var colorNominal = d3.scale.category10();
                        var color;
                        var colorScaleForHeatMap = d3.scale.linear()
                                .range(["#98c8fd", "08306b"])
                                .interpolate(d3.interpolateHsl);
                        var renderData;
                        var thresholdNominal = 7; //Threshold for automatic nominal identification
                        var defaultBinSize = 10;
                        var xValue, yValue; //Function for getting value of X,Y position 
                        var xScale, yScale;
                        var xMap, yMap;
                        var nest = {};
                        scope.config.binSize = defaultBinSize;

                        var globalMaxLength;

                        scope.config.dimSetting = {};

                        var svg, svgGroup, xAxisNodes, yAxisNodes;

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
                                .attr("class", "dot");


                            scope.config.dimOrder = {};
                            scope.config.dimType = {};


                        };

                        var identifyAndUpdateDimDataType = function() {

                            for (var i = 0; i < scope.config.dims.length; i++) {

                                scope.config.dimSetting[scope.config.dims[i]] = {};

                                scope.config.dimSetting[scope.config.dims[i]].dimType = identifyDimDataType(scope.config.dims[i]);
                                setDimSettingKeyEquivalentNumber(scope.config.dims[i]);
                                handleBinningForOrdinalVariablesForGatherplot(scope.config.dims[i]);
                            }

                        };

                        var setDimSettingKeyEquivalentNumber = function(dim) {

                            var currentDimSetting = scope.config.dimSetting[dim];

                            if (currentDimSetting.dimType === 'nominal') {
                                //For Nominal variable
                                currentDimSetting.keyEquivalentNumber = getNominalKeyEquivalentNumber(dim);
                            }
                        };

                        var handleBinningForOrdinalVariablesForGatherplot = function(dimName) {

                            if (scope.config.dimSetting[dimName].dimType === 'ordinal') {

                                doBinningForOrdinalDimension(dimName);
                            }
                        };

                        var doBinningForOrdinalDimension = function(dimName) {

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

                            return function(d) {

                                return decodingBinScale(Math.floor(encodingBinScale(d[dimName])) + 0.5);
                            };
                        };




                        var getNominalKeyEquivalentNumber = function(dim) {

                            var keys = getKeys(dim);

                            var keyNumberDict = {};

                            for (var i = 0; i < keys.length; i++) {

                                keyNumberDict[keys[i]] = i;

                            }

                            return keyNumberDict;

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

                            if (getNumKeys(dim) < thresholdNominal) {
                                return true;
                            } else {
                                return false;
                            }


                        };

                        var getNumKeys = function(dim) {

                            if (!dim) {

                                return 1;
                            }

                            var currentDimSetting = scope.config.dimSetting[dim];



                            if (isBinningRequired(currentDimSetting.dimType)) {

                                return scope.config.binSize;

                            } else {

                                return getKeys(dim).length;
                            }
                        };

                        var getKeys = function(dim) {

                            if (!dim) {

                                return [''];
                            }

                            var nest = d3.nest()
                                .key(function(d) {
                                    return d[dim];
                                })
                                .entries(scope.data);

                            return nest.map(function(d) {
                                return d.key;
                            });
                        };

                        var isFirstSampleNumber = function(dim) {

                            return !isNaN(getKeys(dim)[0]);

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

                            calculateParametersOfNodes();
                            prepareScale();
                            drawNodesInSVG();

                        };

                        var calculateParametersOfNodes = function() {

                            calculatePositionOfNodes();
                            calculateOffsetOfNodes();

                        };

                        var prepareScale = function() {
                            //debugger;
                            //var nominalBox = getNominalBox();

                            xScale = d3.scale.linear().range([0, width]);
                            xScale.domain([d3.min(scope.data, xValueConsideringBinning()) - 0.5, d3.max(scope.data, xValueConsideringBinning()) + 0.5]);
                            xMap = function(d) {
                                return xScale(xValue(d));
                            };

                            yScale = d3.scale.linear().range([height, 0]);
                            yScale.domain([d3.min(scope.data, yValueConsideringBinning()) - 0.5, d3.max(scope.data, yValueConsideringBinning()) + 0.5]);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        var xValueConsideringBinning = function() {

                            var dimName = scope.config.xDim;

                            if(!dimName) {

                                return xValue;
                            }

                            if (isBinningRequired(scope.config.dimSetting[dimName].dimType)) {

                                return function(d) {

                                    return +d[dimName];

                                };
                            } else {

                                return xValue;


                            }
                        };

                        var yValueConsideringBinning = function() {

                            var dimName = scope.config.yDim;

                            if(!dimName) {

                                return yValue;
                            }

                            if (isBinningRequired(scope.config.dimSetting[dimName].dimType)) {

                                return function(d) {

                                    return +d[dimName];

                                };
                            } else {

                                return yValue;


                            }
                        };



                        var calculatePositionOfNodes = function() {
                            //debugger;
                            xValue = getDimValueFunc(scope.config.xDim);
                            yValue = getDimValueFunc(scope.config.yDim);

                        };

                        var getDimValueFunc = function(dimName) {

                            if (!dimName) {

                                return function(d) {
                                    return 0;
                                };
                            }

                            var dimType = scope.config.dimSetting[dimName].dimType;
                            var dimNameClosure = dimName;

                            if (isDimTypeNumerical(dimType)) {

                                if (isBinningRequired(dimType)) {

                                    return function(d, i) {

                                        return +scope.config.dimSetting[dimNameClosure].binnedData[d.id];
                                    };

                                } else {

                                    return function(d) {
                                        return +d[dimNameClosure];
                                    };

                                }
                            } else {


                                return function(d) {
                                    return scope.config.dimSetting[dimNameClosure].keyEquivalentNumber[d[dimNameClosure]];
                                };
                            }

                        };

                        var isBinningRequired = function(dimType) {

                            if (dimType === 'ordinal' && scope.config.isGather === 'gather') {

                                return true;
                            } else {

                                return false;
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

                            nest = d3.nest()
                                .key(xValue)
                                .key(yValue)
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
                                return dimSetting.keyEquivalentNumber[a[myDim]] - dimSetting.keyEquivalentNumber[b[myDim]];
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

                            var box = getNominalBox();
                            var marginPercentage = 0.15;

                            return {
                                widthOfBox: box.widthOfBox * (1 - marginPercentage),
                                heightOfBox: box.heightOfBox * (1 - marginPercentage)
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

                                d.values.forEach(function(d, i, j) {

                                    assignNodesOffsetByCluster(d.values);

                                });

                            });


                        };

                        var assignNodesOffsetByCluster = function(cluster) {

                            var box = getClusterBox();

                            if (box.widthOfBox > box.heightOfBox) {

                                assignNodesOffsetHorizontallyByCluster(cluster, box);

                            } else {

                                assignNodesOffsetVerticallyByCluster(cluster, box);
                            }

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

                            if (numElement.numElementInLongEdge / numElement.numElementInShortEdge > 10) {

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

                        var getFillingDirection = function() {


                            var clusterBox = getClusterBox();

                            if (clusterBox.widthOfBox > clusterBox.heightOfBox) {

                                return 'horizontal';
                            } else {

                                return 'vertical';
                            }
                        };

                        var getSDforJitter = function() {

                            var nominalBox = getNominalBox();
                            var probFactor = 0.1;

                            var xSD = nominalBox.widthOfBox * probFactor;
                            var ySD = nominalBox.heightOfBox * probFactor;

                            return {
                                xSD: xSD,
                                ySD: ySD
                            };

                        };

                        var getNominalBox = function() {



                            return {
                                widthOfBox: width / (getNumKeys(scope.config.xDim)),
                                heightOfBox: height / (getNumKeys(scope.config.yDim))
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
                            } else if (isDimTypeNumerical(scope.config.dimSetting[dimName].dimType)) {

                                return function(d) {

                                    return d;
                                };
                            } else {

                                return function(d) {



                                    return getKeys(dimName)[d];

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

                        var drawAxes = function() {


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

                            xAxisNodes
                                .append("text")
                                .attr("class", "axislabel")
                                .attr("x", width / 2)
                                .attr("y", 56)
                                .style("text-anchor", "end")
                                .text(scope.config.xDim);

                            //Setup Y axis
                            yAxisNodes.selectAll('text')
                                .style("font-size", 12);
                            // .attr("y", -20)
                            // .attr("dx", function(d) {
                            //     return (String(d).length - 1) * 12 / 2;
                            // })
                            // .attr("transform", function(d) {
                            //     return "rotate(-90)translate(" + this.getBBox().width / 2 + "," +
                            //         this.getBBox().height / 2 + ")";
                            // });


                            yAxisNodes
                                .append("text")
                                .attr("class", "axislabel")
                                .attr("transform", "rotate(-90)")
                                .attr("x", -height / 2)
                                .attr("y", -50)
                                .attr("dy", ".71em")
                                .style("text-anchor", "end")
                                .text(scope.config.yDim);

                            svg.selectAll('.axis line, .axis path').style({
                                'stroke': 'Black',
                                'fill': 'none',
                                'stroke-width': '1px',
                                "shape-rendering": "crispEdges"
                            });


                        };

                        var drawLegends = function() {

                            resetLegends();

                            if (!scope.config.colorDim) {

                                return ;
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
                            var heightHeatMap = 20;


                            var xScaleForHeatMap = d3.scale.linear()
                                .domain(colorDomain)
                                .rangeRound([width-100, width+100]);

                            var values = d3.range(colorDomain[0], colorDomain[1], (colorDomain[1] - colorDomain[0]) / widthHeatMap);

                            var g = svg.append("g")
                                .attr("class", "legend")
                                .selectAll("rect")
                                .data(values)
                                .enter().append("rect")
                                .attr("x", xScaleForHeatMap)
                                .attr("y", 10)
                                .attr("width", 1)
                                .attr("height", heightHeatMap)
                                .style("fill", colorScaleForHeatMap);
                                
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
                                    return "translate(0," + i * 20 + ")";
                                });

                            legend.append("rect")
                                .attr("x", width - 18)
                                .attr("width", 18)
                                .attr("height", 18)
                                .style("fill", function(d) {
                                    return color(d);
                                });

                            legend.append("text")
                                .attr("x", width - 24)
                                .attr("y", 9)
                                .attr("dy", ".35em")
                                .style("text-anchor", "end")
                                .text(function(d) {
                                    return d;
                                });

                        }; //End renderer

                    }

                }; //End return 

            } // End function (d3Service)

    );

}());