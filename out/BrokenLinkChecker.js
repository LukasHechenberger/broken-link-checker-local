'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _path = require('path');

var _url = require('url');

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _getPort = require('get-port');

var _getPort2 = _interopRequireDefault(_getPort);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _cliOptions = require('./cliOptions');

var _cliOptions2 = _interopRequireDefault(_cliOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The Command Line Interface.
 */
class BrokenLinkChecker {

  /**
   * Creates a new BrokenLinkChecker with the specified options.
   * @param {String[]} argv The arguments to handle.
   */
  constructor(argv = []) {
    /**
     * The arguments to handle.
     * @type {String[]}
     */
    this._argv = argv;

    /**
     * `true` if serving a directory is needed to run the check.
     * @type {Boolean}
     */
    this.needServer = true;

    /**
     * The path to check. Only set if a path is given as input.
     * @type {String}
     */
    this.path = false;

    /**
     * The URL to check. Only set if a URL is given as input.
     * @type {String}
     */
    this.url = false;

    /**
     * The parsed command line options used.
     * @type {Object}
     */
    this.options = false;
  }

  /**
   * Starts a server serving {@link BrokenLinkChecker#path} on the speficied port.
   * @param {Number} port The port to server on.
   * @return {Promise<Number, Error>} Resolved with the port used, rejected with an error if
   * listening on the port failed.
   */
  startServer(port) {
    return new Promise((resolve, reject) => {
      if (!this.path) {
        reject(new Error('No path given'));
      }

      console.log(_chalk2.default.white('Starting server for path:'), _chalk2.default.yellow(this.path));
      /**
       * The instance of {@link express.Application} used.
       * @type {express.Application}
       */
      this.app = (0, _express2.default)();

      this.app.use('/', _express2.default.static(this.path));

      /**
       * The server used.
       * @type {http.Server}
       */
      this.server = this.app.listen(port);
      this.server.on('listening', () => resolve(port));
      this.server.on('error', err => reject(err));
    });
  }

  /**
   * Runs `blc` on the given port or {@link BrokenLinkChecker#url}.
   * @param {Number} [port] The port to check
   * @return {Promise<Number>} Resolved with `blc`'s exit code.
   */
  runChecker(port) {
    return new Promise((resolve, reject) => {
      if (!port && !this.url) {
        reject(new Error('No url given'));
      } else {
        let args = [port ? `http://localhost:${port}` : this.url, '--colors'];

        // Add options passed to blc
        args = args.concat(this._argv);

        const blc = (0, _child_process.spawn)(require.resolve('broken-link-checker/bin/blc'), args, {
          stdio: 'inherit'
        });

        blc.on('close', code => resolve(code));
      }
    });
  }

  /**
   * Validates options.
   * @return {Promise<Object, Error>} Fulfilled with the parsed options, rejected if validation
   * failed.
   */
  validateOptions() {
    return new Promise((resolve, reject) => {
      this.options = (0, _yargs2.default)(this._argv).usage('Usage: $0 [options] <directory or url>').demandCommand(1, 1, 'Neither directory nor url given').version(_package2.default.version).alias('version', 'V').alias('help', 'h').option(_cliOptions2.default).help().fail((msg, err, y) => {
        console.log(y.help());

        reject(err || new Error(msg));
      }).argv;

      resolve(this.options);
    });
  }

  /**
   * Sets either {@link BrokenLinkChecker#path} or {@link BrokenLinkChecker#path} from the first
   * non-option argument provided.
   */
  getPathOrUrl() {
    const dirOrUrl = this.options._[0];
    const url = (0, _url.parse)(dirOrUrl);

    if (url.hostname) {
      this.url = dirOrUrl;
      this.needServer = false;
    } else {
      this.path = (0, _path.join)(process.cwd(), dirOrUrl);
    }
  }

  /**
   * Exits BrokenLinkChecker with the specified exit code and (optionally) an error that occurred.
   * @param {Number} code The code to exit with.
   * @param {Error} err The error to report.
   * @return {Number} code The code to exit with.
   */
  exit(code, err) {
    if (err) {
      console.error(_chalk2.default.red(`Error: ${err.message}`));
    }

    if (this.server) {
      this.server.close();
    }

    process.exitCode = code;

    return code;
  }

  /**
   * Launches the CLI
   */
  launch() {
    return this.validateOptions().then(() => this.getPathOrUrl()).then(() => {
      if (this.needServer) {
        return (0, _getPort2.default)().then(port => this.startServer(port)).then(port => this.runChecker(port));
      }

      return this.runChecker();
    }).then(code => this.exit(code)).catch(err => this.exit(1, err));
  }

}

exports.default = BrokenLinkChecker; /**
                                      * @external {express.Application} http://expressjs.com/en/4x/api.html#app
                                      */

/**
 * @external {http.Server} https://nodejs.org/api/http.html#http_class_http_server
 */