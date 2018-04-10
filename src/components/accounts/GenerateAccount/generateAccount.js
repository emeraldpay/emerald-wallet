// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import muiThemeable from 'material-ui/styles/muiThemeable';
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
  t: any,
  backLabel: string,
}

type State = {
  loading: boolean,
  page: number,
  accountId: string,
  passphrase?: string,
  privateKey?: string,
}

class GenerateAccount extends React.Component<Props, State> {
  static propTypes = {
    dispatch: PropTypes.func,
    t: PropTypes.func.isRequired,
    backLabel: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: PAGES.PASSWORD,
      accountId: '',
    };
  }

  generate = (passphrase) => {
    this.setState({
      loading: true,
    });

    // Create new account
    this.props.dispatch(accounts.actions.createAccount(passphrase))
      .then((accountId) => {
        this.setState({
          loading: false,
          accountId,
          passphrase,
          page: PAGES.DOWNLOAD,
        });
      });
  };

  download = () => {
    const { passphrase, accountId } = this.state;

    this.setState({
      loading: true,
    });

    // Get encrypted key file from emerald vault
    this.props.dispatch(accounts.actions.exportKeyFile(accountId)).then((result) => {
      ipcRenderer.send('get-private-key', {keyfile: result, passphrase});
      ipcRenderer.once('recieve-private-key', (event, privateKey) => {
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
          loading: false,
          page: PAGES.SHOW_PRIVATE,
          privateKey,
          accountId,
        });
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

  updateAccountProps = (name: string) => {
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

  getPage() {
    const { page, privateKey, accountId } = this.state;
    const { t, backLabel } = this.props;
    switch (page) {
      case PAGES.PASSWORD:
        return (<PasswordDialog loading={this.state.loading} t={ t } onGenerate={ this.generate } backLabel={backLabel} onDashboard={ this.goToDashboard } />);
      case PAGES.DOWNLOAD:
        return (<DownloadDialog accountId={ accountId } loading={this.state.loading} t={ t } onDownload={ this.download }/>);
      case PAGES.SHOW_PRIVATE:
        return (<ShowPrivateDialog t={ t } privateKey={ privateKey } onNext={ this.editAccountProps }/>);
      case PAGES.ACCOUNT_PROPS:
        return (
          <AccountPropertiesDialog
            t={ t }
            onSave={ this.updateAccountProps }
            onSkip={ this.skipAccountProps }
          />);
      default: return null;
    }
  }

  render() {
    const { page, privateKey, accountId } = this.state;
    const { t, backLabel, muiTheme } = this.props;
    if (!page) { return null; }
    return (
      <div style={{border: `1px solid ${muiTheme.palette.borderColor}`}} >
        {this.getPage()}
      </div>
    );
  }
}

export default connect()(translate('accounts')(muiThemeable()(GenerateAccount)));
