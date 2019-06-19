const path = require('path');

module.exports = {
	mode: 'production',
  entry: './src/Asset1.js',
	resolve: {
		modules: [
			path.resolve(__dirname, 'untracked/wgbh-skydiagram/src'),
			path.resolve(__dirname, 'node_modules'),
		],
	},
  output: {
    filename: 'Asset1.js',
    path: path.resolve(__dirname, 'dist/src')
  },
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
};

