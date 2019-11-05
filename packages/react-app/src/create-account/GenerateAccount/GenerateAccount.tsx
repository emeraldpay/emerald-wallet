import { BlockchainCode } from '@emeraldwallet/core';
import { addresses, screen } from '@emeraldwallet/store';
import { NewAccountProps } from '@emeraldwallet/ui';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { saveJson } from '../../util/save-as';
import ShowPrivateKey from '../ShowPrivateKey';
import DownloadDialog from './DownloadDialog';
import PasswordDialog from './PasswordDialog';

const PAGES = {
  PASSWORD: 1,
  DOWNLOAD: 2,
  SHOW_PRIVATE: 3,
  ACCOUNT_PROPS: 4
};

interface IGenAccProps {
  dispatch?: any;
  onBackScreen?: any;
}

interface IState {
  loading: boolean;
  page: number;
  accountId: string;
  passphrase?: string;
  privateKey?: string;
  blockchain: BlockchainCode;
}

type Props = IGenAccProps & WithTranslation;

class GenerateAccount extends React.Component<Props, IState> {
  constructor (props: Props) {
    super(props);
    this.state = {
      loading: false,
      page: PAGES.PASSWORD,
      accountId: '',
      blockchain: BlockchainCode.ETH
    };
  }

  public generate = (passphrase: string, blockchain: BlockchainCode) => {
    this.setState({
      loading: true
    });

    // Create new account
    this.props.dispatch(addresses.actions.createAccount(blockchain, passphrase))
      .then((accountId: string) => {
        this.setState({
          loading: false,
          accountId,
          passphrase,
          blockchain,
          page: PAGES.DOWNLOAD
        });
      });
  }

  public download = () => {
    const { blockchain, passphrase, accountId } = this.state;

    this.setState({
      loading: true
    });

    // Get encrypted key file from emerald vault
    this.props.dispatch(addresses.actions.exportKeyFile(blockchain, accountId)).then((jsonKeyFile: any) => {

      this.props.dispatch(addresses.actions.exportPrivateKey(blockchain, passphrase || '', accountId)).then((privateKey: string) => {
        // Send file to user
        saveJson(jsonKeyFile, `${blockchain}-${accountId}.json`);

        // Show private key
        this.setState({
          loading: false,
          page: PAGES.SHOW_PRIVATE,
          privateKey,
          accountId,
          blockchain
        });

      });

    });
  }

  public editAccountProps = () => {
    this.setState({
      page: PAGES.ACCOUNT_PROPS
    });
  }

  public skipAccountProps = () => {
    this.props.dispatch(screen.actions.gotoScreen('home'));
  }

  public updateAccountProps = (name: string) => {
    const { dispatch } = this.props;
    const { blockchain, accountId } = this.state;
    dispatch(addresses.actions.updateAccount(blockchain, accountId, name, ''))
      .then(() => dispatch(screen.actions.gotoScreen('home')));
  }

  public goToDashboard = () => {
    if (this.props.onBackScreen) {
      this.props.dispatch(screen.actions.gotoScreen(this.props.onBackScreen));
    } else {
      this.props.dispatch(screen.actions.gotoScreen('home'));
    }
  }

  public getPage () {
    const { page, privateKey, accountId } = this.state;
    const { t } = this.props;
    switch (page) {
      case PAGES.PASSWORD:
        return (
          <PasswordDialog
            loading={this.state.loading}
            t={t}
            onGenerate={this.generate}
            onDashboard={this.goToDashboard}
          />
        );
      case PAGES.DOWNLOAD:
        return (
          <DownloadDialog
            onBack={() => {}}
            loading={this.state.loading}
            t={t}
            onDownload={this.download}
          />
        );
      case PAGES.SHOW_PRIVATE:
        return (<ShowPrivateKey t={t} privateKey={privateKey || ''} onNext={this.editAccountProps}/>);
      case PAGES.ACCOUNT_PROPS:
        return (
          <NewAccountProps
            onSave={this.updateAccountProps}
            onSkip={this.skipAccountProps}
          />
        );
      default: return null;
    }
  }

  public render () {
    const { page } = this.state;
    if (!page) {
      return null;
    }
    return (
      <div>
        {this.getPage()}
      </div>
    );
  }
}

export default connect()(withTranslation()(GenerateAccount));
