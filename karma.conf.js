module.exports = function(config) {
    config.set({
        basePath : './',

        files : [
            'node_modules/babel-polyfill/dist/polyfill.js',
            'build/index.js',
            'build/tests.js'
        ],

        //exclude: ['app/lib/angular/angular-scenario.js'],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['PhantomJS'],

        logLevel: config.LOG_DEBUG,

        client: {
            captureConsole: true,
        },

        plugins : [
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    })
};