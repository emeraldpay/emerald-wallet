const log = require('electron-log');
const fs = require('fs');
const path = require('path');
const app = require('electron').app; // eslint-disable-line import/no-extraneous-dependencies

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

function getBinDir() {
  // Use project base dir for development.
  return isDev ? './' : process.resourcesPath;
}

function getLogDir() {
  const p = isDev ? './logs' : path.join(app.getPath('userData'), 'logs');

  // Ensure path exists.
  // TODO: handle error better.
  fs.mkdir(p, (e) => {
    if (e && e.code !== 'EEXIST') {
      log.error('Could not create log dir', p, e);
    }
  });
  return p;
}

function checkExists(target) {
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


function deleteIfExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.W_OK, (err) => {
      if (err) {
        resolve('not_exists');
      } else {
        fs.unlink(filePath, (err2) => {
          if (err2) {
            log.error('Failed to delete', filePath, err);
            reject(err2);
          } else {
            resolve('deleted');
          }
        });
      }
    });
  });
}


const knownChains = [
  { name: 'mainnet', id: 61 },
  { name: 'morden', id: 62 },
];

function isValidChain(chain) {
  const found = knownChains.filter((c) => c.name === chain.name && c.id === parseInt(chain.id, 10));
  return found.length === 1;
}


module.exports = {
  checkExists,
  deleteIfExists,
  getBinDir,
  getLogDir,
  isValidChain,
};
