var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const isProduction = process.argv.indexOf('-p') !== -1;

const postcss = require('postcss');
const presetEnv = require('postcss-preset-env');
const postcssImport = require("postcss-import");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const cssFilename = 'static/css/[name].[contenthash:8].css';

module.exports = {
    optimization: {},
    bail: true,

    devtool: 'source-map',

    entry: './src/index.js',
    mode: !isProduction ? 'development' : 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        chunkFilename: '[id].js',
        publicPath: ''
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        })
    ],

    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: (loader) => [
                                postcssImport(),
                                presetEnv({preserve: false, autoprefixer: true}),
                                // require('postcss-rtl')({prefixType: 'attribute'}),
                            ]
                        }
                    }

                ]
            }
        ]
    },
};


if (isProduction) {
    module.exports.optimization.minimizer = [
        new UglifyJsPlugin({
            sourceMap: true,
            extractComments: 'all'
        }),
        new OptimizeCSSAssetsPlugin({})
    ]
}