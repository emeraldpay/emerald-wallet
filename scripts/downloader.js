const EventEmitter = require('events');
const { https } = require('follow-redirects');
const fs = require('fs');
const os = require('os');
const path = require('path');
const DecompressZip = require('decompress-zip');

const { Verify } = require('emerald-js/lib/pgp');
const { deleteIfExists, checkExists } = require('../electron/utils');


const platformMapping = {
    darwin: 'osx',
    linux: 'linux',
    win32: 'windows',
};

const TMP_FILE_NAME = 'dist.zip';

class Downloader extends EventEmitter {

    constructor(conf, name, dir, signerKeys) {
        super();
        this.config = conf;
        this.name = name;
        this.tmp = null;
        this.basedir = dir;
        this.signerKeys = signerKeys;
    }

    downloadIfNotExists() {
        return new Promise((resolve, reject) => {
            const target = path.join(this.basedir, this.name);
            checkExists(target).then((isExists) => {
                if (isExists) {
                    reject(`File ${this.name} exists`);
                } else {
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
            fs.mkdtemp(path.join(os.tmpdir(), `download-${this.name}-`), (err, tmpfolder) => {
                if (err) {
                    this.log.error('Unable to create temp dir', err);
                    reject(err);
                    return;
                }
                this.tmp = tmpfolder;

                this.emit('notify', `Downloading ${this.name} from ${targetUrl} to ${tmpfolder}/`);

                const f = fs.createWriteStream(path.join(tmpfolder, TMP_FILE_NAME));
                https.get(targetUrl, (response) => {
                    response.pipe(f);
                    response.on('end', () => {
                        this.currentArchive = f.path;
                        resolve(f.path);
                    });
                }).on('error', (err) => {
                    reject(err);
                });
                this.signature = this.downloadPgp(target);
            });
        });
    }

    downloadPgp(target) {
        const pgp = target.signatures.find((x) => x.type === 'pgp');
        const url = pgp.url;
        return new Promise((resolve, reject) => {
            this.emit('notify', `Downloading PGP keys from ${url}`);

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
            this.emit('notify', 'Verifying PGP signature');
            const v = new Verify();
            v.init(this.signerKeys);
            return v.verify(fs.readFileSync(zip), signature)
                .then(() => zip);
        });
    }

    prepareBin(x) {
        return new Promise((resolve, reject) => {
            fs.access(this.basedir, (err) => {
                if (err) {
                    fs.mkdir(this.basedir, 0o777, (err) => {
                        if (err) {
                            reject(err);
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
        return new Promise((resolve, reject) => {
            const target = path.join(path.resolve(this.basedir), this.name);

            this.emit('notify', `Unpacking ${zip} to ${target}`);

            const unzipper = new DecompressZip(zip);
            unzipper.on('error', (err) => {
                this.log.error('Failed to extract zip', err);
                reject(err);
            });
            unzipper.on('extract', (logg) => {
                fs.chmod(target, 0o755, (moderr) => {
                    if (moderr) {
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
            const tempFile = path.join(this.tmp, TMP_FILE_NAME);

            this.emit('notify', `Cleaning up. Removing ${tempFile}`);

            deleteIfExists(tempFile).then(() => {
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


module.exports = {
    Downloader,
};
