import React from 'react';
import { connect } from 'react-redux';
import log from 'loglevel';

import AccountsList from './accounts/list';
import AddressBook from './addressbook/book';
import AccountShow from './accounts/show';
import AddressShow from './addressbook/show';
import AddressAdd from './addressbook/add';
import CreateTx from './tx/create';
import TransactionShow from './tx/show';
import TokensList from './tokens/list';
import AddToken from './tokens/add';
import Status from './status/status';
import CreateAccount from './accounts/add/add';
import GenerateAccount from './accounts/add/generate';
import ImportAccount from './accounts/add/importjson';
import ContractsList from './contracts/list';
import AddContract from './contracts/add';
import DeployContract from './contracts/deploy';
import ContractShow from './contracts/show';

const Render = ({ screen, screenItem }) => {
    log.debug('screen', screen);

    if (screen === null) {
        return <div>
            <i className="fa fa-spinner fa-spin fa-2x" /> Initializing...
        </div>;
    } else if (screen === 'home') {
        return (
            <div>
                <AccountsList/>
                <TokensList/>
                <Status/>
            </div>
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
        return (
            <AddressShow addressId={screenItem}/>
        );
    } else if (screen === 'add-address') {
        return <AddressAdd />;
    } else if (screen === 'account') {
        return <AccountShow account={screenItem}/>;
    } else if (screen === 'transaction') {
        return <TransactionShow hash={screenItem.hash} accountId={screenItem.accountId}/>;
    } else if (screen === 'create-tx') {
        return <CreateTx account={screenItem}/>;
    } else if (screen === 'create-account') {
        return <CreateAccount />;
    } else if (screen === 'generate') {
        return <GenerateAccount />;
    } else if (screen === 'importjson') {
        return <ImportAccount />;
    } else if (screen === 'add-token') {
        return <AddToken />;
    } else if (screen === 'deploy-contract') {
        return <DeployContract />;
    } else if (screen === 'contract') {
        return <ContractShow contract={screenItem} />;
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
