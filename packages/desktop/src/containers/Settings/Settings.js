import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Settings } from '@emeraldwallet/ui';
import screen from '../../store/wallet/screen';
import settings from '../../store/wallet/settings';
import accounts from '../../store/vault/accounts';
import i18n from '../../i18n/i18n';

const TranslatedSettings = translate('settings')(Settings);

export default connect(
  (state, ownProps) => {
    return {
      showHiddenAccounts: state.wallet.settings.get('showHiddenAccounts', false),
      currency: state.wallet.settings.get('localeCurrency', '').toLowerCase(),
      language: i18n.language,
      numConfirmations: state.wallet.settings.get('numConfirmations'),
    };
  },
  (dispatch, ownProps) => ({
    goBack: () => {
      dispatch(screen.actions.goBack());
    },

    onSubmit: (data) => {
      const newSettings = {
        language: data.language,
        localeCurrency: data.currency,
        showHiddenAccounts: data.showHiddenAccounts,
        numConfirmations: data.numConfirmations,
      };
      i18n.changeLanguage(data.language);
      dispatch(settings.actions.update(newSettings));
      dispatch(accounts.actions.loadAccountsList());
    },
  })
)(TranslatedSettings);
