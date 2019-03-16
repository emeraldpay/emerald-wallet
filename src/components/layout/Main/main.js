import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from '@emeraldplatform/ui/lib/theme';
import Screen from '../../../containers/Screen/screen';
import Header from '../Header';
import NotificationBar from '../NotificationBar';
import ErrorDialog from '../../common/ErrorDialog';
import Dialog from '../../../containers/Dialog';

const maxWidth = '1150px';

const Render = translate('common')(({ muiTheme, ...props }) => {
  return (
    <div style={{height: '100%', backgroundColor: muiTheme.palette.canvasColor}}>
      {props.screen !== 'paper-wallet' && (!props.launcherType || props.launcherType !== 'none') && <Header />}
      <div style={{margin: '20px auto', maxWidth}}>
        <MuiThemeProvider theme={theme}>
          <Screen />
        </MuiThemeProvider>
      </div>
      <ErrorDialog />
      <NotificationBar />
      <Dialog />
    </div>
  );
});

const Main = connect(
  (state, ownProps) => ({
    screen: state.wallet.screen.get('screen'),
    launcherType: state.launcher.getIn(['geth', 'type']),
  }),
  (dispatch, ownProps) => ({})
)(Render);

export default muiThemeable()(Main);