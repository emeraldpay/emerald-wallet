const path = require('path');
const webpack = require('webpack');

const config = {
    target: 'electron-main',
    externals: [{
        'electron-store': 'electron-store',
    }],
    entry: {
        main: path.join(__dirname, 'electron', 'main.js'),
    },
    resolve: {
        modules: [
            path.resolve(path.join(__dirname, 'electron')),
            path.join(__dirname, 'node_modules'),
        ],
        alias: {
            'babel-polyfill': path.join(__dirname, 'babel-polyfill/dist/polyfill.js'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|es6)$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'shebang-loader',
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015', 'react', 'stage-2'],
                        },
                    }
                ]
            },
        ],
        // http://andrewhfarmer.com/aws-sdk-with-webpack/
        noParse: [
            /aws\-sdk/,
            /node\-gyp\/lib/,
            /node\-pre\-gyp\/lib/
        ]
    },

    output: {
        path: path.join(__dirname, 'electron'),
        filename: 'webpack-main.js',
        libraryTarget: 'commonjs2',
    },

    plugins: [
        // NODE_ENV should be production so that modules do not perform certain development checks
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],

    /**
     * Disables webpack processing of __dirname and __filename.
     * If you run the bundle in node.js it falls back to these values of node.js.
     * https://github.com/webpack/webpack/issues/2010
     */
    node: {
        __dirname: false,
        __filename: false,
    },
};

module.exports = config;
