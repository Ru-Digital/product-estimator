const path = require('path');

module.exports = {
  entry: {
    // Main frontend entry
    'product-estimator': './src/js/index.js',

    // Admin entry point including all module scripts
    'admin/product-estimator-admin': './src/js/admin.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  mode: process.env.NODE_ENV || 'development',

  // Add the devtool property here for source maps
  devtool: 'source-map', // Or 'eval-source-map' for faster builds

  resolve: {
    // Add aliases for easier imports
    alias: {
      '@utils': path.resolve(__dirname, 'src/js/utils'),
      '@frontend': path.resolve(__dirname, 'src/js/frontend'),
      '@admin': path.resolve(__dirname, 'src/js/admin')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  optimization: {
    // Extract common dependencies into separate bundles
    splitChunks: {
      chunks: 'all',
      name: 'common'
    }
  }
};
