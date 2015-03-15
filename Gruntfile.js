// Generated on 2015-02-17 using generator-angularfire 0.9.1-4
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9001,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            options: {
                cwd: ''
            },
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                ignorePath: /\.\.\//
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/scripts/{,*/}*.js',
                    '<%= yeoman.dist %>/styles/{,*/}*.css',
                    '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/scripts/scripts.js': [
        //         '<%= yeoman.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: false,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: false,
                    removeCommentsFromCDATA: false,
                    removeOptionalTags: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: ['*.js', '!oldieshim.js'],
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'templates/partials/{,*/}*.html',
                        'images/{,*/}*.{webp}',
                        'fonts/{,*/}*.*',
                        'data/{,*/}*.*'

                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                }, {
                    expand: true,
                    cwd: 'bower_components/bootstrap/dist',
                    src: 'fonts/*',
                    dest: '<%= yeoman.dist %>'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },

        shell: {
            options: {
                stderr: false
            },
            target: {
                command: [
                            'firebase deploy', 
                            'firebase open'
                        ].join('&&')
            }
        }
    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'cdnify',
        'cssmin',
        // 'uglify',
        'filerev',
        'usemin',
        // 'htmlmin'
        'shell'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'serve'
    ]);
};



// module.exports = function(grunt) {

//     require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

//     grunt.initConfig({
//         shell: {
//             options: {
//                 stdout: true
//             },
//             selenium: {
//                 command: './selenium/start',
//                 options: {
//                     stdout: false,
//                     async: true
//                 }
//             },
//             protractor_install: {
//                 command: 'node ./node_modules/protractor/bin/webdriver-manager update'
//             },
//             npm_install: {
//                 command: 'npm install'
//             },
//             bower_install: {
//                 command: 'bower install'
//             },
//             bootstrap_font_copy: {
//                 command: 'cp -R bower_components/bootstrap/dist/fonts app/fonts'
//             },
//             www_server_copy: {
//                 command: 'cp -R ./app /Volumes/park573/www/app/gatherplot'
//             },
//             firebase: {
//                 command: [
//                     'firebase deploy',
//                     'firebase open'
//                 ].join('&&')
//             }


//         },

//         connect: {
//             options: {
//                 base: 'app/'
//             },
//             webserver: {
//                 options: {
//                     port: 8887,
//                     keepalive: true
//                 }
//             },
//             devserver: {
//                 options: {
//                     port: 8887
//                 }
//             },
//             testserver: {
//                 options: {
//                     port: 9999
//                 }
//             },
//             coverage: {
//                 options: {
//                     base: 'coverage/',
//                     port: 5555,
//                     keepalive: true
//                 }
//             }
//         },

//         protractor: {
//             options: {
//                 keepAlive: true,
//                 configFile: "./test/protractor.conf.js"
//             },
//             singlerun: {},
//             auto: {
//                 keepAlive: true,
//                 options: {
//                     args: {
//                         seleniumPort: 4444
//                     }
//                 }
//             }
//         },

//         jshint: {
//             options: {
//                 jshintrc: '.jshintrc'
//             },
//             all: [
//                 'Gruntfile.js',
//                 'app/scripts/{,*/}*.js'
//             ]
//         },

//         concat: {
//             styles: {
//                 dest: './app/assets/app.css',
//                 src: [
//                     // 'bower_components/jquery-ui/themes/base/jquery-ui.css',
//                     'bower_components/bootstrap/dist/css/bootstrap.css',
//                     'app/styles/gatherplot.css',
//                     'bower_components/angular-ui-grid/ui-grid.css',
//                     //place your Stylesheet files here
//                 ]
//             },
//             scripts: {
//                 options: {
//                     separator: ';'
//                 },
//                 dest: './app/assets/app.js',
//                 src: [
//                     'bower_components/d3/d3.js',
//                     'bower_components/jquery/jquery.js',
//                     'bower_components/jquery-ui/ui/jquery-ui.js',
//                     'bower_components/angular/angular.js',
//                     'bower_components/angular-route/angular-route.js',
//                     'bower_components/angular-sanitize/angular-sanitize.min.js',
//                     'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
//                     'bower_components/angular-ui-sortable/sortable.js',
//                     'bower_components/qrcode-generator/js/qrcode.js',
//                     'bower_components/angular-qrcode/qrcode.js',
//                     'bower_components/angular-ui-grid/ui-grid.js',
//                     'app/scripts/app.js',
//                     'app/scripts/gatherLensApp.js',
//                     'app/scripts/services/**/*.js',
//                     'app/scripts/controllers/**/*.js',
//                     'app/scripts/filters/**/*.js',
//                     //place your JavaScript files here
//                 ]
//             },
//         },

//         watch: {
//             options: {
//                 livereload: 7777
//             },
//             assets: {
//                 files: ['app/styles/**/*.css', 'app/scripts/**/*.js'],
//                 tasks: ['concat']
//             },
//             protractor: {
//                 files: ['app/scripts/**/*.js', 'test/e2e/**/*.js'],
//                 tasks: ['protractor:auto']
//             }
//         },

//         open: {
//             devserver: {
//                 path: 'http://localhost:8887'
//             },
//             coverage: {
//                 path: 'http://localhost:5555'
//             },
//             PurdueServer: {
//                 path: 'http://web.ics.purdue.edu/~park573/app/gatherplot/jitter.html'
//             }
//         },

//         karma: {
//             unit: {
//                 configFile: './test/karma-unit.conf.js',
//                 autoWatch: false,
//                 singleRun: true
//             },
//             unit_auto: {
//                 configFile: './test/karma-unit.conf.js',
//                 autoWatch: true,
//                 singleRun: false
//             },
//             unit_coverage: {
//                 configFile: './test/karma-unit.conf.js',
//                 autoWatch: false,
//                 singleRun: true,
//                 reporters: ['progress', 'coverage'],
//                 preprocessors: {
//                     'app/scripts/*.js': ['coverage']
//                 },
//                 coverageReporter: {
//                     type: 'html',
//                     dir: 'coverage/'
//                 }
//             },
//         }
//     });

//     //single run tests
//     grunt.registerTask('test', ['jshint', 'test:unit', 'test:e2e']);
//     grunt.registerTask('test:unit', ['karma:unit']);
//     grunt.registerTask('test:e2e', ['connect:testserver', 'protractor:singlerun']);

//     //autotest and watch tests
//     grunt.registerTask('autotest', ['karma:unit_auto']);
//     grunt.registerTask('autotest:unit', ['karma:unit_auto']);
//     grunt.registerTask('autotest:e2e', ['connect:testserver', 'shell:selenium', 'watch:protractor']);

//     //coverage testing
//     grunt.registerTask('test:coverage', ['karma:unit_coverage']);
//     grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

//     //installation-related
//     grunt.registerTask('install', ['update', 'shell:protractor_install']);
//     grunt.registerTask('update', ['shell:npm_install', 'shell:bower_install', 'shell:bootstrap_font_copy', 'concat']);

//     //defaults
//     grunt.registerTask('default', ['dev']);

//     //development
//     grunt.registerTask('dev', ['update', 'connect:devserver', 'open:devserver', 'watch:assets']);

//     //development
//     grunt.registerTask('purdue', ['shell:www_server_copy', 'open:PurdueServer']);

//     //development
//     grunt.registerTask('firebase', ['shell:firebase']);




//     //server daemon
//     grunt.registerTask('serve', ['connect:webserver']);
// };



