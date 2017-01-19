#!/usr/bin/env node

import BrokenLinkChecker from './BrokenLinkChecker';

(new BrokenLinkChecker(process.argv.slice(2))).launch();
