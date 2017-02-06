var fs = require("fs");
var path = require('path');
var webpack = require('webpack');
var srcDir = path.join(__dirname, 'src');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var DirectoryNameAsMain = require('@elastic/webpack-directory-name-as-main');

var watch = process.argv.indexOf('--no-watch') < 0;

var config = {
    entry: {
        index: path.join(srcDir, 'index.js'),
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({name: "index", filename: "index.js"}),
        new ExtractTextPlugin("[name].css"),
        new webpack.ResolverPlugin([
            new DirectoryNameAsMain()
        ]),
        new CopyWebpackPlugin([
            { from: path.join(srcDir, 'index.html'), to: "./" },
        ], {copyUnmodified: true})
    ],
    output: {
        path: "./build/",
        filename: '[name].js'
    },
    resolve: {
        root: path.resolve(srcDir),
        modulesDirectories: [
            path.join(__dirname, 'node_modules')
        ],
        extensions: ['', '.js'],
        alias: {
            'babel-polyfill': path.join(__dirname, 'babel-polyfill/dist/polyfill.js')
        }
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx|es6)$/,
                exclude: /(node_modules|contracts)/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015", "react"]
                }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    'style',
                    `css!sass-loader?includePaths[]=` + path.resolve(__dirname, "./node_modules/compass-mixins/lib")
                )
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract(
                    'style',
                    `css!less`
                )
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            { test: /\.json/, loader: "json-loader" },
            { test: /\.(jpg|png|gif)$/, loader: "file-loader?name=images/[name].[ext]" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff&name=fonts/[name].[ext]" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?name=fonts/[name].[ext]" }
        ]
    }
};

var compiler = webpack(config);
var statOpts = {
    hash: true,
    timing: true,
    assets: true,
    chunks: false,
    children: false,
    version: false
};
if (watch) {
    compiler.watch({}, function (err, stats) {
            console.log(stats.toString(statOpts));
        }
    );
} else {
    compiler.run(function (err, stats) {
        console.log(stats.toString(statOpts));
    });
}