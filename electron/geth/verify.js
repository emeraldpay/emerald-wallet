const kbpgp = require('kbpgp');
const log = require('../logger');
const fs = require('fs');
require('es6-promise').polyfill();


class Verify {
  init(signersPublicKeys) {
    const kms = [];
    signersPublicKeys.forEach((armored) => {
      kbpgp.KeyManager.import_from_armored_pgp({armored}, (err, key) => {
        if (!err) {
          log.debug('Key is loaded', key.get_pgp_fingerprint().toString('hex'));
          kms.push(key);
        } else {
          log.error('Key is not loaded', err);
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

module.exports = {
  Verify,
};
