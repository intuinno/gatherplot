angular.module('d3', [])
.factory('d3Service', ['$document', '$window', '$q', '$rootScope',
  function($document, $window, $q, $rootScope) {
    var d = $q.defer(),
        d3service = {
          d3: function() { return d.promise; }
        };
  function onScriptLoad() {
    // Load client in the browser
    $rootScope.$apply(function() { d.resolve($window.d3); });
  }
  var scriptTag = $document[0].createElement('script');
  scriptTag.type = 'text/javascript'; 
  scriptTag.async = true;
  scriptTag.src = 'http://d3js.org/d3.v3.min.js';
  scriptTag.onreadystatechange = function () {
    if (this.readyState == 'complete') onScriptLoad();
  }
  scriptTag.onload = onScriptLoad;

  var s = $document[0].getElementsByTagName('body')[0];
  s.appendChild(scriptTag);

  return d3service;
}]);
angular.module('d3AngularApp', ['d3'])
.directive('d3Bars', ['$window', '$timeout', 'd3Service', 
  function($window, $timeout, d3Service) {
    return {
      restrict: 'A',
      scope: {
        data: '=',
        onClick: '&'
      },
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {

          var renderTimeout;
          var margin = parseInt(attrs.margin) || 20,
              barHeight = parseInt(attrs.barHeight) || 20,
              barPadding = parseInt(attrs.barPadding) || 5;

          var svg = d3.select(ele[0])
            .append('svg')
            .style('width', '100%');

          $window.onresize = function() {
            scope.$apply();
          };

          scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            scope.render(scope.data);
          });

          scope.$watch('data', function(newData) {
            scope.render(newData);
          }, true);

          scope.render = function(data) {
            svg.selectAll('*').remove();

            if (!data) return;
            if (renderTimeout) clearTimeout(renderTimeout);

            renderTimeout = $timeout(function() {
              var width = d3.select(ele[0]).node().offsetWidth - margin,
                  height = scope.data.length * (barHeight + barPadding),
                  color = d3.scale.category20(),
                  xScale = d3.scale.linear()
                    .domain([0, d3.max(data, function(d) {
                      return d.score;
                    })])
                    .range([0, width]);

              svg.attr('height', height);

              svg.selectAll('rect')
                .data(data)
                .enter()
                  .append('rect')
                  .on('click', function(d,i) {
                    return scope.onClick({item: d});
                  })
                  .attr('height', barHeight)
                  .attr('width', 140)
                  .attr('x', Math.round(margin/2))
                  .attr('y', function(d,i) {
                    return i * (barHeight + barPadding);
                  })
                  .attr('fill', function(d) {
                    return color(d.score);
                  })
                  .on('click', function(d, i) {
                    return scope.onClick({item: d});
                  })
                  .transition()
                    .duration(1000)
                    .attr('width', function(d) {
                      return xScale(d.score);
                    });
              svg.selectAll('text')
                .data(data)
                .enter()
                  .append('text')
                  .attr('fill', '#fff')
                  .attr('y', function(d,i) {
                    return i * (barHeight + barPadding) + 15;
                  })
                  .attr('x', 15)
                  .text(function(d) {
                    return d.name + " (" + d.score + ")";
                  });
            }, 100);
          };
        });
      }}
}])
.directive('d3Arc', ['$window', '$timeout', 'd3Service', 
  function($window, $timeout, d3Service) {
    return {
      restrict: 'A',
      scope: {
        onClick: '&'
      },
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {

          var arc = d3.svg.arc()
            .innerRadius(40)
            .outerRadius(60)
            .startAngle(0),
            width = 150,
            height = 150,
            pi = 2 * Math.PI;

          var svg = d3.select(ele[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
              .attr('transform', 
                'translate('+width/2+','+height/2+')');

          scope.render = function(data) {
            svg.selectAll('*').remove();

          var background = svg.append("path")
              .datum({endAngle: pi})
              .style("fill", "#ddd")
              .attr("d", arc);

          var foreground = svg.append('path')
              .datum({endAngle: .127 * pi})
              .style('fill', 'orange')
              .attr('d', arc);
          
            setTimeout(function() {
              foreground.transition()
                .duration(1500)
                .call(arcTween, Math.random() * pi)
            }, 1500);

            function arcTween(transition, angle) {
              transition.attrTween('d', function(d) {
                var interpolate = d3.interpolate(d.endAngle, angle);
                return function(t) {
                  d.endAngle = interpolate(t);
                  return arc(d);
                }
              });
            }
          };
          scope.render();
        });
      }}
}])
.controller('MainCtrl2', ['$scope', function($scope) {
  $scope.data = [
    {name: "Greg", score: 98},
    {name: "Ari", score: 96},
    {name: 'Q', score: 75},
    {name: "Loser", score: 48}
  ];
}])
.controller('MainCtrl3', ['$scope', function($scope) {
  $scope.data = [
    {name: "Greg", score: 98},
    {name: "Ari", score: 96},
    {name: 'Q', score: 75},
    {name: "Loser", score: 48}
  ];
}])
.controller('MainCtrl4', ['$scope', function($scope) {
  $scope.showDetailPanel = false;

  $scope.onClick = function(item) {
    $scope.$apply(function() {
      if (!$scope.showDetailPanel)
        $scope.showDetailPanel = true;
      $scope.detailItem = item;
    });
  };

  $scope.data = [
    {name: "Greg", score: 98},
    {name: "Ari", score: 96},
    {name: 'Q', score: 75},
    {name: "Loser", score: 48}
  ];
}])
.controller('MainCtrl5', ['$scope', '$http', 
  function($scope, $http) {
    $scope.onClick = function(item) {
      $scope.$apply(function() {
        if (!$scope.showDetailPanel)
          $scope.showDetailPanel = true;
        $scope.detailItem = item;
      });
    };

    $http({
      method: 'JSONP',
      url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=JSON_CALLBACK&num=10&q=' +
        encodeURIComponent('http://sports.espn.go.com/espn/rss/espnu/news')
    }).then(function(data, status) {
      var entries = data.data.responseData.feed.entries,
          wordFreq = {},
          data = [];

      angular.forEach(entries, function(article) {
        angular.forEach(article.content.split(' '), function(word) {
          if (word.length > 3) {
            if (!wordFreq[word]) { 
              wordFreq[word] = {score: 0, link: article.link}; 
            }
            wordFreq[word].score += 1;
          }
        });
      });
      for (key in wordFreq) {
        data.push({
          name: key, 
          score: wordFreq[key].score,
          link: wordFreq[key].link
        });
      }
      data.sort(function(a,b) { return b.score - a.score; })
      $scope.data = data.slice(0, 5);
    });
}])

.controller('MainCtrl', ['$scope', '$timeout', '$http',
  function($scope, $timeout, $http) {
    $scope.data = [
      {name: 'Ari', score: 94},
      {name: 'Greg', score: 90},
      {name: 'Alf', score: 67},
      {name: 'Q', score: 44},
      {name: 'Sean', score: 30}
    ];
}]);
