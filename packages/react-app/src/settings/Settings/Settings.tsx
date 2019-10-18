import { addresses, screen, settings } from '@emeraldwallet/store';
import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import Settings from '../SettingsForm';

const TranslatedSettings = withTranslation('translation')(Settings);

export default connect(
  (state: any, ownProps: any) => {
    return {
      showHiddenAccounts: state.wallet.settings.get('showHiddenAccounts', false),
      currency: state.wallet.settings.get('localeCurrency', '').toLowerCase(),
      language: i18n.language,
      numConfirmations: state.wallet.settings.get('numConfirmations')
    };
  },
  (dispatch, ownProps) => ({
    goBack: () => {
      dispatch(screen.actions.goBack());
    },

    onSubmit: (data: any) => {
      const newSettings = {
        language: data.language,
        localeCurrency: data.currency,
        showHiddenAccounts: data.showHiddenAccounts,
        numConfirmations: data.numConfirmations
      };
      i18n.changeLanguage(data.language);
      // TODO: re-write using saga
      dispatch(settings.actions.update(newSettings) as any);
      dispatch(addresses.actions.loadAccountsList() as any);
    }
  })
)(TranslatedSettings);
