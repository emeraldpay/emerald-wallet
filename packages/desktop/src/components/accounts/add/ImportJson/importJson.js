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
import { screen, addresses, settings } from '@emeraldwallet/store';
import { Row, styles as formStyles } from 'elements/Form/index';

import FileDropField from './fileDropField';

class ImportJson extends React.Component {
    static propTypes = {
      importFile: PropTypes.func,
      showAccount: PropTypes.func,
      accounts: PropTypes.object,
      t: PropTypes.func,
      onDashboard: PropTypes.func,
      blockchains: PropTypes.array.isRequired,
    };

    constructor(props) {
      super(props);
      this.state = {
        fileError: null,
        file: null,
        blockchain: props.blockchains.length > 0 ? props.blockchains[0].params.code : '',
      };
    }

    submitFile = () => {
      const { importFile, showAccount } = this.props;
      importFile(this.state.blockchain, this.state.file)
        .then((result) => showAccount(Immutable.fromJS({id: result, blockchain: this.state.blockchain.toLowerCase()})))
        .catch((err) => this.setState({ fileError: err.message }));
    };

    onFileChange = (file) => {
      this.setState({
        file,
      });
    };

    onChainChange = (blockchain) => {
      this.setState({
        blockchain,
      });
    };

    render() {
      const { t, onDashboard, blockchains } = this.props;
      const { file, fileError, blockchain } = this.state;

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
                <ChainSelector onChange={ this.onChainChange } value={blockchain} chains={ blockchains }/>
              </div>
            </Row>)
          }
        </Page>
      );
    }
}

export default connect(
  (state, ownProps) => ({
    blockchains: settings.selectors.currentChains(state),
  }),
  (dispatch, ownProps) => ({
    importFile: (blockchain, file) => {
      return new Promise((resolve, reject) => {
        dispatch(addresses.actions.importWallet(blockchain, file, '', ''))
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
