import React from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import { Wei } from '@emeraldplatform/eth';

import createLogger from '../../utils/logger';
import AddressBook from '../../components/addressbook/ContactList';
import AccountShow from '../../components/accounts/AccountShow';
import AddressShow from '../../components/addressbook/AddressShow';
import AddContact from '../../components/addressbook/AddContact';
import TransactionShow from '../../components/tx/TxDetails';
import MnemonicWizard from '../../components/accounts/MnemonicWizard';
import AddToken from '../../components/tokens/AddToken/add';
import LedgerImport from '../../components/ledger/ImportAccount';
import ImportJson from '../../components/accounts/add/ImportJson';
import ImportPrivateKey from '../../components/accounts/add/ImportPrivateKey';
import ImportMnemonic from '../ImportMnemonic';
import Welcome from '../../components/welcome/welcome';
import Landing from '../Landing';
import Dashboard from '../../components/layout/Dashboard';
import Settings from '../Settings';
import PaperWallet from '../PaperWallet';
import ExportPaperWallet from '../../components/accounts/ExportPaperWallet';
import GenerateAccount from '../../components/accounts/GenerateAccount';
import WalletScreen from '../../store/wallet/screen';
import MultiCreateTransaction from '../MultiCreateTransaction';

const log = createLogger('screen');

const Screen = ({ screen, screenItem }) => {
  log.debug('Show screen: ', screen);

  if (screen === null) {
    return (<div>
      <CircularProgress size={50} secondary="true" /> Initializing...
    </div>);
  } if (screen === 'home') {
    return (<Dashboard />);
  } if (screen === 'address-book') {
    return <AddressBook />;
  } if (screen === 'address') {
    return <AddressShow address={ screenItem }/>;
  } if (screen === 'add-address') {
    return <AddContact />;
  } if (screen === 'landing-add-from-ledger') {
    return <LedgerImport onBackScreen={screenItem} />;
  } if (screen === 'add-from-ledger') {
    return <LedgerImport />;
  } if (screen === 'account') {
    return <AccountShow account={ screenItem }/>;
  } if (screen === 'transaction') {
    return <TransactionShow hash={ screenItem.hash } accountId={ screenItem.accountId }/>;
  } if (screen === 'create-tx') {
    return <MultiCreateTransaction account={ screenItem } />;
  }
  if (screen === 'repeat-tx') {
    const {transaction, toAccount, fromAccount} = screenItem;
    const amount = new Wei(transaction.get('amount')).toEther();
    const to = toAccount.get('id');
    const gasLimit = transaction.get('gas');
    const data = transaction.get('data');
    const typedData = transaction.get('typedData');
    const mode = transaction.get('mode');
    return <MultiCreateTransaction account={ fromAccount } to={to} amount={amount} gasLimit={gasLimit} data={data} typedData={typedData} mode={mode}/>;
  }
  if (screen === 'landing-generate') {
    return <GenerateAccount onBackScreen="landing" backLabel="Back"/>;
  }
  if (screen === 'generate') {
    return <GenerateAccount />;
  }
  if (screen === 'importjson') {
    return <ImportJson />;
  }
  if (screen === 'landing-importjson') {
    return <ImportJson onBackScreen="landing" backLabel="Back"/>;
  }
  if (screen === 'import-private-key') {
    return <ImportPrivateKey />;
  }
  if (screen === 'landing-import-private-key') {
    return <ImportPrivateKey onBackScreen="landing" />;
  }
  if (screen === 'import-mnemonic') {
    return <ImportMnemonic />;
  }
  if (screen === 'new-mnemonic') {
    return <MnemonicWizard />;
  }
  if (screen === 'add-token') {
    return <AddToken />;
  }
  if (screen === 'landing') {
    return <Landing />;
  }
  if (screen === 'welcome') {
    return <Welcome />;
  }
  if (screen === 'settings') {
    return <Settings />;
  }
  if (screen === 'paper-wallet') {
    return <PaperWallet address={ screenItem.address } privKey={ screenItem.privKey } />;
  }
  if (screen === 'export-paper-wallet') {
    return <ExportPaperWallet accountId={ screenItem } />;
  }

  return (
    <div>
            Unknown screen
    </div>
  );
};

export default connect(
  (state, ownProps) => WalletScreen.selectors.getCurrentScreen(state),
  (dispatch, ownProps) => ({})
)(Screen);
