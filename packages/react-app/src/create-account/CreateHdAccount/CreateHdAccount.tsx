import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, IState, screen, settings } from '@emeraldwallet/store';
import { Button, FormRow, PasswordInput } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import SelectBlockchain from './SelectBlockchain';

interface IProps {
  blockchains: any[];
}

interface IOwnProps {
  walletId: string;
}

interface IDispatchProps {
  onCancel?: any;
  createAccount?: any;
}

function CreateHdAccount (props: IProps & IOwnProps & IDispatchProps) {
  const { onCancel } = props;
  const [selectedChain, setSelectedChain] = React.useState();
  const [password, setPassword] = React.useState();

  function handleSelectChain (code: any) {
    setSelectedChain(code);
  }

  function handlePasswordChange (pwd: string) {
    setPassword(pwd);
  }

  function create () {
    if (props.createAccount) {
      props.createAccount(selectedChain, password);
    }
  }

  return (
    <Page
      leftIcon={(<Back onClick={onCancel}/>)}
      title={'Select cryptocurrency'}
    >
    <SelectBlockchain
      selected={selectedChain}
      supportedBlockchain={props.blockchains}
      selectBlockchain={handleSelectChain}
      onCancel={props.onCancel}
    />
    <FormRow
      leftColumn={(<span>Wallet password</span>)}
      rightColumn={(
        <PasswordInput
          onChange={handlePasswordChange}
          password={password}
        />
      )}
    />
    <FormRow
      rightColumn={(
        <Button
          primary={true}
          label='ADD ACCOUNT'
          onClick={create}
        />
      )}
    />
    </Page>
  );
}

function mapStateToProps (state: IState): IProps {
  return {
    blockchains: settings.selectors.currentChains(state)
  };
}

function mapDispatchToProps (dispatch: any, ownProps: IOwnProps) {
  return {
    onCancel: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
    },
    createAccount: (chain: BlockchainCode, password: string) => {
      dispatch(accounts.actions.createHdAccountAction(ownProps.walletId, chain, password));
    }
  };
}

export default connect<IProps, {}, IOwnProps, IState>(
  mapStateToProps,
  mapDispatchToProps
)(CreateHdAccount);
