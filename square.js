//Values for config


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

}

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

}



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

}


///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
// Setting Variable 

var numberOfEntity = 2201;
var multiplicationfactor = 1;

var originalSquareLength = 10;

var initialSquareLength = 10;
var numDiscreteVar = 60;

var nest;

var XMargin = 10;
var YMargin = 2;


var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
},
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var legend;

var squares;

//Making random data set
var data = [];

var makeData = function() {

    data = [];


    initialSquareLength = originalSquareLength / Math.sqrt(multiplicationfactor);

    d3.tsv("Titanic.txt", function(error, tdata) {

        for (var count = 0; count < numberOfEntity * multiplicationfactor; count++) {

            var temp = new Object();

            temp.id = count;

            temp.continous_variable1 = Math.random();
            temp.continous_variable2 = Math.random();
            temp.discrete_variable = Math.round(Math.random() * (numDiscreteVar - 1));

            if (Math.random() > 0.3) {
                temp.nominal_variable = 'Male';
            } else {
                temp.nominal_variable = 'Female';
            }

            if (Math.random() > 0.99) {
                temp.cancer = 'Cancer';

                if (Math.random() > 0.8) {
                    temp.mamo = 'Negative Mamo';
                } else {
                    temp.mamo = 'Positive Mamo';
                }

            } else {
                temp.cancer = 'No Cancer';

                if (Math.random() > 0.096) {
                    temp.mamo = 'Negative Mamo';
                } else {
                    temp.mamo = 'Positive Mamo';
                }
            }
            
            temp.descriptor = temp.cancer + ", " + temp.mamo;

            if (temp.continous_variable1 * temp.continous_variable2 > 0.7) {
                temp.selection_variable = 'Group 1';

            } else if (temp.continous_variable1 * temp.continous_variable2 > 0.5) {
                temp.selection_variable = 'Group 1 & 2';
            } else if (temp.continous_variable1 * temp.continous_variable2 > 0.3) {
                temp.selection_variable = 'Group 2';
            } else {
                temp.selection_variable = 'None';
            }

            temp.passengerClass = tdata[count % numberOfEntity].Class;
            temp.age = tdata[count % numberOfEntity].Age;
            temp.sex = tdata[count % numberOfEntity].Sex;
            temp.survived = tdata[count % numberOfEntity].Survived;


            data.push(temp);
        }

        x.domain(d3.extent(data, function(d) {
            return d.continous_variable1;
        }));
        y.domain(d3.extent(data, function(d) {
            return d.continous_variable2;
        }));



        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Sepal Width (cm)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Sepal Length (cm)")

        squares = svg.selectAll(".dot")
            .data(data, function(d) {
                return +d.id;
            })
            .enter().append("rect")
            .attr("class", "dot")
            .attr("width", initialSquareLength)
            .attr("height", initialSquareLength)
            .attr("rx", initialSquareLength / 2)
            .attr("ry", initialSquareLength / 2)
            .attr("x", function(d) {
                return x(d.continous_variable1);
            })
            .attr("y", function(d) {
                return y(d.continous_variable2);
            })
            .style("fill", function(d) {
                return color(d.selection_variable);
            });

        legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });

    });

};



