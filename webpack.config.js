const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const srcDir = path.join(__dirname, 'src');
const electronDir = path.join(__dirname, 'electron');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const forElectron = process.argv.indexOf('--for-electron') >= 0;

const config = {
    target: 'electron-renderer', // 'web',
    entry: {
        index: path.join(srcDir, 'index.js'),
        // tests: path.join(srcDir, 'tests.js'),
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({name: 'index', filename: 'index.js'}),
        new ExtractTextPlugin({filename: '[name].css'}),
        new CopyWebpackPlugin([
            { from: path.join(srcDir, 'index.html'), to: './' },
        ], {copyUnmodified: true}),
    ],
    output: {
        path: path.join(__dirname, 'app'),
        filename: '[name].js',
    },
    resolve: {
        // browser must be the first to load some npm packages correctly
        mainFields: ['browser', 'module', 'main'],
        modules: [
            path.resolve(srcDir),
            path.join(__dirname, 'electron'),
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
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react', 'stage-2'],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                        },
                    ],
                }),
                exclude: [/font-awesome/],
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'less-loader'],
                }),
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?modules'],
                }),
                include: [/flexboxgrid/, /typeface-rubik/],
            },
            {
                test: /font-awesome.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'sass-loader',
                        },
                    ],
                }),
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {name: 'images/[name].[ext]'},
                },
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff',
                        name: 'fonts/[name].[ext]',
                    },
                },
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]',
                    },
                },
            },
        ],
    },
};


module.exports = config;
