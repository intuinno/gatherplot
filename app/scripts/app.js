(function() {
    'use strict';

    // create the angular app
    angular.module('myApp', [
        'myApp.controllers',
        'myApp.directives',
        'ngRoute'
    ]);

    // setup dependency injection
    angular.module('myApp.controllers', []);
    angular.module('myApp.directives', [ 'ui.bootstrap', 'ui.sortable']);


}());