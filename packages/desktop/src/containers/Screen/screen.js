import React from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Wei } from '@emeraldplatform/eth';
import {
  ContactList as AddressBook, AddContact, PaperWallet, ExportPaperWallet, ImportJson,
} from '@emeraldwallet/react-app';

import createLogger from '../../utils/logger';
import AccountShow from '../../components/accounts/AccountShow';
import TransactionShow from '../../components/tx/TxDetails';
import MnemonicWizard from '../../components/accounts/MnemonicWizard';
import LedgerImport from '../../components/ledger/ImportAccount';
import ImportPrivateKey from '../../components/accounts/add/ImportPrivateKey';
import ImportMnemonic from '../ImportMnemonic';
import Welcome from '../../components/welcome/welcome';
import Home from '../Home';
import Settings from '../Settings';
import GenerateAccount from '../../components/accounts/GenerateAccount';
import { screen } from '../../store';
import MultiCreateTransaction from '../MultiCreateTransaction';

const log = createLogger('screen');

const Screen = (props) => {
  log.debug('Show screen: ', props.screen);

  if (props.screen === null) {
    return (<div>
      <CircularProgress size={50} secondary="true" /> Initializing...
    </div>);
  }
  if (props.screen === 'home') {
    return (<Home />);
  }
  if (props.screen === 'address-book') {
    return <AddressBook />;
  }
  if (props.screen === 'add-address') {
    return <AddContact />;
  }
  if (props.screen === 'landing-add-from-ledger') {
    return <LedgerImport onBackScreen={props.screenItem} />;
  } if (props.screen === 'add-from-ledger') {
    return <LedgerImport />;
  } if (props.screen === 'account') {
    return <AccountShow account={ props.screenItem }/>;
  } if (props.screen === 'transaction') {
    return <TransactionShow hash={ props.screenItem.hash } accountId={ props.screenItem.accountId }/>;
  } if (props.screen === 'create-tx') {
    return <MultiCreateTransaction account={ props.screenItem } />;
  }
  if (props.screen === 'repeat-tx') {
    const {transaction, toAccount, fromAccount} = props.screenItem;
    const amount = new Wei(transaction.value);
    const to = toAccount.get('id');
    const gasLimit = transaction.gas;
    const { data, typedData, mode } = transaction;
    return <MultiCreateTransaction account={ fromAccount } to={to} amount={amount} gasLimit={gasLimit} data={data} typedData={typedData} mode={mode}/>;
  }
  if (props.screen === 'landing-generate') {
    return <GenerateAccount backLabel="Back"/>;
  }
  if (props.screen === 'generate') {
    return <GenerateAccount />;
  }
  if (props.screen === 'importjson') {
    return <ImportJson />;
  }
  if (props.screen === 'landing-importjson') {
    return <ImportJson backLabel="Back"/>;
  }
  if (props.screen === 'import-private-key') {
    return <ImportPrivateKey />;
  }
  if (props.screen === 'landing-import-private-key') {
    return <ImportPrivateKey />;
  }
  if (props.screen === 'import-mnemonic') {
    return <ImportMnemonic />;
  }
  if (props.screen === 'new-mnemonic') {
    return <MnemonicWizard />;
  }
  if (props.screen === 'welcome') {
    return <Welcome />;
  }
  if (props.screen === 'settings') {
    return <Settings />;
  }
  if (props.screen === 'paper-wallet') {
    return <PaperWallet address={ props.screenItem.address } privKey={ props.screenItem.privKey } />;
  }
  if (props.screen === 'export-paper-wallet') {
    return <ExportPaperWallet accountId={ props.screenItem.address } blockchain={ props.screenItem.blockchain } />;
  }

  return (
    <div>
            Unknown screen
    </div>
  );
};

export default connect(
  (state, ownProps) => screen.selectors.getCurrentScreen(state),
  (dispatch, ownProps) => ({})
)(Screen);
