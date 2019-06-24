/*
webpack.config.js
wgbh-asset1
astro.unl.edu
2019-06-23
*/


const path = require('path');

const OUTPUT_COMPONENT_BASE_PATH = 'Asset1';


module.exports = {
	mode: 'production',
  entry: './src/Asset1.js',
  output: {
    filename: 'Asset1.js',
    path: path.resolve(__dirname, 'dist/' + OUTPUT_COMPONENT_BASE_PATH)
  },
	resolve: {
		modules: [
			path.resolve(__dirname, 'untracked/wgbh-skydiagram/src'),
			path.resolve(__dirname, 'untracked/wgbh-lunar-timekeeper/src'),
			path.resolve(__dirname, 'node_modules'),
		],
	},
	module: {
		rules: [
			{	test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{	test: /\.(svg)$/,
				use: [	
					{	loader: 'file-loader',
						options: {
							name: '[folder]/[name].[ext]',
							publicPath: OUTPUT_COMPONENT_BASE_PATH,
						},
					},
				],
			},
		],
	},
};

