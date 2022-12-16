import { IpcCommands } from '@emeraldwallet/core';
import { Event, app, webContents } from 'electron';

export function protocolHandler(event: Event | null, url: string): void {
  event?.preventDefault();

  const [webContent] = webContents.getAllWebContents();

  if (webContent == null) {
    setTimeout(() => protocolHandler(null, url), 500);
  } else {
    webContent.send(IpcCommands.HANDLE_URL, { url });
  }
}

export function startProtocolHandler(): void {
  app.setAsDefaultProtocolClient('ethereum');

  app.on('will-finish-launching', () => app.on('open-url', protocolHandler));

  const [, arg] = process.argv;

  if (arg?.includes('ethereum:') === true) {
    protocolHandler(null, arg);
  }
}
