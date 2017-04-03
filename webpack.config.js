var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

//const extractCSS = new ExtractTextPlugin('./stylesheets/[name].css');
//const extractLESS = new ExtractTextPlugin('./stylesheets/[name].less');

//var babelPolyfill = require(path.join(__dirname, 'node_modules/babel-polyfill/lib'));

module.exports = {
    devtool: 'cheap-source-map',
    context: path.resolve(__dirname, 'frontend'),
    entry: {
        //jQuery: "../jquery.min.js",
        //less: 'stylesheets/style.less',
        //babelPolyfill: "babel-polyfill",
        style: './stylesheets/style.less'
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].js',
        //publicPath: '/public/',
        library: '[name]'
    },//[chunkhash]
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")]
    },
    resolveLoader: {
         modules: ["web_loaders", "web_modules", "node_loaders", "node_modules"],
    },

    module: {
      rules: [
        /*{
            exclude: [/\/node_modules/,/\/frontend\/stylesheets/],
            loader: "babel-loader",
            options: {
                presets: [['es2015', {modules: false}], "es2016", "es2017", "react"],
                plugins: ['transform-runtime'],
            },
        },*/
        //{
        //use: extractLESS.extract(["css-loader", "less-loader"]
                /*{
                    fallback: "style-loader",
                    use: ["css-loader","autoprefixer-loader?browsers=last 2 versions","less-loader"],
                    publicPath: "./public/stylesheets",
                }),*/
            //loader: "style!css!autoprefixer?browsers=last 2 versions!less",//resolve url по умолчанию
        //},
        /*{
            test: /\.css$/,
            use: extractCSS.extract(["css-loader"]),
            //loader: "style!css!autoprefixer?browsers=last 2 versions",
        },*/
        {
        test: /\.less$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ["css-loader", "autoprefixer-loader", "less-loader"]//
            })
        },
        /*{
            test: /\.(png|jpg|svg)$/,
            use: 'url-loader'
        },*/
        {
            test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
            use: "file-loader?name=../[path][name].[ext]",
        }
      ]
    },
    plugins: [
        
        /*new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            //'_':          'lodash',
            'ReactDOM': 'react-dom',
            'React': 'react',
            'Component': 'react',
            'PropTypes': 'react',
            'createStore': 'redux',
            'Provider': 'react-redux',
            //'cssModule':  'react-css-modules',
        }),*/
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        //extractCSS,
        new ExtractTextPlugin({
            filename: './stylesheets/[name].css'
        }),
        /*new webpack.optimize.CommonsChunkPlugin({
            name: "commons",
            filename: "commons.js",
            minChunks: 2,
            path: path.resolve(__dirname, "public"),
            //chunks: ["index"], из каких выносить, можно подключить второй для других
        }),*/
        /*new webpack.optimize.UnglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
            }
        })*/
        //--optimize-minimize
    ],
    watch: true,
}