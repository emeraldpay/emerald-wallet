import { dialog, getCurrentWindow } from '@electron/remote';
import { IdSeedReference, SeedDescription, SeedDetails, Uuid } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen, settings } from '@emeraldwallet/store';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import SettingsForm from '../SettingsForm';
import { ExportResult, VAULT_FILE_FILTER } from './types';

export interface MutableState {
  currency: string;
  language: string;
}

export interface StateProps {
  hasWallets: boolean;
  seeds: SeedDescription[];
}

export interface DispatchProps {
  exportVaultFile(): Promise<ExportResult>;
  goBack(): void;
  isGlobalKeySet(): Promise<boolean>;
  onChangeGlobalKey(oldPassword: string, newPassword: string): Promise<boolean>;
  onSubmit(state: MutableState): Promise<void>;
  showNotification(message: string, type?: 'success' | 'warning'): void;
  updateSeed(seed: Uuid | IdSeedReference, details: Partial<SeedDetails>): Promise<boolean>;
}

export default connect<MutableState & StateProps, DispatchProps, unknown, IState>(
  (state) => ({
    currency: settings.selectors.fiatCurrency(state) ?? '',
    hasWallets: state.accounts.wallets.length > 0,
    language: i18n.language,
    seeds: accounts.selectors.getSeeds(state),
  }),
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
      dispatch(screen.actions.showNotification(message, type));
    },
    updateSeed(seed, details) {
      const result = dispatch(accounts.actions.updateSeed(seed, details));

      if (result) {
        dispatch(accounts.actions.loadSeedsAction());
      }

      return result;
    },
  }),
)(withTranslation('translation')(SettingsForm));
