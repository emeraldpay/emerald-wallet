import { Logger } from '@emeraldwallet/core';
import { screen } from '@emeraldwallet/store';
import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import CreateHdAccount from '../../../create-account/CreateHdAccount';
import CreateWalletScreen from '../../../create-wallet/CreateWalletScreen';
import {
  AddContact,
  BroadcastTx,
  ContactList as AddressBook,
  Home,
  Settings,
  TxDetails,
  WalletDetails,
  Welcome,
} from '../../../index';
import ReceiveScreen from '../../../receive/ReceiveScreen';
import CreateBitcoinTransaction from '../../../transaction/CreateBitcoinTransaction/CreateBitcoinTransaction';
import CreateConvertTransaction from '../../../transaction/CreateConvertTransaction';
import CreateTransaction from '../../../transaction/CreateTransaction';
import SelectAccount from '../../../transaction/CreateTransaction/SelectAccount';
import WalletInfo from '../../../wallets/WalletInfo';
import GlobalKey from '../../vault/GlobalKey';
import PasswordMigration from '../../vault/PasswordMigration';

const log = Logger.forCategory('screen');

export interface Props {
  termsVersion: string;
  screen: any;
  screenItem: any;
}

const Screen: React.FC<Props> = (props) => {
  log.info('Show screen: ', props.screen);

  switch (props.screen) {
    case null:
      return (
        <div>
          <CircularProgress size={50} color="secondary" />
          Initializing...
        </div>
      );
    case 'add-address':
      return <AddContact />;
    case 'broadcast-tx':
      return <BroadcastTx tx={props.screenItem.tx} signed={props.screenItem.signed} />;
    case 'settings':
      return <Settings />;
    case 'welcome':
      return <Welcome currentTermsVersion={props.termsVersion} />;
    case screen.Pages.ADDRESS_BOOK:
      return <AddressBook />;
    case screen.Pages.CREATE_HD_ACCOUNT:
      return <CreateHdAccount walletId={props.screenItem} />;
    case screen.Pages.CREATE_TX:
      return <SelectAccount walletId={props.screenItem} />;
    case screen.Pages.CREATE_TX_CONVERT:
      return <CreateConvertTransaction entry={props.screenItem} />;
    case screen.Pages.CREATE_TX_BITCOIN:
      return <CreateBitcoinTransaction source={props.screenItem} />;
    case screen.Pages.CREATE_TX_ETHEREUM:
      return <CreateTransaction sourceEntry={props.screenItem} />;
    case screen.Pages.CREATE_WALLET:
      return <CreateWalletScreen />;
    case screen.Pages.GLOBAL_KEY:
      return <GlobalKey />;
    case screen.Pages.HOME:
      return <Home />;
    case screen.Pages.PASSWORD_MIGRATION:
      return <PasswordMigration />;
    case screen.Pages.RECEIVE:
      return <ReceiveScreen walletId={props.screenItem} />;
    case screen.Pages.TX_DETAILS:
      return <TxDetails hash={props.screenItem.hash} />;
    case screen.Pages.WALLET:
      return <WalletDetails walletId={props.screenItem} />;
    case screen.Pages.WALLET_INFO:
      return <WalletInfo walletId={props.screenItem} />;
  }

  return <div>Unknown screen: {props.screen}</div>;
};

export default connect((state) => screen.selectors.getCurrentScreen(state))(Screen);
