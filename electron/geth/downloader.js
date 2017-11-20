const { https } = require('follow-redirects');
const fs = require('fs');
const os = require('os');
const path = require('path');
const DecompressZip = require('decompress-zip');

const defaultLog = require('../logger');
const { Verify } = require('./verify');
const { deleteIfExists, checkExists } = require('../utils');
const signers = require('./signers');

require('es6-promise').polyfill();

const { DefaultGeth } = require('./config');

const platformMapping = {
  darwin: 'osx',
  linux: 'linux',
  win32: 'windows',
};

class Downloader {
  constructor(conf, name, notify, dir, logger = defaultLog) {
    this.config = conf;
    this.log = logger;
    this.name = name;
    this.tmp = null;
    this.notify = notify;
    this.basedir = dir;
  }

  downloadIfNotExists() {
    return new Promise((resolve, reject) => {
      const target = path.join(this.basedir, this.name);
      checkExists(target).then((isExists) => {
        if (isExists) {
          this.log.debug(`${this.name} exists`);
          resolve('exists');
        } else {
          this.notify.info('Downloading latest Geth');
          this.backup()
            .then(this.downloadArchive.bind(this))
            .then(this.verifyArchive.bind(this))
            .then(this.prepareBin.bind(this))
            .then(this.unpack.bind(this))
            .then(this.cleanup.bind(this))
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  getPlatform() {
    return platformMapping[os.platform()];
  }

  downloadArchive() {
    const platform = this.getPlatform();
    const target = this.config.download.find((x) => x.platform === platform);
    const targetBinary = target.binaries.find((x) => x.type === 'https' && x.pack === 'zip');
    const targetUrl = targetBinary.url;
    return new Promise((resolve, reject) => {
      const tmpDir = os.tmpdir();
      fs.mkdtemp(path.join(tmpDir, `download-${this.name}-`), (err, tmpfolder) => {
        if (err) {
          this.log.error('Unable to create temp dir', err);
          reject(err);
          return;
        }
        this.tmp = tmpfolder;
        this.log.info(`Download ${this.name} from ${targetUrl} to ${tmpfolder}/`);
        const f = fs.createWriteStream(path.join(tmpfolder, 'dest.zip'));
        https.get(targetUrl, (response) => {
          response.pipe(f);
          response.on('end', () => {
            this.currentArchive = f.path;
            resolve(f.path);
          });
        }).on('error', (httpsErr) => {
          reject(httpsErr);
        });
        this.signature = this.downloadPgp(target);
      });
    });
  }

  downloadPgp(target) {
    const pgp = target.signatures.find((x) => x.type === 'pgp');
    const url = pgp.url;
    return new Promise((resolve, reject) => {
      let buf = '';
      https.get(url, (response) => {
        response.on('data', (chunk) => {
          buf += chunk.toString();
        });
        response.on('end', () => {
          resolve(buf);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  verifyArchive(zip) {
    return this.signature.then((signature) => {
      const v = new Verify();
      v.init(signers.publicKeys);
      return v.verify(zip, signature);
    });
  }

  prepareBin(x) {
    return new Promise((resolve, reject) => {
      fs.access(this.basedir, (err) => {
        if (err) {
          fs.mkdir(this.basedir, 0o777, (mkdirErr) => {
            if (mkdirErr) {
              reject(mkdirErr);
            } else {
              resolve(x);
            }
          });
        } else {
          resolve(x);
        }
      });
    });
  }

  unpack(zip) {
    this.log.info(`Unpack ${zip}`);
    return new Promise((resolve, reject) => {
      this.notify.info('Unpacking Geth');
      const target = path.join(this.basedir, this.name);
      const unzipper = new DecompressZip(zip);
      unzipper.on('error', (err) => {
        this.log.error('Failed to extract zip', err);
        reject(err);
      });
      unzipper.on('extract', (logg) => {
        this.log.debug('Finished extracting', logg);
        fs.chmod(target, 0o755, (moderr) => {
          if (moderr) {
            this.log.error('Failed to set executable flag', moderr);
            reject(moderr);
          }
          resolve(true);
        });
      });
      unzipper.extract({
        path: this.basedir,
        filter: (file) => {
          // https://github.com/bower/decompress-zip/blob/master/lib/file-details.js#L10
          return file.type !== 'Directory' && file.filename === this.name;
        },
      });
    });
  }

  backup() {
    return new Promise((resolve, reject) => {
      const target = path.join(this.basedir, this.name);
      fs.access(target, fs.constants.F_OK, (err) => {
        if (!err) {
          const bak = path.join(this.basedir, `${this.name}.bak`);
          deleteIfExists(bak).then(() => {
            this.log.debug(`Backup ${target} to ${bak}`);
            fs.rename(target, bak, () => {
              resolve(true);
            });
          }).catch(reject);
        } else {
          resolve(false);
        }
      });
    });
  }

  cleanup() {
    return new Promise((resolve, reject) => {
      if (!this.tmp) {
        resolve('clean');
        return;
      }
      deleteIfExists(path.join(this.tmp, 'dest.zip')).then(() => {
        fs.rmdir(this.tmp, (err) => {
          if (err) {
            this.log.error('Cleanup error', err);
          }
          resolve('cleaned');
        });
      }).catch((err) => {
        this.log.error('Cleanup failed', err);
      });
    });
  }
}

const newGethDownloader = function (notify, dir) {
  const suffix = os.platform() === 'win32' ? '.exe' : '';
  return new Downloader(DefaultGeth, `geth${suffix}`, notify, dir);
};

module.exports = {
  newGethDownloader,
  Downloader,
};
