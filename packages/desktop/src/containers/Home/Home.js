import React from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { addresses } from '@emeraldwallet/store';
import { Landing } from '@emeraldwallet/react-app';

import Dashboard from '../../components/layout/Dashboard';

const styles = {
  statusMessage: {
    color: '#999',
    marginTop: '15px',
  },
};

const Home = (props) => {
  const {connecting, statusMessage, addrs} = props;
  if (connecting) {
    return (
      <Grid container direction="column" alignItems="center" justify="center">
        <Grid item>
          <CircularProgress size={50}/>
        </Grid>
        <Grid>
          <div style={styles.statusMessage}>{statusMessage}</div>
        </Grid>
      </Grid>
    );
  }

  if (addrs.size === 0) {
    return (<Landing />);
  }

  return (<Dashboard />);
};


export default connect(
  (state, ownProps) => ({
    addrs: addresses.selectors.all(state),
    connecting: state.launcher.get('connecting'),
    statusMessage: state.launcher.get('message').get('text'),
  }),
  (dispatch, ownProps) => ({})
)(Home);
