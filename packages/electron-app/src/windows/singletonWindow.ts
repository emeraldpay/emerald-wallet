import { BrowserWindow, app } from 'electron';
import { protocolHandler } from '../protocolHandler';

export function assertSingletonWindow(): void {
  const isNotLocked = app.requestSingleInstanceLock();

  if (isNotLocked) {
    app.on('second-instance', (event, commandLine) => {
      const [window] = BrowserWindow.getAllWindows();

      if (window != null) {
        if (window.isMinimized()) {
          window.restore();
        }

        window.focus();

        protocolHandler(event, commandLine[1]);
      }
    });
  } else {
    app.quit();
  }
}
