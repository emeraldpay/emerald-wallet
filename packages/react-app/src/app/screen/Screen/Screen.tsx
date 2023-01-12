import { Logger } from '@emeraldwallet/core';
import { IState, screen } from '@emeraldwallet/store';
import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import EditContact from '../../../address-book/EditContact';
import AddHDAddress from '../../../create-account/AddHDAddress';
import CreateHdAccount from '../../../create-account/CreateHdAccount';
import CreateWalletScreen from '../../../create-wallet/CreateWalletScreen';
import {
  AddContact,
  ContactList as AddressBook,
  BroadcastTx,
  Home,
  Settings,
  TxDetails,
  WalletDetails,
  Welcome,
} from '../../../index';
import ShowMessage from '../../../message/ShowMessage';
import SignMessage from '../../../message/SignMessage';
import ReceiveScreen from '../../../receive/ReceiveScreen';
import CreateBitcoinTransaction from '../../../transaction/CreateBitcoinTransaction/CreateBitcoinTransaction';
import CreateCancelTransaction from '../../../transaction/CreateCancelTransaction';
import CreateConvertTransaction from '../../../transaction/CreateConvertTransaction';
import CreateRecoverTransaction from '../../../transaction/CreateRecoverTransaction';
import CreateSpeedUpTransaction from '../../../transaction/CreateSpeedUpTransaction';
import CreateTransaction from '../../../transaction/CreateTransaction';
import SelectAccount from '../../../transaction/CreateTransaction/SelectAccount';
import WalletInfo from '../../../wallets/WalletInfo';
import GlobalKey from '../../vault/GlobalKey';
import ImportVault from '../../vault/ImportVault';
import PasswordMigration from '../../vault/PasswordMigration';
import SetupVault from '../../vault/SetupVault';

const log = Logger.forCategory('Screen');

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

const Screen: React.FC<OwnProps & StateProps> = (props) => {
  log.info('Show screen: ', props.screen);

  switch (props.screen) {
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
      return <AddHDAddress walletId={props.screenItem} />;
    case screen.Pages.ADDRESS_BOOK:
      return <AddressBook />;
    case screen.Pages.BROADCAST_TX:
      return <BroadcastTx data={props.screenItem} />;
    case screen.Pages.CREATE_HD_ACCOUNT:
      return <CreateHdAccount walletId={props.screenItem} />;
    case screen.Pages.CREATE_TX:
      return <SelectAccount walletId={props.screenItem} />;
    case screen.Pages.CREATE_TX_CONVERT:
      return <CreateConvertTransaction entry={props.screenItem.entry} token={props.screenItem.token} />;
    case screen.Pages.CREATE_TX_BITCOIN:
      return <CreateBitcoinTransaction source={props.screenItem} />;
    case screen.Pages.CREATE_TX_CANCEL:
      return <CreateCancelTransaction transaction={props.screenItem} />;
    case screen.Pages.CREATE_TX_ETHEREUM:
      return <CreateTransaction sourceEntry={props.screenItem} />;
    case screen.Pages.CREATE_TX_SPEED_UP:
      return <CreateSpeedUpTransaction transaction={props.screenItem} />;
    case screen.Pages.CREATE_TX_RECOVER:
      return <CreateRecoverTransaction entry={props.screenItem} />;
    case screen.Pages.CREATE_WALLET:
      return <CreateWalletScreen />;
    case screen.Pages.EDIT_ADDRESS:
      return <EditContact contact={props.screenItem} />;
    case screen.Pages.GLOBAL_KEY:
      return <GlobalKey />;
    case screen.Pages.IMPORT_VAULT:
      return <ImportVault />;
    case screen.Pages.HOME:
      return <Home />;
    case screen.Pages.PASSWORD_MIGRATION:
      return <PasswordMigration />;
    case screen.Pages.RECEIVE:
      return <ReceiveScreen walletId={props.screenItem} />;
    case screen.Pages.SETTINGS:
      return <Settings />;
    case screen.Pages.SETUP_VAULT:
      return <SetupVault />;
    case screen.Pages.SIGN_MESSAGE:
      return <SignMessage walletId={props.screenItem} />;
    case screen.Pages.SHOW_MESSAGE:
      return <ShowMessage {...props.screenItem} />;
    case screen.Pages.TX_DETAILS:
      return <TxDetails tx={props.screenItem} />;
    case screen.Pages.WALLET:
      return <WalletDetails initialTab={props.restoreData?.tab} walletId={props.screenItem} />;
    case screen.Pages.WALLET_INFO:
      return <WalletInfo walletId={props.screenItem} />;
    case screen.Pages.WELCOME:
      return <Welcome currentTermsVersion={props.termsVersion} />;
    default:
      return <div>Unknown screen: {props.screen}</div>;
  }
};

export default connect<StateProps, unknown, unknown, IState>((state) => screen.selectors.getCurrentScreen(state))(
  Screen,
);
