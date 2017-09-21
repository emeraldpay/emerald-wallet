import React from 'react';
import { connect } from 'react-redux';
import createLogger from '../../utils/logger';

import AddressBook from '../../components/addressbook/book';
import AccountShow from '../../components/accounts/AccountShow';
import AddressShow from '../../components/addressbook/show';
import AddressAdd from '../../components/addressbook/add';
import CreateTx from '../../components/tx/CreateTx';
import TransactionShow from '../../components/tx/TxDetails';
// import TokensList from './tokens/list';
import AddToken from '../../components/tokens/AddToken/add';
import LedgerImport from '../../components/accounts/add/ledger/select';
import ImportJson from '../../components/accounts/add/ImportJson';
import ImportPrivateKey from '../../components/accounts/add/ImportPrivateKey';
import ContractsList from '../../components/contracts/list';
import AddContract from '../../components/contracts/add';
import DeployContract from '../../components/contracts/deploy';
import ContractShow from '../../components/contracts/show';
import Welcome from '../../components/welcome/welcome';
import Dashboard from '../../components/layout/Dashboard';
import Settings from '../../components/settings';
import PaperWallet from '../PaperWallet';
import ExportPaperWallet from '../../components/accounts/ExportPaperWallet';
import GenerateAccount from '../../components/accounts/GenerateAccount';

const log = createLogger('screen');

const Screen = ({ screen, screenItem }) => {
    log.debug('Show screen: ', screen);

    if (screen === null) {
        return <div>
            <i className="fa fa-spinner fa-spin fa-2x" /> Initializing...
        </div>;
    } else if (screen === 'home') {
        return (<Dashboard />);
    } else if (screen === 'contracts') {
        return (
            <div>
                <ContractsList/>
                <AddContract/>
            </div>
        );
    } else if (screen === 'address-book') {
        return <AddressBook />;
    } else if (screen === 'address') {
        return <AddressShow addressId={ screenItem }/>;
    } else if (screen === 'add-address') {
        return <AddressAdd />;
    } else if (screen === 'add-from-ledger') {
        return <LedgerImport />;
    } else if (screen === 'account') {
        return <AccountShow account={ screenItem }/>;
    } else if (screen === 'transaction') {
        return <TransactionShow hash={ screenItem.hash } accountId={ screenItem.from }/>;
    } else if (screen === 'create-tx') {
        return <CreateTx account={ screenItem }/>;
    } else if (screen === 'generate') {
        return <GenerateAccount />;
    } else if (screen === 'importjson') {
        return <ImportJson />;
    } else if (screen === 'import-private-key') {
        return <ImportPrivateKey />;
    } else if (screen === 'add-token') {
        return <AddToken />;
    } else if (screen === 'deploy-contract') {
        return <DeployContract />;
    } else if (screen === 'contract') {
        return <ContractShow contract={ screenItem } />;
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
    (state, ownProps) => ({
        screen: state.wallet.screen.get('screen'),
        screenItem: state.wallet.screen.get('item'),
    }),
    (dispatch, ownProps) => ({})
)(Screen);

