import {
  Page, Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { BlockchainCode, Wallet } from '@emeraldwallet/core';
import { accounts, IState, screen, settings } from '@emeraldwallet/store';
import { Button, ChainSelector, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import FileDropField from './FileDropField';

interface IImportJsonProps {
  wallet: Wallet;
  blockchain: BlockchainCode;
}

interface RenderProps {
}

interface IImportJsonState {
  fileError?: any;
  file?: any;
}

interface IDispatchProps {
  importFile: (file: any) => Promise<void>;
  openWallet: () => void;
}

const ImportJson = ((props: IImportJsonProps & IDispatchProps & WithTranslation) => {
  const { t } = props;

  const [state, setState] = React.useState<IImportJsonState>({});

  const { file, fileError } = state;
  const onFileChange = (file: any) => {
    setState({ file });
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

export default connect<RenderProps, IDispatchProps, IImportJsonProps, IState>(
  (state, ownProps) => {
    return {
    };
  },
  (dispatch, ownProps) => {
    return {
      importFile: (file: any) => {
        return new Promise((resolve, reject) => {
          dispatch(accounts.actions.importWalletFile(ownProps.wallet.id, ownProps.blockchain, file) as any)
            .then(resolve)
            .catch(reject);
        });
      },
      openWallet: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.wallet));
      }
    };
  }
)(withTranslation()(ImportJson));
