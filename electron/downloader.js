import { https } from 'follow-redirects';
import fs from 'fs';
import os from 'os';
import log from 'loglevel';
import unzipper from 'unzip2';

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

export class Downloader {

    constructor(conf, name) {
        this.config = conf;
        this.name = name;
        this.tmp = null;
    }

    downloadIfNotExists() {
        return new Promise((resolve, reject) => {
            this.check_exists().then((is_exists) => {
                if (is_exists) {
                    log.debug(`${this.name} exists`);
                    resolve('exists');
                } else {
                    this.backup()
                        .then(this.downloadArchive.bind(this))
                        .then(this.verifyArchive.bind(this))
                        .then(this.unpack.bind(this))
                        .then(this.cleanup.bind(this))
                        .then(resolve).catch(reject)
                }
            });
        });
    }

    check_exists() {
        let target = `bin/${this.name}`;
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
            fs.mkdtemp(`download-${this.name}-`, (err, folder) => {
                if (err) {
                    log.error("Unable to create temp dir", err);
                    reject(err);
                    return
                }
                this.tmp = folder;
                log.info(`Download ${this.name} from ${targetUrl} to ${folder}/`);
                let f = fs.createWriteStream(`${folder}/dest.zip`);
                https.get(targetUrl, (response) => {
                    response.pipe(f);
                    response.on('end', () => {
                        resolve(f.path);
                    });
                }).on('error', (err) => {
                    reject(err);
                });
            })
        });
    }

    verifyArchive(zip) {
        return new Promise((resolve, reject) => {
            resolve(zip);
        })
    }

    unpack(zip) {
        log.info(`Unpack ${zip}`);
        return new Promise((resolve, reject) => {
            fs.createReadStream(zip)
                .pipe(unzipper.Parse())
                .on('entry', (entry) => {
                    const fileName = entry.path;
                    if (entry.type === 'File' && fileName === this.name) {
                        let target = `bin/${fileName}`;
                        log.info(`Extract to ${target}...`);
                        entry.pipe(fs.createWriteStream(target));
                        entry.on('end', () => {
                            fs.chmod(target, 0o755, (err) => {
                                if (err) {
                                    log.error("Failed to set executable flag", target, err)
                                }
                            })
                        })
                    } else {
                        log.debug(`Skip ${fileName}`);
                        entry.autodrain();
                    }
                })
                .on('close', () => {
                    resolve(true)
                })
        })
    }

    backup() {
        return new Promise((resolve, reject) => {
            let target = `bin/${this.name}`;
            fs.access(target, fs.constants.F_OK, (err) => {
                if (!err) {
                    let bak = `bin/${this.name}.bak`;
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
            deleteIfExists(`${this.tmp}/dest.zip`).then(() => {
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

export function newGethDownloader() {
    const suffix = os.platform() === 'win32' ? '.exe' : '';
    return new Downloader(DefaultGeth, "geth" + suffix);
}
