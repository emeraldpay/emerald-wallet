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
      currency: (settings.selectors.fiatCurrency(state) || '').toLowerCase(),
      language: i18n.language,
      numConfirmations: settings.selectors.numConfirms(state)
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
        numConfirmations: data.numConfirmations
      };
      i18n.changeLanguage(data.language);
      dispatch(settings.actions.updateSettings(newSettings) as any);
      // TODO: get rid of this
      dispatch(addresses.actions.loadAccountsList() as any);
    }
  })
)(TranslatedSettings);
