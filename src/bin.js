#!/usr/bin/env node

const BrokenLinksChecker = require('./index');

(new BrokenLinksChecker(process.argv)).launch();
