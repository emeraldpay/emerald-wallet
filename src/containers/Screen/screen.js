import React from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import { Wei } from 'emerald-js';

import createLogger from '../../utils/logger';
import AddressBook from '../../components/addressbook/ContactList';
import AccountShow from '../../components/accounts/AccountShow';
import AddressShow from '../../components/addressbook/show';
import AddressAdd from '../../components/addressbook/AddContact';
import TransactionShow from '../../components/tx/TxDetails';
import MnemonicWizard from '../../components/accounts/MnemonicWizard';
import AddToken from '../../components/tokens/AddToken/add';
import LedgerImport from '../../components/ledger/ImportAccount';
import ImportJson from '../../components/accounts/add/ImportJson';
import ImportPrivateKey from '../../components/accounts/add/ImportPrivateKey';
import ImportMnemonic from '../../containers/ImportMnemonic';
import Welcome from '../../components/welcome/welcome';
import Landing from '../../containers/Landing';
import Dashboard from '../../components/layout/Dashboard';
import Settings from '../../components/settings';
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
      <CircularProgress size={50} secondary/> Initializing...
    </div>);
  } else if (screen === 'home') {
    return (<Dashboard />);
  } else if (screen === 'address-book') {
    return <AddressBook />;
  } else if (screen === 'address') {
    return <AddressShow address={ screenItem }/>;
  } else if (screen === 'add-address') {
    return <AddressAdd />;
  } else if (screen === 'landing-add-from-ledger') {
    return <LedgerImport onBackScreen={screenItem} />;
  } else if (screen === 'add-from-ledger') {
    return <LedgerImport />;
  } else if (screen === 'account') {
    return <AccountShow account={ screenItem }/>;
  } else if (screen === 'transaction') {
    return <TransactionShow hash={ screenItem.hash } accountId={ screenItem.accountId }/>;
  } else if (screen === 'create-tx') {
    return <MultiCreateTransaction account={ screenItem } />;
  } else if (screen === 'repeat-tx') {
    const {transaction, toAccount, fromAccount} = screenItem;
    const amount = new Wei(transaction.get('amount')).getEther();
    const to = toAccount.get('id');
    const gasLimit = transaction.get('gas');
    const data = transaction.get('data');
    const typedData = transaction.get('typedData');
    return <MultiCreateTransaction account={ fromAccount } to={to} amount={amount} gasLimit={gasLimit} data={data} typedData={typedData}/>;
  } else if (screen === 'landing-generate') {
    return <GenerateAccount onBackScreen="landing" backLabel="Back"/>;
  } else if (screen === 'generate') {
    return <GenerateAccount />;
  } else if (screen === 'importjson') {
    return <ImportJson />;
  } else if (screen === 'landing-importjson') {
    return <ImportJson onBackScreen="landing" backLabel="Back"/>;
  } else if (screen === 'import-private-key') {
    return <ImportPrivateKey />;
  } else if (screen === 'landing-import-private-key') {
    return <ImportPrivateKey onBackScreen="landing" />;
  } else if (screen === 'import-mnemonic') {
    return <ImportMnemonic />;
  } else if (screen === 'new-mnemonic') {
    return <MnemonicWizard />;
  } else if (screen === 'add-token') {
    return <AddToken />;
  } else if (screen === 'landing') {
    return <Landing />;
  } else if (screen === 'welcome') {
    return <Welcome />;
  } else if (screen === 'settings') {
    return <Settings />;
  } else if (screen === 'paper-wallet') {
    return <PaperWallet address={ screenItem.address } privKey={ screenItem.privKey } />;
  } else if (screen === 'export-paper-wallet') {
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
