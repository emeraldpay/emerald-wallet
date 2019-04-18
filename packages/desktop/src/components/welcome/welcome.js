import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Logo} from '@emeraldwallet/ui';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/styles';
import InitialSetup from './initialSetup';
import { TERMS_VERSION } from '../../store/config';

const getStyles = (theme) => ({
  brandPart1: {
    color: theme.palette && theme.palette.primary.main,
  },
  brandPart2: {
    color: theme.palette && theme.palette.secondary.main,
  },
});

const Welcome = (props) => {
  const {
    message, level, needSetup, classes,
  } = props;
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
    <Grid container direction='column' justify="center" alignItems='center' style={{maxWidth: '1150px'}}>
      <Grid item xs style={{paddingTop: '6%'}}>
        <Logo width="250" height="250"/>
      </Grid>
      <Grid item>
        <Grid container direction="column">
          <Grid item xs>
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
  );
};

Welcome.propTypes = {
  message: PropTypes.string,
  level: PropTypes.number,
  ready: PropTypes.bool.isRequired,
  needSetup: PropTypes.bool.isRequired,
};

const StyledWelcome = withStyles(getStyles)(Welcome);

function isEmpty(val) {
  return typeof val === 'undefined' || (typeof val === 'string' && val.length === 0);
}

export default connect(
  (state, ownProps) => {
    return ({
      message: state.launcher.getIn(['message', 'text']),
      level: state.launcher.getIn(['message', 'level']),
      ready: state.launcher.getIn(['geth', 'status']) === 'ready' && state.launcher.getIn(['connector', 'status']) === 'ready',
      needSetup: state.launcher.get('configured') && (
        state.launcher.get('terms') !== TERMS_VERSION
        || isEmpty(state.launcher.getIn(['chain', 'name']))),
    });
  },
  (dispatch, ownProps) => ({})
)(StyledWelcome);
