const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Is this a development build?
const isProduction = process.env.NODE_ENV === 'production';

// Base configuration object
const config = {
  // Set mode based on environment
  mode: isProduction ? 'production' : 'development',

  // Enable source maps for development
  devtool: isProduction ? false : 'source-map',

  // Entry points for our code
  entry: {
    'admin': './src/js/admin.js',
    'public': './src/js/public.js',
    'admin-style': './src/scss/admin.scss',
    'public-style': './src/scss/public.scss'
  },

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'assets/dist'),
    filename: 'js/[name].js',
    clean: true
  },

  // Module rules for processing different file types
  module: {
    rules: [
      // JavaScript processing
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

      // SCSS/CSS processing
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: !isProduction
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer'
                ]
              },
              sourceMap: !isProduction
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProduction,
              sassOptions: {
                outputStyle: 'expanded'
              }
            }
          }
        ]
      },

      // Image processing
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      },

      // Font processing
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      }
    ]
  },

  // Plugins configuration
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    })
  ],

  // Optimization configuration
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // External dependencies
  externals: {
    jquery: 'jQuery',
    lodash: '_',
    wp: 'wp'
  },

  // Performance hints
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  // Watch options for development
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  },

  // Stats configuration
  stats: {
    children: false,
    colors: true,
    modules: false,
    entrypoints: false
  }
};

// Development-specific configuration
if (!isProduction) {
  config.devServer = {
    static: {
      directory: path.join(__dirname, 'assets/dist')
    },
    compress: true,
    port: 9000,
    hot: true
  };
}

// Export the configuration
module.exports = config;
