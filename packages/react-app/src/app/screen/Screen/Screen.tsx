import { Logger } from '@emeraldwallet/core';
import { screen } from '@emeraldwallet/store';
import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import CreateHdAccount from '../../../create-account/CreateHdAccount';
import CreateWalletScreen from "../../../create-wallet/CreateWalletScreen";
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
import ReceiveScreen from "../../../receive/ReceiveScreen";
import CreateBitcoinTransaction from "../../../transaction/CreateBitcoinTransaction/CreateBitcoinTransaction";
import CreateConvertTransaction from '../../../transaction/CreateConvertTransaction';
import CreateTransaction from "../../../transaction/CreateTransaction";
import SelectAccount from "../../../transaction/CreateTransaction/SelectAccount";
import GlobalKey from '../../vault/GlobalKey';
import PasswordMigration from '../../vault/PasswordMigration';

const log = Logger.forCategory('screen');

export interface IScreenProps {
  termsVersion: string;
  screen: any;
  screenItem: any;
}

const Screen = (props: IScreenProps) => {
  log.info('Show screen: ', props.screen);

  if (props.screen === null) {
    return (
      <div>
        <CircularProgress size={50} color='secondary' /> Initializing...
      </div>
    );
  }
  if (props.screen === screen.Pages.HOME) {
    return (<Home />);
  }
  if (props.screen === screen.Pages.GLOBAL_KEY) {
    return (<GlobalKey />);
  }
  if (props.screen === screen.Pages.PASSWORD_MIGRATION) {
    return (<PasswordMigration />);
  }
  if (props.screen === screen.Pages.ADDRESS_BOOK) {
    return <AddressBook />;
  }
  if (props.screen === 'add-address') {
    return <AddContact />;
  }
  if (props.screen === screen.Pages.WALLET) {
    return <WalletDetails walletId={props.screenItem}/>;
  }
  if (props.screen === screen.Pages.TX_DETAILS) {
    return <TxDetails hash={props.screenItem.hash}/>;
  }
  if (props.screen === screen.Pages.CREATE_TX) {
    return (<SelectAccount walletId={props.screenItem}/>);
  }
  if (props.screen === screen.Pages.CREATE_TX_ETHEREUM) {
    return (<CreateTransaction sourceEntry={props.screenItem}/>);
  }
  if (props.screen === screen.Pages.CREATE_TX_CONVERT) {
    return (<CreateConvertTransaction entry={props.screenItem}/>);
  }
  if (props.screen === screen.Pages.CREATE_TX_BITCOIN) {
    return (<CreateBitcoinTransaction source={props.screenItem}/>);
  }
  if (props.screen === 'broadcast-tx') {
    return <BroadcastTx tx={props.screenItem.tx} signed={props.screenItem.signed}/>;
  }
  if (props.screen === screen.Pages.CREATE_WALLET) {
    return <CreateWalletScreen/>;
  }
  if (props.screen === screen.Pages.RECEIVE) {
    return <ReceiveScreen walletId={props.screenItem}/>;
  }
  if (props.screen === 'welcome') {
    return <Welcome currentTermsVersion={props.termsVersion} />;
  }
  if (props.screen === 'settings') {
    return <Settings />;
  }
  if (props.screen === screen.Pages.CREATE_HD_ACCOUNT) {
    return <CreateHdAccount walletId={props.screenItem}/>;
  }
  return (
    <div>Unknown screen: {props.screen}</div>
  );
};

export default connect(
  (state, ownProps) => screen.selectors.getCurrentScreen(state),
  (dispatch, ownProps) => ({})
)(Screen);
