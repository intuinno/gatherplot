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

                                        var XMargin = 10;
                                        var YMargin = 2;
                                        var margin = 80;
                                        var width = 1040;
                                        var height = 520;
                                        var outerWidth = width + 2* margin;
                                        var outerHeight = height + 2*margin;



                                        var svg = d3.select(iElement[0])
                                            .append("svg:svg")
                                            .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
                                            .attr("preserveAspectRatio", "none");

                                        var svgGroup = svg.append("g")
                                            .attr("transform", "translate(" + margin + "," + margin + ")");

                                        // .attr("width", "100%" )
                                        // .attr("height","500")




                                        // on window resize, re-render d3 canvas
                                        window.onresize = function() {
                                            return scope.$apply();
                                        };

                                        scope.$watch(function() {
                                            return angular.element(window)[0].innerWidth;
                                        }, function() {
                                            return scope.render(scope.data);
                                        });

                                        // watch for data changes and re-render
                                        scope.$watch('data', function(newVals, oldVals) {
                                            return scope.render(newVals);
                                        }, true);



                                        //Gets the optimal width of rectangle based on 
                                        //Aspect ratio 
                                        var optimalNumElementWidthAspect = function(width, height, n) {

                                            var widthElement, heightElement;
                                            var numElementHeight;
                                            var optimalNumElementWidth;
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
                                            var optimalNumElementHeight;
                                            var optimalRatio = width * n / height;



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

                                            return optimalNumElementHeight;

                                        };



                                        var optimalNumElementWidthMargin = function(width, height, n) {

                                            var widthElement, heightElement;
                                            var numElementHeight;
                                            var optimalNumElementWidth;
                                            var optimalMargin = 1;
                                            var optimalRatio = width * n / height;


                                            for (numElementWidth = 1; numElementWidth < n + 1; numElementWidth++) {

                                                widthElement = width / numElementWidth;
                                                numElementHeight = Math.ceil(n / numElementWidth);
                                                heightElement = height / numElementHeight;

                                                var aspectRatio = widthElement / heightElement;

                                                var margin = (n % numElementWidth) * widthElement * heightElement / width * height;

                                                if (margin * Math.pow(Math.abs(1 - aspectRatio), 2) < optimalMargin * Math.pow(Math.abs(1 - optimalRatio), 2)) {

                                                    optimalNumElementWidth = numElementWidth;
                                                    optimalRatio = aspectRatio;
                                                    optimalMargin = margin;
                                                }

                                            }

                                            return optimalNumElementWidth;

                                        };



                                        // define render function
                                        scope.render = function(data) {

                                            // remove all previous items before render
                                            //   svg.selectAll("*").remove();

                                            //   // setup variables
                                            //   var width, height, max;
                                            //   width = d3.select(iElement[0]).node().offsetWidth - margin;
                                            //   // 20 is for margins and can be changed
                                            //   height = scope.data.length * (barHeight + barPadding);


                                            if (!data) return;


                                            var widthSVG = d3.select(iElement[0]).node().offsetWidth;
                                            // calculate the height
                                            var heightSVG = d3.select(iElement[0]).node().offsetWidth / 2;

                                            svg.attr('height', heightSVG); svg.attr('width', widthSVG);

                                            var x = d3.scale.linear()
                                                .range([0, width]);

                                                var y = d3.scale.linear()
                                                .range([height, 0]);

                                                var xAxis = d3.svg.axis()
                                                .scale(x)
                                                .orient("bottom");

                                                var yAxis = d3.svg.axis()
                                                .scale(y)
                                                .orient("left");

                                                var color = d3.scale.category10();


                                                xAxis.orient("bottom");

                                                yAxis.orient("left");

                                                d3.select(".x").call(xAxis); d3.select(".y").call(yAxis);

                                                var selection_order = ['Yes', 'No'];
                                                var class_order = ['First', 'Second', 'Third', 'Crew'];
                                                var initialSquareLenth = 10;
                                                var gender_order = ['Male', 'Female'];

                                                var nest = d3.nest()
                                                .key(function(d) {
                                                    return d.Class;
                                                })
                                                .sortKeys(function(a, b) {
                                                    return class_order.indexOf(a) - class_order.indexOf(b);
                                                })
                                                .key(function(d) {
                                                    return d.Sex;
                                                })
                                                .sortKeys(function(a, b) {
                                                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                                                })
                                                .sortValues(function(a, b) {
                                                    return selection_order.indexOf(a.Survived) - selection_order.indexOf(b.Survived);
                                                })
                                                .entries(data);

                                                var sum = nest.reduce(function(previousValue, currentParent) {
                                                    return (currentParent.offset = previousValue) + (currentParent.sum = currentParent.values.reduceRight(function(previousValue, currentChild) {
                                                        currentChild.parent = currentParent;
                                                        return (currentChild.offset = previousValue) + currentChild.values.length;
                                                    }, 0));
                                                }, 0);

                                                var XOffset = 0;
                                                var YOffset = 0;

                                                var XnumGroup = nest.length;
                                                var YnumGroup = nest[0].values.length;

                                                nest.forEach(function(d, i, j) {

                                                    //Here d is PassengerClass Array

                                                    var count = 0;
                                                    var tempXWidth = 0;
                                                    var tempYHeight = 0;

                                                    YOffset = 0;


                                                    d.values.forEach(function(d, i, j) {

                                                        //Here d is Gender Array
                                                        tempXWidth = 0;
                                                        count = 0;

                                                        d.values.forEach(function(d, i, j) {

                                                            //Here d is object
                                                            d.tempID = count;
                                                            count += 1;

                                                        });

                                                        tempXWidth = optimalNumElementWidthAspect(width / XnumGroup, height / YnumGroup, count);

                                                        tempYHeight = Math.ceil(count / tempXWidth);

                                                        d.values.forEach(function(d, i, j) {

                                                            d.tempXGroupSize = count;
                                                            d.tempXWidth = tempXWidth;
                                                            d.tempXOffset = XOffset;
                                                            d.tempYOffset = YOffset;
                                                            d.tempYHeight = tempYHeight;
                                                            d.widthRatio = Math.sqrt(sum) / XnumGroup / tempXWidth;
                                                            d.heightRatio = Math.sqrt(sum) / YnumGroup / tempYHeight;

                                                        });


                                                        YOffset += Math.sqrt(sum) / YnumGroup * initialSquareLenth + 10;


                                                    });


                                                    XOffset += Math.sqrt(sum) / XnumGroup * initialSquareLenth + 10;

                                                });

                                                x = d3.scale.ordinal()
                                                .rangeRoundBands([0, width], 1)
                                                .domain(nest.map(function(d) {
                                                    return d.key;
                                                }));

                                                y = d3.scale.ordinal()
                                                .rangeRoundBands([height, 0], 1)
                                                .domain(nest[0].values.map(function(d) {
                                                    return d.key;
                                                }));

                                                xAxis = d3.svg.axis()
                                                .scale(x)
                                                .orient("bottom");

                                                yAxis = d3.svg.axis()
                                                .scale(y)
                                                .orient("left");

                                                svg.selectAll(".axis").remove();

                                                svgGroup.append("g")
                                                .attr("class", "x axis")
                                                .attr("transform", "translate(0," + height + ")")
                                                .call(xAxis)
                                                .append("text")
                                                .attr("class", "label")
                                                .attr("x", width / 2)
                                                .attr("y", 56)
                                                .style("text-anchor", "end")
                                                .text("Passenger Class");

                                                svgGroup.append("g")
                                                .attr("class", "y axis")
                                                .call(yAxis)
                                                .append("text")
                                                .attr("class", "label")
                                                .attr("transform", "rotate(-90)")
                                                .attr("x", -height / 2)
                                                .attr("y", -50)
                                                .attr("dy", ".71em")
                                                .style("text-anchor", "end")
                                                .text("Gender")

                                                svgGroup.selectAll(".dot")
                                                .data(data)
                                                .enter().append("rect")
                                                .attr("class", "dot")
                                                .attr("width", function(d) {
                                                    // console.log(initialSquareLenth);
                                                    return initialSquareLenth * d.widthRatio;
                                                })
                                                .attr("height", function(d) {
                                                    return initialSquareLenth * d.heightRatio;
                                                })
                                                .attr("rx", 0)
                                                .attr("ry", 0)
                                                .transition()
                                                .duration(1000)
                                                .attr("x", function(d) {
                                                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLenth * d.widthRatio;
                                                })
                                                .attr("y", function(d) {
                                                    return height - (Math.floor(+d.tempID / (+d.tempXWidth)) + 1) * initialSquareLenth * d.heightRatio;
                                                })
                                                .style("fill", function(d) {
                                                    return color(d.Survived);
                                                })
                                                .attr("transform", function(d, i) {
                                                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                                                });


                                            }; //End renderer


                                        }); //End Service
                                }

                            } //End return 

                        } // End function (d3Service)

                    ]);

        }());