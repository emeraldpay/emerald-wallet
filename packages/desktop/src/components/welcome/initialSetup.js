import React from 'react';
import { connect } from 'react-redux';
import { InitialSetup } from '@emeraldwallet/ui';
import { TERMS_VERSION } from '../../store/config';
import launcher from '../../store/launcher';
import Wallet from '../../store/wallet';
import { saveSettings, setChain } from '../../store/launcher/launcherActions';
// import { api } from '../../lib/rpc/api';

export default connect(
  (state, ownProps) => ({
    currentTermsVersion: TERMS_VERSION,
    terms: state.launcher.get('terms'),
  }),
  (dispatch, ownProps) => ({
    onTermsAgreed: () => dispatch(launcher.actions.agreeOnTerms(TERMS_VERSION)),
    connectETC: () => {
      dispatch(saveSettings({}));
      dispatch(Wallet.actions.onOpenWallet());
    },
    connectETH: () => {
      dispatch(saveSettings({}));
      dispatch(Wallet.actions.onOpenWallet());
    },
  })
)(InitialSetup);
