import { Logger } from '@emeraldwallet/core';
import { IState, screen } from '@emeraldwallet/store';
import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import AddContact from '../../../address-book/AddContact';
import AddressBook from '../../../address-book/ContactList';
import EditContact from '../../../address-book/EditContact';
import AddHDAddress from '../../../create-account/AddHDAddress';
import SetupBlockchains from '../../../create-account/SetupBlockchains';
import CreateWalletScreen from '../../../create-wallet/CreateWalletScreen';
import ShowMessage from '../../../message/ShowMessage';
import SignMessage from '../../../message/SignMessage';
import ReceiveScreen from '../../../receive/ReceiveScreen';
import Settings from '../../../settings/Settings';
import { CreateTransaction } from '../../../transaction';
import TxDetails from '../../../transactions/TxDetails';
import WalletDetails from '../../../wallets/WalletDetails';
import WalletInfo from '../../../wallets/WalletInfo';
import Home from '../../layout/Home';
import Welcome from '../../onboarding/Welcome';
import GlobalKey from '../../vault/GlobalKey';
import ImportVault from '../../vault/ImportVault';
import PasswordMigration from '../../vault/PasswordMigration';
import SetupVault from '../../vault/SetupVault';

interface OwnProps {
  termsVersion: string;
}

interface StateProps {
  screen?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  screenItem?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restoreData?: any;
}

const log = Logger.forCategory('Screen');

const Screen: React.FC<OwnProps & StateProps> = ({ restoreData, screenItem, termsVersion, screen: currentScreen }) => {
  log.info(`Show screen: ${currentScreen}`);

  switch (currentScreen) {
    case null:
      return (
        <div>
          <CircularProgress size={50} color="secondary" />
          Initializing...
        </div>
      );
    case screen.Pages.ADD_ADDRESS:
      return <AddContact />;
    case screen.Pages.ADD_HD_ADDRESS:
      return <AddHDAddress walletId={screenItem} />;
    case screen.Pages.ADDRESS_BOOK:
      return <AddressBook />;
    case screen.Pages.CREATE_TX:
      return <CreateTransaction {...screenItem} />;
    case screen.Pages.CREATE_WALLET:
      return <CreateWalletScreen />;
    case screen.Pages.EDIT_ADDRESS:
      return <EditContact contact={screenItem} />;
    case screen.Pages.GLOBAL_KEY:
      return <GlobalKey />;
    case screen.Pages.IMPORT_VAULT:
      return <ImportVault />;
    case screen.Pages.HOME:
      return <Home />;
    case screen.Pages.PASSWORD_MIGRATION:
      return <PasswordMigration />;
    case screen.Pages.RECEIVE:
      return <ReceiveScreen walletId={screenItem} />;
    case screen.Pages.SETTINGS:
      return <Settings />;
    case screen.Pages.SETUP_BLOCKCHAINS:
      return <SetupBlockchains walletId={screenItem} />;
    case screen.Pages.SETUP_VAULT:
      return <SetupVault />;
    case screen.Pages.SIGN_MESSAGE:
      return <SignMessage walletId={screenItem} />;
    case screen.Pages.SHOW_MESSAGE:
      return <ShowMessage {...screenItem} />;
    case screen.Pages.TX_DETAILS:
      return <TxDetails {...screenItem} />;
    case screen.Pages.WALLET:
      return <WalletDetails initialTab={restoreData?.tab} walletId={screenItem} />;
    case screen.Pages.WALLET_INFO:
      return <WalletInfo walletId={screenItem} />;
    case screen.Pages.WELCOME:
      return <Welcome currentTermsVersion={termsVersion} />;
    default:
      return <div>Unknown screen: {currentScreen}</div>;
  }
};

export default connect<StateProps, unknown, unknown, IState>((state) => screen.selectors.getCurrentScreen(state))(
  Screen,
);
