const { app } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

const log = require('./logger');

function assertSingletonWindow(state) {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    console.log('no window existed!');
    if (state.window) {
      log.debug('already existing window!');
      if (state.window.isMinimized()) {
        state.window.restore();
      }
      state.window.focus();
    }
  });
}

module.exports = assertSingletonWindow;
