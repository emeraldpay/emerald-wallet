import { accounts, IState, screen, settings } from '@emeraldwallet/store';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import Settings from '../SettingsForm';

export interface StateProps {
  currency: string;
  language: string;
}

export interface DispatchProps {
  goBack(): void;
  onChangeGlobalKey(oldPassword: string, newPassword: string): Promise<boolean>;
  onSubmit(data: StateProps): Promise<void>;
  showNotification(message: string, type?: 'success' | 'warning'): void;
}

export default connect<StateProps, DispatchProps, {}, IState>(
  (state) => {
    return {
      currency: settings.selectors.fiatCurrency(state) ?? '',
      language: i18n.language,
    };
  },
  (dispatch: any) => ({
    goBack: () => {
      dispatch(screen.actions.goBack());
    },
    onChangeGlobalKey(oldPassword, newPassword) {
      return dispatch(accounts.actions.changeGlobalKey(oldPassword, newPassword));
    },
    async onSubmit(data) {
      await i18n.changeLanguage(data.language);

      dispatch(settings.actions.updateSettings({ language: data.language, localeCurrency: data.currency }));
    },
    showNotification(message, type = 'success') {
      dispatch(screen.actions.showNotification(message, type, 3000, null, null));
    },
  }),
)(withTranslation('translation')(Settings));