$('#state').on('change', function() {

    var $this = $(this),
        val = $this.val();

    switch (val) {
        case '1':
            break;
        case '2':

            x = d3.scale.ordinal()
                .rangePoints([0, width], 1);

            y = d3.scale.linear()
                .range([height, 0]);

            x.domain(['Male', 'Female']);
            y.domain(d3.extent(data, function(d) {
                return d.discrete_variable;
            }));


            xAxis.scale(x)
                .orient("bottom");

            yAxis.scale(y)
                .orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("class", "dot")
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .transition()
                .duration(1000)
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("x", function(d) {
                    return x(d.nominal_variable);
                })
                .attr("y", function(d) {
                    return y(d.discrete_variable);
                })
                .style("fill", function(d) {
                    return color(d.selection_variable);
                });
            break;

        case '3':

            x = d3.scale.ordinal()
                .rangePoints([0, width], 1);

            y = d3.scale.linear()
                .range([height, 0]);

            x.domain(['Male', 'Female']);
            y.domain(d3.extent(data, function(d) {
                return d.discrete_variable;
            }));


            xAxis.scale(x)
                .orient("bottom");

            yAxis.scale(y)
                .orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);
            var selection_order = ['Group 1', 'Group 1 & 2', 'Group 2', 'None'];

            nest = d3.nest()
                .key(function(d) {
                    return d.nominal_variable;
                })
                .key(function(d) {
                    return d.discrete_variable;
                })
                .sortKeys(function(a, b) {
                    return +a - (+b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.selection_variable) - selection_order.indexOf(b.selection_variable);
                })
                .entries(data);

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);
                d.values.forEach(function(d, i, j) {

                    var count = 0;

                    d.values.forEach(function(d, i, j) {

                        // console.log (d); 

                        d.tempID = count;

                        count += 1;

                    });
                });
            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("class", "dot")
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("x", function(d) {
                    return x(d.nominal_variable);
                })
                .attr("y", function(d) {
                    return y(d.discrete_variable);
                })
                .style("fill", function(d) {
                    return color(d.selection_variable);
                })
                .transition()
                .duration(1000)
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempID) * initialSquareLength + ",0)";
                });
            break;

        case '4':

            x = d3.scale.ordinal()
                .rangePoints([0, width], 1);

            y = d3.scale.linear()
                .range([height, 0]);

            x.domain(['Male', 'Female']);
            y.domain(d3.extent(data, function(d) {
                return d.discrete_variable;
            }));


            xAxis.scale(x)
                .orient("bottom");

            yAxis.scale(y)
                .orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Group 1', 'Group 1 & 2', 'Group 2', 'None'];

            nest = d3.nest()
                .key(function(d) {
                    return d.nominal_variable;
                })
                .key(function(d) {
                    return d.discrete_variable;
                })
                .sortKeys(function(a, b) {
                    return +a - (+b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.selection_variable) - selection_order.indexOf(b.selection_variable);
                })
                .entries(data);

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);
                d.values.forEach(function(d, i, j) {

                    var count = 0;

                    d.values.forEach(function(d, i, j) {

                        // console.log (d); 

                        d.tempID = count;

                        count += 1;

                    });

                    d.values.forEach(function(d, i, j) {

                        d.tempGroupSize = count;

                    });

                });
            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("class", "dot")
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("x", function(d) {
                    return x(d.nominal_variable);
                })
                .attr("y", function(d) {
                    return y(d.discrete_variable);
                })
                .style("fill", function(d) {
                    return color(d.selection_variable);
                })
                .transition()
                .duration(1000)
                .attr("transform", function(d, i) {
                    return "translate(" + (-(+d.tempGroupSize / 2.0) + d.tempID) * initialSquareLength + ",0)";
                });
            break;
            /////////////////////////////////////
            /////////
            /////////////////////////////////////
            //////////////////////////////////////
            /////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
        case '5':

            x = d3.scale.ordinal()
                .rangePoints([0, width], 1);

            y = d3.scale.linear()
                .range([height, 0]);

            x.domain(['Male', 'Female']);
            y.domain(d3.extent(data, function(d) {
                return d.discrete_variable;
            }));


            xAxis.scale(x)
                .orient("bottom");

            yAxis.scale(y)
                .orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Group 1', 'Group 1 & 2', 'Group 2', 'None'];

            nest = d3.nest()
                .key(function(d) {
                    return d.nominal_variable;
                })
                .key(function(d) {
                    return d.discrete_variable;
                })
                .sortKeys(function(a, b) {
                    return +a - (+b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.selection_variable) - selection_order.indexOf(b.selection_variable);
                })
                .entries(data);

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);
                d.values.forEach(function(d, i, j) {

                    var count = 0;

                    d.values.forEach(function(d, i, j) {

                        // console.log (d); 

                        d.tempID = count;

                        count += 1;

                    });

                    d.values.forEach(function(d, i, j) {

                        d.tempGroupSize = count;

                    });


                });
            });
            var tempMax;
            nest.forEach(function(d, i, j) {
                tempMax = d3.max(d.values, function(d2) {
                    console.log(d2);

                    return d2.values[0].tempGroupSize;
                });

                d.values.forEach(function(d, i, j) {
                    d.values.forEach(function(d, i, j) {
                        d.tempMax1 = tempMax;
                    });
                });
            });

            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });



            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("class", "dot")
                .attr("width", function(d) {
                    return initialSquareLength * d.tempMax1 / d.tempGroupSize;
                })
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("x", function(d) {
                    return x(d.nominal_variable);
                })
                .attr("y", function(d) {
                    return y(d.discrete_variable);
                })
                .style("fill", function(d) {
                    return color(d.selection_variable);
                })
                .transition()
                .duration(1000)
                .attr("transform", function(d, i) {
                    return "translate(" + (initialSquareLength * d.tempMax1 / d.tempGroupSize) * (+d.tempID) + ",0)";
                });
            break;
            ///////////////////////////////////
            ///////////////////////////////////
        case '6':

            x = d3.scale.ordinal()
                .rangePoints([0, width], 1);

            y = d3.scale.linear()
                .range([height, 0]);

            x.domain(['Male', 'Female']);
            y.domain(d3.extent(data, function(d) {
                return d.discrete_variable;
            }));


            xAxis.scale(x)
                .orient("bottom");

            yAxis.scale(y)
                .orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Group 1', 'Group 1 & 2', 'Group 2', 'None'];


            nest = d3.nest()
                .key(function(d) {
                    return d.nominal_variable;
                })
                .key(function(d) {
                    return d.discrete_variable;
                })
                .sortKeys(function(a, b) {
                    return +a - (+b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.selection_variable) - selection_order.indexOf(b.selection_variable);
                })
                .entries(data);

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);
                d.values.forEach(function(d, i, j) {

                    var count = 0;

                    d.values.forEach(function(d, i, j) {

                        // console.log (d); 

                        d.tempID = count;

                        count += 1;

                    });

                    d.values.forEach(function(d, i, j) {

                        d.tempGroupSize = count;

                    });


                });
            });

            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });



            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("class", "dot")
                .attr("width", function(d) {
                    return initialSquareLength * max / d.tempGroupSize;
                })
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return x(d.nominal_variable);
                })
                .attr("y", function(d) {
                    return y(d.discrete_variable);
                })
                .style("fill", function(d) {
                    return color(d.selection_variable);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (initialSquareLength * max / d.tempGroupSize) * (+d.tempID) + ",0)";
                });
            break;


            ///////////////////////////////////
            ///////////////////////////////////
            // Mosaic plot for Zero variable
        case '7':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];


            nest = d3.nest()
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
                })
                .entries(data);

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                d.tempID = i;



            });


            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

            var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % xModulusSize) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / xModulusSize) * initialSquareLength;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(0,0)";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // Mosaic plot for Passenger Class
        case '8':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
                })
                .entries(data);

            var offset = 0;

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                var count = 0;
                var tempXWidth = 0;

                d.values.forEach(function(d, i, j) {


                    d.tempID = count;

                    count += 1;

                });

                tempXWidth = Math.ceil(Math.sqrt(data.length) * count / data.length);

                d.values.forEach(function(d, i, j) {


                    d.tempXGroupSize = count;
                    d.tempXWidth = tempXWidth;
                    d.tempOffset = offset;



                });

                offset += tempXWidth * initialSquareLength + 10;



            });



            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

            var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempOffset) + ",0)";
                });
            break;


            ///////////////////////////////////
            ///////////////////////////////////
            // Height Adjustment Mosaic plot for Passenger Class
        case '9':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
                })
                .entries(data);

            var offset = 0;

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                var count = 0;
                var tempXWidth = 0;

                d.values.forEach(function(d, i, j) {


                    d.tempID = count;

                    count += 1;

                });

                tempXWidth = Math.ceil(Math.sqrt(data.length) * count / data.length);
                tempYHeight = Math.floor(count / tempXWidth);

                d.values.forEach(function(d, i, j) {


                    d.tempXGroupSize = count;
                    d.tempXWidth = tempXWidth;
                    d.tempOffset = offset;
                    d.tempYHeight = tempYHeight;



                });

                offset += tempXWidth * initialSquareLength + 10;



            });



            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

            var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", initialSquareLength)
                .attr("height", function(d) {
                    return initialSquareLength * Math.sqrt(data.length) / (+d.tempYHeight);
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength * Math.sqrt(data.length) / (+d.tempYHeight);
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempOffset) + ",0)";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // NomaRect for Passenger Class
        case '10':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
                })
                .entries(data);

            var offset = 0;

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                var count = 0;
                var tempXWidth = 0;

                d.values.forEach(function(d, i, j) {


                    d.tempID = count;

                    count += 1;

                });

                tempXWidth = Math.ceil(Math.sqrt(data.length) * count / data.length);
                tempYHeight = Math.floor(count / tempXWidth);

                d.values.forEach(function(d, i, j) {


                    d.tempXGroupSize = count;
                    d.tempXWidth = tempXWidth;
                    d.tempOffset = offset;
                    d.tempYHeight = tempYHeight;



                });

                offset += tempXWidth * initialSquareLength * Math.sqrt(data.length) / 4 / (tempXWidth) + 10;



            });



            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

            var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength * Math.sqrt(data.length) / 4 / (+d.tempXWidth);
                })
                .attr("height", function(d) {
                    return initialSquareLength * Math.sqrt(data.length) / (+d.tempYHeight);
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength * Math.sqrt(data.length) / 4 / (+d.tempXWidth);
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength * Math.sqrt(data.length) / (+d.tempYHeight);
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempOffset) + ",0)";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // Mosaic Plot - Class vs Gender
        case '11':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];
            var gender_order = ['Male', 'Female'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .key(function(d) {
                    return d.sex;
                })
                .sortKeys(function(a, b) {
                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
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

            nest.forEach(function(d, i, j) {

                //Here d is PassengerClass Array

                var count = 0;
                var tempXWidth = 0;

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

                    tempXWidth = Math.ceil(Math.sqrt(sum) * d.parent.sum / sum);

                    tempYHeight = Math.floor(count / tempXWidth);

                    d.values.forEach(function(d, i, j) {

                        d.tempXGroupSize = count;
                        d.tempXWidth = tempXWidth;
                        d.tempXOffset = XOffset;
                        d.tempYOffset = YOffset;
                        d.tempYHeight = tempYHeight;

                    });


                    YOffset += tempYHeight * initialSquareLength + 10;


                });


                XOffset += tempXWidth * initialSquareLength + 10;

            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength;
                })
                .attr("height", function(d) {
                    return initialSquareLength;
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // NomaRect Plot - Class vs Gender
        case '12':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];
            var gender_order = ['Male', 'Female'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .key(function(d) {
                    return d.sex;
                })
                .sortKeys(function(a, b) {
                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
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

                    tempXWidth = Math.ceil(Math.sqrt(sum) * d.parent.sum / sum);

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


                    YOffset += Math.sqrt(sum) / YnumGroup * initialSquareLength + 10;


                });


                XOffset += Math.sqrt(sum) / XnumGroup * initialSquareLength + 10;

            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength * d.widthRatio;
                })
                .attr("height", function(d) {
                    return initialSquareLength * d.heightRatio;
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength * d.widthRatio;
                })
                .attr("y", function(d) {
                    return height - (Math.floor(+d.tempID / (+d.tempXWidth)) + 1) * initialSquareLength * d.heightRatio;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // Optimizing Ratio NomaRect Plot - Class vs Gender
        case '13':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];
            var gender_order = ['Male', 'Female'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .key(function(d) {
                    return d.sex;
                })
                .sortKeys(function(a, b) {
                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
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


                    YOffset += Math.sqrt(sum) / YnumGroup * initialSquareLength + 10;


                });


                XOffset += Math.sqrt(sum) / XnumGroup * initialSquareLength + 10;

            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength * d.widthRatio;
                })
                .attr("height", function(d) {
                    return initialSquareLength * d.heightRatio;
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength * d.widthRatio;
                })
                .attr("y", function(d) {
                    return height - (Math.floor(+d.tempID / (+d.tempXWidth)) + 1) * initialSquareLength * d.heightRatio;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                });
            break;


            /////////////////////////////////////////////////
            ///////////////////////////////////
            ///////////////////////////////////
            // Optimizing Margin NomaRect Plot - Class vs Gender
        case '14':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];
            var gender_order = ['Male', 'Female'];

            nest = d3.nest()
                .key(function(d) {
                    return d.passengerClass;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .key(function(d) {
                    return d.sex;
                })
                .sortKeys(function(a, b) {
                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
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

                    tempXWidth = optimalNumElementWidthMargin(width / XnumGroup, height / YnumGroup, count);

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


                    YOffset += Math.sqrt(sum) / YnumGroup * initialSquareLength + 10;


                });


                XOffset += Math.sqrt(sum) / XnumGroup * initialSquareLength + 10;

            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength * d.widthRatio;
                })
                .attr("height", function(d) {
                    return initialSquareLength * d.heightRatio;
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength * d.widthRatio;
                })
                .attr("y", function(d) {
                    return height - (Math.floor(+d.tempID / (+d.tempXWidth)) + 1) * initialSquareLength * d.heightRatio;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .style("stroke-width", "none")
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                });
            break;

            /////////////////////////////////////////////////
            ///////////////////////////////////
            ///////////////////////////////////
            // Big Data Square Discrete vs Nominal
        case '15':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];
            var gender_order = ['Male', 'Female'];

            nest = d3.nest()
                .key(function(d) {
                    return d.discrete_variable;
                })
                .sortKeys(function(a, b) {
                    return +a - b;
                })
                .key(function(d) {
                    return d.nominal_variable;
                })
                .sortKeys(function(a, b) {
                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
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

                    tempXWidth = optimalNumElementWidthMargin(width / XnumGroup, height / YnumGroup, count);

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


                    YOffset += Math.sqrt(sum) / YnumGroup * initialSquareLength + 10;


                });


                XOffset += Math.sqrt(sum) / XnumGroup * initialSquareLength + 10;

            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength * d.widthRatio;
                })
                .attr("height", function(d) {
                    return initialSquareLength * d.heightRatio;
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength * d.widthRatio;
                })
                .attr("y", function(d) {
                    return height - (Math.floor(+d.tempID / (+d.tempXWidth)) + 1) * initialSquareLength * d.heightRatio;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // 16 Big data Square Nominal vs Discrete
        case '16':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Yes', 'No'];
            var class_order = ['First', 'Second', 'Third', 'Crew'];
            var gender_order = ['Male', 'Female'];

            nest = d3.nest()
                .key(function(d) {
                    return d.nominal_variable;
                })
                .sortKeys(function(a, b) {
                    return gender_order.indexOf(a) - gender_order.indexOf(b);
                })
                .key(function(d) {
                    return d.discrete_variable;
                })
                .sortKeys(function(a, b) {
                    return +a - b;
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.survived) - selection_order.indexOf(b.survived);
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

                //Here d is Gender Array

                var count = 0;
                var tempXWidth = 0;

                YOffset = 0;


                d.values.forEach(function(d, i, j) {

                    //Here d is Age Array
                    tempXWidth = 0;
                    count = 0;

                    d.values.forEach(function(d, i, j) {

                        //Here d is object
                        d.tempID = count;
                        count += 1;

                    });

                    tempYHeight = optimalNumElementHeightAspect(width / XnumGroup, height / YnumGroup, count);

                    tempXWidth = Math.ceil(count / tempYHeight);

                    d.values.forEach(function(d, i, j) {

                        d.tempXGroupSize = count;
                        d.tempXWidth = tempXWidth;
                        d.tempXOffset = XOffset;
                        d.tempYOffset = YOffset;
                        d.tempYHeight = tempYHeight;
                        d.widthRatio = Math.sqrt(sum) / XnumGroup / tempXWidth;
                        d.heightRatio = Math.sqrt(sum) / YnumGroup / tempYHeight;

                    });


                    YOffset += Math.sqrt(sum) / YnumGroup * initialSquareLength + YMargin;


                });


                XOffset += Math.sqrt(sum) / XnumGroup * initialSquareLength + XMargin;

            });


            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", function(d) {
                    return initialSquareLength * d.widthRatio;
                })
                .attr("height", function(d) {
                    return initialSquareLength * d.heightRatio;
                })
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (Math.floor(+d.tempID / (+d.tempYHeight))) * initialSquareLength * d.widthRatio;
                })
                .attr("y", function(d) {
                    return height - (Math.floor(+d.tempID % (+d.tempYHeight)) + 1) * initialSquareLength * d.heightRatio;
                })
                .style("fill", function(d) {
                    return color(d.survived);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempXOffset) + "," + (-d.tempYOffset) + ")";
                });
            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // 17 Bayesian Reasoning Cancer Mosaic Plot - Square Aspect Ratio
        case '17':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Positive Mamo', 'Negative Mamo'];
            var class_order = ['No Cancer', 'Cancer'];

            nest = d3.nest()
                .key(function(d) {
                    return d.cancer;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.mamo) - selection_order.indexOf(b.mamo);
                })
                .entries(data);

            var offset = 0;

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                var count = 0;
                var tempXWidth = 0;

                d.values.forEach(function(d, i, j) {


                    d.tempID = count;

                    count += 1;

                });

                tempXWidth = Math.ceil(Math.sqrt(data.length) * count / data.length);

                d.values.forEach(function(d, i, j) {


                    d.tempXGroupSize = count;
                    d.tempXWidth = tempXWidth;
                    d.tempOffset = offset;



                });

                offset += tempXWidth * initialSquareLength + 10;



            });



            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

            var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength;
                })
                .style("fill", function(d) {
                    return color(d.descriptor);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempOffset) + ",0)";
                });


        legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });


                
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });


            break;

            break;
            ///////////////////////////////////
            ///////////////////////////////////
            // 18 Bayesian Reasoning Cancer Mosaic Plot - Minimum Height 
        case '18':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var selection_order = ['Positive Mamo', 'Negative Mamo'];
            var class_order = ['No Cancer', 'Cancer'];

            nest = d3.nest()
                .key(function(d) {
                    return d.cancer;
                })
                .sortKeys(function(a, b) {
                    return class_order.indexOf(a) - class_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return selection_order.indexOf(a.mamo) - selection_order.indexOf(b.mamo);
                })
                .entries(data);

            var offset = 0;

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                var count = 0;
                var tempXWidth = 0;

                d.values.forEach(function(d, i, j) {


                    d.tempID = count;

                    count += 1;

                });

                tempXWidth = Math.ceil(Math.sqrt(data.length) * count / data.length);

                d.tempXWidth = tempXWidth;
                d.tempYHeight = Math.ceil(count / tempXWidth);

            });

            var minHeight = d3.min(nest, function(d) {return d.tempYHeight; });

            nest.forEach(function(d, i, j) {

                var tempXWidth = Math.ceil(d.values.length / minHeight);

                d.values.forEach(function(d, i, j) {


                    d.tempXGroupSize = j.length;
                    d.tempXWidth = tempXWidth;
                    d.tempOffset = offset;



                });

                offset += tempXWidth * initialSquareLength + 10;



            });



            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

         //   var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .attr("rx", 0)
                .attr("ry", 0)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength;
                })
                .style("fill", function(d) {
                    return color(d.descriptor);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempOffset) + ",0)";
                });


        legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });


                
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });


            break;


            break;

            ///////////////////////////////////
            ///////////////////////////////////
            // 19 Bayesian Reasoning Mamography Mosaic Plot - Minimum Height 
        case '19':



            xAxis.orient("bottom");

            yAxis.orient("left");

            d3.select(".x").call(xAxis);
            d3.select(".y").call(yAxis);

            var mamo_order = ['Positive Mamo', 'Negative Mamo'];
            var cancer_order = ['Cancer', 'No Cancer'];

            nest = d3.nest()
                .key(function(d) {
                    return d.mamo;
                })
                .sortKeys(function(a, b) {
                    return mamo_order.indexOf(a) - mamo_order.indexOf(b);
                })
                .sortValues(function(a, b) {
                    return cancer_order.indexOf(a.cancer) - cancer_order.indexOf(b.cancer);
                })
                .entries(data);

            var offset = 0;

            nest.forEach(function(d, i, j) {
                // console.log (d); 
                // console.log(i); 
                // console.log(j);

                var count = 0;
                var tempXWidth = 0;

                d.values.forEach(function(d, i, j) {


                    d.tempID = count;

                    count += 1;

                });

                tempXWidth = Math.ceil(Math.sqrt(data.length) * count / data.length);

                d.tempXWidth = tempXWidth;
                d.tempYHeight = Math.ceil(count / tempXWidth);

            });

            var minHeight = d3.min(nest, function(d) {return d.tempYHeight; });

            nest.forEach(function(d, i, j) {

                var tempXWidth = Math.ceil(d.values.length / minHeight);

                d.values.forEach(function(d, i, j) {


                    d.tempXGroupSize = j.length;
                    d.tempXWidth = tempXWidth;
                    d.tempOffset = offset;



                });

                offset += tempXWidth * initialSquareLength + 10;



            });



            var max = d3.max(data, function(d) {
                return d.tempGroupSize;
            });

            var xModulusSize = Math.floor(Math.sqrt(data.length))

            svg.selectAll(".dot")
                .data(data, function(d) {
                    return +d.id;
                })
                .attr("width", initialSquareLength)
                .attr("height", initialSquareLength)
                .transition()
                .duration(1000)
                .attr("x", function(d) {
                    return (+d.tempID % (+d.tempXWidth)) * initialSquareLength;
                })
                .attr("y", function(d) {
                    return height - Math.floor(+d.tempID / (+d.tempXWidth)) * initialSquareLength;
                })
                .style("fill", function(d) {
                    return color(d.descriptor);
                })
                .attr("transform", function(d, i) {
                    return "translate(" + (+d.tempOffset) + ",0)";
                })
                .transition()
                .duration(1000)
                .attr("rx", 0)
                .attr("ry", 0);
                

        legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });


                
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });


            break;


    }
});

var clearSVG = function() {

    if (squares != null) {

        squares.remove();

    }

};

$('#multiply').on('change', function() {

    var $this = $(this),
        val = $this.val();

    switch (val) {
        case '0':
            clearSVG();
            break;
        case '1':
            clearSVG();
            multiplicationfactor = 1;
            makeData();
            break;
        case '2':
            clearSVG();
            multiplicationfactor = 10;
            makeData();
            break;
        case '3':
            clearSVG()
            multiplicationfactor = 100;
            makeData();
            break;
    }
});