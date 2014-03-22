(function() {
    'use strict';

    // create the angular app
    angular.module('myApp', [
        // 'ngSlider',
        'myApp.controllers',
        'myApp.directives'
    ]);

    // setup dependency injection
    angular.module('myApp.controllers', []);
    angular.module('myApp.directives', [ 'ui.bootstrap', 'ui.sortable']);


}());