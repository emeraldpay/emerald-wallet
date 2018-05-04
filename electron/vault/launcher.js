const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { checkExists } = require('../utils');
const log = require('../logger');

class LocalConnector {
  // TODO: assert params
  constructor(bin, chain) {
    this.bin = bin;
    this.chain = chain;
  }

  emeraldExecutable() {
    const suffix = os.platform() === 'win32' ? '.exe' : '';
    return path.resolve(path.join(this.bin, `emerald${suffix}`));
  }

  // It would be nice to refactor so we can reuse functions
  // - chmod to executable
  // - check if exists
  // - move
  // - get bin path for executable (eg this.emeraldBin?)
  //
  // This will migrate from cargo bin path emerald to project dir if emerald
  // is already installed to the cargo bin path and does not exist in the project "bin" path,
  // which is the project base dir.
  migrateIfNotExists() {
    return new Promise((resolve, reject) => {
      const bin = this.emeraldExecutable();
      log.debug('Checking if emerald exists:', bin);
      checkExists(bin).then((exists) => {
        if (!exists) {
          log.debug('emerald not found');
          // check that included binary path exists
          // if it does exist, move it to this.bin/
          const cargoEmeraldPath = path.join(process.env.HOME, '.cargo', 'bin', 'emerald');
          log.debug('cargo installed emerald path:', cargoEmeraldPath);
          checkExists(cargoEmeraldPath).then((emBinaryExists) => {
            log.debug('cargo installed emerald path exists:', emBinaryExists);
            if (!emBinaryExists) {
              reject(new Error('No packaged emerald binary found.'));
            }
            const rs = fs.createReadStream(cargoEmeraldPath);
            const ws = fs.createWriteStream(bin);
            rs.on('error', (err) => { reject(err); });
            ws.on('error', (err) => { reject(err); });
            ws.on('close', () => {
              fs.chmod(bin, 0o755, (moderr) => {
                if (moderr) {
                  log.error('Failed to set emerald executable flag', moderr);
                  reject(moderr);
                }
                resolve(true);
              });
            });
            rs.pipe(ws);
          });
        } else {
          // Assuming the emerald found is valid (perms, etc).
          log.debug('OK: emerald exists: ', bin);
          resolve(true);
        }
      });
    });
  }


  /**
     * It runs "emerald import --all" to import old key files from vault version before v0.12
     * TODO: sooner or later it should be removed
     */
  importKeyFiles() {
    return new Promise((resolve, reject) => {
      const bin = this.emeraldExecutable();
      const appData = (process.env.APPDATA || os.homedir());
      const emeraldHomeDir = `${appData}${path.join('/.emerald', this.chain.name, 'keystore/')}`;
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
            emeraldHomeDir,
          ];
          log.debug(`Emerald bin: ${bin}, args: ${options}`);
          const result = spawnSync(bin, options);
          if (result) {
            log.debug(`Emerald execution status: ${result.status}`);
          }
          resolve(result);
        }
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      const bin = this.emeraldExecutable();
      fs.access(bin, fs.constants.F_OK | fs.constants.R_OK | fs.constants.X_OK, (err) => {
        if (err) {
          log.error(`File ${bin} doesn't exist or doesn't have execution flag`);
          reject(err);
        } else {
          const options = [
            '-v',
            'server',
          ];
          log.debug(`Emerald bin: ${bin}, args: ${options}`);
          this.proc = spawn(bin, options);
          resolve(this.proc);
        }
      });
    });
  }

  launch() {
    return new Promise((resolve, reject) => {
      log.info('Starting Emerald Connector...');
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
        log.error('Failed to shutdown Emerald Connector', err);
        reject(err);
      });
      this.proc.kill();
    });
  }
}

module.exports = {
  LocalConnector,
};
