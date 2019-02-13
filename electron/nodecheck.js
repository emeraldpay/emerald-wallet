require('es6-promise').polyfill();
const os = require('os');
const { app } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

const {
  JsonRpc, HttpTransport, EthRpc, NodeChecker,
} = require('@emeraldplatform/emerald-js');
const log = require('./logger');

const headers = {
  'User-Agent': `EmeraldWallet/${app.getVersion()}`,
};

function initFetcher() {
  const details = [os.platform(), os.release(), os.arch(), app.getLocale()].join('; ');
  headers['User-Agent'] = `Electron/${process.versions.electron} (${details}) EmeraldWallet/${app.getVersion()} (+https://emeraldwallet.io) Chrome/${process.versions.chrome} node-fetch/1.0`;
}

function check(url) {
  const checker = new NodeChecker(new EthRpc(new JsonRpc(new HttpTransport(url, headers))));
  return checker.check();
}

function waitRpc(url) {
  const checker = new NodeChecker(new EthRpc(new JsonRpc(new HttpTransport(url, headers))));
  return new Promise((resolve, reject) => {
    const retry = (n) => {
      checker.exists().then((clientVersion) => resolve(clientVersion)).catch(() => {
        if (n > 0) {
          log.debug(`RPC ${url} not exists, going retry after 1000 ms`);
          setTimeout(() => retry(n - 1), 1000);
        } else {
          reject(new Error('Not Connected'));
        }
      });
    };
    retry(30);
  });
}

module.exports = {
  check,
  waitRpc,
  initFetcher,
};
