import { ipcRenderer } from 'electron';

export function agreeOnTerms (v: any) {
  ipcRenderer.send('terms', v);
  return {
    type: 'LAUNCHER/TERMS',
    version: v
  };
}
