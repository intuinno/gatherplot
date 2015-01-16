(function() {
    'use strict';

    // create the angular app
    angular.module('gatherLensApp', [
        'gatherLensApp.controllers',
        'gatherLensApp.directives'
    ]);

    // setup dependency injection
    angular.module('gatherLensApp.controllers', []);
    angular.module('gatherLensApp.directives', [ 'ui.bootstrap', 'ui.sortable']);


}());