import React from 'react';
import { connect } from 'react-redux';
import { OpenWallet } from '@emeraldwallet/ui';
import Wallet from '../../store/wallet';
import { switchEndpoint } from '../../store/wallet/walletActions';
import { saveSettings, setChain } from '../../store/launcher/launcherActions';
import { api } from '../../lib/rpc/api';

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    connectETC: () => {
      api.updateChain('mainnet');
      dispatch(setChain('mainnet', 61));
      dispatch(saveSettings({}));
      dispatch(switchEndpoint({chain: 'mainnet', chainId: 61}));
      dispatch(Wallet.actions.onOpenWallet());
    },
    connectETH: () => {
      api.updateChain('eth');
      dispatch(setChain('eth', 1));
      dispatch(saveSettings({}));
      dispatch(switchEndpoint({chain: 'eth', chainId: 1}));
      dispatch(Wallet.actions.onOpenWallet());
    },
  })
)(OpenWallet);
