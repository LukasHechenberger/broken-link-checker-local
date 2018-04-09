#!/usr/bin/env node
'use strict';

var _BrokenLinkChecker = require('./BrokenLinkChecker');

var _BrokenLinkChecker2 = _interopRequireDefault(_BrokenLinkChecker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _BrokenLinkChecker2.default(process.argv.slice(2)).launch();