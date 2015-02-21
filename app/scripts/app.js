(function() {
    'use strict';

    // create the angular app
    angular.module('myApp', [
            'myApp.controllers',
            'myApp.directives',
            'myApp.services',
            'ngRoute',
            'firebase',
            'firebase.utils',
            'simpleLogin',
            'monospaced.qrcode'
        ]).config(['$routeProvider', 'SECURED_ROUTES',
            function($routeProvider, SECURED_ROUTES) {

                $routeProvider.whenAuthenticated = function(path, route) {

                    route.resolve = route.resolve || {};

                    route.resolve.user = ['authRequired', function(authRequired) {
                        return authRequired();
                    }];

                    $routeProvider.when(path, route);
                    SECURED_ROUTES[path] = true;

                    return $routeProvider;
                };

            }
        ])
        .config(['$routeProvider',
            function($routeProvider) {
                $routeProvider
                    .when('/', {
                        templateUrl: '../templates/partials/index_full.html',
                        controller: 'DemoCtrl'
                    })
                    .when('/demo', {
                        templateUrl: '../templates/partials/index_full.html',
                        controller: 'DemoCtrl'
                    })
                    .when('/show/:dataset/:xDim/:yDim/:colorDim/:relativeMode', {
                        templateUrl: '../templates/partials/index_simple.html',
                        controller: 'ShowCtrl'
                    })
                    .when('/dropbox/:dropbox_key/:dropbox_filename', {
                        templateUrl: '../templates/partials/index_dropbox.html',
                        controller: 'DropboxCtrl'
                    })
                    .when('/login', {
                        templateUrl: '../templates/partials/login.html',
                        controller: 'LoginCtrl'
                    })
                    .whenAuthenticated('/account', {
                        templateUrl: '../templates/partials/account.html',
                        controller: 'AccountCtrl'
                    })
                    .when('/load/:csvKey/:comment?', {
                        templateUrl: '../templates/partials/index_load.html',
                        controller: 'LoadCtrl',
                        reloadOnSearch: false
                    })
                    .when('/matrix/:csvKey', {
                        templateUrl: '../templates/partials/index_matrix.html',
                        controller: 'MatrixCtrl',
                        reloadOnSearch: false
                    })
                    .whenAuthenticated('/upload', {
                        templateUrl: '../templates/partials/index_upload.html',
                        controller: 'UploadCtrl'
                    })
                    .when('/browse', {
                        templateUrl: '../templates/partials/browse.html',
                        controller: 'BrowseCtrl'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });

            }
        ])
        .run(['$rootScope', '$location', 'simpleLogin', 'SECURED_ROUTES', 'loginRedirectPath',
            function($rootScope, $location, simpleLogin, SECURED_ROUTES, loginRedirectPath) {

                simpleLogin.watch(check, $rootScope);

                $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
                    // if (angular.isObject(err) && err.authRequired) {
                    if (err === 'AUTH_REQUIRED') {
                        $location.path(loginRedirectPath);
                    }
                });

                function check(user) {
                    if (!user && authRequired($location.path())) {
                        $location.path(loginRedirectPath).replace();
                    }
                }

                function authRequired(path) {
                    return SECURED_ROUTES.hasOwnProperty(path);
                }


            }
        ])
        .constant('SECURED_ROUTES', {});

    // setup dependency injection
    angular.module('myApp.controllers', []);
    angular.module('myApp.directives', ['ui.bootstrap', 'ui.sortable']);

    angular.module('myApp.services', ['firebase', 'firebase.utils', 'firebase.config']);



}());
