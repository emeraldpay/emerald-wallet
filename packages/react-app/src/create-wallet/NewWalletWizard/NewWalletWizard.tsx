import { accounts, IState, screen } from '@emeraldwallet/store';
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
  goBack?: any;
  onCreateWallet: (name: string, password: string, seed: string) => void;
}

function NewWalletWizard (props: IProps) {
  const [page, setPage] = React.useState(PAGES.SET_NAME);
  const [mnemonic, setMnemonic] = React.useState();
  const [walletName, setWalletName] = React.useState();
  const [walletPwd, setWalletPwd] = React.useState();

  const generate = () => {
    if (props.generateMnemonic) {
      props.generateMnemonic().then((m: string) => {
        setMnemonic(m);
      });
    }
  };

  function createWallet () {
    if (props.onCreateWallet) {
      props.onCreateWallet(walletName, walletPwd, mnemonic);
    }
  }

  const gotoGenerate = (name: string, password: string) => {
    setWalletName(name);
    setWalletPwd(password);
    setPage(PAGES.GENERATE);
  };

  const gotoConfirm = () => {
    setPage(PAGES.CONFIRM);
  };

  function getPage () {
    const { goBack } = props;

    switch (page) {
      case PAGES.SET_NAME:
        return (
          <CreateWallet
            onCancel={goBack}
            onCreate={gotoGenerate}
          />
        );
      case PAGES.GENERATE:
        return (
          <NewMnemonic
            mnemonic={mnemonic}
            onBack={goBack}
            onGenerate={generate}
            onContinue={gotoConfirm}
          />
        );
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
    goBack: () => {
      // dispatch(screen.actions.gotoScreen(screen.Pages.NEW_WALLET));
    },
    onCreateWallet: (walletName: string, password: string, mnemonic: string) => {
      //
      dispatch(accounts.actions.createNewWalletAction(walletName, password, mnemonic));
    }

  })
)(NewWalletWizard);
