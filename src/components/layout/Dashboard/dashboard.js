import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import Immutable from 'immutable';
import CircularProgress from 'material-ui/CircularProgress';
import TransactionsHistory from '../../../components/tx/TxHistory';
import AccountsList from '../../../components/accounts/AccountList';
import Header from './header';

const styles = {
  statusMessage: {
    color: '#999',
    marginTop: '15px',
  },
};

const Dashboard = (props) => {
  const { connecting, statusMessage } = props;

  if (connecting) {
    return (
      <div>
        <Grid>
          <Row center="xs">
            <Col xs={12}>
              <CircularProgress size={50} />
              <div style={styles.statusMessage}>{statusMessage}</div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <AccountsList/>
      <TransactionsHistory/>
    </div>
  );
};

Dashboard.propTypes = {
  connecting: PropTypes.bool.isRequired,
  statusMessage: PropTypes.string,
};

export default connect(
  (state, ownProps) => ({
    accounts: state.accounts.get('accounts', Immutable.List()),
    connecting: state.launcher.get('connecting'),
    statusMessage: state.launcher.get('message').get('text'),
  }),
  (dispatch, ownProps) => ({
  })
)(Dashboard);
