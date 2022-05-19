import { dialog, getCurrentWindow } from '@electron/remote';
import { accounts, IState, screen, settings } from '@emeraldwallet/store';
import { FileFilter } from 'electron';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import Settings from '../SettingsForm';

export const VAULT_FILE_FILTER: Readonly<FileFilter> = { name: 'Emerald Vault', extensions: ['emrldvault'] };

export enum ExportResult {
  CANCEL,
  COMPLETE,
  FAILED,
}

export interface MutableState {
  currency: string;
  language: string;
}

export interface StateProps {
  hasWallets: boolean;
}

export interface DispatchProps {
  exportVaultFile(): Promise<ExportResult>;
  goBack(): void;
  isGlobalKeySet(): Promise<boolean>;
  onChangeGlobalKey(oldPassword: string, newPassword: string): Promise<boolean>;
  onSubmit(state: MutableState): Promise<void>;
  showNotification(message: string, type?: 'success' | 'warning'): void;
}

export default connect<MutableState & StateProps, DispatchProps, {}, IState>(
  (state) => {
    return {
      currency: settings.selectors.fiatCurrency(state) ?? '',
      hasWallets: state.accounts.wallets.length > 0,
      language: i18n.language,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    async exportVaultFile() {
      const { filePath } = await dialog.showSaveDialog(getCurrentWindow(), { filters: [VAULT_FILE_FILTER] });

      if (filePath == null || filePath.length === 0) {
        return ExportResult.CANCEL;
      }

      const exported = await dispatch(settings.actions.exportVaultFile(filePath));

      return exported ? ExportResult.COMPLETE : ExportResult.FAILED;
    },
    goBack: () => {
      dispatch(screen.actions.goBack());
    },
    isGlobalKeySet() {
      return dispatch(accounts.actions.isGlobalKeySet());
    },
    onChangeGlobalKey(oldPassword, newPassword) {
      return dispatch(accounts.actions.changeGlobalKey(oldPassword, newPassword));
    },
    async onSubmit(state) {
      await i18n.changeLanguage(state.language);

      dispatch(settings.actions.updateSettings({ language: state.language, localeCurrency: state.currency }));
    },
    showNotification(message, type = 'success') {
      dispatch(screen.actions.showNotification(message, type, 3000, null, null));
    },
  }),
)(withTranslation('translation')(Settings));
