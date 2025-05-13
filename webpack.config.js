const path = require('path');

module.exports = {
  entry: {
    // Main frontend entry
    'product-estimator': './src/js/index.js',

    // Admin entry point including all module scripts
    'admin/product-estimator-admin': './src/js/admin.js',
    
    // Admin styles entry
    'admin/admin-styles': './src/styles/admin/Index.scss'
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
      '@admin': path.resolve(__dirname, 'src/js/admin'),
      '@templates': path.resolve(__dirname, 'src/templates'), // Add templates alias
      '@styles': path.resolve(__dirname, 'src/styles')
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
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'admin-styles-bundled.css',
              outputPath: '../../admin/css/'
            }
          },
          {
            loader: 'sass-loader',
            options: {
              // Use modern API
              sassOptions: {
                outputStyle: 'compressed'
              },
              api: 'modern'
            }
          }
        ]
      },
      {
        // Add the HTML loader for handling template imports
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                minifyJS: true,
                minifyCSS: true
              }
            }
          }
        ]
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