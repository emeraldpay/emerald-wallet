import { accounts, IState, screen, settings } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmMnemonic from './ConfirmMnemonic';
import CreateWallet from './CreateWallet';
import NewMnemonic from './NewMnemonic';

const PAGES = {
  SET_NAME: 1,
  GENERATE: 2,
  IMPORT_SEED: 3,
  CONFIRM: 4
};

interface IProps {
  generateMnemonic: any;
  gotoDashboard?: any;
  onCreateWallet: (name: string, seed: string) => void;
}

function NewWalletWizard (props: IProps) {
  const [page, setPage] = React.useState(PAGES.SET_NAME);
  const [mnemonic, setMnemonic] = React.useState();

  const generate = () => {
    if (props.generateMnemonic) {
      props.generateMnemonic().then((m: string) => {
        setMnemonic(m);
      });
    }
  };

  function createWallet () {
    if (props.onCreateWallet) {
      props.onCreateWallet('', mnemonic);
    }
  }

  const gotoGenerate = () => {
    setPage(PAGES.GENERATE);
  };

  const gotoConfirm = () => {
    setPage(PAGES.CONFIRM);
  };

  function getPage () {
    const { gotoDashboard } = props;

    switch (page) {
      case PAGES.SET_NAME:
        return (
          <CreateWallet
            onCancel={gotoDashboard}
            onCreate={gotoGenerate}
          />
        );
      case PAGES.GENERATE:
        return (
          <NewMnemonic
            mnemonic={mnemonic}
            onBack={gotoDashboard}
            onGenerate={generate}
            onContinue={gotoConfirm}
          />
        );

      // case PAGES.IMPORT:
      //   return (
      //     <ImportMnemonic
      //       initialValues={
      //         {
      //           hdpath: "m/44'/60'/0'/0/0"
      //         }
      //       }
      //       mnemonic={mnemonic}
      //       onSubmit={this.gotoConfirm}
      //       onBack={this.gotoGenerate}
      //       blockchains={blockchains}
      //     />
      //   );

      case PAGES.CONFIRM:
        return (
          <ConfirmMnemonic
            mnemonic={mnemonic}
            onSubmit={createWallet}
            onBack={gotoGenerate}
          />
        );

      default:
        return null;
    }
  }

  if (!page) {
    return null;
  }
  return (
    <React.Fragment>
      {getPage()}
    </React.Fragment>
  );

}

export default connect<any, any, any, IState>(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    generateMnemonic: () => {
      return dispatch(accounts.actions.generateMnemonic() as any);
    },
    gotoDashboard: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    },
    onCreateWallet: (walletName: string, mnemonic: string) => {
      //
      dispatch(accounts.actions.createNewWalletAction(walletName, mnemonic));
    }

  })
)(NewWalletWizard);
