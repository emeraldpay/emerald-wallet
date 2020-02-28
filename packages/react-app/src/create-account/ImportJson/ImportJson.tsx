import {
  Page, Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { BlockchainCode } from '@emeraldwallet/core';
import {addresses, screen, settings, State} from '@emeraldwallet/store';
import { Button, ChainSelector, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import FileDropField from './FileDropField';
import { Wallet } from '@emeraldpay/emerald-vault-core';

type ImportJsonProps = {
  wallet: Wallet,
  blockchain: BlockchainCode
}

type RenderProps = {
}

interface IImportJsonState {
  fileError?: any;
  file?: any;
}

type DispatchProps = {
  importFile: (file: any) => Promise<void>;
  openWallet: () => void;
}

const ImportJson = ((props: ImportJsonProps & DispatchProps & WithTranslation) => {
  const { t } = props;

  const [state, setState] = React.useState<IImportJsonState>({});

  const { file, fileError } = state;
  const onFileChange = (file: any) => {
    setState({file})
  };
  const submitFile = () => {
    const { importFile, openWallet } = props;
    importFile(state.file)
      .then(() => openWallet())
      .catch((err: any) => setState({ fileError: err.message }));
  };

  return (
    <Page title={t('accounts.import.title')}>
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
        rightColumn={<FileDropField name='wallet' onChange={onFileChange} />}
      />

      {file && (
        <FormRow
          rightColumn={(
            <React.Fragment>
              <Button primary={true} onClick={submitFile} label={t('common.submit')}/>
            </React.Fragment>
          )}
        />
      )}
    </Page>
  );
});

export default connect<RenderProps, DispatchProps, ImportJsonProps, State>(
  (state, ownProps) => {
    return {
    }
  },
  (dispatch, ownProps) => {
    return {
      importFile: (file: any) => {
        return new Promise((resolve, reject) => {
          dispatch(addresses.actions.importWalletFile(ownProps.wallet.id, ownProps.blockchain, file) as any)
            .then(resolve)
            .catch(reject);
        });
      },
      openWallet: () => {
        dispatch(screen.actions.gotoScreen('wallet', ownProps.wallet));
      }
    }
  }
)(withTranslation()(ImportJson));
