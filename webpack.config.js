const path = require('path');

module.exports = {
	mode: 'development',
  entry: './src/Asset1.js',
  output: {
    filename: 'Asset1.js',
    path: path.resolve(__dirname, 'dist')
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

