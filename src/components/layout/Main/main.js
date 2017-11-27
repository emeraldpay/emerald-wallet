import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Screen from '../../../containers/Screen/screen';
import Header from '../Header';
import Footer from '../Footer';
import NotificationBar from '../NotificationBar';
import ErrorDialog from '../../common/ErrorDialog';
import Dialog from '../../dialog';

import './main.scss';

const maxWidth = '1150px';

function isLanding(props) {
  return props.screen !== 'landing' && props.screen !== 'landing-importjson' && props.screen !== 'landing-generate' && props.screen !== 'landing-add-from-ledger';
}

const Render = translate('common')(({ t, ...props }) => {
  return (
    <div>
      {isLanding(props) && props.screen !== 'welcome' && props.screen !== 'paper-wallet' && <Header maxWidth={ maxWidth }/>}
      <div style={{margin: '20px auto', maxWidth}}>
        <Screen />
      </div>
      <ErrorDialog />
      <NotificationBar />
      <Dialog />
      {props.screen !== 'welcome' && props.screen !== 'paper-wallet' && <Footer maxWidth={ maxWidth }/>}
    </div>
  );
});

const Main = connect(
  (state, ownProps) => ({
    screen: state.wallet.screen.get('screen'),
  }),
  (dispatch, ownProps) => ({})
)(Render);

export default Main;
