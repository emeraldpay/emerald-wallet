// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { Wallet } from 'emerald-js';
import saveAs from '../../../lib/saveAs';
import accounts from '../../../store/vault/accounts';
import screen from '../../../store/wallet/screen';
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

type Props = {
    dispatch: any,
    t: any
}

type State = {
    page: number,
    accountId: string,
    passphrase?: string,
    privateKey?: string,
}

class GenerateAccount extends React.Component<Props, State> {
    static propTypes = {
        dispatch: PropTypes.func,
        t: PropTypes.func.isRequired,
        onBackScreen: PropTypes.string,
        backLabel: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            page: PAGES.PASSWORD,
            accountId: '',
        };
    }

    generate = (passphrase) => {
        // Create new account
        this.props.dispatch(accounts.actions.createAccount(passphrase))
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
        this.props.dispatch(accounts.actions.exportKeyFile(accountId)).then((result) => {
            // Decrypt and get private key
            const wallet = Wallet.fromV3(result, passphrase);
            const privateKey = wallet.getPrivateKeyString();

            const fileData = {
                filename: `${accountId}.json`,
                mime: 'text/plain',
                contents: result,
            };

            // Give encrypted key file to user
            const blob = new Blob([fileData.contents], {type: fileData.mime});
            const url = URL.createObjectURL(blob);
            saveAs(url, fileData.filename);

            this.setState({
                page: PAGES.SHOW_PRIVATE,
                privateKey,
            });
        });
    }

    editAccountProps = () => {
        this.setState({
            page: PAGES.ACCOUNT_PROPS,
        });
    }

    skipAccountProps = () => {
        this.props.dispatch(screen.actions.gotoScreen('home'));
    }

    updateAccountProps = (name) => {
        const { dispatch } = this.props;
        dispatch(accounts.actions.updateAccount(this.state.accountId, name))
            .then(() => dispatch(screen.actions.gotoScreen('home')));
    }

    goToDashboard = () => {
      if (this.props.onBackScreen) {
        this.props.dispatch(screen.actions.gotoScreen(this.props.onBackScreen));
      } else {
        this.props.dispatch(screen.actions.gotoScreen('home'));
      }
    }

    render() {
        const { page, privateKey } = this.state;
      const { t, backLabel } = this.props;
        switch (page) {
            case PAGES.PASSWORD:
          return (<PasswordDialog t={ t } onGenerate={ this.generate } backLabel={backLabel}onDashboard={ this.goToDashboard } />);
            case PAGES.DOWNLOAD:
                return (<DownloadDialog t={ t } onDownload={ this.download }/>);
            case PAGES.SHOW_PRIVATE:
                return (<ShowPrivateDialog t={ t } privateKey={ privateKey } onNext={ this.editAccountProps }/>);
            case PAGES.ACCOUNT_PROPS:
                return (
                    <AccountPropertiesDialog
                        t={ t }
                        onSave={ this.updateAccountProps }
                        onSkip={ this.skipAccountProps }
                    />);
            default: return <div></div>;
        }
    }
}

export default connect()(translate('accounts')(GenerateAccount));
