//Values for config


var numberOfEntity = 1000;
var initialR = 5;
var numDiscreteVar = 60;

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

var data = [];

for (var count = 0; count < numberOfEntity; count++) {

  var temp = new Array();

  temp.id = count;

  temp.continous_variable1 = Math.random();
  temp.continous_variable2 = Math.random();
  temp.discrete_variable = Math.round(Math.random()*(numDiscreteVar - 1 ));

  if (Math.random()>0.3) {
    temp.nominal_variable = 'M';
  } else {
    temp.nominal_variable = 'F';
  }

  if (temp.continous_variable1 * temp.continous_variable2 > 0.8) {
    temp.selection_variable = 'Group 1';

  } else if (temp.continous_variable1 * temp.continous_variable2 > 0.6) {
    temp.selection_variable = 'Group 1 & 2';
  } else if (temp.continous_variable1 * temp.continous_variable2 > 0.4) {
    temp.selection_variable = 'Group 2';
  } else {
    temp.selection_variable = 'None';
  }

  data.push(temp);
}


  x.domain(d3.extent(data, function(d) { return d.continous_variable1; }));
  y.domain(d3.extent(data, function(d) { return d.continous_variable2; }));


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

  svg.selectAll(".dot")
      .data(data,function(d) { return +d.id;})
    .enter().append("rect")
      .attr("class", "dot")
      .attr("width", initialR*2)
      .attr("height",initialR*2)
      .attr("rx",initialR)
      .attr("ry",initialR)
      .attr("x", function(d) { return x(d.continous_variable1); })
      .attr("y", function(d) { return y(d.continous_variable2); })
      .style("fill", function(d) { return color(d.selection_variable); });

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

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
      .text(function(d) { return d; });

$('#state').on('change', function() {
    
    var $this = $(this),
      val = $this.val();
      
      switch (val) {
        case '1':
          break;
        case '2':

    x = d3.scale.ordinal()
        .rangePoints([0,width],.2);

    y = d3.scale.linear()
        .range([height, 0]);

    x.domain( ['M','F']);
    y.domain(d3.extent(data, function(d) { return d.discrete_variable; }));


    xAxis.scale(x)
        .orient("bottom");

    yAxis.scale(y)
        .orient("left");

  d3.select(".x").call(xAxis);
  d3.select(".y").call(yAxis);
   
   
          svg.selectAll(".dot")
                .data(data, function(d){return +d.id;})
                .attr("class", "dot")
                .attr("width", initialR)
                .attr("height",initialR)
                .transition()
                .duration(1000)
                .attr("rx",0)
                .attr("ry",0)
                .attr("x", function(d) { return x(d.nominal_variable); })
                .attr("y", function(d) { return y(d.discrete_variable); })
                .style("fill", function(d) { return color(d.selection_variable); });
          break;

      case '3':

           x = d3.scale.ordinal()
        .rangePoints([0,width],.2);

    y = d3.scale.linear()
        .range([height, 0]);

    x.domain( ['M','F']);
    y.domain(d3.extent(data, function(d) { return d.discrete_variable; }));


    xAxis.scale(x)
        .orient("bottom");

    yAxis.scale(y)
        .orient("left");

  d3.select(".x").call(xAxis);
  d3.select(".y").call(yAxis);
    var selection_order = ['Group 1','Group 1 & 2', 'Group 2', 'None'];

    var nest = d3.nest()
                    .key(function(d) {return d.nominal_variable;})
                    .key(function(d){return d.discrete_variable;})
                    .sortKeys(function(a,b){return +a - (+b);} )
                    .sortValues(function(a,b) {return selection_order.indexOf(a.selection_variable) - selection_order.indexOf(b.selection_variable);})  
                    .entries(data);

    nest.forEach(function(d,i,j) { 
        console.log (d); 
        console.log(i); 
        console.log(j);
        d.values.forEach(function(d,i,j) {

            var count = 0;

            d.values.forEach(function(d,i,j) {

                console.log (d); 
                
                d.tempID = count;

                count += 1;

            });
        });
    });


          svg.selectAll(".dot")
                .data(data, function(d) {return +d.id;})
                .attr("class", "dot")
                .attr("width", initialR)
                .attr("height",initialR)
                .attr("rx",0)
                .attr("ry",0)
                .attr("x", function(d) { return x(d.nominal_variable); })
                .attr("y", function(d) { return y(d.discrete_variable); })
                .style("fill", function(d) { return color(d.selection_variable); })
                .transition()
                .duration(1000)
                .attr("transform",function(d,i) {return "translate(" + (+d.tempID) *5 + ",0)"; });
          break;

case '4':

           x = d3.scale.ordinal()
        .rangePoints([0,width],.2);

    y = d3.scale.linear()
        .range([height, 0]);

    x.domain( ['M','F']);
    y.domain(d3.extent(data, function(d) { return d.discrete_variable; }));


    xAxis.scale(x)
        .orient("bottom");

    yAxis.scale(y)
        .orient("left");

  d3.select(".x").call(xAxis);
  d3.select(".y").call(yAxis);
   
   var selection_order = ['Group 1','Group 1 & 2', 'Group 2', 'None'];

    var nest = d3.nest()
                    .key(function(d) {return d.nominal_variable;})
                    .key(function(d){return d.discrete_variable;})
                    .sortKeys(function(a,b){return +a - (+b);} )
                    .sortValues(function(a,b) {return selection_order.indexOf(a.selection_variable) - selection_order.indexOf(b.selection_variable);})
                    .entries(data);
    
    nest.forEach(function(d,i,j) { 
        console.log (d); 
        console.log(i); 
        console.log(j);
        d.values.forEach(function(d,i,j) {

            var count = 0;

            d.values.forEach(function(d,i,j) {

                console.log (d); 
                
                d.tempID = count;

                count += 1;

            });

            d.values.forEach(function(d,i,j) {

                d.tempGroupSize = count;

            });

        });
    });


          svg.selectAll(".dot")
                .data(data, function(d) {return +d.id;})
                .attr("class", "dot")
                .attr("width", initialR)
                .attr("height",initialR)
                .attr("rx",0)
                .attr("ry",0)
                .attr("x", function(d) { return x(d.nominal_variable); })
                .attr("y", function(d) { return y(d.discrete_variable); })
                .style("fill", function(d) { return color(d.selection_variable); })
                .transition()
                .duration(1000)
                .attr("transform",function(d,i) {return "translate(" + (- (+d.tempGroupSize/2.0) +d.tempID) *5 + ",0)"; });
          break;

        }
      });






