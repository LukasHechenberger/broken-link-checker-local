const { spawn } = require('child_process');
const { join } = require('path');
const { parse } = require('url');
const yargs = require('yargs');
const express = require('express');
const getPort = require('get-port');
const colors = require('chalk');

const pkg = require('./../package.json');
const cliOptions = require('./cliOptions');

class BrokenLinkChecker {

  constructor(argv) {
    this._argv = argv;
    this.needServer = true;
  }

  startServer(port) {
    return new Promise((resolve, reject) => {
      console.log(colors.white('Starting server for path:'), colors.yellow(this.path));
      this.app = express();

      this.app.use('/', express.static(this.path));

      this.server = this.app.listen(port, err => {
        if (err) {
          reject(err);
        } else {
          resolve(port);
        }
      });
    });
  }

  runChecker(port) {
    let args = [
      port ?
        `http://localhost:${port}` :
        this.url,
      '--colors',
    ];

    // Add options passed to blc
    args = args.concat(this._argv.filter(a => !this.options._.includes(a)));

    const blc = spawn(join(__dirname, '../node_modules/.bin/blc'), args, {
      stdio: 'inherit',
    });

    return new Promise(resolve => {
      blc.on('close', code => resolve(code));
    });
  }

  exit(code, err) {
    if (err) {
      console.error(colors.red(`Error: ${err.message}`));
    }

    if (this.app) {
      this.server.close();
    }

    process.exitCode = code;
  }

  launch() {
    this.options = yargs(process.argv)
      .usage('Usage: $0 [options] <directory>')
      .version(pkg.version)
      .alias('version', 'V')
      .alias('help', 'h')
      .option(cliOptions)
      .help()
      .argv;

    // If a valid URL was passed just run blc, otherwise start a server to serve the given
    // directory.
    const dirOrUrl = this.options._[this.options._.length - 1];
    const url = parse(dirOrUrl);

    if (url.hostname) {
      this.url = dirOrUrl;
      this.needServer = false;
    } else {
      this.path = join(process.cwd(), dirOrUrl);
    }

    const program = this.needServer ?
      getPort()
        .then(port => this.startServer(port))
        .then(port => this.runChecker(port)) :
      this.runChecker();

    program
      .then(code => this.exit(code))
      .catch(err => this.exit(1, err));
  }

}

module.exports = BrokenLinkChecker;
