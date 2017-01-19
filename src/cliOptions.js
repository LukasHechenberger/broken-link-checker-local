const blcDefaults = require('broken-link-checker/lib/internal/defaultOptions');

module.exports = {
  exclude: {
    desc: 'A keyword/glob to match links against. Can be used multiple times.',
    default: blcDefaults.excludedKeywords,
  },
  'exclude-external': {
    desc: 'Will not check external links.',
    alias: 'e',
    type: 'boolean',
    default: false,
  },
  'exclude-internal': {
    desc: 'Will not check internal links.',
    alias: 'i',
    type: 'boolean',
    default: false,
  },
  'filter-level': {
    desc: 'The types of tags and attributes that are considered links.\n' +
    '  0: clickable links\n' +
    '  1: 0 + media, iframes, meta refreshes\n' +
    '  2: 1 + stylesheets, scripts, forms\n' +
    '  3: 2 + metadata\n',
    type: 'number',
    default: blcDefaults.filterLevel,
  },
  follow: {
    desc: 'Force-follow robot exclusions.',
    alias: 'f',
    type: 'boolean',
    default: false,
  },
  get: {
    desc: 'Change request method to GET.',
    alias: 'g',
    type: 'boolean',
    default: false,
  },
  input: {
    desc: 'Missing',
  },
  ordered: {
    desc: 'Maintain the order of links as they appear in their HTML document.',
    alias: 'o',
    type: 'boolean',
    default: false,
  },
  recursive: {
    desc: 'Recursively scan "crawl" the HTML document(s).',
    alias: 'r',
    type: 'boolean',
    default: false,
  },
  'user-agent': {
    desc: 'The user agent to use for link checks.',
    type: 'string',
    default: blcDefaults.userAgent,
  },
  verbose: {
    desc: 'Display excluded links.',
    alias: 'v',
    type: 'boolean',
    default: false,
  },
};
