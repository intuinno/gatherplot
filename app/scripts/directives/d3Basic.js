(function() {
    'use strict';

    angular.module('myApp.directives')
        .directive('nomarect', ['d3Service',
            function(d3Service) {
                return {
                    restrict: 'EA',
                    scope: {
                        data: "=",
                        onClick: '&',
                        config: "="
                    },

                    link: function(scope, iElement, iAttrs) {

                        d3Service.d3().then(function(d3) {



                            //Constants and Setting Environment variables 
                            var XPadding = 30;
                            var YPadding = 15;
                            var XMargin = 10;
                            var YMargin = 2;
                            var margin = 80;
                            var width = 1040;
                            var height = 520;
                            var outerWidth = width + 2 * margin;
                            var outerHeight = height + 2 * margin;
                            var initialSquareLenth = 10;
                            var color = d3.scale.category10();
                            var renderData;
                            var thresholdNominal = 100; //Threshold for automatic nominal identification
                            var defaultBinSize = 10;
                            var minWidth = 12;
                            var minHeight = 6;

                            scope.config.YBinSize = defaultBinSize;
                            scope.config.XBinSize = defaultBinSize;




                            var svg = d3.select(iElement[0])
                                .append("svg:svg")
                                .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
                                .attr("preserveAspectRatio", "none");

                            var svgGroup = svg.append("g")
                                .attr("transform", "translate(" + margin + "," + margin + ")");



                            // on window resize, re-render d3 canvas
                            window.onresize = function() {
                                return scope.$apply();
                            };

                            scope.$watch(function() {
                                return angular.element(window)[0].innerWidth;
                            }, function() {
                                return scope.renderConfigChange(renderData, scope.config);
                            });

                            // watch for data changes and re-render
                            scope.$watch('data', function(newVals, oldVals) {
                                return scope.renderDataChange(newVals, scope.config);

                            }, false);

                            // watch for Config changes and re-render

                            scope.$watch('config', function(newVals, oldVals) {
                                return scope.renderConfigChange(renderData, newVals);
                            }, true);

                            var optimalNumElementHorizontal = function(width, height, n, isAspect, fillingDirection) {

                                if (isAspect == "true") {

                                    if (fillingDirection == "horizontal") {
                                        return optimalNumElementWidthAspect(width, height, n);
                                    } else {
                                        return optimalNumElementHeightAspect(width, height, n);
                                    }
                                } else {

                                    if (fillingDirection == "horizontal") {
                                        return n;
                                    } else {
                                        return 1;
                                    }
                                }

                            };



                            //Gets the optimal width of rectangle based on 
                            //Aspect ratio 
                            var optimalNumElementWidthAspect = function(width, height, n) {

                                var widthElement, heightElement;
                                var numElementHeight;
                                var optimalNumElementWidth = 1;
                                var optimalRatio = width * n / height;



                                for (var numElementWidth = 1; numElementWidth < n + 1; numElementWidth++) {

                                    widthElement = width / numElementWidth;
                                    numElementHeight = Math.ceil(n / numElementWidth);
                                    heightElement = height / numElementHeight;

                                    var aspectRatio = widthElement / heightElement;

                                    if (Math.abs(1 - aspectRatio) < Math.abs(1 - optimalRatio)) {

                                        optimalNumElementWidth = numElementWidth;
                                        optimalRatio = aspectRatio;
                                    }

                                }

                                return optimalNumElementWidth;

                            };

                            //Gets the optimal height of rectangle based on 
                            //Aspect ratio 
                            var optimalNumElementHeightAspect = function(width, height, n) {

                                var widthElement, heightElement;
                                var numElementWidth;
                                var optimalNumElementHeight = 1;
                                var optimalRatio = width / n / height;



                                for (var numElementHeight = 1; numElementHeight < n + 1; numElementHeight++) {

                                    heightElement = height / numElementHeight;
                                    numElementWidth = Math.ceil(n / numElementHeight);
                                    widthElement = width / numElementWidth;

                                    var aspectRatio = widthElement / heightElement;

                                    if (Math.abs(1 - aspectRatio) < Math.abs(1 - optimalRatio)) {

                                        optimalNumElementHeight = numElementHeight;
                                        optimalRatio = aspectRatio;
                                    }

                                }

                                return Math.round(n / optimalNumElementHeight);

                            };



                            scope.renderDataChange = function(data, config) {


                                if (!data) return;

                                svgGroup.selectAll("*").remove();


                                svgGroup.selectAll(".dot")
                                    .data(data)
                                    .enter().append("rect")
                                    .attr("class", "dot");

                                renderData = data;

                                var nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.xDim];
                                    })
                                    .entries(data);

                                config.xDimOrder = nest.map(function(d) {
                                    return d.key;
                                });

                                nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.yDim];
                                    })
                                    .entries(data);


                                config.yDimOrder = nest.map(function(d) {
                                    return d.key;
                                });

                                //Try automatic identification 
                                var isYNumber, isXNumber;



                                if (config.xDimOrder.length > thresholdNominal) {

                                    config.isXNumber = true;

                                } else {

                                    config.isXNumber = false;
                                }


                                if (config.yDimOrder.length > thresholdNominal) {

                                    config.isYNumber = true;

                                } else {

                                    config.isYNumber = false;
                                }


                                nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.colorDim];
                                    })
                                    .entries(data);

                                config.colorDimOrder = nest.map(function(d) {
                                    return d.key;
                                });


                                scope.renderConfigChange(renderData, config);


                            }; //End Data change renderer




                            // define render function
                            scope.renderConfigChange = function(data, config) {



                                if (!data) return;

                                //Update size of SVG
                                var widthSVG = d3.select(iElement[0]).node().offsetWidth;
                                // calculate the height
                                var heightSVG = d3.select(iElement[0]).node().offsetWidth / 2;

                                svg.attr('height', heightSVG);
                                svg.attr('width', widthSVG);

                                //Organize Data according to the dimension


                                var nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.xDim];
                                    })
                                    .entries(data);

                                if (config.isXNumber) {

                                    nest = d3.nest()
                                        .key(function(d) {
                                            return d[config.xDim];
                                        })
                                        .sortKeys(function(a, b) {


                                            return +a - b;


                                        })
                                        .entries(data);
                                }

                                config.xDimOrder = nest.map(function(d) {
                                    return d.key;
                                });

                                nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.yDim];
                                    })
                                    .entries(data);

                                if (config.isYNumber) {

                                    nest = d3.nest()
                                        .key(function(d) {
                                            return d[config.yDim];
                                        })
                                        .sortKeys(function(a, b) {


                                            return +a - b;


                                        })
                                        .entries(data);
                                }

                                config.yDimOrder = nest.map(function(d) {
                                    return d.key;
                                });



                                nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.colorDim];
                                    })
                                    .entries(data);

                                config.colorDimOrder = nest.map(function(d) {
                                    return d.key;
                                });

                                nest = d3.nest()
                                    .key(function(d) {
                                        return d[config.xDim];
                                    })
                                    .sortKeys(function(a, b) {

                                        if (config.isXNumber) {
                                            return +a - b;
                                        } else {
                                            return config.xDimOrder.indexOf(a) - config.xDimOrder.indexOf(b);

                                        }

                                    })
                                    .key(function(d) {
                                        return d[config.yDim];
                                    })
                                    .sortKeys(function(a, b) {

                                        if (config.isYNumber) {
                                            return +a - b;
                                        } else {
                                            return config.yDimOrder.indexOf(a) - config.yDimOrder.indexOf(b);

                                        }
                                    })
                                    .sortValues(function(a, b) {
                                        return config.colorDimOrder.indexOf(a[config.colorDim]) - config.colorDimOrder.indexOf(b[config.colorDim]);
                                    })
                                    .entries(data);

                                var sum = nest.reduce(function(previousValue, currentParent) {
                                    return (currentParent.offset = previousValue) + (currentParent.sum = currentParent.values.reduceRight(function(previousValue, currentChild) {
                                        currentChild.parent = currentParent;
                                        return (currentChild.offset = previousValue) + currentChild.values.length;
                                    }, 0));
                                }, 0);

                                var XOffset = XPadding;
                                var YOffset = YPadding;

                                var clusterWidth, clusterHeight;

                                var XnumGroup = config.xDimOrder.length;
                                var YnumGroup = config.yDimOrder.length;

                                nest.forEach(function(d, i, j) {

                                    //Here d is PassengerClass Array

                                    var count = 0;
                                    var tempXWidth = 0;
                                    var tempYHeight = 0;



                                    YOffset = YPadding;


                                    d.values.forEach(function(d, i, j) {

                                        //Here d is Gender Array
                                        tempXWidth = 0;
                                        count = 0;

                                        d.values.forEach(function(d, i, j) {

                                            //Here d is object
                                            d.tempID = count;
                                            count += 1;

                                        });


                                        //clusterWidth, clusterHeight is for the region 


                                        // If uniform Scaling X width 

                                        if (config.isXUniformSpacing == true) {

                                            clusterWidth = (width - (XnumGroup + 1) * XPadding) / XnumGroup;

                                            if (clusterWidth <= 0) {

                                                XPadding = thresholdNominal / (XnumGroup + 1);

                                                clusterWidth = (width - (XnumGroup + 1) * XPadding) / XnumGroup;

                                            }

                                        } else {

                                            //If Mosaic plot spacing 

                                            clusterWidth = (width - (XnumGroup + 1) * XPadding) * d.parent.sum / sum;

                                            if (clusterWidth <= 0) {

                                                XPadding = thresholdNominal / (XnumGroup + 1);

                                                clusterWidth = (width - (XnumGroup + 1) * XPadding) * d.parent.sum / sum;
                                            }

                                        }

                                        // If uniform Scaling  Y Height 

                                        if (config.isYUniformSpacing == true) {

                                            clusterHeight = (height - (YnumGroup + 1) * YPadding) / YnumGroup;

                                            if (clusterHeight <= 0) {

                                                YPadding = thresholdNominal / (YnumGroup + 1);

                                                clusterHeight = (height - (YnumGroup + 1) * YPadding) / YnumGroup;
                                            }


                                        } else {

                                            //If Mosaic plot spacing 



                                            clusterHeight = (height - (YnumGroup + 1) * YPadding) * count / d.parent.sum;

                                            if (clusterHeight <= 0) {

                                                YPadding = thresholdNominal / (YnumGroup + 1);

                                                clusterHeight = (height - (YnumGroup + 1) * YPadding) * count / d.parent.sum;
                                            }

                                        }


                                        tempXWidth = optimalNumElementHorizontal(clusterWidth, clusterHeight, count, config.optimizeAspect, config.fillingDirection);

                                        tempYHeight = Math.ceil(count / tempXWidth);

                                        d.values.forEach(function(d, i, j) {

                                            // d.tempXGroupSize = count;

                                            // d.numNodeX = tempXWidth;
                                            // d.numNodeY = tempYHeight;
                                            if (config.XAlign == 'justify') {

                                                d.nodeWidth = clusterWidth / tempXWidth;


                                            } else {

                                                d.nodeWidth = minWidth;
                                            }

                                            if (config.YAlign == 'justify') {

                                                d.nodeHeight = clusterHeight / tempYHeight;


                                            } else {

                                                d.nodeHeight = minHeight;
                                            }



                                           

                                            d.XOffset = XOffset;
                                            d.YOffset = YOffset;

                                            if (config.fillingDirection == "vertical") {

                                                d.nodeX = +d.tempID % tempXWidth * d.nodeWidth;
                                                d.nodeY = -d.nodeHeight - 1 * Math.floor(+d.tempID / tempXWidth) * d.nodeHeight;

                                            } else if (config.fillingDirection == "horizontal") {

                                                d.nodeX = +Math.floor(d.tempID / tempYHeight) * d.nodeWidth;
                                                d.nodeY = -d.nodeHeight - 1 * (+d.tempID % tempYHeight) * d.nodeHeight;

                                            }


                                        });


                                        YOffset += clusterHeight + YPadding;

                                        d.clusterHeight = clusterHeight;
                                        d.clusterWidth = clusterWidth;


                                    });


                                    XOffset += clusterWidth + XPadding;
                                    d.clusterHeight = clusterHeight;
                                    d.clusterWidth = clusterWidth;

                                });



                                var x = d3.scale.ordinal()
                                    .rangeRoundBands([0, width], 0.2, 0.1)
                                    .domain(config.xDimOrder);

                                var y = d3.scale.ordinal()
                                    .rangeRoundBands([height, 0], 0.2, 0.1)
                                    .domain(config.yDimOrder);

                                var xAxis = d3.svg.axis()
                                    .scale(x)
                                    .orient("bottom");

                                var yAxis = d3.svg.axis()
                                    .scale(y)
                                    .orient("left");

                                svg.selectAll(".axis").remove();

                                svgGroup.append("g")
                                    .attr("class", "x axis")
                                    .attr("transform", "translate(0," + height + ")")
                                    .call(xAxis)
                                    .append("text")
                                    .attr("class", "axislabel")
                                    .attr("x", width / 2)
                                    .attr("y", 56)
                                    .style("text-anchor", "end")
                                    .text(config.xDim);

                                svgGroup.append("g")
                                    .attr("class", "y axis")
                                    .call(yAxis)
                                    .append("text")
                                    .attr("class", "axislabel")
                                    .attr("transform", "rotate(-90)")
                                    .attr("x", -height / 2)
                                    .attr("y", -50)
                                    .attr("dy", ".71em")
                                    .style("text-anchor", "end")
                                    .text(config.yDim)

                                svgGroup.selectAll(".dot")
                                    .data(data, function(d) {
                                        return +d.id;
                                    })
                                    .style("stroke", function(d) {
                                        return 'black';
                                    })
                                    .attr("width", function(d) {
                                        // console.log(initialSquareLenth);
                                        return initialSquareLenth;
                                    })
                                    .attr("height", function(d) {
                                        return initialSquareLenth;
                                    })
                                    .transition()
                                    .duration(1200)
                                    .attr("width", function(d) {
                                        // console.log(initialSquareLenth);
                                        return initialSquareLenth;
                                    })
                                    .attr("height", function(d) {
                                        return initialSquareLenth;
                                    })
                                    .attr("rx", initialSquareLenth / 2)
                                    .attr("ry", initialSquareLenth / 2)
                                    .transition()
                                    .duration(1200)
                                    .attr("transform", function(d, i) {

                                        // if (d.cancer== "Cancer") {
                                        //     console.log(height);
                                        // }
                                        return "translate(" + (d.XOffset) + "," + (height - (d.YOffset)) + ")";
                                    })
                                    .transition()
                                    .duration(1200)
                                    .attr("x", function(d) {
                                        return +d.nodeX;
                                    })
                                    .attr("y", function(d) {
                                        return +d.nodeY;
                                    })
                                    .transition()
                                    .duration(1200)
                                    .attr("width", function(d) {
                                        // console.log(initialSquareLenth);
                                        return +d.nodeWidth;
                                    })
                                    .attr("height", function(d) {
                                        return +d.nodeHeight;
                                    })
                                    .attr("rx", 0)
                                    .attr("ry", 0)
                                    .transition()
                                    .duration(1200)
                                    .style("fill", function(d) {
                                        return color(d[config.colorDim]);
                                    })
                                    .style("stroke", function(d) {
                                        return config.border ? 'black' : 'none';
                                    });


                                var legendGroup = svg.selectAll(".legend")
                                    .data(config.colorDimOrder, function(d) {
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


                        }); //End Service
                    }

                } //End return 

            } // End function (d3Service)

        ]);

}());