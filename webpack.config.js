const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// This configuration includes CSS source maps for easier debugging

module.exports = {
  entry: {
    // Main frontend entry
    'product-estimator': './src/js/index.js',

    // Admin entry point including all module scripts
    'product-estimator-admin': './src/js/admin.js',
    
    // Admin styles entry
    'admin-styles': './src/styles/admin/Index.scss',
    
    // Frontend styles entry
    'frontend-styles': './src/styles/frontend/Index.scss'
  },
  
  // Configure output paths - everything goes to public/js
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
    sourceMapFilename: '[file].map',
  },
  mode: process.env.NODE_ENV || 'development',

  // Only generate source maps in development mode
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

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
            loader: MiniCssExtractPlugin.loader,
            options: {
              // This allows source maps to correctly find the original scss files
              esModule: false,
              emit: true,
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded'
              }
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
      },
      {
        // Source map loader for existing source maps
        test: /\.js\.map$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        // Source map loader for CSS files
        test: /\.css$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  },
  optimization: {
    // Extract common dependencies into separate bundles
    splitChunks: {
      chunks: 'all',
      name: 'common'
    }
  },
  
  // Configure plugins
  plugins: [
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        // Output all CSS files to public/css with appropriate names
        const chunkName = pathData.chunk.name;
        if (chunkName === 'admin-styles') {
          return '../css/product-estimator-admin-bundled.css';
        }
        return '../css/product-estimator-frontend-bundled.css';
      },
      chunkFilename: '[id].css'
    })
  ]
};