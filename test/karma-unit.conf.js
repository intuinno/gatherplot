module.exports = function(config) {
    config.set({
        files: [
            'bower_components/jquery/jquery.js',
            'bower_components/jquery-ui/ui/jquery-ui.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-ui-sortable/sortable.js',
            'app/scripts/app.js',
            'app/scripts/services/**/*.js',
            'app/scripts/directives/**/*.js',
            'app/scripts/controllers/**/*.js',
            'app/scripts/filters/**/*.js',
            'test/unit/**/*.js'
        ],
        basePath: '../',
        frameworks: ['jasmine'],
        reporters: ['progress'],
        browsers: ['Chrome'],
        autoWatch: false,
        singleRun: true,
        colors: true
    });
};