module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        shell: {
            options: {
                stdout: true
            },
            selenium: {
                command: './selenium/start',
                options: {
                    stdout: false,
                    async: true
                }
            },
            protractor_install: {
                command: 'node ./node_modules/protractor/bin/webdriver-manager update'
            },
            npm_install: {
                command: 'npm install'
            },
            bower_install: {
                command: 'bower install'
            },
            bootstrap_font_copy: {
                command: 'cp -R bower_components/bootstrap/dist/fonts app/fonts'
            },
            www_server_copy: {
                command: 'cp -R ./app /Volumes/park573/www/app/gatherplot'
            },
            firebase: {
                command: [
                    'firebase deploy',
                    'firebase open'
                ].join('&&')
            }


        },

        connect: {
            options: {
                base: 'app/'
            },
            webserver: {
                options: {
                    port: 8887,
                    keepalive: true
                }
            },
            devserver: {
                options: {
                    port: 8887
                }
            },
            testserver: {
                options: {
                    port: 9999
                }
            },
            coverage: {
                options: {
                    base: 'coverage/',
                    port: 5555,
                    keepalive: true
                }
            }
        },

        protractor: {
            options: {
                keepAlive: true,
                configFile: "./test/protractor.conf.js"
            },
            singlerun: {},
            auto: {
                keepAlive: true,
                options: {
                    args: {
                        seleniumPort: 4444
                    }
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'app/scripts/{,*/}*.js'
            ]
        },

        concat: {
            styles: {
                dest: './app/assets/app.css',
                src: [
                    // 'bower_components/jquery-ui/themes/base/jquery-ui.css',
                    'bower_components/bootstrap/dist/css/bootstrap.css',
                    'app/styles/gatherplot.css',
                    'bower_components/angular-ui-grid/ui-grid.css',
                    //place your Stylesheet files here
                ]
            },
            scripts: {
                options: {
                    separator: ';'
                },
                dest: './app/assets/app.js',
                src: [
                    'bower_components/d3/d3.js',
                    'bower_components/jquery/jquery.js',
                    'bower_components/jquery-ui/ui/jquery-ui.js',
                    'bower_components/angular/angular.js',
                    'bower_components/angular-route/angular-route.js',
                    'bower_components/angular-sanitize/angular-sanitize.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                    'bower_components/angular-ui-sortable/sortable.js',
                    'bower_components/qrcode-generator/js/qrcode.js',
                    'bower_components/angular-qrcode/qrcode.js',
                    'bower_components/angular-ui-grid/ui-grid.js',
                    'app/scripts/app.js',
                    'app/scripts/gatherLensApp.js',
                    'app/scripts/services/**/*.js',
                    'app/scripts/controllers/**/*.js',
                    'app/scripts/filters/**/*.js',
                    //place your JavaScript files here
                ]
            },
        },

        watch: {
            options: {
                livereload: 7777
            },
            assets: {
                files: ['app/styles/**/*.css', 'app/scripts/**/*.js'],
                tasks: ['concat']
            },
            protractor: {
                files: ['app/scripts/**/*.js', 'test/e2e/**/*.js'],
                tasks: ['protractor:auto']
            }
        },

        open: {
            devserver: {
                path: 'http://localhost:8887'
            },
            coverage: {
                path: 'http://localhost:5555'
            },
            PurdueServer: {
                path: 'http://web.ics.purdue.edu/~park573/app/gatherplot/jitter.html'
            }
        },

        karma: {
            unit: {
                configFile: './test/karma-unit.conf.js',
                autoWatch: false,
                singleRun: true
            },
            unit_auto: {
                configFile: './test/karma-unit.conf.js',
                autoWatch: true,
                singleRun: false
            },
            unit_coverage: {
                configFile: './test/karma-unit.conf.js',
                autoWatch: false,
                singleRun: true,
                reporters: ['progress', 'coverage'],
                preprocessors: {
                    'app/scripts/*.js': ['coverage']
                },
                coverageReporter: {
                    type: 'html',
                    dir: 'coverage/'
                }
            },
        }
    });

    //single run tests
    grunt.registerTask('test', ['jshint', 'test:unit', 'test:e2e']);
    grunt.registerTask('test:unit', ['karma:unit']);
    grunt.registerTask('test:e2e', ['connect:testserver', 'protractor:singlerun']);

    //autotest and watch tests
    grunt.registerTask('autotest', ['karma:unit_auto']);
    grunt.registerTask('autotest:unit', ['karma:unit_auto']);
    grunt.registerTask('autotest:e2e', ['connect:testserver', 'shell:selenium', 'watch:protractor']);

    //coverage testing
    grunt.registerTask('test:coverage', ['karma:unit_coverage']);
    grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

    //installation-related
    grunt.registerTask('install', ['update', 'shell:protractor_install']);
    grunt.registerTask('update', ['shell:npm_install', 'shell:bower_install', 'shell:bootstrap_font_copy', 'concat']);

    //defaults
    grunt.registerTask('default', ['dev']);

    //development
    grunt.registerTask('dev', ['update', 'connect:devserver', 'open:devserver', 'watch:assets']);

    //development
    grunt.registerTask('purdue', ['shell:www_server_copy', 'open:PurdueServer']);

    //development
    grunt.registerTask('firebase', ['shell:firebase']);




    //server daemon
    grunt.registerTask('serve', ['connect:webserver']);
};
