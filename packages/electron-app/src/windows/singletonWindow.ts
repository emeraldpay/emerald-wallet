import { app, BrowserWindow } from 'electron';
import { protocolHandler } from '../protocol';

export function assertSingletonWindow () {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const window = BrowserWindow.getAllWindows()[0];

    if (window) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();

      protocolHandler(event, commandLine[1]);
    }
  });
}
