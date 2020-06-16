import { accounts, IState, screen, settings } from '@emeraldwallet/store';
import { ImportMnemonic, NewMnemonic } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmMnemonic from '../ConfirmMnemonic';

const PAGES = {
  GENERATE: 1,
  IMPORT: 2,
  CONFIRM: 3
};

interface IProps {
  generateMnemonic: any;
  blockchains: any;
  gotoDashboard?: any;
}

interface IWizardState {
  page: any;
  mnemonic?: any;
  formData?: any;
}

class MnemonicWizard extends React.Component<IProps, IWizardState> {
  constructor (props: IProps) {
    super(props);
    this.state = {
      page: PAGES.GENERATE
    };
  }

  public generate = () => {
    if (this.props.generateMnemonic) {
      this.props.generateMnemonic().then((mnemonic: string) => {
        this.setState({
          mnemonic
        });
      });
    }
  }

  public gotoImport = () => {
    this.setState({
      page: PAGES.IMPORT
    });
  }

  public gotoGenerate = () => {
    this.setState({
      page: PAGES.GENERATE
    });
  }

  public gotoConfirm = (formData: any) => {
    this.setState({
      page: PAGES.CONFIRM,
      formData
    });
  }

  public getPage () {
    const { gotoDashboard, blockchains } = this.props;
    const {
      page, mnemonic, formData
    } = this.state;
    switch (page) {
      case PAGES.GENERATE:
      // return (
      //   <NewMnemonic
      //     mnemonic={mnemonic}
      //     onBack={gotoDashboard}
      //     onGenerate={this.generate}
      //     onContinue={this.gotoImport}
      //   />
      // );

      case PAGES.IMPORT:
        return (
          <ImportMnemonic
            initialValues={
              {
                hdpath: "m/44'/60'/0'/0/0"
              }
            }
            mnemonic={mnemonic}
            onSubmit={this.gotoConfirm}
            onBack={this.gotoGenerate}
            blockchains={blockchains}
          />
        );

      case PAGES.CONFIRM:
        return (
          <ConfirmMnemonic
            mnemonic={mnemonic}
            onBack={this.gotoImport}
            formData={formData}
          />
        );

      default:
        return null;
    }
  }

  public render () {
    const { page } = this.state;
    if (!page) { return null; }
    return (
      <React.Fragment>
        {this.getPage()}
      </React.Fragment>
    );
  }
}

export default connect<any, any, any, IState>(
  (state, ownProps) => ({
    blockchains: settings.selectors.currentChains(state)
  }),
  (dispatch, ownProps) => ({
    generateMnemonic: () => {
      return dispatch(accounts.actions.generateMnemonic() as any);
    },
    gotoDashboard: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    }

  })
)(MnemonicWizard);
