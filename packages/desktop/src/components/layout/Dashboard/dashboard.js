import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Immutable from 'immutable';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {addresses} from '@emeraldwallet/store';
import TransactionsHistory from '../../tx/TxHistory';
import AccountsList from '../../accounts/AccountList';
import Header from './header';

const styles = {
  statusMessage: {
    color: '#999',
    marginTop: '15px',
  },
};

const Dashboard = (props) => {
  const {connecting, statusMessage} = props;
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

  return (
    <React.Fragment>
      <Header/>
      <AccountsList/>
      <TransactionsHistory/>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  connecting: PropTypes.bool.isRequired,
  statusMessage: PropTypes.string,
};

export default connect(
  (state, ownProps) => ({
    accounts: addresses.selectors.all(state),
    connecting: state.launcher.get('connecting'),
    statusMessage: state.launcher.get('message').get('text'),
  }),
  (dispatch, ownProps) => ({})
)(Dashboard);
