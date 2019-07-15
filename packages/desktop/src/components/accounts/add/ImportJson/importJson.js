import React from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import {
  Page, Warning, WarningText, WarningHeader
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button, ChainSelector } from '@emeraldwallet/ui';
import { screen, addresses } from '@emeraldwallet/store';
import { Row, styles as formStyles } from 'elements/Form/index';

import FileDropField from './fileDropField';
import settings from '../../../../store/wallet/settings';

class ImportJson extends React.Component {
    static propTypes = {
      importFile: PropTypes.func,
      showAccount: PropTypes.func,
      accounts: PropTypes.object,
      t: PropTypes.func,
      onDashboard: PropTypes.func,
    };

    constructor(props) {
      super(props);
      this.state = {
        fileError: null,
        file: null,
        chain: props.chains.length > 0 ? props.chains[0].params.coinTicker : '',
      };
    }

    submitFile = () => {
      const { importFile, showAccount } = this.props;
      importFile(this.state.chain, this.state.file)
        .then((result) => showAccount(Immutable.fromJS({id: result, blockchain: this.state.chain.toLowerCase()})))
        .catch((err) => this.setState({ fileError: err.message }));
    };

    onFileChange = (file) => {
      this.setState({
        file,
      });
    };

    onChainChange = (chain) => {
      this.setState({
        chain,
      });
    };

    render() {
      const { t, onDashboard, chains } = this.props;
      const { file, fileError, chain } = this.state;

      return (
        <Page title={ t('import.title') } leftIcon={<Back onClick={onDashboard} />}>
          {fileError && (
            <Row>
              <div style={ formStyles.left }/>
              <div style={ formStyles.right }>
                <Warning fullWidth={ true }>
                  <WarningHeader>File error</WarningHeader>
                  <WarningText>{ fileError }</WarningText>
                </Warning>
              </div>
            </Row>
          )}
          <Row>
            <div style={ formStyles.left }/>
            <div style={ formStyles.right }>
              <FileDropField
                name="wallet"
                onChange={ this.onFileChange }
              />
            </div>
          </Row>

          {file && (
            <Row>
              <div style={ formStyles.left }/>
              <div style={ formStyles.right }>
                <Button primary onClick={ this.submitFile } label={ t('common:submit') }/>
                <ChainSelector onChange={ this.onChainChange } value={chain} chains={ chains }/>
              </div>
            </Row>)
          }
        </Page>
      );
    }
}

export default connect(
  (state, ownProps) => ({
    chains: settings.selectors.currentChains(state),
  }),
  (dispatch, ownProps) => ({
    importFile: (chain, file) => {
      return new Promise((resolve, reject) => {
        dispatch(addresses.actions.importWallet(chain, file, '', ''))
          .then(resolve)
          .catch(reject);
      });
    },
    showAccount: (account) => {
      dispatch(screen.actions.gotoScreen('account', account));
    },
    onDashboard: () => {
      if (ownProps.onBackScreen) {
        dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
    cancel: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(translate('accounts')(ImportJson));
