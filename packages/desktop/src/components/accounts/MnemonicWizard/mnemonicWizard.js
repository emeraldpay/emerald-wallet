import React from 'react';
import { connect } from 'react-redux';
import { ImportMnemonic, NewMnemonic } from '@emeraldwallet/ui';
import screen from 'store/wallet/screen';
import accounts from 'store/vault/accounts';
import ConfirmMnemonic from '../add/ConfirmMnemonic';

const PAGES = {
  GENERATE: 1,
  IMPORT: 2,
  CONFIRM: 3,
};

class MnemonicWizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: PAGES.GENERATE,
    };
  }

  generate = () => {
    if (this.props.generateMnemonic) {
      this.props.generateMnemonic().then((mnemonic) => {
        this.setState({
          mnemonic,
        });
      });
    }
  };

  gotoImport = () => {
    this.setState({
      page: PAGES.IMPORT,
    });
  };

  gotoGenerate = () => {
    this.setState({
      page: PAGES.GENERATE,
    });
  };

  gotoConfirm = (formData) => {
    this.setState({
      page: PAGES.CONFIRM,
      formData,
    });
  };

  getPage() {
    const { gotoDashboard } = this.props;
    const { page, mnemonic, formData } = this.state;
    switch (page) {
      case PAGES.GENERATE:
        return (
          <NewMnemonic
            mnemonic={ mnemonic }
            onBack={ gotoDashboard }
            onGenerate={ this.generate }
            onContinue={ this.gotoImport }
          />
        );

      case PAGES.IMPORT:
        return (
          <ImportMnemonic
            mnemonic={ mnemonic }
            onSubmit={ this.gotoConfirm }
            onBack={ this.gotoGenerate }
          />
        );

      case PAGES.CONFIRM:
        return (
          <ConfirmMnemonic
            mnemonic={ mnemonic }
            onBack={ this.gotoImport }
            formData={ formData }
          />
        );

      default: return null;
    }
  }

  render() {
    const { page } = this.state;
    if (!page) { return null; }
    return (
      <React.Fragment>
        {this.getPage()}
      </React.Fragment>
    );
  }
}


export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({

    generateMnemonic: () => {
      return dispatch(accounts.actions.generateMnemonic());
    },
    gotoDashboard: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },

  })
)(MnemonicWizard);
