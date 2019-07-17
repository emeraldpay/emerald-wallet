import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {addresses} from '@emeraldwallet/store';
import TransactionsHistory from '../../tx/TxHistory';
import AccountsList from '../../accounts/AccountList';
import Header from './header';
import Landing from '../../../containers/Landing';

const styles = {
  statusMessage: {
    color: '#999',
    marginTop: '15px',
  },
};

const Dashboard = (props) => {
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
    addrs: addresses.selectors.all(state),
    connecting: state.launcher.get('connecting'),
    statusMessage: state.launcher.get('message').get('text'),
  }),
  (dispatch, ownProps) => ({})
)(Dashboard);
