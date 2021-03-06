/* eslint-disable no-console */

import { spawn } from 'child_process';
import { join } from 'path';
import { parse } from 'url';
import yargs from 'yargs';
import express from 'express';
import getPort from 'get-port';
import colors from 'chalk';
import pkg from '../package.json';
import cliOptions from './cliOptions';

/**
 * The Command Line Interface.
 */
export default class BrokenLinkChecker {

  /**
   * Creates a new BrokenLinkChecker with the specified options.
   * @param {Array<string>} argv The arguments to handle.
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
   * The base url to use when serving files.
   * @type {string}
   */
  get baseUrl() {
    return this.options ? this.options.baseUrl : '/';
  }

  /**
   * Starts a server serving {@link BrokenLinkChecker#path} on the speficied port.
   * @param {number} port The port to server on.
   * @return {Promise<number, Error>} Resolved with the port used, rejected with an error if
   * listening on the port failed.
   */
  startServer(port) {
    return new Promise((resolve, reject) => {
      if (!this.path) {
        reject(new Error('No path given'));
      }

      console.log(colors.white('Starting server for path:'), colors.yellow(this.path));
      if (this.baseUrl !== '/') {
        console.log(colors.gray(`Using base url '${this.options.baseUrl}'`));
      }
      /**
       * The instance of {@link express.Application} used.
       * @type {express.Application}
       */
      this.app = express();

      this.app.use(this.baseUrl, express.static(this.path));

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
   * @param {number} [port] The port to check.
   * @return {Promise<number>} Resolved with `blc`'s exit code.
   */
  runChecker(port) {
    return new Promise((resolve, reject) => {
      if (!port && !this.url) {
        reject(new Error('No url given'));
      } else {
        let args = [
          port ?
            `http://localhost:${port}${this.baseUrl}` :
            this.url,
          '--colors',
        ];

        // Add options passed to blc
        args = args.concat(this._argv);

        const blc = spawn(require.resolve('broken-link-checker/bin/blc'), args, {
          stdio: 'inherit',
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
      this.options = yargs(this._argv)
        .usage('Usage: $0 [options] <directory or url>')
        .demandCommand(1, 1, 'Neither directory nor url given')
        .version(pkg.version)
        .alias('version', 'V')
        .alias('help', 'h')
        .option(cliOptions)
        .help()
        .fail((msg, err, y) => {
          console.log(y.help());

          reject(err || new Error(msg));
        })
        .argv;

      // Add leading '/' to baseUrl if needed
      if (this.options.baseUrl[0] !== '/') {
        console.error('Adding slash');
        this.options.baseUrl = `/${this.options.baseUrl}`;
      }

      resolve(this.options);
    });
  }

  /**
   * Sets either {@link BrokenLinkChecker#path} or {@link BrokenLinkChecker#path} from the first
   * non-option argument provided.
   */
  getPathOrUrl() {
    const dirOrUrl = this.options._[0];
    const url = parse(dirOrUrl);

    if (url.hostname) {
      this.url = dirOrUrl;
      this.needServer = false;
    } else {
      this.path = join(process.cwd(), dirOrUrl);
    }
  }

  /**
   * Exits BrokenLinkChecker with the specified exit code and (optionally) an error that occurred.
   * @param {number} code The code to exit with.
   * @param {Error} err The error to report.
   * @return {number} Code The code to exit with.
   */
  exit(code, err) {
    if (err) {
      console.error(colors.red(`Error: ${err.message}`));
    }

    if (this.server) {
      this.server.close();
    }

    process.exitCode = code;

    return code;
  }

  /**
   * Launches the CLI.
   */
  launch() {
    return this.validateOptions()
      .then(() => this.getPathOrUrl())
      .then(() => {
        if (this.needServer) {
          return getPort()
            .then(port => this.startServer(port))
            .then(port => this.runChecker(port));
        }

        return this.runChecker();
      })
      .then(code => this.exit(code))
      .catch(err => this.exit(1, err));
  }

}

/**
 * @external {express.Application} http://expressjs.com/en/4x/api.html#app
 */

/**
 * @external {http.Server} https://nodejs.org/api/http.html#http_class_http_server
 */
