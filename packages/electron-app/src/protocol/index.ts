import { app, webContents } from 'electron';

const getMainWebContents = () => webContents
  .getAllWebContents()
  .find((webcontent: any) => !!webcontent.browserWindowOptions);

export function protocolHandler (event: any, url: string) {
  if (event) { event.preventDefault(); }

  const wc = getMainWebContents();
  if (!wc) {
    setTimeout(() => protocolHandler(null, url), 500);
    return;
  }
  wc.send('protocol', { url });
  wc.on('did-finish-load', () => wc.send('protocol', { url }));
}

export function startProtocolHandler () {
  app.setAsDefaultProtocolClient('ethereum');

  app.on('will-finish-launching', () => {
    app.on('open-url', protocolHandler);
  });

  if (process.argv[1] && process.argv[1].includes('ethereum:')) {
    protocolHandler(null, process.argv[1]);
  }
}
