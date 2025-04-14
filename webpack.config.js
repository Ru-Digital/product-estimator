const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'product-estimator.bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
