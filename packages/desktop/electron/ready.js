const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

let ready = false;
const handlers = [];

function onceReady(f) {
  if (ready) {
    f();
  }
  handlers.push(f);
}

ipcMain.on('emerald-ready', () => {
  log.info('Emerald app launched');
  ready = true;
  handlers.forEach((f) => f());
});

module.exports = {
  onceReady,
};
