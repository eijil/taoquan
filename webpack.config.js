var webpack = require('webpack'),
	ExtractTextWebpackPlugin = require('extract-text-webpack-plugin'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	HtmlWebpackPlugin = require('html-webpack-plugin');

var minify = process.env.ENV == 'prod'; //是否压缩

module.exports = {
	entry : {
		game : './src/js/game.js'
	},
	output : {
		path : __dirname + '/dist',
		filename : 'js/[name].js'
	},
	module : {
		rules : [{
			test : /\.css$/,
			use : ExtractTextWebpackPlugin.extract({
				use : [
					'css-loader?-url&-reduceTransforms',
					'postcss-loader'
				]
			})
		}]
	},
	plugins : [
		new webpack.BannerPlugin('v0.13'),
		new ExtractTextWebpackPlugin('css/[name].css'),
		new CopyWebpackPlugin([
			{
				from : './src/img',
				to : 'img',
				ignore : ['.gitkeep']
			},{
				from : './src/js/conf.js',
				to : 'js'
			},{
				from : './src/js/app.bundle.js',
				to : 'js/main.js'
			},{
				from : './src/plugin',
				to : 'plugin',
				ignore : ['.gitkeep']
			}
		]),
		new HtmlWebpackPlugin({
			inject : false,
			minify : minify ? {
				collapseWhitespace : true,
				minifyCSS : true,
				minifyJS : true,
				removeComments : true
			} : false,
			template : './src/index.html'
		})
	]
};