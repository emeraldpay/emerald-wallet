// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import {NewAccountProps} from '@emeraldwallet/ui';
import { screen, addresses } from '@emeraldwallet/store';
import { saveJson } from '../../../lib/saveAs';
import PasswordDialog from './PasswordDialog';
import DownloadDialog from './DownloadDialog';
import ShowPrivateDialog from './ShowPrivateDialog';

const PAGES = {
  PASSWORD: 1,
  DOWNLOAD: 2,
  SHOW_PRIVATE: 3,
  ACCOUNT_PROPS: 4,
};

type ILandingProps = {
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
  blockchain: string,
}

class GenerateAccount extends React.Component<ILandingProps, State> {
  static propTypes = {
    dispatch: PropTypes.func,
    t: PropTypes.func.isRequired,
    backLabel: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: PAGES.PASSWORD,
      accountId: '',
      blockchain: 'ETH',
    };
  }

  generate = (passphrase, blockchain) => {
    this.setState({
      loading: true,
    });

    // Create new account
    this.props.dispatch(addresses.actions.createAccount(blockchain, passphrase))
      .then((accountId) => {
        this.setState({
          loading: false,
          accountId,
          passphrase,
          blockchain,
          page: PAGES.DOWNLOAD,
        });
      });
  };

  download = () => {
    const { blockchain, passphrase, accountId } = this.state;

    this.setState({
      loading: true,
    });

    // Get encrypted key file from emerald vault
    this.props.dispatch(addresses.actions.exportKeyFile(blockchain, accountId)).then((result) => {
      ipcRenderer.send('get-private-key', {keyfile: result, passphrase});
      ipcRenderer.once('recieve-private-key', (event, privateKey) => {
        saveJson(result, `${blockchain}-${accountId}.json`);

        this.setState({
          loading: false,
          page: PAGES.SHOW_PRIVATE,
          privateKey,
          accountId,
          blockchain,
        });
      });
    });
  };

  editAccountProps = () => {
    this.setState({
      page: PAGES.ACCOUNT_PROPS,
    });
  };

  skipAccountProps = () => {
    this.props.dispatch(screen.actions.gotoScreen('home'));
  };

  updateAccountProps = (name: string) => {
    const { dispatch } = this.props;
    dispatch(addresses.actions.updateAccount(this.state.blockchain, this.state.accountId, name))
      .then(() => dispatch(screen.actions.gotoScreen('home')));
  };

  goToDashboard = () => {
    if (this.props.onBackScreen) {
      this.props.dispatch(screen.actions.gotoScreen(this.props.onBackScreen));
    } else {
      this.props.dispatch(screen.actions.gotoScreen('home'));
    }
  };

  getPage() {
    const { page, privateKey, accountId } = this.state;
    const { t, backLabel } = this.props;
    switch (page) {
      case PAGES.PASSWORD:
        return (<PasswordDialog
          loading={this.state.loading}
          t={ t }
          onGenerate={ this.generate }
          backLabel={backLabel}
          onDashboard={ this.goToDashboard }
        />);
      case PAGES.DOWNLOAD:
        return (<DownloadDialog accountId={ accountId } loading={this.state.loading} t={ t } onDownload={ this.download }/>);
      case PAGES.SHOW_PRIVATE:
        return (<ShowPrivateDialog t={ t } privateKey={ privateKey } onNext={ this.editAccountProps }/>);
      case PAGES.ACCOUNT_PROPS:
        return (
          <NewAccountProps
            t={ t }
            onSave={ this.updateAccountProps }
            onSkip={ this.skipAccountProps }
          />);
      default: return null;
    }
  }

  render() {
    const { page } = this.state;
    const { t } = this.props;
    if (!page) { return null; }
    return (
      <div>
        {this.getPage()}
      </div>
    );
  }
}

export default connect()(withTranslation()(GenerateAccount));
