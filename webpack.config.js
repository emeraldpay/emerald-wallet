var fs = require("fs");
var path = require('path');
var webpack = require('webpack');
var srcDir = path.join(__dirname, 'src');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
    entry: {
        index: path.join(srcDir, 'index.js'),
        tests: path.join(srcDir, 'tests.js'),
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({name: "index", filename: "index.js"}),
        new ExtractTextPlugin({filename: "[name].css"}),
        new CopyWebpackPlugin([
            { from: path.join(srcDir, 'index.html'), to: "./" },
        ], {copyUnmodified: true})
    ],
    output: {
        path: path.join(__dirname, "./build/"),
        filename: '[name].js'
    },
    resolve: {
        modules: [
            path.resolve(srcDir),
            path.join(__dirname, 'node_modules')
        ],
        alias: {
            'babel-polyfill': path.join(__dirname, 'babel-polyfill/dist/polyfill.js')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|es6)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["es2015", "react", "stage-2"]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader",
                            options: {"includePaths": [path.resolve(__dirname, "./node_modules/compass-mixins/lib")]}
                        }
                    ],
                }),
                
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ["css-loader", "less-loader"]
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ["css-loader?modules"]
                }),
                include: /flexboxgrid/
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: "file-loader",
                    options: {name: "images/[name].[ext]"}
                }
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: "application/font-woff",
                        name: "fonts/[name].[ext]"
                    }
                },
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "fonts/[name].[ext]"
                    }
                },
            }
        ]
    }
};


module.exports = config;
