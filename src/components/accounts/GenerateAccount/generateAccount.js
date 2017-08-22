import React from 'react';
import { connect } from 'react-redux';

import Wallet from 'lib/wallet';
import saveAs from 'lib/saveAs';
import { createAccount, exportKeyFile, updateAccount } from 'store/accountActions';
import { gotoScreen } from '../../../store/screenActions';
import PasswordDialog from './PasswordDialog';
import DownloadDialog from './DownloadDialog';
import ShowPrivateDialog from './ShowPrivateDialog';
import AccountPropertiesDialog from './AccountPropertiesDialog';

const PAGES = {
    PASSWORD: 1,
    DOWNLOAD: 2,
    SHOW_PRIVATE: 3,
    ACCOUNT_PROPS: 4,
};

class GenerateAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: PAGES.PASSWORD,
        };
    }

    generate = (passphrase) => {
        // Create new account
        this.props.dispatch(createAccount(passphrase))
            .then((accountId) => {
                this.setState({
                    accountId,
                    passphrase,
                    page: PAGES.DOWNLOAD,
                });
            });
    };

    download = () => {
        const { passphrase, accountId } = this.state;

        // Get encrypted key file from emerald vault
        this.props.dispatch(exportKeyFile(accountId)).then((result) => {

            // Decrypt and get private key
            const wallet = Wallet.fromV3(result, passphrase);
            const privateKey = wallet.getPrivateKeyString();

            const newState = {
                ...this.state,
                page: PAGES.SHOW_PRIVATE,
                privateKey,
            };

            const fileData = {
                filename: `${accountId}.json`,
                mime: 'text/plain',
                contents: result,
            };

            // Give encrypted key file to user
            const blob = new Blob([fileData.contents], {type: fileData.mime});
            const url = URL.createObjectURL(blob);
            saveAs(url, fileData.filename);

            this.setState(newState);
        });
    }

    editAccountProps = () => {
        this.setState({
            ...this.state,
            page: PAGES.ACCOUNT_PROPS,
        });
    }

    skipAccountProps = () => {
        this.props.dispatch(gotoScreen('home'));
    }

    updateAccountProps = (name) => {
        const { dispatch } = this.props;
        dispatch(updateAccount(this.state.accountId, name))
            .then(() => dispatch(gotoScreen('home')));
    }

    render() {
        const { page, privateKey } = this.state;
        switch (page) {
            case PAGES.PASSWORD:
                return (<PasswordDialog onGenerate={ this.generate }/>);
            case PAGES.DOWNLOAD:
                return (<DownloadDialog onDownload={ this.download }/>);
            case PAGES.SHOW_PRIVATE:
                return (<ShowPrivateDialog privateKey={ privateKey } onNext={ this.editAccountProps }/>);
            case PAGES.ACCOUNT_PROPS:
                return (<AccountPropertiesDialog onSave={ this.updateAccountProps } onSkip={ this.skipAccountProps } />);
            default: return <div></div>;
        }
    }
}

export default connect()(GenerateAccount);
