module.exports = {
  plugins: [
    'autoprefixer',
    [
      'postcss-preset-env',
      {
        stage: 3,
        features: {
          'nesting-rules': true,
          'custom-media-queries': true,
          'media-query-ranges': true
        },
        autoprefixer: {
          grid: true
        }
      }
    ],
    [
      'cssnano',
      {
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true
            },
            normalizeWhitespace: false
          }
        ]
      }
    ]
  ]
};
