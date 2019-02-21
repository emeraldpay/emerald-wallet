import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import theme from '@emeraldplatform/ui/lib/theme';
import LogoIcon from '../common/Logo';
import InitialSetup from './initialSetup';

const getStyles = (t) => ({
  brandPart1: {
    color: t.palette.primary.main,
  },
  brandPart2: {
    color: t.palette.secondary.main,
  },
});

const Render = ({
  message, level, needSetup, classes,
}) => {
  let messageBlock = null;
  if (message) {
    const messageStyle = {
      color: '#999',
    };
    if (level === 3) {
      messageStyle.color = '#f66';
    }
    messageBlock = <span style={messageStyle}><CircularProgress size={25}/> {message}</span>;
  }

  if (needSetup) {
    return (
      <Grid container justify='center' alignItems='center'>
        <Grid item xs={8}>
          <InitialSetup/>
        </Grid>
      </Grid>
    );
  }

  return (
    <MuiThemeProvider theme={theme}>
      <Grid container direction='column' justify="center" alignItems='center' style={{maxWidth: '1150px'}}>
        <Grid item xs style={{paddingTop: '6%'}}>
          <LogoIcon width="250" height="250"/>
        </Grid>
        <Grid item>
          <Grid container direction="column">
            <Grid item justify="center" alignItems="center" xs>
              <div style={{fontSize: '42px'}}>
                <span className={classes.brandPart1}>Emerald </span>
                <span className={classes.brandPart2}>Wallet</span>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs style={{paddingTop: '40px', height: '40px'}}>
          <div>
            {messageBlock}
          </div>
        </Grid>
      </Grid>
    </MuiThemeProvider>
  );
};

Render.propTypes = {
  message: PropTypes.string,
  level: PropTypes.number,
  ready: PropTypes.bool.isRequired,
  needSetup: PropTypes.bool.isRequired,
};

const Welcome = connect(
  (state, ownProps) => ({
    message: state.launcher.getIn(['message', 'text']),
    level: state.launcher.getIn(['message', 'level']),
    ready: state.launcher.getIn(['geth', 'status']) === 'ready' && state.launcher.getIn(['connector', 'status']) === 'ready',
    needSetup: state.launcher.get('terms') !== 'v1'
      || state.launcher.getIn(['geth', 'type']) === 'none'
      || state.launcher.get('settingsUpdated') === true,
  }),
  (dispatch, ownProps) => ({})
)(withStyles(getStyles(theme))(Render));

export default Welcome;
