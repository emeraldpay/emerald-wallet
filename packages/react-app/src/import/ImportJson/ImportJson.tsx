import {
  Page, Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { BlockchainCode } from '@emeraldwallet/core';
import {addresses, screen, settings, State} from '@emeraldwallet/store';
import { Button, ChainSelector, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import FileDropField from './FileDropField';
import { EthereumAccount, Uuid } from '@emeraldpay/emerald-vault-core';

interface ImportJsonProps {
  importFile: any;
  openWallet: (walletId: Uuid) => void;
  accounts: any;
  onDashboard: any;
  blockchains: any[];
  onBackScreen?: any;
}

interface IImportJsonState {
  fileError: any;
  file: any;
  blockchain: any;
}

type Props = ImportJsonProps & WithTranslation;

class ImportJson extends React.Component<Props, IImportJsonState> {
  constructor (props: Props) {
    super(props);
    this.state = {
      fileError: null,
      file: null,
      blockchain: props.blockchains.length > 0 ? props.blockchains[0].params.code : ''
    };
  }

  public submitFile = () => {
    const { importFile, openWallet } = this.props;
    importFile(this.state.blockchain, this.state.file)
        .then((result: Uuid) => openWallet(result))
        .catch((err: any) => this.setState({ fileError: err.message }));
  };

  public onFileChange = (file: any) => {
    this.setState({
      file
    });
  };

  public onChainChange = (blockchain: any) => {
    this.setState({
      blockchain
    });
  };

  public render () {
    const { t, onDashboard, blockchains } = this.props;
    const { file, fileError, blockchain } = this.state;

    return (
        <Page title={t('accounts.import.title')} leftIcon={<Back onClick={onDashboard} />}>
          {fileError && (
            <FormRow
              rightColumn={(
                <Warning fullWidth={true}>
                  <WarningHeader>File error</WarningHeader>
                  <WarningText>{fileError}</WarningText>
                </Warning>
              )}
            />
            )}

          <FormRow
            rightColumn={<FileDropField name='wallet' onChange={this.onFileChange} />}
          />

          {file && (
            <FormRow
              rightColumn={(
                  <React.Fragment>
                    <Button primary={true} onClick={this.submitFile} label={t('common.submit')}/>
                    <ChainSelector onChange={this.onChainChange} value={blockchain} chains={blockchains}/>
                  </React.Fragment>
                )}
            />
            )}
        </Page>
    );
  }
}

export default connect<any, any, ImportJsonProps, State>(
  (state, ownProps) => ({
    blockchains: settings.selectors.currentChains(state)
  }),
  (dispatch, ownProps: Props) => ({
    importFile: (blockchain: BlockchainCode, file: any) => {
      return new Promise((resolve, reject) => {
        dispatch(addresses.actions.importWallet(blockchain, file, '', '') as any)
          .then(resolve)
          .catch(reject);
      });
    },
    openWallet: (walletId: Uuid) => {
      dispatch(screen.actions.gotoScreen('wallet', walletId));
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
    }
  })
)(withTranslation()(ImportJson));
