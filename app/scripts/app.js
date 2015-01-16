(function() {
    'use strict';

    // create the angular app
    angular.module('myApp', [
        'myApp.controllers',
        'myApp.directives',
        'ngRoute'
    ]).config(['$routeProvider', 
        function($routeProvider) {
            $routeProvider.
                when('/demo', {
                    templateUrl: '../templates/partials/index_full.html',
                    controllers: 'DemoCtrl'
                }).
                when('/show/:dataset/:xDim/:yDim/:colorDim/:relativeMode', {
                    templateUrl: '../templates/partials/index_simple.html',
                    controllers: 'showCtrl'
                }).
                otherwise({
                    redirectTo: '/demo'
                });

        }]);;

    // setup dependency injection
    angular.module('myApp.controllers', []);
    angular.module('myApp.directives', [ 'ui.bootstrap', 'ui.sortable']);

    

}());