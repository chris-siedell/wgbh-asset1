/*
webpack.config.js
wgbh-asset1
astro.unl.edu
2019-08-16
*/


const COMPONENT_NAME = 'LunarPhasesAsset1';
const VERSION_TAG = '_v1-1';


const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
	mode: 'production',
  entry: './src/' + COMPONENT_NAME + '.js',
  output: {
    filename: COMPONENT_NAME + VERSION_TAG + '.js',
    path: path.resolve(__dirname, 'dist')
  },
	resolve: {
		modules: [
			path.resolve(__dirname, 'untracked/wgbh-skydiagram/src'),
			path.resolve(__dirname, 'untracked/wgbh-lunar-timekeeper/src'),
			path.resolve(__dirname, 'untracked/wgbh-ui/src'),
			path.resolve(__dirname, 'node_modules'),
		],
	},
	module: {
		rules: [
			{	test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{	test: /\.svg|jpg|png$/,
				use: [	
					{	loader: 'file-loader',
						options: {
							name: COMPONENT_NAME + VERSION_TAG + '/[name].[ext]',
						},
					},
				],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{	from: 'static', to: ''},
		]),
	],
};

