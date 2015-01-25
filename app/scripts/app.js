(function() {
    'use strict';

    // create the angular app
    angular.module('myApp', [
        'myApp.controllers',
        'myApp.directives',
        'ngRoute',
        'firebase'
    ]).config(['$routeProvider', 
        function($routeProvider) {
            $routeProvider.
                when('/demo', {
                    templateUrl: '../templates/partials/index_full.html',
                    controller: 'DemoCtrl'
                }).
                when('/show/:dataset/:xDim/:yDim/:colorDim/:relativeMode', {
                    templateUrl: '../templates/partials/index_simple.html',
                    controller: 'ShowCtrl'
                }).
                when('/dropbox/:dropbox_key/:dropbox_filename', {
                    templateUrl: '../templates/partials/index_dropbox.html',
                    controller: 'DropboxCtrl'
                }).
                otherwise({
                    redirectTo: '/demo'
                });


        }]);;

    // setup dependency injection
    angular.module('myApp.controllers', []);
    angular.module('myApp.directives', [ 'ui.bootstrap', 'ui.sortable']);

    

}());