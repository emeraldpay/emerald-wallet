import kbpgp from 'kbpgp';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';

// TODO: refactor these vars that happen in just about every file in electron/*.js
const isDev = process.env.NODE_ENV === 'development';

// PGP keys from:
// https://github.com/ethereumproject/volunteer/tree/master/Volunteer-Public-Keys
// Find keys in ./keys/* dir, downloaded directly from ^

function getKeyDir() {
    const keydir = isDev ? './keys' : path.join(process.resourcesPath, 'keys');
    log.debug('gpg keydir:', path.resolve(keydir));
    return keydir;
}

export class Verify {

    // returns an array of pgp key strings read from keys/ dir
    // does so *synchronously*
    readKeys() {
        this.pgps = [];
        const keydir = getKeyDir();
        fs.readdirSync(keydir).forEach((file) => {
            const k = path.join(keydir, file);
            log.debug('reading pgp key:', k);
            this.pgps.push(fs.readFileSync(k));
        });
        return this.pgps;
    }

    init() {
        const kms = [];
        this.readKeys().forEach((armored) => {
            kbpgp.KeyManager.import_from_armored_pgp({armored}, (err, key) => {
                if (!err) {
                    log.debug('key is loaded', key.get_pgp_fingerprint().toString('hex'));
                    kms.push(key);
                } else {
                    log.error('key is not loaded', err);
                }
            });
        });

        const ring = new kbpgp.keyring.KeyRing();
        kms.forEach((km) => {
            ring.add_key_manager(km);
        });
        this.ring = ring;
    }

    verify(path, armored) {
        const data = fs.readFileSync(path);
        return new Promise((resolve, reject) => {
            kbpgp.unbox({keyfetch: this.ring, data, armored}, (err, literals) => {
                if (err !== null) {
                    reject(err);
                } else {
                    let km = null;
                    const ds = literals[0].get_data_signer();
                    if (ds) {
                        km = ds.get_key_manager();
                    }
                    if (km) {
                        log.info('Signed by PGP fingerprint', km.get_pgp_fingerprint().toString('hex'));
                        resolve(path);
                    } else {
                        reject('no_key');
                    }
                }
            });
        });
    }
}
