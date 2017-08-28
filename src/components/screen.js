import React from 'react';
import { connect } from 'react-redux';
import createLogger from '../utils/logger';

import AddressBook from './addressbook/book';
import AccountShow from './accounts/AccountShow';
import AddressShow from './addressbook/show';
import AddressAdd from './addressbook/add';
import CreateTx from './tx/CreateTx';
import TransactionShow from './tx/TxDetails';
// import TokensList from './tokens/list';
import AddToken from './tokens/add';
import LedgerImport from './accounts/add/ledger/select';
import ImportJson from './accounts/add/ImportJson';
import ImportPrivateKey from './accounts/add/ImportPrivateKey';
import ContractsList from './contracts/list';
import AddContract from './contracts/add';
import DeployContract from './contracts/deploy';
import ContractShow from './contracts/show';
import Welcome from './welcome/welcome';
import Dashboard from '../containers/Dashboard';
import Settings from './settings';
import PaperWallet from '../containers/PaperWallet';
import ExportPaperWallet from '../containers/ExportPaperWallet';
import GenerateAccount2 from '../components/accounts/GenerateAccount';

const log = createLogger('screen');

const Render = ({ screen, screenItem }) => {
    log.debug('Show screen: ', screen);

    if (screen === null) {
        return <div>
            <i className="fa fa-spinner fa-spin fa-2x" /> Initializing...
        </div>;
    } else if (screen === 'home') {
        return (
            <Dashboard />
        );
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
        return <GenerateAccount2 />;
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

const Screen = connect(
    (state, ownProps) => ({
        screen: state.screen.get('screen'),
        screenItem: state.screen.get('item'),
    }),
    (dispatch, ownProps) => ({})
)(Render);

export default Screen;
