import {ChildProcess, spawn, spawnSync} from 'child_process';
import * as fs from 'fs';
import { ILogger, DefaultLogger } from '@emeraldwallet/core';

const path = require('path');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development';

class LocalConnector {
  bin: string;
  dataDir: string;
  proc: ChildProcess | null = null;
  log: ILogger;

  // TODO: assert params
  constructor(bin: string, dataDir: string, log?: ILogger) {
    this.bin = bin;
    this.dataDir = dataDir || path.join(process.env.APPDATA || os.homedir(), ".emerald");
    this.log = log || new DefaultLogger();
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
      this.log.debug('Checking if emerald exists:', bin);
      this.checkExists(bin).then((exists) => {
        if (!exists) {
          this.log.warn(`emerald not found at ${bin}`);
          // check that included binary path exists
          // if it does exist, move it to this.bin/
          const cargoEmeraldPath = path.join(process.env.HOME, '.cargo', 'bin', 'emerald');

          this.log.debug('cargo installed emerald path:', cargoEmeraldPath);

          this.checkExists(cargoEmeraldPath).then((emBinaryExists) => {
            this.log.debug('cargo installed emerald path exists:', emBinaryExists);
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
                  this.log.error('Failed to set emerald executable flag', moderr);
                  reject(moderr);
                }
                resolve(true);
              });
            });
            rs.pipe(ws);
          });
        } else {
          // Assuming the emerald found is valid (perms, etc).
          this.log.debug('OK: emerald exists: ', bin);
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
      const chainName = 'mainnet';
      const bin = this.emeraldExecutable();
      const appData = (process.env.APPDATA || os.homedir());
      const emeraldHomeDir = `${appData}${path.join('/.emerald', chainName, 'keystore/')}`;
      fs.access(bin, fs.constants.F_OK | fs.constants.R_OK | fs.constants.X_OK, (err) => {
        if (err) {
          this.log.error(`File ${bin} doesn't exist or doesn't have execution flag`);
          reject(err);
        } else {
          const options = [
            'account',
            'import',
            `--chain=${chainName}`,
            '--all',
            emeraldHomeDir,
          ];
          this.log.debug(`Emerald bin: ${bin}, args: ${options}`);
          const result = spawnSync(bin, options);
          if (result) {
            this.log.debug(`Emerald execution status: ${result.status}`);
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
          this.log.error(`File ${bin} doesn't exist or doesn't have execution flag`);
          reject(err);
        } else {
          const options = [
            '-v',
          ];
          if (this.dataDir) {
            this.log.warn("SPECIFY CUSTOM DIR FOR VAULT");
            options.push(`--base-path=${this.dataDir}`);
          }
          options.push('server');
          this.log.debug(`Emerald bin: ${bin}, args: ${options}`);
          this.proc = spawn(bin, options);
          resolve(this.proc);
        }
      });
    });
  }

  launch() {
    return new Promise((resolve, reject) => {
      this.log.info('Starting Emerald Connector...');
      this.migrateIfNotExists()
        .then(this.importKeyFiles.bind(this))
        .then(this.start.bind(this))
        .then(resolve)
        .catch(reject);
    });
  }

  shutdown() {
    this.log.info('Shutting down Local Connector');
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
        this.log.error('Failed to shutdown Emerald Connector', err);
        reject(err);
      });
      this.proc.kill();
    });
  }

  checkExists(target: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(target, fs.constants.R_OK | fs.constants.X_OK, (err) => {
        if (err) {
          resolve(false);
        } else {
          fs.stat(target, (e, stat) => {
            if (e) {
              resolve(false);
            } else if (!stat.isFile() || stat.size === 0) {
              resolve(false);
            } else {
              resolve(true);
            }
          });
        }
      });
    });
  }
}

export default LocalConnector;
