const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { checkExists } = require('../utils');
const log = require('../logger');

const isDev = process.env.NODE_ENV === 'development';

class LocalConnector {
  // TODO: assert params
  constructor(bin, chain) {
    this.bin = bin;
    this.chain = chain;
  }

  gethExecutable() {
    const p = path.join(path.join(__dirname,"../../../../bin"), `geth`);
    log.debug("Loading GETH client: ", p);
    return path.resolve(p);
  }

  // It would be nice to refactor so we can reuse functions
  // - chmod to executable
  // - check if exists
  // - move
  // - get bin path for executable (eg this.gethBin?)
  //
  // This will migrate from cargo bin path geth to project dir if geth
  // is already installed to the cargo bin path and does not exist in the project "bin" path,
  // which is the project base dir.
  migrateIfNotExists() {
    return new Promise((resolve, reject) => {
      const bin = this.gethExecutable();
      log.debug('Checking if geth exists:', bin);
      checkExists(bin).then((exists) => {
        if (!exists) {
          log.debug('geth not found');
          // check that included binary path exists
          // if it does exist, move it to this.bin/
          resolve(false);
        } else {
          // Assuming the geth found is valid (perms, etc).
          log.debug('OK: geth exists: ', bin);
          resolve(true);
        }
      });
    });
  }


  /**
     * It runs "geth import --all" to import old key files from vault version before v0.12
     * TODO: sooner or later it should be removed
     */
  importKeyFiles() {
    return new Promise((resolve, reject) => {
      const bin = this.gethExecutable();
      const appData = (process.env.APPDATA || os.homedir());
      const gethHomeDir = `${appData}${path.join('/.geth', this.chain.name, 'keystore/')}`;
      fs.access(bin, fs.constants.F_OK | fs.constants.R_OK | fs.constants.X_OK, (err) => {
        if (err) {
          log.error(`File ${bin} doesn't exist or doesn't have execution flag`);
          reject(err);
        } else {
          const options = [
            'account',
            'import',
            `--chain=${this.chain.name}`,
            '--all',
            gethHomeDir,
          ];
          log.debug(`Geth bin: ${bin}, args: ${options}`);
          const result = spawnSync(bin, options);
          if (result) {
            log.debug(`Geth execution status: ${result.status}`);
          }
          resolve(result);
        }
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      const bin = this.gethExecutable();
      fs.access(bin, fs.constants.F_OK | fs.constants.R_OK | fs.constants.X_OK, (err) => {
        if (err) {
          log.error(`File ${bin} doesn't exist or doesn't have execution flag`);
          reject(err);
        } else {
          let options = [
            '--sport',
          ];
          if (isDev) {
            options = [
              '--testnet'
            ];
            options.push(`--datadir=${path.resolve('./.geth-dev/vault')}`);
          }
          options.push("--rpc");
          // options.push("-rpcapi=admin,db,eth,debug,miner,net,shh,txpool,personal,web3");


          log.debug(`Geth bin: ${bin}, args: ${options}`);
          this.proc = spawn(bin, options);
          resolve(this.proc);
        }
      });
    });
  }

  launch() {
    return new Promise((resolve, reject) => {
      log.info('Starting Geth Connector...');
      this.migrateIfNotExists()
        .then(this.importKeyFiles.bind(this))
        .then(this.start.bind(this))
        .then(resolve)
        .catch(reject);
    });
  }

  shutdown() {
    log.info('Shutting down Local Connector');
    return new Promise((resolve, reject) => {
      if (!this.proc) {
        resolve('not_started');
        return;
      }
      this.proc.on('exit', () => {
        resolve('killed');
        this.proc = null;
      });
      this.proc.on('error', (err) => {
        log.error('Failed to shutdown Geth Connector', err);
        reject(err);
      });
      this.proc.kill();
    });
  }
}

module.exports = {
  LocalConnector,
};
