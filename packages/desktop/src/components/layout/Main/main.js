import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { ThemeProvider } from '@material-ui/styles';
import theme from '@emeraldplatform/ui/lib/theme';
import Screen from '../../../containers/Screen/screen';
import Header from '../Header';
import NotificationBar from '../NotificationBar';
import ErrorDialog from '../../../containers/ErrorDialog';
import Dialog from '../../../containers/Dialog';

const maxWidth = '1150px';

const Render = translate('common')((props) => {
  return (
    <ThemeProvider theme={theme}>
      <div style={{height: '100%', backgroundColor: theme.palette.background.default}} className="application">
        {props.screen !== 'paper-wallet' && (!props.launcherType || props.launcherType !== 'none') && <Header/>}
        <div style={{margin: '20px auto', maxWidth}}>
          <Screen/>
        </div>
        <ErrorDialog/>
        <NotificationBar/>
        <Dialog/>
      </div>
    </ThemeProvider>
  );
});

const Main = connect(
  (state, ownProps) => ({
    screen: state.wallet.screen.get('screen'),
    launcherType: state.launcher.getIn(['geth', 'type']),
  }),
  (dispatch, ownProps) => ({})
)(Render);

export default (Main);
