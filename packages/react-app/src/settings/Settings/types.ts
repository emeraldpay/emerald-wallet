import { FileFilter } from 'electron';

export const VAULT_FILE_FILTER: Readonly<FileFilter> = { name: 'Emerald Vault', extensions: ['emrldvault'] };

export enum ExportResult {
  CANCEL,
  COMPLETE,
  FAILED,
}
