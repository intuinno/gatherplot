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
                        var XPadding = 30;
                        var YPadding = 30;
                        var XMargin = 10;
                        var YMargin = 2;
                        var margin = 80;
                        var width = 1040;
                        var height = 820;
                        var outerWidth = width + 2 * margin;
                        var outerHeight = height + 2 * margin;
                        var initialSquareLenth = 10;
                        var color = d3.scale.category10();
                        var renderData;
                        var thresholdNominal = 100; //Threshold for automatic nominal identification
                        var defaultBinSize = 10;
                        var minWidth = 12;
                        var minHeight = 6;
                        var xValue, yValue; //Function for getting value of X,Y position 
                        var xScale, yScale;
                        var xMap, yMap;
                        var nest = {};

                        var globalMaxLength;

                        scope.config.YBinSize = defaultBinSize;
                        scope.config.XBinSize = defaultBinSize;

                        scope.config.dimSetting = {};

                        var svg, svgGroup, xAxisNodes, yAxisNodes;

                        var initializeSVG = function() {

                            svg = d3.select(iElement[0])
                                .append("svg:svg")
                                .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
                                .attr("preserveAspectRatio", "xMinYMin");

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

                        scope.$watch('border', function(newVals, oldVals) {
                            return scope.renderBorderChange(newVals);
                        }, true);

                        scope.$watch('round', function(newVals, oldVals) {
                            return scope.renderRoundChange(newVals);
                        }, true);

                        scope.$watch('shapeRenderingMode', function(newVals, oldVals) {
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
                            }

                        };

                        var setDimSettingKeyEquivalentNumber = function(dim) {

                            var currentDimSetting = scope.config.dimSetting[dim];

                            if (currentDimSetting.dimType === 'nominal') {
                                //For Nominal variable
                                currentDimSetting.keyEquivalentNumber = getNominalKeyEquivalentNumber(dim);
                            }
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

                            if (getNumberOfKeys(dim) > thresholdNominal) {
                                return true;
                            } else {
                                return false;
                            }


                        };

                        var getNumberOfKeys = function(dim) {

                            return getKeys().length;
                        };

                        var getKeys = function(dim) {

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
                            var widthSVG = d3.select(iElement[0]).node().offsetWidth;
                            // calculate the height
                            var heightSVG = d3.select(iElement[0]).node().offsetWidth / config.SVGAspectRatio;

                            outerHeight = outerWidth / config.SVGAspectRatio;

                            svg.attr('height', heightSVG)
                                .attr('width', widthSVG)
                                .attr("viewBox", "0 0 " + (outerWidth) + " " + (outerHeight));

                            // width = o - 2 * margin;
                            height = outerHeight - 2 * margin;

                        };

                        var renderConfigChange = function(data, config) {


                            updateSizeSVG(config);

                            //Call separate render for the rendering

                            drawPlot();

                        };

                        var drawPlot = function() {

                            drawNodes();
                            //   drawAxes();
                            //   drawLegends();

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
                            var nominalBox = getNominalBox();

                            xScale = d3.scale.linear().range([0, width]);
                            xScale.domain([d3.min(scope.data, xValue) - 1, d3.max(scope.data, xValue) + 1]);
                            xMap = function(d) {
                                return xScale(xValue(d));
                            };

                            yScale = d3.scale.linear().range([height, 0]);
                            yScale.domain([d3.min(scope.data, yValue) - 1, d3.max(scope.data, yValue) + 1]);
                            yMap = function(d) {
                                return yScale(yValue(d));
                            };

                        };

                        var calculatePositionOfNodes = function() {
                            //debugger;
                            xValue = getDimValueFunc(scope.config.xDim);
                            yValue = getDimValueFunc(scope.config.yDim);

                            xValue(scope.data[0]);

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

                                return function(d) {
                                    return +d.dimNameClosure;
                                };
                            } else {

                                return function(d) {
                                    return scope.config.dimSetting[dimNameClosure].keyEquivalentNumber[d[dimNameClosure]];
                                };
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
                            calculateRequiredParametersForGather();
                            // assignOffsetForGather();

                        };

                        var makeNestedData = function() {
                            // debugger;

                            nest = d3.nest()
                                .key(function(d) {
                                    return d[scope.config.xDim];
                                })
                                .key(function(d) {
                                    return d[scope.config.yDim];
                                })
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

                                // return scope.config.dimOrder[scope.config.colorDim].indexOf(a[scope.config.colorDim]) - scope.config.dimOrder[scope.config.colorDim].indexOf(b[scope.config.colorDim]);

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
                                return a;
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



                        var calculateRequiredParametersForGather = function() {

                            var box;
                            box = getClusterBox();
                            getNodesSizeAndOffsetPosition(box);

                        };

                        var getClusterBox = function() {

                            var box = getNominalBox();
                            var marginPercentage = 0.1;

                            return {
                                widthOfBox: box.widthOfBox * (1 - marginPercentage),
                                heightOfBox: box.heightOfBox * (1 - marginPercentage)
                            };

                        };

                        var getNodesSizeAndOffsetPosition = function(box) {

                            if (scope.config.relativeMode === "relative") {

                                getNodesSizeAndOffsetPositionForRelative(box);

                            } else {
                                getNodesSizeAndOffsetPositionForAbsolute(box);
                            }

                        };

                        var getNodesSizeAndOffsetPositionForAbsolute = function(box) {
                            var size;
                            size = getNodesSizeForAbsolute(box);
                            assignSizeOfNodes(size);
                            getNodesOffsetForAbsoulte(box, size);

                        };

                        var getNodesSizeForAbsolute = function(box) {

                            var maxNumberOfElementInCluster = getClusterWithMaximumPopulation();
                            var size = calculateNodesSizeForAbsolute(box, maxNumberOfElementInCluster);

                            return size;

                        };

                        var assignSizeOfNodes = function(size) {

                            nest.forEach(function(d, i, j) {

                                d.values.forEach(function(d, i, j) {

                                    d.values.forEach(function(d, i, j) {

                                        d.nodeWidth = size;
                                        d.nodeHeight = size;

                                    });

                                });

                            });

                        };

                        var getNodesOffsetForAbsoulte = function(box) {

                            nest.forEach(function(d, i, j) {

                                d.values.forEach(function(d, i, j) {

                                    assignNodesOffsetByCluster(d.values, box);

                                });

                            });


                        };

                        var assignNodesOffsetByCluster = function(cluster, box) {

                            if (box.widthOfBox > box.heightOfBox) {

                                assignNodesOffsetHorizontallyByCluster(cluster, box);
                            } else {

                                assignNodesOffsetVerticallyByCluster(cluster, box);
                            }

                        };

                        var assignNodesOffsetHorizontallyByCluster = function(cluster, box) {

                            var numberOfElementInShortEdge = getNumOfElementInShortEdgeUsingAspectRatioKeeping(box.widthOfBox, box.heightOfBox, cluster.length);
                            var nodeHeight = cluster[0].nodeHeight;
                            var nodeWidth = cluster[0].nodeWidth;
                            var offsetForCenterPosition = calculateOffsetForCenterPosition(numberOfElementInShortEdge, cluster.length, nodeHeight, nodeWidth);

                            cluster.forEach(function(d, i, j) {

                                d.YOffset = d.clusterID % numberOfElementInShortEdge * nodeWidth - offsetForCenterPosition.offsetInShortEdge;
                                d.XOffset = Math.floor(d.clusterID / numberOfElementInShortEdge) * nodeHeight - offsetForCenterPosition.offsetInLongEdge;

                            });


                        };

                        var calculateOffsetForCenterPosition = function(numberOfElementInShortEdge, numNodes, nodeLengthInShortEdge, nodeLengthInLongEdge) {

                            var offsetInShortEdgeForCenterPosition;
                            var offsetInLongEdgeForCenterPosition;
                            var numberOfElementInLongEdge = Math.ceil(numNodes/numberOfElementInShortEdge);

                            offsetInShortEdgeForCenterPosition = numberOfElementInShortEdge * nodeLengthInShortEdge/2;
                            offsetInLongEdgeForCenterPosition = numberOfElementInLongEdge * nodeLengthInLongEdge/2;

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


                            var numElementInShortEdge = getNumOfElementInShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, number);

                            return shortEdge / numElementInShortEdge;

                        };

                        var getNumOfElementInShortEdgeUsingAspectRatioKeeping = function(longEdge, shortEdge, number) {

                            var numElementInShortEdge = 0,
                                sizeNode, lengthCandidate;

                            do {

                                numElementInShortEdge++;
                                sizeNode = shortEdge / numElementInShortEdge;
                                lengthCandidate = sizeNode * number / numElementInShortEdge;

                            } while (lengthCandidate > longEdge);

                            return numElementInShortEdge;

                        };

                        var getNodesSizeAndOffsetPositionForRelative = function(box) {

                        };


                        // var assignOffsetForGather = function() {

                        //     if (getFillingDirection() === 'horizontal') {

                        //         stackNodesHorizontallyOffsetForGather();

                        //     } else if (getFillingDirection() === 'vertical') {

                        //         stackNodesVerticallyOffsetForGather();
                        //     }
                        // };

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
                                widthOfBox: width / (getKeys(scope.config.xDim).length + 2),
                                heightOfBox: height / (getKeys(scope.config.yDim).length + 2)
                            };

                        };

                        var drawNodesInSVG = function() {

                            getColorOfNodes();
                            getShapeOfNodes();
                            writeNodesInSVG();


                        };

                        var getColorOfNodes = function() {



                        };

                        var getShapeOfNodes = function() {

                        };

                        var writeNodesInSVG = function() {
                            // debugger;
                            svgGroup.selectAll(".dot")
                                .data(scope.data, function(d) {
                                    return +d.id;
                                })
                                .attr("transform", function(d, i) {

                                    // if (d.cancer== "Cancer") {
                                    //     console.log(height);
                                    // }
                                    return "translate(" + (d.XOffset) + "," + (-(d.YOffset)) + ")";
                                })
                                .style("fill", function(d) {
                                    return color(d[scope.config.colorDim]);
                                })
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
                                });

                        };

                        var drawAxes = function() {

                            //Common Axis formating between scatterplot and gatherplot
                            //Setup X axis
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
                                .style("font-size", 12)
                                .attr("y", -15)
                                .attr("transform", "rotate(-90)")
                                .attr("dx", function(d) {
                                    return (String(d).length - 1) * 12 / 2;
                                });

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


                            svgGroup.selectAll(".dot")
                                .style("fill", function(d) {
                                    return color(d[scope.config.colorDim]);
                                })
                                .style("stroke", function(d) {
                                    return scope.border ? 'black' : 'none';
                                })
                                .style("stroke-width", "1px")
                                .style("shape-rendering", scope.shapeRenderingMode);
                        };

                        var drawLegends = function() {
                            var legendGroup = svg.selectAll(".legend")
                                .data(scope.config.dimOrder[scope.config.colorDim], function(d) {
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