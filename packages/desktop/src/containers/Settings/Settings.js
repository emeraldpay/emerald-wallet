import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { i18n } from '@emeraldwallet/react-app';
import { Settings } from '@emeraldwallet/ui';
import { screen, addresses } from '@emeraldwallet/store';
import settings from '../../store/wallet/settings';

const TranslatedSettings = withTranslation('translation')(Settings);

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
      dispatch(addresses.actions.loadAccountsList());
    },
  })
)(TranslatedSettings);
