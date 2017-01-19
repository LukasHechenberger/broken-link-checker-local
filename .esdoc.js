const pkg = require('./package.json');

module.exports = {
  title: pkg.name,
  source: './src',
  destination: './docs/api',
  access: ['public', 'package', 'private'],
  test: {
    type: 'mocha',
    source: './test'
  },
  manual: {
    changelog: ['./CHANGELOG.md']
  },
  plugins: [
    {
      name: 'esdoc-plugin-require-coverage'
    }
  ]
};
