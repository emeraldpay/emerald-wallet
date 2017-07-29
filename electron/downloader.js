const { https } = require('follow-redirects');
const fs = require('fs');
const os = require('os');
const path = require('path');
const log = require('electron-log');
const DecompressZip = require('decompress-zip');
const { Verify } = require('./verify');
require('es6-promise').polyfill();

const DefaultGeth = {
    format: "v1",
    channel: "stable",
    app: {
        version: "3.5.0"
    },
    download: [
        {
            platform: "osx",
            binaries: [
                {
                    type: "https",
                    pack: "zip",
                    url: "https://github.com/ethereumproject/go-ethereum/releases/download/v3.5.0/geth-classic-osx-v3.5.0.zip",
                }
            ],
            signatures: [
                {
                    type: "pgp",
                    url: "https://github.com/ethereumproject/go-ethereum/releases/download/v3.5.0/geth-classic-osx-v3.5.0.zip.asc"
                }
            ]
        },
        {
            platform: "windows",
            binaries: [
                {
                    type: "https",
                    pack: "zip",
                    url: "https://github.com/ethereumproject/go-ethereum/releases/download/v3.5.0/geth-classic-win64-v3.5.0.zip",
                }
            ],
            signatures: [
                {
                    type: "pgp",
                    url: "https://github.com/ethereumproject/go-ethereum/releases/download/v3.5.0/geth-classic-win64-v3.5.0.zip.asc"
                }
            ]
        },
        {
            platform: "linux",
            binaries: [
                {
                    type: "https",
                    pack: "zip",
                    url: "https://github.com/ethereumproject/go-ethereum/releases/download/v3.5.0/geth-classic-linux-v3.5.0.zip",
                }
            ],
            signatures: [
                {
                    type: "pgp",
                    url: "https://github.com/ethereumproject/go-ethereum/releases/download/v3.5.0/geth-classic-linux-v3.5.0.zip.asc"
                }
            ]
        }
    ]
};

const platformMapping = {
    darwin: 'osx',
    linux: 'linux',
    win32: 'windows'
};

function deleteIfExists(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.W_OK, (err) => {
            if (err) {
                resolve('not_exists')
            } else {
                fs.unlink(path, (err2) => {
                    if (err2) {
                        log.error('Failed to delete', path, err);
                        reject(err2)
                    } else {
                        resolve('deleted');
                    }
                })
            }
        });
    });
}

class Downloader {

    constructor(conf, name, notify, dir) {
        this.config = conf;
        this.name = name;
        this.tmp = null;
        this.notify = notify;
        this.basedir = dir;
    }

    downloadIfNotExists() {
        return new Promise((resolve, reject) => {
            this.check_exists().then((is_exists) => {
                if (is_exists) {
                    log.debug(`${this.name} exists`);
                    resolve('exists');
                } else {
                    this.notify.info("Downloading latest Geth");
                    this.backup()
                        .then(this.downloadArchive.bind(this))
                        .then(this.verifyArchive.bind(this))
                        .then(this.prepareBin.bind(this))
                        .then(this.unpack.bind(this))
                        .then(this.cleanup.bind(this))
                        .then(resolve).catch(reject)
                }
            });
        });
    }

    check_exists() {
        let target = path.join(this.basedir, this.name);
        return new Promise((resolve) => {
            fs.access(target, fs.constants.R_OK | fs.constants.X_OK, (err) => {
                if (err) {
                    resolve(false)
                } else {
                    fs.stat(target, (err, stat) => {
                        if (err) {
                            resolve(false)
                        } else if (!stat.isFile() || stat.size === 0) {
                            resolve(false)
                        } else {
                            resolve(true)
                        }
                    })
                }
            });
        })
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
                    log.error("Unable to create temp dir", err);
                    reject(err);
                    return
                }
                this.tmp = tmpfolder;
                log.info(`Download ${this.name} from ${targetUrl} to ${tmpfolder}/`);
                let f = fs.createWriteStream(path.join(tmpfolder, 'dest.zip'));
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
            })
        });
    }

    downloadPgp(target) {
        const pgp = target.signatures.find((x) => x.type === 'pgp');
        const url = pgp.url;
        return new Promise((resolve, reject) => {
            let buf = "";
            https.get(url, (response) => {
                response.on('data', (chunk) => {
                    buf = buf + chunk.toString();
                });
                response.on('end', () => {
                    resolve(buf);
                });
            }).on('error', (err) => {
                reject(err);
            });
        })
    }

    verifyArchive(zip) {
        const v = new Verify();
        v.init();
        return this.signature.then((signature) =>
            v.verify(zip, signature)
        )
    }

    prepareBin(x) {
        return new Promise((resolve, reject) => {
            fs.access(this.basedir, (err) => {
                if (err) {
                    fs.mkdir(this.basedir, 0o777, (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(x)
                        }
                    })
                } else {
                    resolve(x)
                }
            })
        })
    }

    unpack(zip) {
        log.info(`Unpack ${zip}`);
        return new Promise((resolve, reject) => {
            this.notify.info('Unpacking Geth');
            const target = path.join(this.basedir, this.name);
            const unzipper = new DecompressZip(zip);
            unzipper.on('error', (err) => {
                log.error('Failed to extract zip', err);
                reject(err);
            });
            unzipper.on('extract', (logg) => {
                log.debug('Finished extracting', logg);
                fs.chmod(target, 0o755, (moderr) => {
                    if (moderr) {
                        log.error('Failed to set executable flag', moderr);
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
            let target = path.join(this.basedir, this.name);
            fs.access(target, fs.constants.F_OK, (err) => {
                if (!err) {
                    let bak = path.join(this.basedir,`${this.name}.bak`);
                    deleteIfExists(bak).then(() => {
                        log.debug(`Backup ${target} to ${bak}`);
                        fs.rename(target, bak, () => {
                            resolve(true);
                        });
                    }).catch(reject)
                } else {
                    resolve(false)
                }
            })
        })
    }

    cleanup() {
        return new Promise((resolve, reject) => {
            if (!this.tmp) {
                resolve('clean');
                return
            }
            deleteIfExists(path.join(this.tmp, 'dest.zip')).then(() => {
                fs.rmdir(this.tmp, (err) => {
                    if (err) {
                        log.error("Cleanup error", err);
                    }
                    resolve('cleaned');
                });
            }).catch((err) => {
                log.error('Cleanup failed', err)
            })
        })
    }


}

const newGethDownloader = function(notify, dir) {
    const suffix = os.platform() === 'win32' ? '.exe' : '';
    return new Downloader(DefaultGeth, "geth" + suffix, notify, dir);
};

module.exports = {
    newGethDownloader: newGethDownloader,
    Downloader: Downloader
};